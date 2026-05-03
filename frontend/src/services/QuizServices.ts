import ApiService from './ApiService'

export async function apiGetQuizSummary<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/chapter/${chapterId}/summary`,
        method: 'get',
    })
}

export async function apiStartQuizAttempt<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/chapter/${chapterId}/attempts/start`,
        method: 'post',
        data: {},
    })
}

export async function apiSubmitQuizAttempt<T>(payload: {
    attemptId: string
    answers: { question_id: string; selected_option: string | null }[]
}) {
    return ApiService.fetchData<T>({
        url: `quizzes/attempts/${payload.attemptId}/submit`,
        method: 'post',
        data: { answers: payload.answers },
    })
}

export async function apiGetMyQuizAttempts<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/attempts/me/chapter/${chapterId}`,
        method: 'get',
    })
}
