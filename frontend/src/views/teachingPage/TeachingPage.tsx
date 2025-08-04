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
    getChapterProgress,
    resetError,
    setDotAnimation,
    setMobileVisual,
} from './store'
import React, { useEffect, useState, useCallback } from 'react'
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'
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

    const [chatMessages, setChatMessages] = useState<string[] | undefined>([]);
    // Remove local isAudioPlaying, use global isPlaying from Redux
    const currentPage = useAppSelector((state) => state.teaching.data.currentPage);
    const [responseMessage, setResponseMessage] = useState('');
    const { textToSpeechConvert, stopAudio, isPlaying } = useTextToSpeech2();

    const handleApiCall = (userInput: string, imageUrl?: string) => {
        dispatch(setDotAnimation(true))
        stopAudio()
        if (chatMessages && setChatMessages) {
            setChatMessages([...chatMessages, userInput])
        }
        if (smaller.sm) dispatch(setMobileVisual(true))
        setResponseMessage('A paragraph is a series of sentences that are correlated to each other in a healthy way')
        textToSpeechConvert(userInput, imageUrl)
    }

    useEffect(() => {
        if (error) {
            dispatch(resetError())
            navigate(`${APP_PREFIX_PATH}/my_books`, { replace: true })
        }
    }, [error])

    useEffect(() => {
        
        dispatch(getChapterData(chapterId))
        dispatch(getChapterProgress(chapterId))
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

    return (
        <>      
            {(chapterLoading || currentPage == null) ? (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#11161f] z-[99999]">
                    <Loading loading={true} />
                </div>
            ) : (
                <div className="teaching-page-container relative h-screen overflow-hidden">
                    <div className="teaching-page-content h-full">
                        <div className="w-full h-full">
                            <div className="flex justify-center">
                                <div className="book-sub-title">
                                    <h5 className='!text-[20px]'>
                                        <span>Chapter One:</span> {chapterData?.title}
                                    </h5>
                                </div>
                                <i className="chevron-icon" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                                    <FaChevronLeft />
                                </i>
                            </div>
                            <div className='book-animation flex items-center shadow-lg h-fit w-full pt-4'>
                                <BookAnimation 
                                    pages={chapterData?.pages} 
                                    handleApiCall={handleApiCall} 
                                    isAudioPlaying={isPlaying}
                                />
                            </div>
                        </div>
                        {!smaller.sm ? (
                            <div className="book-side-container">
                                <AudioVisualizer
                                    initialHeight={[15, 15, 15, 15]}
                                    intensity={50}
                                />
                                <MessageBox handleApiCall={handleApiCall} chatMessages={chatMessages} setChatMessages={setChatMessages} />
                            </div>
                        ) : (
                            <>
                                <MessageInput handleApiCall={handleApiCall} chatMessages={chatMessages} setChatMessages={setChatMessages} />
                                <div
                                    className={`mobile-visulization-conatiner w-full ${mobileVisual ? 'active-mobile-visulization-conatiner' : ''}`}
                                    style={{ pointerEvents: 'none' }}
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
            )}
        </>
    )
}
export default TeachingPage
