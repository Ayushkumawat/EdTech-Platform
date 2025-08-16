import { useLocation} from 'react-router-dom'
import { useRef,useEffect ,useMemo} from 'react'
import View from '@/views'
import Layout from '../main-layout/Layout'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import AuthLayout from './AuthLayout'


const MainLayout = () => {
    const location = useLocation();
   

    const getLayoutSettings = (path: string) => {
        // Define route patterns and their breadcrumb configurations
        const routeConfigs = [
            {
                pattern: new RegExp(`^${APP_PREFIX_PATH}/home$`),
                config: { headerStyle: 1, breadcrumbTitle: '', footerStyle: 1, breadcrumbPath: [] }
            },
            {
                pattern: new RegExp(`^${APP_PREFIX_PATH}/all_books$`),
                config: { 
                    headerStyle: 3, 
                    breadcrumbTitle: 'Books', 
                    footerStyle: 1,
                    breadcrumbPath: [
                        { label: 'Home', path: `${APP_PREFIX_PATH}/home` },
                        { label: 'Books', path: null }
                    ]
                }
            },
            {
                pattern: new RegExp(`^${APP_PREFIX_PATH}/all_books/book_detail/([^/]+)$`),
                config: { 
                    headerStyle: 3, 
                    breadcrumbTitle: 'Book Detail', 
                    footerStyle: 1,
                    breadcrumbPath: [
                        { label: 'Home', path: `${APP_PREFIX_PATH}/home` },
                        { label: 'Books', path: `${APP_PREFIX_PATH}/all_books` },
                        { label: 'Book Detail', path: null }
                    ]
                }
            },
            {
                pattern: new RegExp(`^${APP_PREFIX_PATH}/my_books/book_detail/([^/]+)/chapter/([^/]+)$`),
                config: { 
                    headerStyle: null, 
                    breadcrumbTitle: null, 
                    footerStyle: null,
                    breadcrumbPath: []
                }
            },
            {
                pattern: new RegExp(`^${APP_PREFIX_PATH}/account/settings/([^/]+)$`),
                config: { 
                    headerStyle: 3, 
                    breadcrumbTitle: 'Account Settings', 
                    footerStyle: 1,
                    breadcrumbPath: [
                        { label: 'Home', path: `${APP_PREFIX_PATH}/home` },
                        { label: 'Account Settings', path: null }
                    ]
                }
            },
            {
                pattern: new RegExp(`^/pricing$`),
                config: { 
                    headerStyle: 3, 
                    breadcrumbTitle: 'Pricing', 
                    footerStyle: 1,
                    breadcrumbPath: [
                        { label: 'Home', path: '/' },
                        { label: 'Pricing', path: null }
                    ]
                }
            },
            {
                pattern: new RegExp(`^/contact$`),
                config: { 
                    headerStyle: 3, 
                    breadcrumbTitle: 'Contact', 
                    footerStyle: 1,
                    breadcrumbPath: [
                        { label: 'Home', path: '/' },
                        { label: 'Contact', path: null }
                    ]
                }
            }
        ];

        // Find matching route configuration
        for (const route of routeConfigs) {
            if (route.pattern.test(path)) {
                return route.config;
            }
        }

        // Default fallback for unmatched routes
        const segments = path.split('/').filter(segment => segment);
        const lastSegment = segments[segments.length - 1];
        
        return {
            headerStyle: 3,
            breadcrumbTitle: lastSegment ? capitalize(lastSegment.replace(/[-_]/g, ' ')) : 'Page',
            footerStyle: 1,
            breadcrumbPath: [
                { label: 'Home', path: `${APP_PREFIX_PATH}/home` },
                { label: lastSegment ? capitalize(lastSegment.replace(/[-_]/g, ' ')) : 'Page', path: null }
            ]
        };
    };

    
    const capitalize = (str: string) => {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    
    const { headerStyle, breadcrumbTitle, footerStyle, breadcrumbPath } = getLayoutSettings(location.pathname);
    


    return (
        (location.pathname ==`/sign-in` || location.pathname ==`/sign-up`)  ? (
            <AuthLayout />
        ) : (
            <Layout 
                headerStyle={headerStyle} 
                footerStyle={footerStyle} 
                breadcrumbTitle={breadcrumbTitle}
                breadcrumbPath={breadcrumbPath}
            >
                <div className='outer-layout-container'>
                <View />
                </div>
            </Layout>
        )
    );
}

export default MainLayout;
