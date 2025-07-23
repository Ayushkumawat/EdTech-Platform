export type PaymentCycle = 'monthly' | 'annually'

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

export type GetPricingPanResponse = {
    featuresModel: {
        id: string
        description: string
    }[]
    plans: {
        id: string
        name: string
        description: string
        price: {
            monthly: number
            annually: number
        }
        features: string[]
        recommended: boolean
    }[]
}
