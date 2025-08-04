import React, { useEffect, useState } from 'react'
import { IoIosStar } from 'react-icons/io'
import { FaUser } from 'react-icons/fa'
import { IoDocumentTextSharp } from 'react-icons/io5'
import { FaClock } from 'react-icons/fa'
import { MdOutlineSearch } from 'react-icons/md'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import useAuth from '@/utils/hooks/useAuth'
import { Link } from 'react-router-dom'
import Select from '@/components/ui/Select'
import { apiGetClasses } from '@/services/ClassService'
import { apiGetSubjectBookByClass } from '@/services/BooksServices'
import { useAppSelector, useAppDispatch, injectReducer } from '@/store'
import type { Book, Subject } from '../books-all/store/booksSlice'
import allBookReducer, {
    useAppSelector as bookAppSelector,
    getBooksData,
    useAppDispatch as bookAppDispatch,
    resetError,
    resetNotifaction,
    setSelectedClass
} from '../books-all/store'

interface BookListingProps {
    booksdata: Book[]
    subjectsData: Subject[]
    onClassChange?: (classId: string) => void
}

const BookListing = ({ booksdata, subjectsData, onClassChange }: BookListingProps) => {
    const { authenticated } = useAuth()
    const dispatch = useAppDispatch()
    const bookDispatch = bookAppDispatch()
    const user_class_id = useAppSelector((state) => state.auth.user.class_id)
    const selectedClassFromRedux = bookAppSelector((state) => state.book_all.data.selectedClass)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSubject, setSelectedSubject] = useState<string>('all')

    // Use selectedClassFromRedux with fallback to user_class_id
    const selectedClass = selectedClassFromRedux || user_class_id || ''

    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([])
    const [loadingClasses, setLoadingClasses] = useState(false)
    const [hasClassBeenTouched, setHasClassBeenTouched] = useState(false)

    // Convert subjects to Select options format
    const subjectOptions = [
        { label: 'All Subjects', value: 'all' },
        ...(subjectsData?.map((subject) => ({
            label: subject.name,
            value: subject.uid,
        })) || [])
    ]

    // Fetch classes data
    useEffect(() => {
        const fetchClasses = async () => {
            setLoadingClasses(true)
            try {
                const response = await apiGetClasses<any>()
                const options = (response.data || []).map((item: any) => ({
                    label: item.name,
                    value: item.uid,
                }))
                setClassOptions(options)
            } catch (error) {
                console.error('Error fetching classes:', error)
            } finally {
                setLoadingClasses(false)
            }
        }
        fetchClasses()
    }, [])

    // Handle class change
    const handleClassChange = (classId: string) => {
        setHasClassBeenTouched(true)
        
        // Dispatch to Redux using bookAppDispatch
        bookDispatch(setSelectedClass(classId))
        
        if (onClassChange) {
            onClassChange(classId)
        }
    }

    // Filter books based on search term and selected subject only (class filtering is now handled by API)
    const filteredBooks = booksdata?.filter((book) => {
        const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             book.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSubject = selectedSubject === 'all' || book.subject_id === selectedSubject
        return matchesSearch && matchesSubject
    }) || []

    return (
        <div>
            {/* Start Shop Page */}
            <section className="book-page">
                <div className="container max-w-[1300px]">
                    <div className="book-page__top">
                        <div className="book-page__top-inner">
                            <div className="book-page__top-left">
                                <p>
                                    Showing {filteredBooks.length} results
                                </p>
                            </div>
                            <div className="flex gap-4 items-center w-[700px]">
                                {/* Class Filter */}
                                <div className="w-56">
                                    <Select
                                        placeholder="Select Class"
                                        options={classOptions}
                                        value={classOptions.find(option => option.value === selectedClass)}
                                        onChange={(option) => handleClassChange(option?.value || '')}
                                        isDisabled={loadingClasses}
                                        isLoading={loadingClasses}
                                    />
                                </div>
                                
                                {/* Subject Filter */}
                                <div className="w-56">
                                    <Select
                                        placeholder="Select Subject"
                                        options={subjectOptions}
                                        value={subjectOptions.find(option => option.value === selectedSubject)}
                                        onChange={(option) => setSelectedSubject(option?.value || 'all')}
                                    />
                                </div>
                                
                                {/* Search */}
                                <div className="sidebar__single sidebar__search">
                                    <form className="sidebar__search-form">
                                        <input
                                            type="search"
                                            placeholder="Search books..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button type="submit">
                                            <i className="fa fa-search text-[28px]">
                                                <MdOutlineSearch />
                                            </i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredBooks.map((book: Book, index: number) => {
                            const subject = subjectsData?.find(sub => sub.uid === book.subject_id)
                            
                            return (
                                <div
                                    key={book.uid}
    
                                >
                                    <div className="book-page__single">
                                        <div className="book-page__single-img">
                                            <img
                                                src={book.cover_image}
                                                alt={book.name || 'Book'}
                                            />
                                            <div className="text">{book.medium}</div>
                                        </div>
                                        <div className="book-page__single-content">
                                            <div className="text-box">
                                                <h4>{book.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{subject?.name}</p>
                                            </div>
                                            <div className="rating-box">
                                                {[...Array(5)].map(
                                                    (_, starIndex) => (
                                                        <Link
                                                            to="#"
                                                            key={starIndex}
                                                        >
                                                            <i className="icon-star">
                                                                <IoIosStar />
                                                            </i>
                                                        </Link>
                                                    ),
                                                )}
                                                <p>({book.reviews?.length || 0})</p>
                                            </div>
                                            <div className="book-stats">
                                                <div>
                                                    <i>
                                                        <FaUser />
                                                    </i>
                                                    <span>
                                                        {book.teacher}
                                                    </span>
                                                </div>
                                                <div>
                                                    <i>
                                                        <IoDocumentTextSharp />
                                                    </i>
                                                    <span>
                                                        {book.chapters?.length || 0} Chapters
                                                    </span>
                                                </div>
                                                <div>
                                                    <i>
                                                        <FaClock />
                                                    </i>
                                                    <span>
                                                        {book.duration} min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="btn-box">
                                                <Link
                                                    to={`${APP_PREFIX_PATH}/all_books/book_detail/${book.uid}`}
                                                >
                                                   Start Learning
                                                    
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filteredBooks.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No books found matching your criteria.</p>
                        </div>
                    )}

                    <ul className="styled-pagination text-center mt-6 flex justify-center space-x-2">
                        <li>
                            <Link to="#">1</Link>
                        </li>
                        <li>
                            <Link to="#">2</Link>
                        </li>
                        <li>
                            <Link to="#">3</Link>
                        </li>
                        <li className="arrow next active">
                            <Link to="#">
                                <span className="icon-left-arrow"></span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </section>
            {/* End Shop Page */}
        </div>
    )
}

export default BookListing