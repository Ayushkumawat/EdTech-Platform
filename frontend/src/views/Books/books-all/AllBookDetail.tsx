import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import allBookReducer,{ useAppSelector as bookAppSelector, useAppDispatch, getBookDetail, resetError } from './store'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import BookDetail from '../components/BookDetail'
import useAuth from '@/utils/hooks/useAuth'
import { injectReducer } from '@/store'
import Loading from '@/components/shared/Loading'

injectReducer("book_all",allBookReducer)
const AllBookDetail = () => {
    const { bookId }: any = useParams<{ bookId: string }>()
    const navigate = useNavigate()
    const { authenticated } = useAuth()
    const dispatch = useAppDispatch()
    const bookDetail = bookAppSelector((state) => state.book_all.data.bookDetail)
    const detailLoading=bookAppSelector((state)=>state.book_all.data.detailLoading)
    const error = bookAppSelector((state) => state.book_all.data.error)
    
    useEffect(() => {
        if (error) {
          dispatch(resetError())
          navigate(`${APP_PREFIX_PATH}/all_books`, { replace: true })
        }
    }, [error]) 

    useEffect(() => {
        if (!error && bookId !== bookDetail?.uid) {
            dispatch(getBookDetail(bookId));
        }
    }, []);

    useEffect(() => {
       console.log(bookDetail,"these is book datail")
    }, [bookDetail]);

    return (
        <>
            <Loading loading={detailLoading} className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#11161f] z-[99999]" />
            {bookDetail && (
                <BookDetail
                    bookDetail={bookDetail}
                />
            )}
        </>
    )
}

export default AllBookDetail
