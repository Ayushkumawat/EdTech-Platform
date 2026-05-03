import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Notification, toast } from '@/components/ui'
import { HiOutlineChevronRight, HiOutlineChevronLeft } from 'react-icons/hi'
import { useAppSelector, useAppDispatch, setSelection, submitQuizAttempt, clearError } from '../store'

interface QuizRunnerProps {
    chapterId: string
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ chapterId }) => {
    const dispatch = useAppDispatch()
    const attempt = useAppSelector((s) => s.quiz.data.currentAttempt)
    const selections = useAppSelector((s) => s.quiz.data.selections)
    const loadingSubmit = useAppSelector((s) => s.quiz.data.loading.submit)
    const error = useAppSelector((s) => s.quiz.data.error)

    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<1 | -1>(1)
    const [isRateLimited, setIsRateLimited] = useState(false)

    // 429 handling
    useEffect(() => {
        if (!error) return
        const isRateError =
            error.toLowerCase().includes('rate') ||
            error.toLowerCase().includes('wait') ||
            error.toLowerCase().includes('too many')
        if (isRateError) {
            toast.push(
                <Notification title="Please wait" type="warning" duration={3000}>
                    {error}
                </Notification>
            )
            setIsRateLimited(true)
            const timer = setTimeout(() => setIsRateLimited(false), 2000)
            dispatch(clearError())
            return () => clearTimeout(timer)
        } else {
            toast.push(
                <Notification title="Submit failed" type="danger" duration={5000}>
                    {error}
                </Notification>
            )
            dispatch(clearError())
        }
    }, [error])

    if (!attempt) return null

    const { questions, attemptId } = attempt
    const total = questions.length
    const question = questions[currentIndex]
    if (!question) return null

    const selected = selections[question.question_id] ?? null
    const isLast = currentIndex === total - 1

    const handleOptionClick = (optionId: string) => {
        dispatch(setSelection({ questionId: question.question_id, optionId }))
    }

    const goNext = () => {
        setDirection(1)
        setCurrentIndex((i) => Math.min(i + 1, total - 1))
    }

    const goPrev = () => {
        setDirection(-1)
        setCurrentIndex((i) => Math.max(i - 1, 0))
    }

    const handleSubmit = () => {
        const answers = questions.map((q) => ({
            question_id: q.question_id,
            selected_option: selections[q.question_id] ?? null,
        }))
        dispatch(submitQuizAttempt({ attemptId, answers, chapterId }))
    }

    const answeredCount = questions.filter(
        (q) => selections[q.question_id] != null
    ).length

    const optionLabels = ['A', 'B', 'C', 'D']

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 60 : -60,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({
            x: dir > 0 ? -60 : 60,
            opacity: 0,
        }),
    }

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col overflow-hidden">
            {/* Top bar */}
            <div
                className="px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0"
                style={{ background: 'var(--thm-primary)' }}
            >
                <span className="text-white font-bold text-lg">Quiz</span>
                <span className="text-white text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {answeredCount} / {total} answered
                </span>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pt-5 px-6 flex-wrap flex-shrink-0">
                {questions.map((q, idx) => {
                    const isAnswered = selections[q.question_id] != null
                    const isCurrent = idx === currentIndex
                    return (
                        <button
                            key={q.question_id}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1)
                                setCurrentIndex(idx)
                            }}
                            className={`rounded-full transition-all duration-200 ${
                                isCurrent
                                    ? 'w-7 h-3.5'
                                    : 'w-3 h-3'
                            } ${
                                isAnswered
                                    ? 'bg-[var(--thm-primary)]'
                                    : isCurrent
                                    ? 'bg-[var(--thm-primary)] opacity-60'
                                    : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        />
                    )
                })}
            </div>

            {/* Question counter */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium flex-shrink-0">
                Question {currentIndex + 1} of {total}
            </p>

            {/* Question card — animated, scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-2xl mx-auto">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={question.question_id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                            {/* Question text */}
                            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg px-8 py-7 mb-5">
                                <p className="text-gray-800 dark:text-gray-100 font-semibold text-base leading-relaxed">
                                    {question.text}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {(question.options ?? []).map((option, idx) => {
                                    const isSelected = selected === option.option_id
                                    return (
                                        <button
                                            key={option.option_id}
                                            onClick={() => handleOptionClick(option.option_id)}
                                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                                                isSelected
                                                    ? 'border-[var(--thm-primary)] bg-[rgba(var(--thm-primary-rgb),0.08)] dark:bg-[rgba(var(--thm-primary-rgb),0.2)]'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-[var(--thm-primary)] hover:bg-[rgba(var(--thm-primary-rgb),0.04)]'
                                            }`}
                                        >
                                            {/* Letter badge */}
                                            <span
                                                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors duration-150 ${
                                                    isSelected
                                                        ? 'text-white'
                                                        : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                                                }`}
                                                style={
                                                    isSelected
                                                        ? { background: 'var(--thm-primary)' }
                                                        : {}
                                                }
                                            >
                                                {optionLabels[idx] ?? option.option_id.toUpperCase()}
                                            </span>

                                            <span
                                                className={`text-sm font-medium leading-snug ${
                                                    isSelected
                                                        ? 'text-[var(--thm-primary)]'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {option.text}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom nav */}
            <div className="flex-shrink-0 bg-white dark:bg-[#161b22] border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between gap-4 shadow-lg">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--thm-primary)] transition-colors"
                >
                    <HiOutlineChevronLeft />
                    Back
                </button>

                {isLast ? (
                    <button
                        onClick={handleSubmit}
                        disabled={loadingSubmit || isRateLimited || !selected}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--thm-primary)' }}
                    >
                        {loadingSubmit ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            'Submit Quiz'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        disabled={!selected}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                        style={{ background: 'var(--thm-primary)' }}
                    >
                        Next
                        <HiOutlineChevronRight />
                    </button>
                )}
            </div>
        </div>
    )
}

export default QuizRunner
