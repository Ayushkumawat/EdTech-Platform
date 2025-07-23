import Segment from '@/components/ui/Segment'
import { useAppSelector, useAppDispatch, setPaymentCycle } from '../store'
import type { PaymentCycle } from '../types'

const PaymentCycleToggle = () => {
    const paymentCycle = useAppSelector((state) => state.pricing.data.paymentCycle)
    const dispatch = useAppDispatch()

    return (
        <Segment
            value={paymentCycle}
            onChange={(val) => dispatch(setPaymentCycle(val as PaymentCycle))}
        >
            <Segment.Item value="monthly">Monthly</Segment.Item>
            <Segment.Item value="annually">Annually</Segment.Item>
        </Segment>
    )
}

export default PaymentCycleToggle
