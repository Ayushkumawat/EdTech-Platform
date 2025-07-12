import MessageBox from './components/MessageBox'
import AudioVisualizer from './components/AudioVisualizer'
import MarkdownDisplay from './components/MarkdownDisplay'
import { FaChevronLeft } from 'react-icons/fa'
import { FaArrowRotateLeft } from 'react-icons/fa6'
import 'regenerator-runtime/runtime'
import MessageInput from './components/MessageInput'
import useResponsive from '@/utils/hooks/useResponsive'
import reducer, {
    useAppSelector,
    useAppDispatch,
    getChapterData,
    resetError,
} from './store'
import React, { useEffect, useState } from 'react'
import { injectReducer } from '@/store'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Loading from '@/components/shared/Loading'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import BookAnimation from './components/BookAnimation'

injectReducer('teaching', reducer)
const TeachingPage = () => {
    const { chapterId }: any = useParams<{ chapterId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { smaller } = useResponsive()
    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual,)
    const chapterData = useAppSelector((state) => state.teaching.data.chapterData)
    const chapterLoading = useAppSelector((state) => state.teaching.data.chapterLoading)
    const error = useAppSelector((state) => state.teaching.data.error)
    console.log(mobileVisual, 'moxile')

    useEffect(() => {
        if (error) {
            dispatch(resetError())
            navigate(`${APP_PREFIX_PATH}/my_books`, { replace: true })
        }
    }, [error])

    useEffect(() => {
        dispatch(getChapterData(chapterId))
    }, [])

    useEffect(() => {
        console.log(chapterData,"chapter")
        console.log('chapterData.pages', chapterData?.pages);
    }, [chapterData])

    // Request fullscreen on mount
    useEffect(() => {
        if (document.fullscreenEnabled && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, []);
 

    // Request fullscreen on mount
    useEffect(() => {
        if (document.fullscreenEnabled && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, []);

    const md_content = `# Notable Exoplanetary Systems
## Introduction

Exoplanetary systems, which consist of planets orbiting stars beyond our Sun, have garnered significant attention from astronomers and the general public due to their remarkable diversity and potential to support life. The discovery of the first exoplanet in 1995 marked the beginning of a new era in astronomy, and since then, thousands of these celestial bodies have been identified, showcasing complex and unique characteristics.

![Image relevant to early exoplanet discovery](https://github.com/user-attachments/assets/de087b29-ea76-46d1-8690-20681615e18f)

## TRAPPIST-1 System
The TRAPPIST-1 system is a fascinating exoplanetary system that has garnered significant attention in recent years. Located in the habitable zone of its star, at least three of the planets in this system are considered potential candidates for hosting liquid water and, by extension, life.

### Key Features of the TRAPPIST-1 System
The TRAPPIST-1 system is set to be an important target for observation with the James Webb Space Telescope, which will enable researchers to gain a deeper understanding of these distant worlds. A team of Canadian astronomers will be utilizing the Canadian-made Near-Infrared Imager and Slitless Spectrograph (NIRISS) instrument to study the atmospheres of TRAPPIST-1 d, f, and g.

![Artist's concept of star TRAPPIST-1 and its seven exoplanets](https://github.com/user-attachments/assets/588ad340-7830-4332-9aa6-81e8f4b71172)

## HR 8799 System
The HR 8799 system is a notable example of an exoplanetary system. It features a star, HR 8799, and its four orbiting exoplanets. To gain a deeper understanding of this system, you can watch the following video:`

    return (
        <>
            <Loading
                loading={chapterLoading}
                className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#11161f] z-[99999]"
            />
            <div className="teaching-page-container relative">
                <div className="teaching-page-content">
                    <div className="w-full h-full">
                    <div className="flex justify-center">
                            <div className="book-sub-title">
                                <h5 className='!text-[20px]'>
                                    <span>Chapter One:</span> {chapterData?.title}
                                </h5>
                            </div>
                            <i className="chevron-icon">
                                <FaChevronLeft />
                            </i>
                        </div>
                   
                    <div className='book-animation flex items-center shadow-lg '>
                        <BookAnimation pages={chapterData?.pages}/>
                    </div>
                    </div>

                    {!smaller.sm ? (
                        <div className="book-side-container">
                            <AudioVisualizer
                                initialHeight={[15, 15, 15, 15]}
                                intensity={50}
                            />
                            <MessageBox />
                        </div>
                    ) : (
                        <>
                            <MessageInput />
                            <div
                                className={`mobile-visulization-conatiner w-full ${mobileVisual ? 'active-mobile-visulization-conatiner' : ''}`}
                            >
                                <AudioVisualizer
                                    initialHeight={[13, 13, 13, 13]}
                                    intensity={30}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
export default TeachingPage
