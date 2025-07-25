import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'
import useSpeechToText from '@/utils/hooks/useSpeechToText'
import {
    useAppSelector,
    useAppDispatch,
    setDotAnimation,
    setMobileVisual,
    setCurrentPage,
    setStartButton,
} from '../store'
import useResponsive from '@/utils/hooks/useResponsive'
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'

interface MessageInputProps {
    handleApiCall: (userInput: string, imageUrl?: string) => void;
    setChatMessages?: React.Dispatch<React.SetStateAction<string[] | undefined>>
    chatMessages?: string[] | undefined
}

const MessageInput: React.FC<MessageInputProps> = ({ handleApiCall, setChatMessages, chatMessages }) => {
    const [micActive, setMicActive] = useState(false)
    const [message, setMessage] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const startButton = useAppSelector((state) => state.teaching.data.startButton)
    const { smaller } = useResponsive()
    const { textToSpeechConvert, isPlaying, stopAudio } = useTextToSpeech2()

    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual)
    const currentPage = useAppSelector((state) => state.teaching.data.currentPage)
    const inputPage = useAppSelector((state) => state.teaching.data.inputPage)
    const chapterData = useAppSelector((state) => state.teaching.data.chapterData)
    const current_page_image = (chapterData && currentPage !== null)
  ? chapterData.pages[currentPage-1]
  : undefined;
    const dispatch = useAppDispatch()

    

    const shouldDisableInput = useMemo(() => inputPage !== 0, [inputPage, currentPage])

    const { transcript, startListening, stopListening } = useSpeechToText(handleApiCall)

    const startTeaching = () => {
        dispatch(setStartButton(false))
        console.log(current_page_image)
        //handleApiCall('start teaching this page',current_page_image)
    }



    useEffect(() => {
        if (micActive && !isPlaying) {
            startListening()
        }
    }, [micActive, isPlaying, startListening])

    // Stop mic if user navigates away from current page
    useEffect(() => {
        if (shouldDisableInput && micActive) {
            console.log('Stopping mic due to page change');
            setMicActive(false)
            stopListening()
        }
    }, [shouldDisableInput, micActive, stopListening])

    const sharedStyle: React.CSSProperties = {
        pointerEvents: shouldDisableInput ? 'none' as const : 'auto' as const,
        opacity: shouldDisableInput ? 0.5 : 1,
    }

    // Separate style for the button
    const buttonStyle: React.CSSProperties = {
        ...sharedStyle,
        cursor: startButton ? 'pointer' : 'not-allowed',
    }

    // Separate style for the input
    const inputStyle: React.CSSProperties = {
        ...sharedStyle,
        cursor: shouldDisableInput ? 'not-allowed' : 'text',
    }

    return (
        <>
            {micActive && transcript && (
                <div className="chat-message-box-recognition-text-container">
                    <h4 className="text-center">{transcript}</h4>
                </div>
            )}

            <div className="send-message-button-box">
                <div
                    className={`start-teaching-button ${startButton ? '' : 'start-teaching-button-deactive'}`}
                    onClick={startButton ? startTeaching : undefined}
                    style={buttonStyle}
                >
                    {startButton && 'Start Learning'}
                </div>

                <div
                    className={`input-box ${micActive ? 'input-box-inactive' : 'input-box-active'} ${
                        !startButton ? 'input-box-active1' : ''
                    }`}
                    style={sharedStyle}
                >
                    <input
                        type="text"
                        placeholder={!micActive ? 'Enter Your Message' : ''}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={micActive || shouldDisableInput}
                        style={inputStyle}
                    />

                    <div className="mic-stop-btn-container">
                        {message.length > 0 ? (
                            <button
                                onClick={!shouldDisableInput ? () => { handleApiCall(message); setMessage(""); } : undefined}
                                className="send-message-button-box-btn-send"
                                style={sharedStyle}
                            >
                                <FaPaperPlane />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={!shouldDisableInput ? () => {
                                        setMicActive(false)
                                        stopListening()
                                    } : undefined}
                                    className={`send-message-button-box-btn-stop ${
                                        micActive && !mobileVisual
                                            ? 'send-message-button-box-btn-stop-active'
                                            : ''
                                    }`}
                                    style={sharedStyle}
                                >
                                    <ImCross />
                                </button>

                                <button
                                    onClick={!shouldDisableInput ? () => {
                                        setMicActive(true)
                                        startListening()
                                    } : undefined}
                                    className={`send-message-button-box-btn-mic ${
                                        mobileVisual ? 'send-message-button-box-btn-mic-inactive' : ''
                                    }`}
                                    style={sharedStyle}
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
