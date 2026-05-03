import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import pricingReducer, {
    useAppSelector,
    useAppDispatch,
    setPaymentDialog,
    setSelectedPlan,
} from '../store'
import { useEffect } from 'react'
import classNames from 'classnames'
import { NumericFormat } from 'react-number-format'
import { TbCheck } from 'react-icons/tb'
import { injectReducer } from '@/store'
import { staticPlans } from '../constants'

injectReducer('pricing', pricingReducer)

interface PlansProps {
    filterUids?: string[]
}

const Plans = ({ filterUids }: PlansProps) => {
    const dispatch = useAppDispatch()
    const { loading } = useAppSelector((state) => state.pricing.data)

    const filteredPlans = filterUids 
        ? staticPlans.filter(p => filterUids.includes(p.uid))
        : staticPlans

    if (loading) {
        return <div>Loading plans...</div>
    }

    return (
        <>
            {filteredPlans.map((plan) => (
                <div
                    key={plan.uid}
                    className={classNames(
                        'w-full max-w-[320px] h-full p-5 rounded-xl border flex flex-col justify-between bg-[#1a212e] text-white transition-all duration-300 hover:scale-[1.01]',
                        'border-[var(--thm-primary)]/50 ring-1 ring-[var(--thm-primary)]/30',
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="mb-2 h-5">
                            {plan.tag && (
                                <span
                                    className={classNames(
                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                        plan.tag === 'Free' &&
                                            'bg-gray-100 text-black',
                                        plan.tag === 'Most popular' &&
                                            'bg-green-500/10 text-green-500 border border-green-500/20',
                                        plan.tag === 'Best value' &&
                                            'bg-purple-500/10 text-purple-500 border border-purple-500/20',
                                        plan.tag === 'Exam season' &&
                                            'bg-orange-500/10 text-orange-500 border border-orange-500/20',
                                        plan.tag === 'School' &&
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20',
                                    )}
                                >
                                    {plan.tag}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-0.5">
                            {plan.plan_name}
                        </h3>
                        <p className="text-gray-400 text-[13px] mb-3 leading-relaxed min-h-[40px]">
                            {plan.plan_description}
                        </p>

                        <div className="mb-1 flex items-baseline gap-1">
                            <span className="text-2xl font-bold">
                                <NumericFormat
                                    displayType="text"
                                    value={plan.cost}
                                    prefix={'₹'}
                                    thousandSeparator={true}
                                />
                            </span>
                            <span className="text-gray-500 text-xs font-medium">
                                /{plan.duration}
                            </span>
                        </div>
                        <p className="text-gray-500 text-[11px] mb-3 min-h-[16px]">
                            {plan.sub_description}
                        </p>

                        <div className="bg-[#11161f] rounded-lg p-3 mb-4 border border-gray-800 flex flex-col justify-center min-h-[64px]">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wide font-bold mb-1">
                                {plan.token_sub_text}
                            </div>
                            <div className="font-semibold text-[13px] text-gray-100">
                                {plan.token_limit}
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 flex-grow">
                            {plan.features?.map((feature, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-[12px] text-gray-300 leading-tight"
                                >
                                    <TbCheck className="mt-0.5 text-[var(--thm-primary)] shrink-0 size-3" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button
                        className={classNames(
                            'w-full rounded-lg text-sm font-bold transition-all py-2.5 border-none',
                            plan.recommended 
                                ? 'bg-[var(--thm-primary)] hover:bg-[var(--thm-primary)] opacity-90 hover:opacity-100 text-white shadow-lg shadow-[var(--thm-primary)]/20' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        )}
                        onClick={() => {
                            dispatch(
                                setSelectedPlan({
                                    planName: plan.plan_name,
                                    planId: plan.uid,
                                    cost: plan.cost,
                                    duration: plan.duration,
                                    planDescription: plan.plan_description,
                                    hoursPerDay: plan.hours_per_day,
                                    dailyLimit: plan.daily_limit,
                                    discount: plan.discount,
                                }),
                            )
                            dispatch(setPaymentDialog(true))
                        }}
                    >
                        {plan.cost === 0 ? 'Try Free' : 'Select Plan'}
                    </Button>
                </div>
            ))}
        </>
    )
}

export default Plans
