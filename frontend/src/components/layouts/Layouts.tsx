import { useMemo, lazy, Suspense, useRef,useEffect, useState } from 'react'
import Loading from '@/components/shared/Loading'
import allBookReducer,{ useAppSelector as bookAppSelector } from '@/views/Books/books-all/store'
import { useAppSelector } from '@/store'
import {
    LAYOUT_TYPE_CLASSIC,
    LAYOUT_TYPE_MODERN,
    LAYOUT_TYPE_SIMPLE,
    LAYOUT_TYPE_STACKED_SIDE,
    LAYOUT_TYPE_DECKED,
    LAYOUT_TYPE_BLANK,
    LAYOUT_TYPE_MAIN,
} from '@/constants/theme.constant'
import useDirection from '@/utils/hooks/useDirection'
import useLocale from '@/utils/hooks/useLocale'

import { injectReducer } from '@/store'
const layouts = {
    [LAYOUT_TYPE_CLASSIC]: lazy(() => import('./ClassicLayout')),
    [LAYOUT_TYPE_MODERN]: lazy(() => import('./ModernLayout')),
    [LAYOUT_TYPE_STACKED_SIDE]: lazy(() => import('./StackedSideLayout')),
    [LAYOUT_TYPE_SIMPLE]: lazy(() => import('./SimpleLayout')),
    [LAYOUT_TYPE_DECKED]: lazy(() => import('./DeckedLayout')),
    [LAYOUT_TYPE_BLANK]: lazy(() => import('./BlankLayout')),
    [LAYOUT_TYPE_MAIN]: lazy(() => import('./MainLayout')),
}
injectReducer("book_all",allBookReducer)

const Layout = () => {
    const layoutType = useAppSelector((state) => state.theme.layout.type)
 

    
  
    useDirection()
    useLocale()

    const AppLayout = useMemo(() => {
       return layouts[layoutType]
    }, [layoutType])
    
   
    return (
        <Suspense fallback={ 
             <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#11161f] z-[99999]">
                    <Loading loading={true} />
             </div>}>
            

             <AppLayout />
             
        </Suspense>
    );
    
}

export default Layout
