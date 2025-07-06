import { useState, useEffect, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeechToText = (onTranscriptReady: (transcript: string) => void, silenceThreshold = 3000) => {
  const [isListening, setIsListening] = useState(false);
  const { transcript, finalTranscript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const lastSpokenTime = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.');
    }
  }, [browserSupportsSpeechRecognition]);

  const clearTimeoutRef = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    resetTranscript();
    lastSpokenTime.current = Date.now();
    setIsListening(true);
    clearTimeoutRef();
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    setIsListening(false);
    clearTimeoutRef();
  };

  useEffect(() => {
    if (
      listening &&
      Date.now() - lastSpokenTime.current >= silenceThreshold &&
      finalTranscript
    ) {
      onTranscriptReady(finalTranscript);
      stopListening();
    }
  }, [finalTranscript, listening, silenceThreshold]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
      clearTimeoutRef();
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;
