import React, { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Notification, toast } from '@/components/ui'
import { injectReducer } from '@/store'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import Loading from '@/components/shared/Loading'
import { FaChevronLeft } from 'react-icons/fa'
import reducer, {
    useAppSelector,
    useAppDispatch,
    fetchQuizSummary,
    startQuizAttempt,
    resetQuiz,
    clearError,
} from './store'

import QuizIntro from './components/QuizIntro'
import QuizRunner from './components/QuizRunner'
import QuizResult from './components/QuizResult'

injectReducer('quiz', reducer)

const QuizPage: React.FC = () => {
    const { chapterId, bookId } = useParams<{ chapterId: string; bookId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const summary = useAppSelector((s) => s.quiz.data.summary)
    const currentAttempt = useAppSelector((s) => s.quiz.data.currentAttempt)
    const result = useAppSelector((s) => s.quiz.data.result)
    const loadingSummary = useAppSelector((s) => s.quiz.data.loading.summary)
    const loadingStart = useAppSelector((s) => s.quiz.data.loading.start)
    const error = useAppSelector((s) => s.quiz.data.error)

    // Fetch chapter title from teaching state if available (best-effort)
    const chapterTitle = useAppSelector(
        (s: any) => s.teaching?.data?.chapterData?.title as string | undefined
    )

    useEffect(() => {
        if (chapterId) {
            dispatch(fetchQuizSummary(chapterId))
        }
        return () => {
            dispatch(resetQuiz())
        }
    }, [chapterId])

    // Handle errors bubbled up from thunks (502, 503, 409, etc.)
    useEffect(() => {
        if (!error) return
        toast.push(
            <Notification title="Quiz Error" type="danger" duration={6000}>
                {error}
            </Notification>
        )
        dispatch(clearError())
    }, [error])

    const handleBack = useCallback(() => {
        navigate(
            `${APP_PREFIX_PATH}/my_books/book_detail/${bookId}/chapter/${chapterId}`
        )
    }, [navigate, bookId, chapterId])

    const isLoading = loadingSummary || (!summary && !error)

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] z-[99999]">
                <Loading loading />
            </div>
        )
    }

    // Pool not yet seeded but we still show the intro (server seeds lazily on start)
    if (!summary) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-500 dark:text-gray-400">
                        Quiz could not be loaded.
                    </p>
                    <button
                        onClick={() => chapterId && dispatch(fetchQuizSummary(chapterId))}
                        className="px-6 py-2.5 rounded-xl text-white font-semibold"
                        style={{ background: 'var(--thm-primary)' }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    // First-time start loading state (Gemini seeding — can take up to ~10s)
    if (loadingStart) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-[#0d1117] z-[99999]">
                <div
                    className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--thm-primary)', borderTopColor: 'transparent' }}
                />
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                    Generating your quiz…
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                    First-time setup may take up to 10 seconds
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Back button — shown only on intro screen */}
            {!currentAttempt && !result && (
                <button
                    onClick={handleBack}
                    className="fixed top-4 left-4 z-20 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[var(--thm-primary)] transition-colors"
                >
                    <FaChevronLeft />
                    Back to chapter
                </button>
            )}

            {result ? (
                <QuizResult
                    chapterId={chapterId!}
                    bookId={bookId!}
                    chapterTitle={chapterTitle}
                />
            ) : currentAttempt ? (
                <QuizRunner chapterId={chapterId!} />
            ) : (
                <QuizIntro chapterId={chapterId!} chapterTitle={chapterTitle} />
            )}
        </>
    )
}

export default QuizPage
