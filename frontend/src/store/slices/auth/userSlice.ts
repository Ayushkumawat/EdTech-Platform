import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { apiGetUserMe } from '@/services/UserService'




export type UserState = {
    first_name?: string
    last_name?: string
    email?: string
    class_id?: string
    avatar?: string
    authority?: string[]
    daily_usage?: number
    loading: boolean
}

const initialState: UserState = {
    first_name: '',
    last_name: '',
    email: '',
    class_id: '',
    avatar: '',
    authority: [],
    daily_usage: 0,
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
                daily_usage?: number
            }>()
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
            state.daily_usage = action.payload?.daily_usage
            state.loading = action.payload?.loading ?? false
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
                state.daily_usage = action.payload?.daily_usage
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false
            })
    }
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
