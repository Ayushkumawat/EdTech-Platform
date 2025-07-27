import { useState } from 'react'
import Card from '@/components/ui/Card'
import Menu from '@/components/ui/Menu'
import Question from './Question'
import { questionList, questionCategory } from '../constants'
import isLastChild from '@/utils/isLastChild'

const Faq = () => {
    const [selectedCategory, setSelectedCategory] = useState('subscription')

    return (
        <Card>
            <h3 className="mt-2">FAQ</h3>
            <div className="flex flex-col md:flex-row gap-4 md:gap-20 mt-8">
                <div className="min-w-[230px]">
                    <Menu className="bg-gray-100 dark:bg-[#11161f]">
                        {Object.entries(questionList).map(([key]) => (
                            <Menu.MenuItem
                                key={key}
                                isActive={key === selectedCategory}
                                eventKey={key}
                                onSelect={setSelectedCategory}
                                className={`bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${
                                    key === selectedCategory 
                                        ? '!bg-gray-900 !text-white dark:bg-gray-900 !dark:text-white' 
                                        : ''
                                }`}
                            >
                                {questionCategory[key]}
                            </Menu.MenuItem>
                        ))}
                    </Menu>
                </div>
                <div className="max-w-[800px] my-2">
                    <div className="">
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
        </Card>
    )
}

export default Faq
