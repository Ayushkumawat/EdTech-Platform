import React, { useState, useCallback, useMemo } from 'react'
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'
import {
    useAppSelector,
    useAppDispatch,
    setDotAnimation,
    setMobileVisual,
    setStartButton,
} from '../store'
import useResponsive from '@/utils/hooks/useResponsive'

interface MessageInputProps {
    handleApiCall: (userInput: string, imageUrl?: string) => void;
    setChatMessages?: React.Dispatch<React.SetStateAction<string[] | undefined>>
    chatMessages?: string[] | undefined
    startMicStream?: (imageUrl?: string) => Promise<void>;
    stopMicStream?: () => void;
    isMicActive?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ handleApiCall, setChatMessages, chatMessages, startMicStream, stopMicStream, isMicActive = false }) => {
    const [message, setMessage] = useState('')
    const startButton = useAppSelector((state) => state.teaching.data.startButton)
    const { smaller } = useResponsive()

    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual)
    const currentPage = useAppSelector((state) => state.teaching.data.currentPage)
    const chapterData = useAppSelector((state) => state.teaching.data.chapterData)
    const current_page_image = (chapterData && currentPage !== null)
      ? chapterData.pages[currentPage - 1]
      : undefined;
    const dispatch = useAppDispatch()

    const shouldDisableInput = useMemo(() => false, []);

    const startTeaching = () => {
        dispatch(setStartButton(false))
        console.log(current_page_image)
        handleApiCall('start teaching this page', current_page_image)
    }

    const handleMicToggle = useCallback(() => {
        if (isMicActive) {
            stopMicStream?.();
        } else {
            startMicStream?.(current_page_image);
        }
    }, [isMicActive, startMicStream, stopMicStream, current_page_image]);

    const handleSendMessage = useCallback(() => {
        if (!message.trim()) return;
        handleApiCall(message, current_page_image);
        setMessage('');
    }, [message, handleApiCall, current_page_image]);

    const sharedStyle: React.CSSProperties = {
        pointerEvents: shouldDisableInput ? 'none' as const : 'auto' as const,
        opacity: shouldDisableInput ? 0.5 : 1,
    }

    const buttonStyle: React.CSSProperties = {
        ...sharedStyle,
        cursor: startButton ? 'pointer' : 'not-allowed',
    }

    const inputStyle: React.CSSProperties = {
        ...sharedStyle,
        cursor: shouldDisableInput ? 'not-allowed' : 'text',
    }

    return (
        <>
            <div className="send-message-button-box">
                <div
                    className={`start-teaching-button ${startButton ? '' : 'start-teaching-button-deactive'}`}
                    onClick={startButton ? startTeaching : undefined}
                    style={buttonStyle}
                >
                    {startButton && 'Start Learning'}
                </div>

                <div
                    className={`input-box ${isMicActive ? 'input-box-inactive' : 'input-box-active'} ${
                        !startButton ? 'input-box-active1' : ''
                    }`}
                    style={sharedStyle}
                >
                    <input
                        type="text"
                        placeholder={!isMicActive ? 'Enter Your Message' : 'Voice mode active...'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        disabled={isMicActive || shouldDisableInput}
                        style={inputStyle}
                    />

                    <div className="mic-stop-btn-container">
                        {message.length > 0 ? (
                            <button
                                onClick={!shouldDisableInput ? handleSendMessage : undefined}
                                className="send-message-button-box-btn-send"
                                style={sharedStyle}
                            >
                                <FaPaperPlane />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={!shouldDisableInput ? () => {
                                        stopMicStream?.();
                                    } : undefined}
                                    className={`send-message-button-box-btn-stop ${
                                        isMicActive && !mobileVisual
                                            ? 'send-message-button-box-btn-stop-active'
                                            : ''
                                    }`}
                                    style={sharedStyle}
                                >
                                    <ImCross />
                                </button>

                                <button
                                    onClick={!shouldDisableInput ? handleMicToggle : undefined}
                                    className={`send-message-button-box-btn-mic ${
                                        mobileVisual ? 'send-message-button-box-btn-mic-inactive' : ''
                                    } ${isMicActive ? 'bg-red-500' : ''}`}
                                    style={sharedStyle}
                                    title={isMicActive ? 'Voice mode active — click to stop' : 'Click to start voice conversation'}
                                >
                                    <FaMicrophone />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MessageInput
