import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { MenuItem } from '@/@types/navigation'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

const navigationConfig:MenuItem[] = [
        {
            label: 'Home',
            path: `${APP_PREFIX_PATH}/home`,
            icon:"home"
        },
        {
            label: 'About',
            path: `${APP_PREFIX_PATH}/about`
        },
        {
            label: 'Books',
            path:`${APP_PREFIX_PATH}/all_books`
            
        },

        {
            label: 'Blog',
            subMenu: []
        },
        {
            label: 'Contact',
            path: '/contact'
        }
    ];

export default navigationConfig
