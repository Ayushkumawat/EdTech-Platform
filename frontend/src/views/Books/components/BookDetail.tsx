import React, { useState, useEffect } from 'react'
import Affix from '@/components/shared/Affix'
import { LuCalendarDays } from 'react-icons/lu'
import { FaRegClock } from 'react-icons/fa6'
import { HiOutlineUsers } from 'react-icons/hi'
import { GrCertificate } from 'react-icons/gr'
import { GrLanguage } from 'react-icons/gr'
import { MdOutlinePlayLesson } from 'react-icons/md'
import { IoIosStar } from 'react-icons/io'
import { HiOutlineUser } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar/Avatar'
import { FaArrowRightLong } from 'react-icons/fa6'
import { FaTwitter } from 'react-icons/fa6'
import { FaLinkedinIn } from 'react-icons/fa'
import { FaYoutube } from 'react-icons/fa'
import { FaFacebookF } from 'react-icons/fa'
import { FaLock } from 'react-icons/fa6'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { FaRegStar } from 'react-icons/fa6'
import useAuth from '@/utils/hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import type { Book } from '../books-all/store/booksSlice'
import useResponsive from '@/utils/hooks/useResponsive'

const bookDetail = ({bookDetail}: {bookDetail: Book}) => {
    const { authenticated } = useAuth()
    const navigate = useNavigate();
    console.log(bookDetail)
    const { smaller } = useResponsive()

    const [activeTab, setActiveTab] = useState('overview')
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId)
    }

    const startLesson = (chapterId: string, bookId: string) => {
        if (authenticated){
            console.log(chapterId,bookId)
            navigate(`${APP_PREFIX_PATH}/my_books/book_detail/${bookId}/chapter/${chapterId}`)
        }else{
            navigate(`/sign-in`)
        }
    }
    

    const tabs = [
        { name: 'Overview', tab: 'overview' },
        { name: 'Reviews', tab: 'reviews' },
    ]



    const reviews = [
        {
            userImg: "/img/avatars/thumb-3.jpg",
            userName: "Ronald Richards",
            reviewDate: "February 10, 2024 at 2:37 pm",
            reviewText:
                "Aenean blandit justo ac rutrum hendrerit. Vivamus ultrices vulputate ante eget convallis. Donec id ex ut tellus blandit aliquet. Morbi varius",
        },
        {
            userImg: "/img/avatars/thumb-5.jpg",
            userName: "Eliza Nolan",
            reviewDate: "February 10, 2024 at 2:37 pm",
            reviewText:
                "Aenean blandit justo ac rutrum hendrerit. Vivamus ultrices vulputate ante eget convallis. Donec id ex ut tellus blandit aliquet. Morbi varius",
        },
    ];
    return (
        <div className="flex flex-col lg:flex-row  relative gap-[30px] p-5 lg:p-20   ">
            <div className="left-0 max-w-full grow ">
                <div>
                    <h4 className="font-bold text-[30px] lg:text-[27px] xs:text-[25px] xxs:text-[23px] text-[var(--thm-black)] mb-[23px]">
                        {bookDetail?.name}
                    </h4>

                    {/*  book meta */}
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-[25px] flex lg:flex-nowrap flex-wrap items-center gap-[26px]   mb-[34px]">
                        {/*  single info */}
                        <div className="flex items-center gap-[10px] border-l border-gray-300 dark:border-gray-700 first:border-none pl-[10px] first:pl-0">
                            <div className="chat-message-box-avatar-container">
                                <Avatar
                                    size={45}
                                    shape="circle"
                                    src="/img/avatars/thumb-13.jpg"
                                    className="bg-slate-200 text-slate-400"
                                    icon={<HiOutlineUser />}
                                />
                            </div>
                            <div>
                                <h6 className="font-medium leading-[1.2]">
                                    {bookDetail?.teacher}
                                </h6>
                                <span className="font-medium text-[14px] text-gray-500 leading-[1]">
                                    Teacher
                                </span>
                            </div>
                        </div>

                        {/*  single info */}
                        <div className="flex items-center gap-[10px] border-l border-gray-300 dark:border-gray-700 first:border-none pl-[10px] first:pl-0">
                            <div>
                                <h6 className="font-medium leading-[1.2]">
                                    Subject
                                </h6>
                                <span className="font-medium text-[14px] text-gray-500 leading-[1]">
                                    {bookDetail?.subject?.name}
                                </span>
                            </div>
                        </div>

                         {/*  single info */}
                         <div className="flex items-center gap-[10px] border-l border-gray-300 dark:border-gray-700 first:border-none pl-[10px] first:pl-0">
                            <div>
                                <h6 className="font-medium leading-[1.2]">
                                    Medium
                                </h6>
                                <span className="font-medium text-[14px] text-gray-500 leading-[1]">
                                    {bookDetail?.medium}
                                </span>
                            </div>
                        </div>

                      

                        {/*  single info */}
                        <div className="flex items-center gap-[10px] border-l border-gray-300 dark:border-gray-700 first:border-none pl-[10px] first:pl-0">
                            <div>
                                <h6 className="font-medium leading-[1.2]">
                                    Duration
                                </h6>
                                <span className="font-medium text-[14px] text-gray-500 leading-[1]">
                                    {bookDetail?.duration}
                                </span>
                            </div>
                        </div>

                          {/*  single info */}
                          <div className="flex items-center gap-[10px] border-l border-gray-300 dark:border-gray-700 first:border-none pl-[10px] first:pl-0">
                            <div>
                                <h6 className="font-medium leading-[1.2]">
                                    Reviews
                                </h6>
                                <div className="flex gap-[5px] text-[var(--thm-primary)] text-[17px] mt-[4px]">
                                    {[...Array(5)].map((_, index) => (
                                        <i
                                            key={index}
                                            className="fa-solid fa-star"
                                        >
                                            <IoIosStar />
                                        </i>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                    

                    {smaller.sm && (
                        <div className="lg:!sticky top-[110px] right h-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100  dark:bg-gray-900 max-w-full sm:w-full lg:w-[400px]  shrink-0 space-y-[30px] mb-[30px]">
                            {/*  COURSE INFORMATION */}
                            <div className="px-[25px]  py-[25px] ">
                                <h5 className="font-bold text-[24px] text-[var(--thm-black)] mb-[20px]">
                                    Chapters
                                </h5>
                                <div className="flex flex-col gap-2">
                                    {bookDetail?.chapters?.map((chapter, index) => (
                                        <div
                                            key={index}
                                            className="px-[16px] py-[14px] flex flex-wrap gap-[10px] items-center justify-between bg-[rgba(var(--thm-primary-rgb),0.1)] dark:bg-[rgba(var(--thm-primary-rgb),0.2)]"
                                        >
                                            {/* Left */}
                                            <div className="flex items-center gap-[10px]">
                                                <span className="text-[20px] text-[var(--thm-primary)]">
                                                    <MdOutlinePlayLesson />
                                                </span>
                                                <span className="text-gray-900 dark:text-gray-300 font-[500] lg:w-[250px] w-[180px] ">
                                                    {index + 1} :{' '}
                                                    {chapter?.title || 'Introduction'}
                                                </span>
                                            </div>
                                            {/* Right */}
                                            <div className="flex items-center gap-[10px]">
                                                <span className="text-[var(--thm-primary)] text-[22px] cursor-pointer">
                                                    <i onClick={() => { startLesson(chapter.uid, bookDetail?.uid) }}><IoPlayCircleOutline /></i>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}




                    {/*  tabs container */}
                    <div>
                        {/*  tab navs  */}
                        <div className="ed-book-details-tab-navs  border border-gray-300 dark:border-gray-700 p-[10px]  flex gap-[10px] *:h-[56px] sm:*:h-[46px]  *:flex-auto *:bg-[rgba(var(--thm-primary-rgb),0.1)] dark:*:bg-[rgba(var(--thm-primary-rgb),0.2)] dark: bg-gray-900 *:px-[20px] lg:*:px-[15px] *:font-semibold overflow-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.tab}
                                    className={`tab-nav ${activeTab === tab.tab ? 'active' : ''}`}
                                    onClick={() => handleTabClick(tab.tab)}
                                    data-tab={tab.tab}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        {/*  tabs */}
                        <div className="ed-book-details-tabs">
                            {/*  tab 01 */}
                            <div
                                id="overview"
                                className={`ed-tab duration-[400ms] ${activeTab === 'overview' ? 'active' : ''}`}
                            >
                                <div>
                                    <h4 className="font-semibold text-[30px] lg:text-[27px] xs:text-[25px] xxs:text-[23px] mt-[28px] mb-[15px]">
                                        Book Descriptions
                                    </h4>
                                    <div className="space-y-[10px]">
                                        <p className="text-edgray">
                                            {bookDetail?.description}
                                        </p>
                                    </div>
                                </div>

                          
                            </div>

 


                            {/* tab 03  */}
                            <div
                                id="reviews"
                                className={`ed-tab duration-[400ms] ${activeTab === 'reviews' ? 'active' : ''}`}
                            >
                                <div className="ed-book-details-review mt-[40px]">
                                    <div className="review-overview flex xxs:flex-col gap-[22px] gap-y-[10px] items-center mb-[42px]">
                                        {/* <!-- average rating area --> */}
                                        <div className="average-rating-area text-center shrink-0">
                                            <h3 className="font-medium text-[50px] leading-[0.7] mb-[14px]">
                                                4.3
                                            </h3>
                                            <div className="flex gap-[5px] text-[var(--thm-primary)] text-[15px] mt-[4px] mb-[4px]">
                                                {[...Array(5)].map(
                                                    (_, index) => (
                                                        <i
                                                            key={index}
                                                            className="fa-solid fa-star"
                                                        >
                                                            <IoIosStar />
                                                        </i>
                                                    ),
                                                )}
                                            </div>
                                            <span className="rating-amount text-edgray text-[13px]">
                                                2.33K reviews
                                            </span>
                                        </div>

                                        {/* <!-- review-breakdown by each star  --> */}
                                        <div className="review-breakdown grow xxs:w-full">
                                            <ul className="individual-star-breakdown flex items-center gap-[15px]">
                                                <li className="star w-[11px] shrink-0 font-kanit text-edgray text-[16px]">
                                                    5
                                                </li>
                                                <li className="bar bg-gray-200 dark:bg-[#181e2b] max-w-full w-full h-[12px] rounded-full relative">
                                                    <div className="filled bg-[var(--thm-primary)] rounded-[18px] absolute top-0 left-0 h-full w-[80%]"></div>
                                                </li>
                                            </ul>
                                            <ul className="individual-star-breakdown flex items-center gap-[15px]">
                                                <li className="star w-[11px] shrink-0 font-kanit text-edgray text-[16px]">
                                                    4
                                                </li>
                                                <li className="bar bg-gray-200 dark:bg-[#181e2b] max-w-full w-full h-[12px] rounded-full relative">
                                                    <div className="filled bg-[var(--thm-primary)] rounded-[18px] absolute top-0 left-0 h-full w-[90%]"></div>
                                                </li>
                                            </ul>
                                            <ul className="individual-star-breakdown flex items-center gap-[15px]">
                                                <li className="star w-[11px] shrink-0 font-kanit text-edgray text-[16px]">
                                                    3
                                                </li>
                                                <li className="bar bg-gray-200 dark:bg-[#181e2b] max-w-full w-full h-[12px] rounded-full relative">
                                                    <div className="filled bg-[var(--thm-primary)] rounded-[18px] absolute top-0 left-0 h-full w-[40%]"></div>
                                                </li>
                                            </ul>
                                            <ul className="individual-star-breakdown flex items-center gap-[15px]">
                                                <li className="star w-[11px] shrink-0 font-kanit text-edgray text-[16px]">
                                                    2
                                                </li>
                                                <li className="bar bg-gray-200 dark:bg-[#181e2b] max-w-full w-full h-[12px] rounded-full relative">
                                                    <div className="filled bg-[var(--thm-primary)] rounded-[18px] absolute top-0 left-0 h-full w-[30%]"></div>
                                                </li>
                                            </ul>
                                            <ul className="individual-star-breakdown flex items-center gap-[15px]">
                                                <li className="star w-[11px] shrink-0 font-kanit text-edgray text-[16px]">
                                                    1
                                                </li>
                                                <li className="bar bg-gray-200 dark:bg-[#181e2b] max-w-full w-full h-[12px] rounded-full relative">
                                                    <div className="filled bg-[var(--thm-primary)] rounded-[18px] absolute top-0 left-0 h-full w-[5%]"></div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* <!-- reviews --> */}
                                    <h4 className="font-semibold text-[30px] lg:text-[27px] xs:text-[25px] xxs:text-[23px] mb-[28px]">
                                        Reviews
                                    </h4>
                                    <div className="user-reviews space-y-[30px]">
                                        {reviews.map((review, index) => (
                                            <div
                                                key={index}
                                                className="et-event-details-review flex xxs:flex-col items-start gap-[15px] pb-[30px] border-b border-gray-300 dark:border-gray-700 last:border-none last:pb-0"
                                            >
                                                {/* User Image */}
                                                <div className="user-img rounded-full overflow-hidden w-[60px] h-[60px] shrink-0">
                                                    <img
                                                        src={review.userImg}
                                                        alt="user"
                                                        className="object-cover w-full max-w-full max-h-full"
                                                    />
                                                </div>

                                                {/* Review Content */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-[9px]">
                                                        <div className="user-info">
                                                            <h5 className="user-name font-semibold text-[18px] mb-[4px]">
                                                                {
                                                                    review.userName
                                                                }
                                                            </h5>
                                                            <h6 className="text-edgray">
                                                                {
                                                                    review.reviewDate
                                                                }
                                                            </h6>
                                                        </div>

                                                        <div className="flex gap-[5px] text-[var(--thm-primary)] text-[15px] mt-[4px] mb-[4px]">
                                                            {[...Array(5)].map(
                                                                (_, index) => (
                                                                    <i
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="fa-solid fa-star"
                                                                    >
                                                                        <IoIosStar />
                                                                    </i>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="review">
                                                        <p className="text-edgray leading-[1.8]">
                                                            {review.reviewText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  Review Form BLOCK */}
                    <div className="mt-[50px]">
                        <h5 className="font-bold text-[22px] text-[var(--thm-black)] mb-[13px]">
                            Write a Review
                        </h5>
                        <div className="flex gap-[7px] text-[18px] text-[var(--thm-primary)] mb-[15px]">
                            {[...Array(5)].map((_, index) => (
                                <i key={index} className="fa-solid fa-star">
                                    <FaRegStar />
                                </i>
                            ))}
                        </div>

                        <form
                            action="#"
                            className="grid  grid-cols-2 sm:grid-cols-1 gap-[20px]  text-[16px]"
                        >
                            <div>
                                <label className="font-lato font-bold text-gray-500 block mb-[12px]">
                                    Your Name*
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="ed-book-review-name"
                                    placeholder="Your Name"
                                    className="bg-gray-200 dark:bg-[#181e2b] h-[55px] px-[20px] xs:px-[15px]  w-full focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-lato font-bold text-gray-500 block mb-[12px]">
                                    Your Email*
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="ed-book-review-email"
                                    placeholder="Your Email"
                                    className="bg-gray-200 dark:bg-[#181e2b] h-[55px] px-[20px] xs:px-[15px]  w-full focus:outline-none"
                                />
                            </div>
                            <div className="col-span-2 xxs:col-span-1">
                                <label className="font-lato font-bold text-gray-500 block mb-[12px]">
                                    Your Message*
                                </label>
                                <textarea
                                    name="message"
                                    id="ed-book-review-message"
                                    placeholder="Your Message"
                                    className="bg-gray-200 dark:bg-[#181e2b] h-[145px] p-[20px]  w-full focus:outline-none"
                                ></textarea>
                            </div>
                            <div className="flex items-center bg-[var(--thm-primary)] h-[50px] w-[160px] px-[24px] text-[16px] font-semibold text-white hover:bg-[var(--thm-black)]">
                                <button type="submit" className="text-nowrap">
                                    Post Review{' '}
                                </button>
                                <span className="icon pl-2">
                                    <i className="fa-solid fa-arrow-right-long text-[19px]">
                                        <FaArrowRightLong />
                                    </i>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/*  right sidebar */}
            {!smaller.sm && (
                <div className="lg:!sticky top-[110px] right h-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100  dark:bg-gray-900 max-w-full sm:w-full lg:w-[400px]  shrink-0 space-y-[30px]">
                    {/*  COURSE INFORMATION */}
                    <div className="px-[25px]  py-[25px] ">
                        <h5 className="font-bold text-[24px] text-[var(--thm-black)] mb-[20px]">
                            Chapters
                        </h5>
                        <div className="flex flex-col gap-2">
                            {bookDetail?.chapters?.map((chapter, index) => (
                                <div
                                    key={index}
                                    className="px-[16px] py-[14px] flex flex-wrap gap-[10px] items-center justify-between bg-[rgba(var(--thm-primary-rgb),0.1)] dark:bg-[rgba(var(--thm-primary-rgb),0.2)]"
                                >
                                    {/* Left */}
                                    <div className="flex items-center gap-[10px]">
                                        <span className="text-[20px] text-[var(--thm-primary)]">
                                            <MdOutlinePlayLesson />
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-300 font-[500] lg:w-[250px] w-[180px] ">
                                            {index + 1} :{' '}
                                            {chapter?.title || 'Introduction'}
                                        </span>
                                    </div>
                                    {/* Right */}
                                    <div className="flex items-center gap-[10px]">
                                        <span className="text-[var(--thm-primary)] text-[22px] cursor-pointer">
                                            <i onClick={() => { startLesson(chapter.uid, bookDetail?.uid) }}><IoPlayCircleOutline /></i>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default bookDetail
