import { useRef, useEffect, useCallback } from 'react';
import reducer, {
  setFrequencyData,
  setIsPlaying,
  useAppDispatch,
  useAppSelector,
} from '@/views/teachingPage/store';
import { injectReducer } from '@/store';
import appConfig from '@/configs/app.config'
import { apiAskGemini, apiAskGeminiImage } from '@/services/GeminiServices';
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess } from '@/store'



injectReducer('teaching', reducer);

const MIN_BUFFERED_CHUNKS = 5;
const SAMPLE_RATE = 24000;
const CONCAT_CHUNKS = 5;

const useTextToSpeech2 = () => {
  const isPlaying = useAppSelector((state) => state.teaching.data.isPlaying);
  const frequencyData = useAppSelector((state) => state.teaching.data.frequencyData);
  const dispatch = useAppDispatch();
  const api_prifix= appConfig.apiPrefix1
  const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
  const persistData = deepParseJson(rawPersistData)
  let accessToken = (persistData as any).auth.session.token
  if (!accessToken) {
    const { auth } = store.getState()
    accessToken = auth.session.token
}

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playingRef = useRef(false);
  const bufferQueueRef = useRef<ArrayBuffer[]>([]);
  const isChunkPlayingRef = useRef(false);
  const playbackTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const streamEndedRef = useRef(false);

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      try {
        audioContextRef.current = new AudioContextClass({ sampleRate: SAMPLE_RATE });
      } catch (e) {
        console.warn('Custom sample rate not supported. Using default.');
        audioContextRef.current = new AudioContextClass();
      }
      gainNodeRef.current = audioContextRef.current.createGain();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const checkPlaybackComplete = useCallback(() => {
    // Check if stream has ended and all audio has finished playing
    if (streamEndedRef.current && 
        scheduledSourcesRef.current.length === 0 && 
        bufferQueueRef.current.length === 0) {
      dispatch(setIsPlaying(false));
      playingRef.current = false;
    }
  }, [dispatch]);

  const stopAudio = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Fade out audio for better UX
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioContextRef.current.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.2);
    }
    // Stop all scheduled sources
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    scheduledSourcesRef.current = [];
    playingRef.current = false;
    bufferQueueRef.current = [];
    isChunkPlayingRef.current = false;
    playbackTimeRef.current = 0;
    streamEndedRef.current = false;
    
    // Set playing state to false immediately when manually stopped
    dispatch(setIsPlaying(false));
    
    // Restore gain after fade out
    setTimeout(() => {
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 1;
    }, 250);
  }, [dispatch]);

  // PCM chunk playback function with scheduling
  const playPCMAudio = useCallback(async (pcmData: ArrayBuffer, scheduleTime: number) => {
    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) return 0;
      const numChannels = 1;
      const audioBuffer = audioContext.createBuffer(
        numChannels,
        pcmData.byteLength / 2,
        SAMPLE_RATE
      );
      const channelData = audioBuffer.getChannelData(0);
      const pcmView = new Int16Array(pcmData);
      for (let i = 0; i < pcmView.length; i++) {
        channelData[i] = pcmView[i] / 32768.0;
      }
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current || audioContext.destination);
      source.start(scheduleTime);
      // Track this source for stopping
      scheduledSourcesRef.current.push(source);
      source.onended = () => {
        // Remove this source from the array
        scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
        // Check if playback is complete after this source ends
        setTimeout(() => checkPlaybackComplete(), 100);
      };
      return audioBuffer.duration;
    } catch (error) {
      console.error('Error playing PCM audio:', error);
      return 0;
    }
  }, [checkPlaybackComplete]);

  // Concatenate and schedule playback by fixed chunk count
  const playQueue = useCallback(async () => {
    if (isChunkPlayingRef.current) return;
    isChunkPlayingRef.current = true;
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    if (playbackTimeRef.current < audioContext.currentTime) {
      playbackTimeRef.current = audioContext.currentTime;
    }
  
    while (playingRef.current && bufferQueueRef.current.length >= CONCAT_CHUNKS) {
      // Concatenate CONCAT_CHUNKS buffers
      const chunks = bufferQueueRef.current.splice(0, CONCAT_CHUNKS);
      const totalLength = chunks.reduce((sum, arr) => sum + arr.byteLength, 0);
      const joined = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of chunks) {
        joined.set(new Uint8Array(arr), offset);
        offset += arr.byteLength;
      }
      const duration = await playPCMAudio(joined.buffer, playbackTimeRef.current);
      playbackTimeRef.current += duration;
    }

    // Handle remaining chunks when stream has ended
    if (streamEndedRef.current && bufferQueueRef.current.length > 0) {
      const chunks = bufferQueueRef.current.splice(0);
      const totalLength = chunks.reduce((sum, arr) => sum + arr.byteLength, 0);
      const joined = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of chunks) {
        joined.set(new Uint8Array(arr), offset);
        offset += arr.byteLength;
      }
      const duration = await playPCMAudio(joined.buffer, playbackTimeRef.current);
      playbackTimeRef.current += duration;
    }
    
    isChunkPlayingRef.current = false;
    
    // Check if playback is complete after processing queue
    setTimeout(() => checkPlaybackComplete(), 100);
  }, [playPCMAudio, checkPlaybackComplete]);

  // Streaming TTS with Fetch API
  const textToSpeechConvert = useCallback(
    async (text: string, imageUrl?: string) => {
      if (!text.trim()) return;

      stopAudio();

      try {
        const audioContext = await initAudioContext();
        if (!audioContext || !gainNodeRef.current) {
          throw new Error('Failed to initialize audio context');
        }

        playingRef.current = true;
        streamEndedRef.current = false;
        abortControllerRef.current = new AbortController();
        bufferQueueRef.current = [];
        isChunkPlayingRef.current = false;
        playbackTimeRef.current = 0;
        scheduledSourcesRef.current = [];

        // Use fetch for streaming support instead of axios
        let endpoint, body;
        if (imageUrl) {
          endpoint = api_prifix+'gemini/ask-image';
          body = { url: imageUrl, text };
        } else {
          endpoint = api_prifix+'gemini/ask';
          body = { text };
        }
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });
        if (!response.body) throw new Error('No stream');
        const reader = response.body.getReader();
        let leftover: Uint8Array | null = null;
        let hasStartedPlaying = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            let chunk = value;
            if (leftover) {
              const combined = new Uint8Array(leftover.length + chunk.length);
              combined.set(leftover, 0);
              combined.set(chunk, leftover.length);
              chunk = combined;
              leftover = null;
            }
            if (chunk.length % 2 !== 0) {
              leftover = chunk.slice(chunk.length - 1);
              chunk = chunk.slice(0, chunk.length - 1);
            }
            if (chunk.length > 0) {
              bufferQueueRef.current.push(chunk.buffer as ArrayBuffer);
              if (!hasStartedPlaying && bufferQueueRef.current.length >= MIN_BUFFERED_CHUNKS) {
                dispatch(setIsPlaying(true));
                hasStartedPlaying = true;
                playQueue();
              } else if (
                hasStartedPlaying &&
                !isChunkPlayingRef.current &&
                bufferQueueRef.current.length >= CONCAT_CHUNKS
              ) {
                playQueue();
              }
            }
          }
        }
        streamEndedRef.current = true;
        if (bufferQueueRef.current.length > 0) {
          playQueue();
        } else {
          checkPlaybackComplete();
        }
      } catch (error) {
        console.error('TTS streaming error:', error);
        dispatch(setIsPlaying(false));
        playingRef.current = false;
        streamEndedRef.current = false;
      }
    },
    [dispatch, initAudioContext, stopAudio, playQueue, checkPlaybackComplete]);

  useEffect(() => {
    const updateFrequencyData = () => {
      if (!analyserRef.current || !isPlaying) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const getFrequency = () => {
        if (!analyserRef.current || !isPlaying) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        dispatch(setFrequencyData([...dataArray]));
        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(getFrequency);
        }
      };
      getFrequency();
    };
    if (isPlaying) {
      updateFrequencyData();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, dispatch]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    textToSpeechConvert,
    isPlaying,
    frequencyData,
    stopAudio,
  };
};

export default useTextToSpeech2;