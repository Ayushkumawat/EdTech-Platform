import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { apiGetUserMe } from '@/services/UserService'
import { apiGetUsageStatus, UsageStatusResponse } from '@/services/UsageService'

export type UserState = {
    first_name?: string
    last_name?: string
    email?: string
    class_id?: string
    avatar?: string
    authority?: string[]
    daily_credits?: number
    usage_state?: 'Active' | 'Inactive'
    loading: boolean
}

const initialState: UserState = {
    first_name: '',
    last_name: '',
    email: '',
    class_id: '',
    avatar: '',
    authority: [],
    daily_credits: 0,
    usage_state: 'Inactive',
    loading: false
}

// Async thunk to fetch current user data
export const fetchCurrentUser = createAsyncThunk(
    `${SLICE_BASE_NAME}/user/fetchCurrentUser`,
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetUserMe<{
                first_name?: string
                last_name?: string
                email?: string
                class_id?: string
                avatar?: string
                authority?: string[]
                daily_credits?: number
            }>()
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Async thunk to fetch usage status
export const fetchUsageStatus = createAsyncThunk(
    `${SLICE_BASE_NAME}/user/fetchUsageStatus`,
    async (tokenCount: number, { rejectWithValue }) => {
        try {
            const response = await apiGetUsageStatus<UsageStatusResponse>(tokenCount)
            return response.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)



const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.first_name = action.payload?.first_name
            state.last_name = action.payload?.last_name
            state.email = action.payload?.email
            state.class_id = action.payload?.class_id
            state.avatar = action.payload?.avatar
            state.authority = action.payload?.authority
            state.daily_credits = action.payload?.daily_credits
            state.loading = action.payload?.loading ?? false
            // Set usage_state based on daily_credits
            state.usage_state = (state.daily_credits && state.daily_credits > 0) ? 'Active' : 'Inactive'
        },
        updateUsageState(state, action: PayloadAction<'Active' | 'Inactive'>) {
            state.usage_state = action.payload
        },
        updateUsageStateFromAPI(state, action: PayloadAction<{ Status: string; remainingTokens?: number; totalTokens?: number; lastUsed?: string }>) {
            state.usage_state = action.payload.Status as 'Active' | 'Inactive'
            // Optionally update daily_credits with remainingTokens if provided
            if (action.payload.remainingTokens !== undefined) {
                state.daily_credits = action.payload.remainingTokens
            }
        },
    }, 
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.first_name = action.payload?.first_name
                state.last_name = action.payload?.last_name
                state.email = action.payload?.email
                state.class_id = action.payload?.class_id
                state.avatar = action.payload?.avatar
                state.authority = action.payload?.authority
                state.daily_credits = action.payload?.daily_credits
                // Set usage_state based on daily_credits
                state.usage_state = (state.daily_credits && state.daily_credits > 0) ? 'Active' : 'Inactive'
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false
            })
            .addCase(fetchUsageStatus.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchUsageStatus.fulfilled, (state, action) => {
                state.loading = false
                // Update usage state from API response
                state.usage_state = action.payload.Status as 'Active' | 'Inactive'
                // Update daily_credits with remainingTokens if provided
                if (action.payload.remainingTokens !== undefined) {
                    state.daily_credits = action.payload.remainingTokens
                }
            })
            .addCase(fetchUsageStatus.rejected, (state) => {
                state.loading = false
            })
    }
})

export const { setUser, updateUsageState, updateUsageStateFromAPI } = userSlice.actions
export default userSlice.reducer
