import React, { useEffect, useState } from 'react'
import { IoIosStar } from 'react-icons/io'
import { FaUser } from 'react-icons/fa'
import { IoDocumentTextSharp } from 'react-icons/io5'
import { FaClock } from 'react-icons/fa'
import { MdOutlineSearch } from 'react-icons/md'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import useAuth from '@/utils/hooks/useAuth'
import { Link } from 'react-router-dom'
import type { Book, Subject } from '../books-all/store/booksSlice'

interface BookListingProps {
    booksdata: Book[]
    subjectsData: Subject[]
}

const BookListing = ({ booksdata, subjectsData }: BookListingProps) => {
    const { authenticated } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSubject, setSelectedSubject] = useState<string>('all')

    // Filter books based on search term and selected subject
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
                            <div className="flex gap-4 items-center">
                                {/* Subject Filter */}
                                <select 
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Subjects</option>
                                    {subjectsData?.map((subject) => (
                                        <option key={subject.uid} value={subject.uid}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                
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
                                    className="wow animated fadeInUp"
                                    data-wow-delay="0.1s"
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