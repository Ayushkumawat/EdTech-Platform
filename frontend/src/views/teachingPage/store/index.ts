import { combineReducers } from '@reduxjs/toolkit'
import reducers, {
    SLICE_NAME,
    TeachingState,
} from './TeachingSlice'

import { useSelector } from 'react-redux'

import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const reducer = combineReducers({
    data: reducers,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: TeachingState
        }
    }
> = useSelector

export * from './TeachingSlice'
export { useAppDispatch } from '@/store'
export default reducer
