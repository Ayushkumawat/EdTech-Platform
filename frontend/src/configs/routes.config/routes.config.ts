import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

const commonRoutes = [
  
    {
        key: 'home',
        path: `${APP_PREFIX_PATH}/home`,
        component: lazy(() => import('../../views/landingPage')),
        authority: [],
    },
    {
        key: 'about',
        path: `${APP_PREFIX_PATH}/about`,
        component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'appsAccount.settings',
        path: `${APP_PREFIX_PATH}/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },

]

export const authRouts: Routes = [...authRoute]
export const publicRoutes: Routes = [ ...commonRoutes]

export const protectedRoutes:Routes=[
    {
        key: 'books',
        path: `${APP_PREFIX_PATH}/all_books`,
        component: lazy(() => import('@/views/Books/books-all/AllBooks')),
        authority: [],
    },
    {
        key: 'book_detail',
        path: `${APP_PREFIX_PATH}/all_books/book_detail/:bookId`,
        component: lazy(() => import('@/views/Books/books-all/AllBookDetail')),
        authority: [],
    },
    {
    key: 'lesson_teaching',
    path: `${APP_PREFIX_PATH}/my_books/book_detail/:bookId/lesson/:lessonId`,
    component: lazy(() => import('@/views/teachingPage')),
    authority: [],
    
},
]






