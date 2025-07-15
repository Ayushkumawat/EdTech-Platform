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
        key: 'appsAccount.settings',
        path: `${APP_PREFIX_PATH}/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },
    {
        key: 'pricing',
        path: '/pricing',
        component: lazy(() => import('@/views/pricing/Pricing')),
        authority: [],
    },
    {
        key: 'contact',
        path: '/contact',
        component: lazy(() => import('@/views/contact/Contact')),
        authority: []
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
    path: `${APP_PREFIX_PATH}/my_books/book_detail/:bookId/chapter/:chapterId`,
    component: lazy(() => import('@/views/teachingPage')),
    authority: [],
    
},
]






