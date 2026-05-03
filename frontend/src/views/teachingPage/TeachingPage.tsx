import MessageBox from './components/MessageBox'
import AudioVisualizer from './components/AudioVisualizer'
import MarkdownDisplay from './components/MarkdownDisplay'
import { FaChevronLeft } from 'react-icons/fa'
import { FaArrowRotateLeft } from 'react-icons/fa6'
import { HiOutlineCheckCircle } from 'react-icons/hi'
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
    addUserMessage,
    flushModelTranscriptToChat,
} from './store'
import React, { useEffect, useState, useCallback } from 'react'
import { useAppDispatch as useBooksAppDispatch, useAppSelector as useBooksAppSelector, getBookDetail } from '@/views/Books/books-all/store'
import { useAppDispatch as useAuthAppDispatch, useAppSelector as useAuthAppSelector, fetchUsageStatus } from '@/store'
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'
import { injectReducer } from '@/store'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Loading from '@/components/shared/Loading'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import BookAnimation from './components/BookAnimation'

injectReducer('teaching', reducer)
const TeachingPage = () => {
    const { chapterId, bookId }: any = useParams<{ chapterId: string; bookId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const authDispatch = useAuthAppDispatch()
    const { smaller } = useResponsive()
    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual,)
    const chapterData = useAppSelector((state) => state.teaching.data.chapterData)
    const chapterLoading = useAppSelector((state) => state.teaching.data.chapterLoading)
    const error = useAppSelector((state) => state.teaching.data.error)
    
    // Get user usage state from auth store
    const userUsageState = useAuthAppSelector((state) => state.auth.user.usage_state)
    const isUsageInactive = userUsageState === 'Inactive'

    const [chatMessages, setChatMessages] = useState<string[] | undefined>([]);

    // Book detail for teacher name
    const bookDetail = useBooksAppSelector((state) => state.book_all?.data?.bookDetail);
    const booksDispatch = useBooksAppDispatch();
    // Remove local isAudioPlaying, use global isPlaying from Redux
    const currentPage = useAppSelector((state) => state.teaching.data.currentPage);
    const [responseMessage, setResponseMessage] = useState('');
    const { textToSpeechConvert, isPlaying, startMicStream, stopMicStream, isMicActive } = useTextToSpeech2();

    const isHindiMedium = !!bookDetail?.medium && (/[\u0900-\u097F]/.test(bookDetail.medium) || bookDetail.medium.toLowerCase().includes('hindi'))
    const chapterLabel = isHindiMedium ? 'अध्याय' : 'Chapter'
    const passedAt = useAppSelector((state) => state.teaching.data.passed_at)
    const bestQuizScore = useAppSelector((state) => state.teaching.data.best_quiz_score)

    const handleApiCall = (userInput: string, imageUrl?: string) => {
        dispatch(setDotAnimation(true))
        dispatch(flushModelTranscriptToChat())
        dispatch(addUserMessage(userInput))
        if (chatMessages && setChatMessages) {
            setChatMessages([...chatMessages, userInput])
        }
        if (smaller.sm) dispatch(setMobileVisual(true))
        setResponseMessage('A paragraph is a series of sentences that are correlated to each other in a healthy way')
        textToSpeechConvert(userInput, imageUrl)
    }

    const handleBackClick = useCallback(() => {
        const goBack = () => navigate(-1)
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                document
                    .exitFullscreen()
                    .catch(() => {})
                    .finally(goBack)
                return
            }
        } catch (_) {}
        goBack()
    }, [navigate])


    useEffect(() => {
        if (error) {
            dispatch(resetError())
            navigate(`${APP_PREFIX_PATH}/my_books`, { replace: true })
        }
    }, [error])

    // Listen for token usage updates from live audio component
    useEffect(() => {
        const handleUsageUpdate = async (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail?.tokenCount) {
                try {
                    // This calls the backend to update credits based on Gemini's token count
                    await authDispatch(fetchUsageStatus(detail.tokenCount)).unwrap();
                } catch (err) {
                    console.error('Error updating credits in backend:', err);
                }
            }
        };

        window.addEventListener('liveAudioUsageUpdate', handleUsageUpdate);
        return () => {
            window.removeEventListener('liveAudioUsageUpdate', handleUsageUpdate);
        };
    }, [authDispatch]);

    // Fetch book detail from route params only if not already in store
    useEffect(() => {
        if (bookId && (!bookDetail || bookDetail?.uid !== bookId)) {
            booksDispatch(getBookDetail(bookId));
        }
    }, [bookId, bookDetail?.uid, booksDispatch]);

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
                <div className="fixed inset-0 flex items-center justify-center z-[99999]">
                    <Loading loading={true} />
                </div>
            ) : (
                <div className="teaching-page-container relative h-screen overflow-hidden">
                    <div className="teaching-page-content h-full">
                        <div className="w-full h-full">
                            <div className="flex justify-center">
                                <div className="book-sub-title">
                                    <h5 className='!text-[20px] flex items-center gap-2 flex-wrap'>
                                        <span>{chapterLabel}:</span> {chapterData?.title}
                                        {passedAt && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-100 dark:bg-green-900 dark:bg-opacity-40 px-2 py-0.5 rounded-full">
                                                <HiOutlineCheckCircle className="text-sm" />
                                                Completed{bestQuizScore != null ? ` · ${bestQuizScore}%` : ''}
                                            </span>
                                        )}
                                    </h5>
                                </div>
                                <i className="chevron-icon" onClick={handleBackClick} style={{ cursor: 'pointer' }}>
                                    <FaChevronLeft />
                                </i>
                            </div>
                            <div className='book-animation flex items-center shadow-lg h-fit w-full pt-4'>
                                <BookAnimation 
                                    pages={chapterData?.pages} 
                                    handleApiCall={handleApiCall} 
                                    isAudioPlaying={isPlaying}
                                    bookId={bookId}
                                    chapterId={chapterId}
                                />
                            </div>
                        </div>
                        {!smaller.sm ? (
                            <div className="book-side-container">
                                <AudioVisualizer
                                    initialHeight={[15, 15, 15, 15]}
                                    intensity={50}
                                />
                                <MessageBox handleApiCall={handleApiCall} chatMessages={chatMessages} setChatMessages={setChatMessages} teacherName={bookDetail?.teacher} subjectName={bookDetail?.subject?.name} medium={bookDetail?.medium} startMicStream={startMicStream} stopMicStream={stopMicStream} isMicActive={isMicActive} isUsageInactive={isUsageInactive} />
                            </div>
                        ) : (
                            <>
                                <MessageInput handleApiCall={handleApiCall} chatMessages={chatMessages} setChatMessages={setChatMessages} startMicStream={startMicStream} stopMicStream={stopMicStream} isMicActive={isMicActive} isUsageInactive={isUsageInactive} />
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
