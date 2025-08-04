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

    const shouldDisableInput = useMemo(() => {
      // Allow interactions even when AI is speaking
      return false;
    }, []);

    // Create a callback that handles the transcript properly
    const handleTranscriptReady = useCallback((transcript: string) => {
        console.log('Transcript ready:', transcript);
        if (transcript.trim()) {
            // Send the transcript immediately
            handleApiCall(transcript, current_page_image)
            // Clear the message input but keep microphone active
            setMessage("")
            // Don't stop the microphone - let it continue listening
        }
    }, [handleApiCall, current_page_image])

    const { transcript, startListening, stopListening, error, browserSupportsSpeechRecognition } = useSpeechToText(handleTranscriptReady, 2000)

    // Add debugging for transcript updates
    useEffect(() => {
        if (transcript && micActive) {
            console.log('Current transcript:', transcript);
        }
    }, [transcript, micActive]);

    // Handle speech recognition errors
    useEffect(() => {
        if (error) {
            console.error('Speech recognition error:', error);
            // You could show a toast notification here
        }
    }, [error]);

    const startTeaching = () => {
        dispatch(setStartButton(false))
        console.log(current_page_image)
        handleApiCall('start teaching this page',current_page_image)
    }

    useEffect(() => {
        if (micActive) {
            startListening()
        }
    }, [micActive, startListening])

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
                    <h4 className="text-center" style={{ color: 'white', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                        {transcript}
                    </h4>
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
                        placeholder={!micActive ? 'Enter Your Message' : 'Listening...'}
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
                                        console.log('Stopping microphone');
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

                                {micActive && transcript && (
                                    <button
                                        onClick={!shouldDisableInput ? () => {
                                            console.log('Manually sending transcript:', transcript);
                                            handleApiCall(transcript, current_page_image)
                                            setMessage("")
                                            // Keep microphone active for continuous listening
                                        } : undefined}
                                        className="send-message-button-box-btn-send"
                                        style={sharedStyle}
                                        title="Send current transcript"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                )}

                                <button
                                    onClick={!shouldDisableInput && browserSupportsSpeechRecognition ? () => {
                                        console.log('Starting microphone');
                                        setMicActive(true)
                                        startListening()
                                    } : undefined}
                                    className={`send-message-button-box-btn-mic ${
                                        mobileVisual ? 'send-message-button-box-btn-mic-inactive' : ''
                                    } ${micActive ? 'bg-red-500' : ''} ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={sharedStyle}
                                    title={!browserSupportsSpeechRecognition ? 'Speech recognition not supported in this browser' : micActive ? 'Listening... Click to stop' : 'Click to start voice input'}
                                    disabled={!browserSupportsSpeechRecognition}
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
