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
} from '../store'
import useResponsive from '@/utils/hooks/useResponsive'
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'

interface MessageInputProps {
    setChatMessages?: React.Dispatch<React.SetStateAction<string[] | undefined>>
    chatMessages?: string[] | undefined
}

const MessageInput: React.FC<MessageInputProps> = ({ setChatMessages, chatMessages }) => {
    const [micActive, setMicActive] = useState(false)
    const [message, setMessage] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const [startButton, setStartButton] = useState(true)

    const { smaller } = useResponsive()
    const { textToSpeechConvert, isPlaying, stopAudio } = useTextToSpeech2()

    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual)
    const currentPage = useAppSelector((state) => state.teaching.data.currentPage)
    const inputPage = useAppSelector((state) => state.teaching.data.inputPage)
    const dispatch = useAppDispatch()

    const shouldDisableInput = useMemo(() => inputPage !== currentPage, [inputPage, currentPage])

    const handleApiCall = useCallback((userInput: string, imageUrl?: string) => {
        dispatch(setDotAnimation(true))
        stopAudio()
        if (chatMessages && setChatMessages) {
            setChatMessages([...chatMessages, userInput])
        }
        if (smaller.sm) dispatch(setMobileVisual(true))
        setMessage('')
        setResponseMessage('A paragraph is a series of sentences that are correlated to each other in a healthy way')
        textToSpeechConvert(userInput, imageUrl)
    }, [chatMessages, setChatMessages, smaller.sm, dispatch, stopAudio, textToSpeechConvert])

    const { transcript, startListening, stopListening } = useSpeechToText(handleApiCall)

    const startTeaching = () => {
        setStartButton(false)
        handleApiCall('start teaching')
    }

    const continueThisPage = () => {
        dispatch(setCurrentPage(inputPage))
        handleApiCall(`continue teaching page ${inputPage}`)
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
        cursor: shouldDisableInput ? 'not-allowed' : 'pointer',
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
                        style={{ cursor: sharedStyle.cursor }}
                    />

                    <div className="mic-stop-btn-container">
                        {message.length > 0 ? (
                            <button
                                onClick={!shouldDisableInput ? () => handleApiCall(message) : undefined}
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
