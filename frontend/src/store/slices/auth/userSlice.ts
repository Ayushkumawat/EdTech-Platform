import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'




export type UserState = {
    first_name?: string
    last_name?: string
    email?: string
    class_id?: string
    avatar?: string
    authority?: string[]
    loading: boolean
}

const initialState: UserState = {
    first_name: '',
    last_name: '',
    email: '',
    class_id: '',
    avatar: '',
    authority: [],
    loading: false
}



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
        },
    
    }, 

})

export const { setUser } = userSlice.actions
export default userSlice.reducer
