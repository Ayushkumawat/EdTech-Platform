import React, { useRef, useEffect } from 'react'
import { HiOutlineUser } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar/Avatar'
import MessageInput from './MessageInput'
import { useAppSelector } from '../store'

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
}

const MessageBox: React.FC<MessageBoxProps> = ({ handleApiCall, chatMessages, setChatMessages, teacherName, subjectName, medium, startMicStream, stopMicStream, isMicActive }) => {
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
                <img src='/assets/img/chat_box_background/chat_background2.png' className='absolute inset-0 w-full h-full object-cover opacity-35 dark:opacity-25' />
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

                <div className="chat-message-box-body" ref={bodyRef}>
                    {/* All messages in chronological order */}
                    {liveTranscripts.map((msg, index) => (
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
                    ))}

                    {/* Currently streaming user text */}
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

                    {/* Currently streaming model text */}
                    {streamingModelText && (
                        <div className="w-full flex justify-start">
                            <div className="chat-message-box-body-content chat-bubble-left opacity-80">
                                {streamingModelText}
                                <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse align-middle" />
                            </div>
                        </div>
                    )}
                </div>

                <MessageInput handleApiCall={handleApiCall} setChatMessages={setChatMessages} chatMessages={chatMessages} startMicStream={startMicStream} stopMicStream={stopMicStream} isMicActive={isMicActive} />
            </div>
        </div>
    )
}

export default MessageBox
