import { combineReducers } from '@reduxjs/toolkit'
import reducers, { SLICE_NAME, PricingState } from './pricingSlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const reducer = combineReducers({
    data: reducers,
})

type SliceName = typeof SLICE_NAME;

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [key in SliceName]: {
            data: PricingState
        }
    }
> = useSelector

export * from './pricingSlice'
export { useAppDispatch } from '@/store'
export default reducer 