import { useRef, useEffect, useCallback } from 'react';
import reducer, {
  setFrequencyData,
  setIsPlaying,
  useAppDispatch,
  useAppSelector,
} from '@/views/teachingPage/store';
import { injectReducer } from '@/store';
import appConfig from '@/configs/app.config';
import { PERSIST_STORE_NAME } from '@/constants/app.constant';
import deepParseJson from '@/utils/deepParseJson';
import store from '@/store';

injectReducer('teaching', reducer);

const SAMPLE_RATE = 24000;
const MIN_BUFFERED_CHUNKS = 5;
const CONCAT_CHUNKS = 5;

type TextToSpeechHook = {
  textToSpeechConvert: (text: string, imageUrl?: string) => Promise<void>;
  stopAudio: () => void;
  isPlaying: boolean;
  frequencyData: number[];
};

const useTextToSpeech = (): TextToSpeechHook => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.teaching.data.isPlaying);
  const frequencyData = useAppSelector(state => state.teaching.data.frequencyData);

  const getToken = (): string => {
    const raw = localStorage.getItem(PERSIST_STORE_NAME);
    const data = deepParseJson(raw);
    return (data as any)?.auth?.session?.token || store.getState().auth.session.token;
  };

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferQueue = useRef<ArrayBuffer[]>([]);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const playingRef = useRef<boolean>(false);
  const streamEndedRef = useRef<boolean>(false);
  const nextStartTime = useRef<number>(0);

  const initAudio = useCallback(async (): Promise<AudioContext> => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        audioCtxRef.current = new Ctx({ sampleRate: SAMPLE_RATE });
      } catch {
        audioCtxRef.current = new Ctx();
      }
      gainRef.current = audioCtxRef.current.createGain();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      gainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const scheduleChunk = useCallback(
    async (arrayBuffer: ArrayBuffer): Promise<number> => {
      const ctx = audioCtxRef.current;
      if (!ctx || !playingRef.current) return 0;

      const pcm = new Int16Array(arrayBuffer);
      const audioBuf = ctx.createBuffer(1, pcm.length, SAMPLE_RATE);
      const floatData = audioBuf.getChannelData(0);
      pcm.forEach((v, i) => (floatData[i] = v / 32768));

      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(gainRef.current ?? ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTime.current);
      src.start(startTime);

      nextStartTime.current = startTime + audioBuf.duration;
      sourcesRef.current.push(src);

      src.onended = () => {
        sourcesRef.current = sourcesRef.current.filter(s => s !== src);
        if (
          streamEndedRef.current &&
          sourcesRef.current.length === 0 &&
          bufferQueue.current.length === 0
        ) {
          dispatch(setIsPlaying(false));
          playingRef.current = false;
        }
      };

      return audioBuf.duration;
    },
    [dispatch]
  );

  const processQueue = useCallback(async (): Promise<void> => {
    if (!playingRef.current) return;

    while (bufferQueue.current.length >= CONCAT_CHUNKS) {
      const chunks = bufferQueue.current.splice(0, CONCAT_CHUNKS);
      const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
      const combined = new Uint8Array(total);
      let offset = 0;
      chunks.forEach(c => {
        combined.set(new Uint8Array(c), offset);
        offset += c.byteLength;
      });
      await scheduleChunk(combined.buffer);
    }

    if (streamEndedRef.current && bufferQueue.current.length > 0) {
      const remaining = bufferQueue.current.splice(0);
      const total = remaining.reduce((sum, c) => sum + c.byteLength, 0);
      const combined = new Uint8Array(total);
      let off = 0;
      remaining.forEach(c => {
        combined.set(new Uint8Array(c), off);
        off += c.byteLength;
      });
      await scheduleChunk(combined.buffer);
    }
  }, [scheduleChunk]);

  const stopAudio = useCallback(() => {
    abortCtrlRef.current?.abort();
    playingRef.current = false;
    streamEndedRef.current = false;
    bufferQueue.current = [];
    nextStartTime.current = 0;
    sourcesRef.current.forEach(src => { try { src.stop(); } catch {} });
    sourcesRef.current = [];
    dispatch(setIsPlaying(false));
    if (gainRef.current) gainRef.current.gain.value = 1;
  }, [dispatch]);

  const textToSpeechConvert = useCallback(
    async (text: string, imageUrl?: string): Promise<void> => {
      if (!text.trim()) return;
     

      const ctx = await initAudio();
      const token = getToken();
      playingRef.current = true;
      abortCtrlRef.current = new AbortController();
      streamEndedRef.current = false;
      nextStartTime.current = ctx.currentTime;

      const endpoint = `${appConfig.apiPrefix1}gemini/${imageUrl ? 'ask-image' : 'ask'}`;
      const payload = imageUrl
        ? { url: imageUrl, text }
        : { text };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: abortCtrlRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error('Audio stream error');

      const reader = res.body.getReader();
      let leftover: Uint8Array | null = null;
      let started = false;

      while (playingRef.current) {
        const { done, value } = await reader.read();
        if (done) break;
        let chunk = value;
        if (leftover) {
          chunk = new Uint8Array([...leftover, ...chunk]);
          leftover = null;
        }
        if (chunk.length % 2 !== 0) {
          leftover = chunk.slice(-1);
          chunk = chunk.slice(0, -1);
        }
        if (chunk.length) {
          bufferQueue.current.push(chunk.buffer as ArrayBuffer);
          if (!started && bufferQueue.current.length >= MIN_BUFFERED_CHUNKS) {
            dispatch(setIsPlaying(true));
            started = true;
            processQueue();
          } else if (started) {
            processQueue();
          }
        }
      }

      reader.releaseLock();
      streamEndedRef.current = true;
      processQueue();
    },
    [dispatch, initAudio, stopAudio, processQueue]
  );

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
       
        rafId = requestAnimationFrame(update);
      }
    };
    if (isPlaying) update();
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, dispatch]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  return { textToSpeechConvert, stopAudio, isPlaying, frequencyData };
};

export default useTextToSpeech;