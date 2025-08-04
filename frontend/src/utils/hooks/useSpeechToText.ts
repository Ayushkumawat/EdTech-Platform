import { useState, useEffect, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeechToText = (onTranscriptReady: (transcript: string) => void, silenceThreshold = 3000) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { transcript, finalTranscript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const lastSpokenTime = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      const errorMsg = 'Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.';
      setError(errorMsg);
      console.error(errorMsg);
    } else {
      setError(null);
    }
  }, [browserSupportsSpeechRecognition]);

  const clearTimeoutRef = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const startListening = useCallback(() => {
    try {
      if (!browserSupportsSpeechRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }
      
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      resetTranscript();
      lastSpokenTime.current = Date.now();
      setIsListening(true);
      setError(null);
      clearTimeoutRef();
      console.log('Speech recognition started');
    } catch (error) {
      const errorMsg = 'Error starting speech recognition: ' + error;
      console.error(errorMsg);
      setError(errorMsg);
    }
  }, [resetTranscript, browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    try {
      SpeechRecognition.stopListening();
      resetTranscript();
      setIsListening(false);
      clearTimeoutRef();
      console.log('Speech recognition stopped');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [resetTranscript]);

  // Update last spoken time when transcript changes
  useEffect(() => {
    if (transcript && listening) {
      lastSpokenTime.current = Date.now();
      console.log('Transcript updated:', transcript);
      
      // Clear any existing timeout
      clearTimeoutRef();
      
      // Set a new timeout for silence detection
      timeoutRef.current = setTimeout(() => {
        if (transcript.trim() && listening) {
          console.log('Silence timeout reached, submitting transcript:', transcript);
          onTranscriptReady(transcript);
          // Reset transcript after sending to clear for next input
          resetTranscript();
        }
      }, silenceThreshold);
    }
  }, [transcript, listening, silenceThreshold, onTranscriptReady, stopListening, resetTranscript]);

  // Handle silence detection and auto-submit (backup for finalTranscript)
  useEffect(() => {
    if (
      listening &&
      finalTranscript &&
      finalTranscript.trim() &&
      finalTranscript !== transcript &&
      Date.now() - lastSpokenTime.current >= silenceThreshold
    ) {
      console.log('Final transcript detected, submitting:', finalTranscript);
      onTranscriptReady(finalTranscript);
      // Reset transcript after sending to clear for next input
      resetTranscript();
    }
  }, [finalTranscript, listening, silenceThreshold, onTranscriptReady, stopListening, transcript, resetTranscript]);

  // Cleanup on unmount
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
    error,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechToText;
