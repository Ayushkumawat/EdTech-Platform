import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import pricingReducer,{ useAppSelector, useAppDispatch, setPaymentDialog, setSelectedPlan, fetchSubscriptionPlans } from '../store'
import { useEffect } from 'react'
import classNames from 'classnames'
import isLastChild from '@/utils/isLastChild'
import { NumericFormat } from 'react-number-format'
import { TbCheck } from 'react-icons/tb'
import { injectReducer } from '@/store'

injectReducer("pricing",pricingReducer)


const Plans = () => {
    const dispatch = useAppDispatch()
    const { plans, loading, paymentCycle } = useAppSelector((state) => state.pricing.data)

    useEffect(() => {
        dispatch(fetchSubscriptionPlans())
    }, [dispatch])

    if (loading) {
        return <div>Loading plans...</div>
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-4">
            {plans?.map((plan, index) => (
                <div
                    key={plan.uid}
                    className={classNames(
                        'px-6 pt-2 flex flex-col justify-between',
                        !isLastChild(plans, index) &&
                            'border-r-0 xl:border-r border-gray-200 dark:border-gray-700',
                    )}
                >
                    <div>
                        <h5 className="mb-6 flex items-center gap-2">
                            <span>{plan.plan_name}</span>
                            {plan.discount > 0 && (
                                <Tag className="rounded-full bg-green-200 font-bold">
                                    {plan.discount}% OFF
                                </Tag>
                            )}
                        </h5>
                        <div className="">{plan.plan_description}</div>
                        <div className="mt-6">
                            <NumericFormat
                                className="h1"
                                displayType="text"
                                value={plan.cost}
                                prefix={'₹'}
                                thousandSeparator={true}
                            />
                            <span className="text-lg font-bold">
                                {' '}/ {plan.duration} days
                            </span>
                        </div>
                        <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                            <div className="flex items-center gap-4 font-semibold heading-text">
                                <TbCheck className="text-2xl text-primary" />
                                <span>Hours per day: {plan.hours_per_day}</span>
                            </div>
                            <div className="flex items-center gap-4 font-semibold heading-text">
                                <TbCheck className="text-2xl text-primary" />
                                <span>Daily limit: {plan.daily_limit}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Button
                            color="primary"
                            block
                            onClick={() => {
                                dispatch(setSelectedPlan({
                                    planName: plan.plan_name,
                                    planId: plan.uid,
                                    cost: plan.cost,
                                    duration: plan.duration,
                                    planDescription: plan.plan_description,
                                    hoursPerDay: plan.hours_per_day,
                                    dailyLimit: plan.daily_limit,
                                    discount: plan.discount,
                                }))
                                dispatch(setPaymentDialog(true))
                            }}
                        >
                            {plan.cost === 0 ? 'Start Free Trial' : 'Select plan'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Plans
