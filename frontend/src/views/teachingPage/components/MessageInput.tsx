import React, { useState, useEffect } from 'react'
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'
import useSpeechToText from '@/utils/hooks/useSpeechToText'
import {
    useAppSelector,
    useAppDispatch,
    setDotAnimation,
    setMobileVisual,
} from '../store'
import useResponsive from '@/utils/hooks/useResponsive'
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'

interface MessageInputProps {
    setChatMessages?: React.Dispatch<React.SetStateAction<string[] | undefined>>
    chatMessages?: string[] | undefined
}

const MessageInput: React.FC<MessageInputProps> = ({setChatMessages,chatMessages,}) => {

    const [micActive, setMicActive] = useState(false);
    const [message, setMessage] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const { smaller } = useResponsive()
    const { textToSpeechConvert, isPlaying, stopAudio } = useTextToSpeech2()
    
    const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual)
    const dispatch = useAppDispatch()
    const [startButton, setStartButton] = useState(true)

    const handleApiCall = (userInput: string, imageUrl?:string) => {
        // Stop any ongoing audio playback
        dispatch(setDotAnimation(true))
        stopAudio();
        
        if (chatMessages && setChatMessages)
            setChatMessages([...chatMessages, userInput])
        
        if (smaller.sm) dispatch(setMobileVisual(true))
        const responseText =
            'A paragraph is a series of sentences that are correlated to each other in a healthy way'
        setMessage('')
        setResponseMessage(responseText)
        textToSpeechConvert(userInput,imageUrl)
    }

    const {transcript,startListening,stopListening} = useSpeechToText(handleApiCall)

    const startTeaching = () => {
        setStartButton(false)
        handleApiCall('start teaching')
    }

    useEffect(() => {
        if (micActive && !isPlaying) {
            startListening()
        }
    }, [isPlaying])

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
                    onClick={startTeaching}
                >
                    {startButton && 'Start Learning'}
                </div>
                <div
                    className={`input-box ${micActive ? 'input-box-inactive' : 'input-box-active'} ${!startButton ? 'input-box-active1' : ''}`}
                >
                    <input
                        type="text"
                        placeholder={!micActive ? 'Enter Your Message' : ''}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={micActive}
                    />
                    <div className="mic-stop-btn-container">
                        {message.length > 0 ? (
                            <button
                                onClick={() => {
                                    handleApiCall(message)
                                }}
                                className="send-message-button-box-btn-send"
                            >
                                <FaPaperPlane />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setMicActive(false)
                                        stopListening()
                                    }}
                                    className={`send-message-button-box-btn-stop ${
                                        micActive && !mobileVisual
                                            ? 'send-message-button-box-btn-stop-active'
                                            : ''
                                    }`}
                                >
                                    <ImCross />
                                </button>
                                <button
                                    onClick={() => {
                                        setMicActive(true)
                                        startListening()
                                    }}
                                    className={`send-message-button-box-btn-mic ${mobileVisual ? 'send-message-button-box-btn-mic-inactive' : ''}`}
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
