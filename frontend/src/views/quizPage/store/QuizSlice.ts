import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetQuizSummary,
    apiStartQuizAttempt,
    apiSubmitQuizAttempt,
} from '@/services/QuizServices'
import { getChapterProgress } from '@/views/teachingPage/store/TeachingSlice'

export const SLICE_NAME = 'quiz'

/** Safely turn any backend error payload into a plain string. */
function extractErrorMessage(detail: unknown, fallback: string): string {
    if (!detail) return fallback
    if (typeof detail === 'string') return detail
    // Pydantic v2 returns an array of { type, loc, msg, input }
    if (Array.isArray(detail)) {
        return detail.map((e: any) => e?.msg ?? JSON.stringify(e)).join('; ')
    }
    if (typeof detail === 'object') {
        const d = detail as any
        return d.msg ?? d.message ?? d.detail ?? JSON.stringify(detail)
    }
    return String(detail)
}

export type QuizQuestion = {
    question_id: string
    position: number
    text: string
    options: { option_id: string; text: string }[]
}

export type QuizSummary = {
    pass_percentage: number
    questions_per_attempt: number
    pool_size: number
    best_score: number | null
    is_passed: boolean
    attempts_count: number
    last_attempt: {
        attempt_id: string
        score: number
        is_passed: boolean
        submitted_at: string
    } | null
}

export type QuizResultPerQuestion = {
    question_id: string
    selected_option_id: string | null
    correct_option_id: string
    is_correct: boolean
    explanation: string | null
}

export type QuizResult = {
    attempt_id?: string
    score: number
    total?: number
    is_passed: boolean
    pass_percentage: number
    submitted_at?: string
    per_question?: QuizResultPerQuestion[]
}

export type QuizState = {
    summary: QuizSummary | null
    currentAttempt: { attemptId: string; questions: QuizQuestion[] } | null
    selections: Record<string, string | null>
    result: QuizResult | null
    loading: { summary: boolean; start: boolean; submit: boolean }
    error: string | null
}

const initialState: QuizState = {
    summary: null,
    currentAttempt: null,
    selections: {},
    result: null,
    loading: { summary: false, start: false, submit: false },
    error: null,
}

export const fetchQuizSummary = createAsyncThunk(
    SLICE_NAME + '/fetchQuizSummary',
    async (chapterId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetQuizSummary<QuizSummary>(chapterId)
            return response.data
        } catch (error: any) {
            const detail = extractErrorMessage(error.response?.data?.detail, 'Failed to load quiz summary.')
            return rejectWithValue({ detail })
        }
    }
)

type StartAttemptResponse = {
    attempt_id: string
    started_at: string
    questions: QuizQuestion[]
}

export const startQuizAttempt = createAsyncThunk(
    SLICE_NAME + '/startQuizAttempt',
    async (chapterId: string, { rejectWithValue }) => {
        try {
            const response = await apiStartQuizAttempt<StartAttemptResponse>(chapterId)
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            const retryAfter = error.response?.headers?.['retry-after'] ?? '10'
            let detail = extractErrorMessage(error.response?.data?.detail, 'Failed to start quiz.')
            if (status === 502) detail = "Quiz couldn't be prepared right now, please try again."
            else if (status === 503) detail = `Quiz is preparing, please try again in about ${retryAfter} second(s).`
            return rejectWithValue({ detail, status, retryAfter })
        }
    }
)

type SubmitPayload = {
    attemptId: string
    answers: { question_id: string; selected_option: string | null }[]
    chapterId: string
}

export const submitQuizAttempt = createAsyncThunk(
    SLICE_NAME + '/submitQuizAttempt',
    async (payload: SubmitPayload, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiSubmitQuizAttempt<QuizResult>({
                attemptId: payload.attemptId,
                answers: payload.answers,
            })
            if (response.data.is_passed) {
                dispatch(getChapterProgress(payload.chapterId))
            }
            return response.data
        } catch (error: any) {
            const status = error.response?.status
            let detail = extractErrorMessage(error.response?.data?.detail, 'Failed to submit quiz.')
            if (status === 409) detail = 'This quiz was already submitted.'
            else if (status === 429) detail = 'Please wait a moment before submitting again.'
            else if (status === 400) detail = 'Invalid answers submitted. Please refresh and try again.'
            else if (status === 403) detail = "You don't have permission to submit this attempt."
            return rejectWithValue({ detail, status })
        }
    }
)

const quizSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setSelection(
            state,
            action: PayloadAction<{ questionId: string; optionId: string | null }>
        ) {
            state.selections[action.payload.questionId] = action.payload.optionId
        },
        resetQuiz(state) {
            state.currentAttempt = null
            state.selections = {}
            state.result = null
            state.error = null
        },
        clearError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchQuizSummary
            .addCase(fetchQuizSummary.pending, (state) => {
                state.loading.summary = true
                state.error = null
            })
            .addCase(fetchQuizSummary.fulfilled, (state, action) => {
                state.summary = action.payload
                state.loading.summary = false
            })
            .addCase(fetchQuizSummary.rejected, (state, action: any) => {
                state.error = extractErrorMessage(action.payload?.detail, 'Failed to load quiz summary.')
                state.loading.summary = false
            })

            // startQuizAttempt
            .addCase(startQuizAttempt.pending, (state) => {
                state.loading.start = true
                state.error = null
            })
            .addCase(startQuizAttempt.fulfilled, (state, action) => {
                // Normalise questions from the actual API shape:
                // { uid, text, option_a, option_b, option_c, option_d }
                // → { question_id, position, text, options: [{option_id, text}] }
                const questions = (action.payload.questions ?? []).map((q: any, idx: number) => {
                    const optionEntries = [
                        { option_id: 'a', text: q.option_a },
                        { option_id: 'b', text: q.option_b },
                        { option_id: 'c', text: q.option_c },
                        { option_id: 'd', text: q.option_d },
                    ].filter((o) => o.text != null && o.text !== '')

                    return {
                        question_id: q.uid ?? q.question_id ?? String(idx),
                        position: q.position ?? idx + 1,
                        text: q.text ?? '',
                        options: optionEntries.length > 0
                            ? optionEntries
                            : (q.options ?? []),
                    }
                })
                state.currentAttempt = {
                    attemptId: action.payload.attempt_id,
                    questions,
                }
                state.selections = {}
                state.result = null
                state.loading.start = false
            })
            .addCase(startQuizAttempt.rejected, (state, action: any) => {
                state.error = extractErrorMessage(action.payload?.detail, 'Failed to start quiz.')
                state.loading.start = false
            })

            // submitQuizAttempt
            .addCase(submitQuizAttempt.pending, (state) => {
                state.loading.submit = true
                state.error = null
            })
            .addCase(submitQuizAttempt.fulfilled, (state, action) => {
                state.result = action.payload
                state.currentAttempt = null
                state.loading.submit = false
                // Refresh summary so best_score / is_passed are up to date
                if (state.summary) {
                    if (action.payload.score > (state.summary.best_score ?? -1)) {
                        state.summary.best_score = action.payload.score
                    }
                    if (action.payload.is_passed) {
                        state.summary.is_passed = true
                    }
                    state.summary.attempts_count += 1
                    state.summary.last_attempt = {
                        attempt_id: action.payload.attempt_id ?? '',
                        score: action.payload.score,
                        is_passed: action.payload.is_passed,
                        submitted_at: action.payload.submitted_at ?? new Date().toISOString(),
                    }
                }
            })
            .addCase(submitQuizAttempt.rejected, (state, action: any) => {
                state.error = extractErrorMessage(action.payload?.detail, 'Failed to submit quiz.')
                state.loading.submit = false
            })
    },
})

export const { setSelection, resetQuiz, clearError } = quizSlice.actions
export default quizSlice.reducer
