import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { PaymentCycle, SelectedPlan } from '../types';
import { apiGetAllSubscriptions } from '@/services/SubscriptionServices';

export type SubscriptionPlan = {
    plan_name: string;
    plan_description: string;
    hours_per_day: number;
    daily_limit: number;
    duration: string;
    cost: number;
    discount: number;
    uid: string;
};

export type PricingState = {
    paymentCycle: PaymentCycle;
    paymentDialog: boolean;
    selectedPlan: Partial<SelectedPlan>;
    plans: SubscriptionPlan[];
    loading: boolean;
    error: string | null;
};

const initialState: PricingState = {
    paymentCycle: 'monthly',
    paymentDialog: false,
    selectedPlan: {},
    plans: [],
    loading: false,
    error: null,
};

export const SLICE_NAME= 'pricing'

export const fetchSubscriptionPlans = createAsyncThunk(
    SLICE_NAME+'/fetchSubscriptionPlans',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetAllSubscriptions<any>();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch plans');
        }
    }
);

const pricingSlice = createSlice({
    name: 'pricing',
    initialState,
    reducers: {
        setPaymentCycle(state, action: PayloadAction<PaymentCycle>) {
            state.paymentCycle = action.payload;
        },
        setPaymentDialog(state, action: PayloadAction<boolean>) {
            state.paymentDialog = action.payload;
        },
        setSelectedPlan(state, action: PayloadAction<Partial<SelectedPlan>>) {
            state.selectedPlan = action.payload;
        },
        resetSelectedPlan(state) {
            state.selectedPlan = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscriptionPlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
                state.loading = false;
                state.plans = action.payload;
            })
            .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPaymentCycle, setPaymentDialog, setSelectedPlan, resetSelectedPlan } = pricingSlice.actions;
export default pricingSlice.reducer; 