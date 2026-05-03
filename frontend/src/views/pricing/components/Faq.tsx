import { useState } from 'react'
import Question from './Question'
import { questionList, questionCategory } from '../constants'
import isLastChild from '@/utils/isLastChild'
import classNames from 'classnames'

const Faq = () => {
    const [selectedCategory, setSelectedCategory] = useState('subscription')

    return (
        <div className="bg-[#1a212e] p-6 md:p-10 rounded-2xl border border-gray-800">
            <h3 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h3>
            <div className="flex flex-col md:flex-row gap-4 md:gap-20">
                <div className="min-w-[230px]">
                    <div className="bg-[#11161f] rounded-xl overflow-hidden border border-gray-800">
                        {Object.entries(questionList).map(([key]) => (
                            <div
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={classNames(
                                    'px-6 py-4 cursor-pointer text-sm font-semibold transition-all',
                                    key === selectedCategory
                                        ? 'bg-[var(--thm-primary)] text-white'
                                        : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
                                )}
                            >
                                {questionCategory[key]}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-grow max-w-[800px]">
                    <div className="space-y-2">
                        {questionList[selectedCategory].map(
                            (question, index) => (
                                <Question
                                    key={question.title}
                                    border={
                                        !isLastChild(
                                            questionList[selectedCategory],
                                            index,
                                        )
                                    }
                                    isFirstChild={index === 0}
                                    {...question}
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Faq
