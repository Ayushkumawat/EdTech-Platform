import { useState } from 'react'
import Plans from './components/Plans'
import Faq from './components/Faq'
import PaymentDialog from './components/PaymentDialog'
import classNames from 'classnames'

const Pricing = () => {
    const [activeTab, setActiveTab] = useState<'student' | 'school'>('student')

    return (
        <div className="bg-[#11161f] min-h-screen py-10 px-4">
            <div className="container max-w-[1400px] mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        Choose the perfect plan for your learning journey.
                    </p>

                    {/* Tabs */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-[#1a212e] p-1 rounded-xl flex border border-gray-800">
                            <button
                                className={classNames(
                                    'px-8 py-2.5 rounded-lg text-sm font-bold transition-all',
                                    activeTab === 'student'
                                        ? 'bg-[var(--thm-primary)] text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                                onClick={() => setActiveTab('student')}
                            >
                                For Students
                            </button>
                            <button
                                className={classNames(
                                    'px-8 py-2.5 rounded-lg text-sm font-bold transition-all',
                                    activeTab === 'school'
                                        ? 'bg-[var(--thm-primary)] text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                                onClick={() => setActiveTab('school')}
                            >
                                For Schools
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {activeTab === 'student' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 place-items-center">
                            <Plans filterUids={['explorer-free', 'scholar-popular', 'pro-best-value', 'crunch-exam']} />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Plans filterUids={['campus-school']} />
                        </div>
                    )}
                </div>
                
                <div className="mt-24">
                    <Faq />
                </div>
            </div>
            <PaymentDialog />
        </div>
    )
}

export default Pricing
