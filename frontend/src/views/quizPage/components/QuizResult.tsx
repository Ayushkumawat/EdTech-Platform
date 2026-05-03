import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle } from 'react-icons/hi'
import { MdOutlineReplay } from 'react-icons/md'
import { FaChevronLeft } from 'react-icons/fa'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { useAppSelector, useAppDispatch, startQuizAttempt } from '../store'

interface QuizResultProps {
    chapterId: string
    bookId: string
    chapterTitle?: string
}

const QuizResult: React.FC<QuizResultProps> = ({ chapterId, bookId, chapterTitle }) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const result = useAppSelector((s) => s.quiz.data.result)
    const loadingStart = useAppSelector((s) => s.quiz.data.loading.start)

    if (!result) return null

    const passed = result.is_passed
    const scoreColor = passed ? 'text-green-500' : 'text-red-500'
    const badgeBg = passed
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'

    // score from API is a raw number (e.g. 20 out of 100 = 20%)
    // total questions may be in result.total
    const scoreDisplay = result.score

    const handleRetake = () => dispatch(startQuizAttempt(chapterId))

    const handleBack = () =>
        navigate(`${APP_PREFIX_PATH}/my_books/book_detail/${bookId}/chapter/${chapterId}`)

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col overflow-hidden">
            {/* Header */}
            <div
                className="px-6 py-4 flex items-center gap-4 shadow-sm flex-shrink-0"
                style={{ background: 'var(--thm-primary)' }}
            >
                <button
                    onClick={handleBack}
                    className="text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                    <FaChevronLeft />
                </button>
                <span className="text-white font-bold text-lg">Quiz Result</span>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Score card */}
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-8 py-10 text-center">
                            {chapterTitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {chapterTitle}
                                </p>
                            )}

                            <div className={`text-7xl font-extrabold mb-3 ${scoreColor}`}>
                                {scoreDisplay}%
                            </div>

                            <span
                                className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${badgeBg}`}
                            >
                                {passed ? '🎉 Passed' : '✗ Not passed'}
                            </span>

                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                                Pass mark: {result.pass_percentage}%
                            </p>

                            {result.total != null && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {Math.round((result.score / 100) * result.total)} /{' '}
                                    {result.total} correct
                                </p>
                            )}

                            {passed && (
                                <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                                    Congratulations! This chapter is now marked as completed.
                                </p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 transition-colors hover:border-[var(--thm-primary)]"
                            >
                                <FaChevronLeft className="text-sm" />
                                Back to Chapter
                            </button>

                            <button
                                onClick={handleRetake}
                                disabled={loadingStart}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: 'var(--thm-primary)' }}
                            >
                                {loadingStart ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating quiz…
                                    </>
                                ) : (
                                    <>
                                        <MdOutlineReplay className="text-xl" />
                                        {passed ? 'Retake' : 'Try Again'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Per-question review — only if backend returns it */}
                    {Array.isArray(result.per_question) && result.per_question.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 px-1">
                                Question Review
                            </h2>

                            {result.per_question.map((q, idx) => (
                                <div
                                    key={q.question_id}
                                    className={`bg-white dark:bg-[#161b22] rounded-2xl shadow p-6 border-l-4 ${
                                        q.is_correct ? 'border-green-500' : 'border-red-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {q.is_correct ? (
                                            <HiOutlineCheckCircle className="text-green-500 text-2xl flex-shrink-0" />
                                        ) : (
                                            <HiOutlineXCircle className="text-red-500 text-2xl flex-shrink-0" />
                                        )}
                                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                            Question {idx + 1}
                                        </span>
                                    </div>

                                    <div className="space-y-2 ml-9">
                                        {q.selected_option_id && q.selected_option_id !== q.correct_option_id && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="w-24 flex-shrink-0 text-xs text-gray-400">Your answer:</span>
                                                <span className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium line-through">
                                                    {q.selected_option_id}
                                                </span>
                                            </div>
                                        )}
                                        {!q.selected_option_id && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="w-24 flex-shrink-0 text-xs text-gray-400">Your answer:</span>
                                                <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs italic">
                                                    Skipped
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="w-24 flex-shrink-0 text-xs text-gray-400">Correct:</span>
                                            <span className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium">
                                                {q.correct_option_id}
                                            </span>
                                        </div>
                                    </div>

                                    {q.explanation && (
                                        <div className="mt-4 ml-9 flex items-start gap-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-xl p-3">
                                            <HiOutlineInformationCircle className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuizResult
