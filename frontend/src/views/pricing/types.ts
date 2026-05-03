export type PaymentCycle = 'monthly' | 'annually'

export type SubscriptionFeature = {
    text: string
}

export type SelectedPlan = {
    planName: string
    planId: string
    cost: number
    duration: string
    planDescription: string
    hoursPerDay: number
    dailyLimit: number
    discount: number
}

export type SubscriptionPlan = {
    uid: string
    plan_name: string
    plan_description: string
    cost: number
    duration: string
    discount: number
    hours_per_day: number
    daily_limit: number
    tag?: string
    sub_description?: string
    token_limit?: string
    token_sub_text?: string
    features?: string[]
    recommended?: boolean
    color?: string
}

export type GetPricingPanResponse = {
    featuresModel: {
        id: string
        description: string
    }[]
    plans: SubscriptionPlan[]
}
