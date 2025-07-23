import Pricing from './Pricing'
import pricingReducer from './store'
import { injectReducer } from '@/store'

injectReducer('pricing', pricingReducer)

export default Pricing
