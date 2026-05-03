import { useState } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { TbMinus, TbPlus } from 'react-icons/tb'

type QuestionProps = {
    title: string
    content: string
    defaultExpand: boolean
    border: boolean
    isFirstChild: boolean
}

const Question = (props: QuestionProps) => {
    const { title, content, defaultExpand, border, isFirstChild } = props

    const [expand, setExpand] = useState(defaultExpand)

    return (
        <div
            className={classNames(
                'flex flex-col w-full',
                border && 'border-b border-gray-800',
                isFirstChild ? 'pb-6' : 'py-6',
            )}
        >
            <div
                className="flex items-center gap-4 transition-colors h6 font-bold cursor-pointer group text-gray-200"
                role="button"
                onClick={() => setExpand(!expand)}
            >
                <span className="text-xl">
                    {expand ? <TbMinus className="text-[var(--thm-primary)]" /> : <TbPlus />}
                </span>
                <span className="group-hover:text-[var(--thm-primary)]">{title}</span>
            </div>
            <AnimatePresence>
                {expand && (
                    <motion.div
                        className="mt-4 ltr:ml-10 text-gray-400 text-sm leading-relaxed"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Question
