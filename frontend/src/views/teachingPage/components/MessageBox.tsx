import React, { useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { HiOutlineUser, HiPlay, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar/Avatar'
import MessageInput from './MessageInput'
import { useAppSelector } from '../store'
import type { VideoCard } from '../store'

// ── Helpers ────────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/)
    return m ? m[1] : null
}

interface MessageBoxProps {
    handleApiCall: (userInput: string, imageUrl?: string) => void;
    chatMessages: string[] | undefined;
    setChatMessages: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    teacherName?: string;
    subjectName?: string;
    medium?: string;
    startMicStream?: (imageUrl?: string) => Promise<void>;
    stopMicStream?: () => void;
    isMicActive?: boolean;
    isUsageInactive?: boolean;
}

// ── YouTube embed modal ────────────────────────────────────────────────────────
const VideoModal: React.FC<{ video: VideoCard; onClose: () => void }> = ({ video, onClose }) => {
    const videoId = getYouTubeId(video.url)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.65)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-3 bg-[#111] gap-2">
                    <div className="min-w-0">
                        <p className="text-white text-sm font-semibold line-clamp-1">{video.title}</p>
                        {video.channel && (
                            <p className="text-gray-400 text-xs mt-0.5">{video.channel}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    >
                        <HiX className="text-base" />
                    </button>
                </div>
                {/* Player */}
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    {videoId ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            title={video.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            Cannot embed this video.{' '}
                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-red-400 underline ml-1">
                                Watch on YouTube
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

// ── YouTube-style video card ───────────────────────────────────────────────────
const VideoCard: React.FC<{ video: VideoCard }> = ({ video }) => {
    const [showModal, setShowModal] = useState(false)
    return (
        <>
            <div
                className="flex-shrink-0 w-32 rounded-xl overflow-hidden bg-white dark:bg-[#1e2329] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group/card flex flex-col"
                onClick={() => setShowModal(true)}
            >
                <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                    {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <HiPlay className="text-gray-400 text-3xl" />
                        </div>
                    )}
                    {/* YouTube-style play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/20">
                        <div className="bg-[#FF0000] rounded-lg w-10 h-7 flex items-center justify-center shadow-lg transform group-hover/card:scale-110 transition-transform duration-200">
                            <HiPlay className="text-white text-xl" />
                        </div>
                    </div>
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                    <p className="text-[10px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-3 leading-tight">
                        {video.title}
                    </p>
                    {video.channel && (
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-1">{video.channel}</p>
                    )}
                </div>
            </div>
            {showModal && <VideoModal video={video} onClose={() => setShowModal(false)} />}
        </>
    )
}

// ── Video Carousel ───────────────────────────────────────────────────────────────
const VideoCarousel: React.FC<{ videos: VideoCard[] }> = ({ videos }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(true)

    const handleScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeft(scrollLeft > 0)
        setShowRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth)
    }

    useEffect(() => {
        handleScroll()
        const timer = setTimeout(handleScroll, 100)
        return () => clearTimeout(timer)
    }, [videos])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const offset = direction === 'left' ? -150 : 150
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }

    return (
        <div className="relative group w-full">
            <style>{`
                .hide-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {showLeft && (
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                    <HiChevronLeft className="text-lg" />
                </button>
            )}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-2 overflow-x-auto hide-scroll pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {videos.map((video, vi) => (
                    <VideoCard key={vi} video={video} />
                ))}
            </div>
            {showRight && (
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                    <HiChevronRight className="text-lg" />
                </button>
            )}
        </div>
    )
}

// ── Main MessageBox ─────────────────────────────────────────────────────────────
const MessageBox: React.FC<MessageBoxProps> = ({ handleApiCall, chatMessages, setChatMessages, teacherName, subjectName, medium, startMicStream, stopMicStream, isMicActive, isUsageInactive }) => {
    const liveTranscripts = useAppSelector((state) => state.teaching.data.liveTranscripts);
    const streamingUserText = useAppSelector((state) => state.teaching.data.streamingUserText);
    const streamingModelText = useAppSelector((state) => state.teaching.data.streamingModelText);

    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [liveTranscripts, streamingUserText, streamingModelText]);

    return (
        <div className='flex relative h-full items-start justify-start'>
            <div className="chat-message-box-container">
                <img src='/assets/img/chat_box_background/chat_background2.png' className='absolute inset-0 w-full h-full object-cover opacity-35 dark:opacity-25 pointer-events-none' />
                <div className="chat-message-box-header z-10">
                    <div className="chat-message-box-avatar-container">
                        <Avatar
                            size={35}
                            shape="circle"
                            src="/img/avatars/thumb-11.jpg"
                            className="bg-slate-200 text-slate-400"
                            icon={<HiOutlineUser />}
                        />
                    </div>
                    <div className="chat-message-box-header-content">
                        <h3>{teacherName || 'Prof. Adam Brown'}</h3>
                        {subjectName && <h4>{subjectName} teacher</h4>}
                    </div>
                </div>

                <div className="chat-message-box-body relative z-10" ref={bodyRef}>
                    {liveTranscripts.map((msg, index) => {
                        if (msg.role === 'videos') {
                            return (
                                <div key={`msg-${index}`} className="w-full flex justify-start my-1">
                                    <div className="w-full max-w-sm">
                                        <p className="text-[11px] font-bold text-[var(--thm-primary)] mb-2 px-1">
                                            🎬 Related Videos
                                        </p>
                                        <VideoCarousel videos={msg.videos ?? []} />
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div
                                key={`msg-${index}`}
                                className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`chat-message-box-body-content ${msg.role === 'user' ? '!bg-[var(--thm-primary)] !text-white' : 'chat-bubble-left'}`}
                                    style={msg.role === 'user' ? { ['--bubble-arrow-color' as any]: 'var(--thm-primary)' } : undefined}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        )
                    })}

                    {streamingUserText && (
                        <div className="w-full flex justify-end">
                            <div
                                className="chat-message-box-body-content !bg-[var(--thm-primary)] !text-white opacity-80"
                                style={{ ['--bubble-arrow-color' as any]: 'var(--thm-primary)' }}
                            >
                                {streamingUserText}
                                <span className="inline-block w-1 h-4 ml-1 bg-white animate-pulse align-middle" />
                            </div>
                        </div>
                    )}

                    {streamingModelText && (
                        <div className="w-full flex justify-start">
                            <div className="chat-message-box-body-content chat-bubble-left opacity-80">
                                {streamingModelText}
                                <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse align-middle" />
                            </div>
                        </div>
                    )}
                </div>

                <MessageInput handleApiCall={handleApiCall} setChatMessages={setChatMessages} chatMessages={chatMessages} startMicStream={startMicStream} stopMicStream={stopMicStream} isMicActive={isMicActive} isUsageInactive={isUsageInactive} />
            </div>
        </div>
    )
}

export default MessageBox
