import { useLocation} from 'react-router-dom'
import { useRef,useEffect ,useMemo} from 'react'
import View from '@/views'
import Layout from '../main-layout/Layout'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import AuthLayout from './AuthLayout'


const MainLayout = () => {
    const location = useLocation();
   

    const getLayoutSettings = (path:any) => {
        const dynamicLessonPathRegex = new RegExp(`${APP_PREFIX_PATH}/my_books/book_detail/[^/]+/lesson/[^/]+`);
    
        if (path === `${APP_PREFIX_PATH}/home`) {
            return { headerStyle: 1, breadcrumbTitle: '', footerStyle: 1 };
        } else if (dynamicLessonPathRegex.test(path)) {
            return { headerStyle:null, breadcrumbTitle:null, footerStyle:null };
        } else {
            const lastSegment = path.split("/").pop();
            return {
                headerStyle: 3,
                breadcrumbTitle: lastSegment ? capitalize(lastSegment) : '',
                footerStyle: 1,
            };
        }
    };

    
    const capitalize = (str:any) => str.charAt(0).toUpperCase() + str.slice(1);

    
    const { headerStyle, breadcrumbTitle,footerStyle} = getLayoutSettings(location.pathname);
    


    return (
        (location.pathname ==`/sign-in` || location.pathname ==`/sign-up`)  ? (
            <AuthLayout />
        ) : (
            <Layout headerStyle={headerStyle} footerStyle={footerStyle} breadcrumbTitle={breadcrumbTitle}>
                <div className='outer-layout-container'>
                <View />
                </div>
            </Layout>
        )
    );
}

export default MainLayout;
