import React, { useState, useEffect, useCallback } from 'react'
import allBookReducer, {
    useAppSelector as bookAppSelector,
    getBooksData,
    useAppDispatch,
    resetError,
    resetNotifaction
} from './store'
import Loading from '@/components/shared/Loading'

import toast from '@/components/ui/toast'
import { useAppSelector } from '@/store'

import BookListing from '../components/BookListing'
import useAuth from '@/utils/hooks/useAuth'
import { injectReducer } from '@/store'
import Notification from '@/components/ui/Notification'

injectReducer("book_all",allBookReducer)
const AllBooks = () => {
    const dispatch = useAppDispatch()
    const {authenticated} = useAuth()
    const classId=useAppSelector((state) => state.auth.user.class_id)
    const booksdata = bookAppSelector((state) => state.book_all.data.booksData)
    const subjectsData=bookAppSelector((state) => state.book_all.data.subjectsData)
    const bookLoading = bookAppSelector((state) => state.book_all.data.bookLoading)
    const notification = bookAppSelector((state) => state.book_all.data.notification)

    const fetchData = () => {
        if (booksdata && booksdata.length === 0 && classId) {
            dispatch(getBooksData(classId))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    useEffect(()=>{
        if (notification){
        console.log(notification)
        toast.push(
            <Notification closable type={notification.type} duration={4000}>
                {notification.message}
            </Notification>
        )
        dispatch(resetNotifaction())
        
        
    }
    },[notification])


    return (
        <> 
            <Loading loading={bookLoading} className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#11161f] z-[99999]" />
            <BookListing booksdata={booksdata} subjectsData={subjectsData}/>
        </>
    )
}

export default AllBooks
