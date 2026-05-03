import React from 'react'
import { HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineClipboardList } from 'react-icons/hi'
import { MdOutlineReplay, MdOutlinePlayArrow } from 'react-icons/md'
import { useAppSelector, useAppDispatch, startQuizAttempt } from '../store'

interface QuizIntroProps {
    chapterId: string
    chapterTitle?: string
}

const QuizIntro: React.FC<QuizIntroProps> = ({ chapterId, chapterTitle }) => {
    const dispatch = useAppDispatch()
    const summary = useAppSelector((s) => s.quiz.data.summary)
    const loadingStart = useAppSelector((s) => s.quiz.data.loading.start)

    if (!summary) return null

    const hasAttempted = summary.attempts_count > 0
    const bestScoreDisplay =
        summary.best_score !== null ? `${summary.best_score}%` : '—'

    const handleStart = () => {
        dispatch(startQuizAttempt(chapterId))
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header card */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div
                        className="px-8 py-10 text-white text-center"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--thm-primary) 0%, rgba(var(--thm-primary-rgb),0.7) 100%)',
                        }}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <HiOutlineAcademicCap className="text-4xl" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Chapter Quiz</h1>
                        {chapterTitle && (
                            <p className="text-white text-opacity-80 text-sm">{chapterTitle}</p>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                        <div className="px-6 py-5 text-center">
                            <p className="text-2xl font-bold text-[var(--thm-primary)]">
                                {summary.pass_percentage}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                Pass mark
                            </p>
                        </div>
                        <div className="px-6 py-5 text-center">
                            <p className="text-2xl font-bold text-[var(--thm-primary)]">
                                {bestScoreDisplay}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                Best score
                            </p>
                        </div>
                        <div className="px-6 py-5 text-center">
                            <p className="text-2xl font-bold text-[var(--thm-primary)]">
                                {summary.attempts_count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                Attempts
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info list */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg px-8 py-6 mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <HiOutlineClipboardList className="text-[var(--thm-primary)] text-xl flex-shrink-0" />
                        <span className="text-sm">
                            <span className="font-semibold">{summary.questions_per_attempt}</span>{' '}
                            questions per attempt
                        </span>
                    </div>

                    {summary.is_passed && (
                        <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                            <HiOutlineCheckCircle className="text-xl flex-shrink-0" />
                            <span className="text-sm font-medium">
                                You have already passed this chapter — feel free to retake for practice!
                            </span>
                        </div>
                    )}

                    {hasAttempted && !summary.is_passed && (
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                            <MdOutlineReplay className="text-xl flex-shrink-0" />
                            <span className="text-sm">
                                You'll see <span className="font-semibold">different questions</span> on
                                each retake until the question bank cycles.
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA button */}
                <button
                    onClick={handleStart}
                    disabled={loadingStart}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'var(--thm-primary)' }}
                >
                    {loadingStart ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating your quiz…
                        </>
                    ) : hasAttempted ? (
                        <>
                            <MdOutlineReplay className="text-2xl" />
                            Retake Quiz
                        </>
                    ) : (
                        <>
                            <MdOutlinePlayArrow className="text-2xl" />
                            Take Quiz
                        </>
                    )}
                </button>

                {hasAttempted && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                        Best score: {bestScoreDisplay} · {summary.attempts_count}{' '}
                        {summary.attempts_count === 1 ? 'attempt' : 'attempts'} so far
                    </p>
                )}
            </div>
        </div>
    )
}

export default QuizIntro
