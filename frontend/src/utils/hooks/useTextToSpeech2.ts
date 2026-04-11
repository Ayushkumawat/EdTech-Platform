import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import reducer, {
  setFrequencyData,
  setIsPlaying,
  setDotAnimation,
  useAppDispatch,
  useAppSelector,
  appendStreamingUserText,
  appendStreamingModelText,
  flushUserTranscript,
  flushModelTranscriptToChat,
} from '@/views/teachingPage/store';
import { injectReducer } from '@/store';
import { createBlob, decode, decodeAudioData, encode } from '@/features/liveAudio/utils';

injectReducer('teaching', reducer);

const SAMPLE_RATE = 24000;
const GEMINI_MODEL = 'gemini-3.1-flash-live-preview';

type Turn = { role: 'user' | 'model'; parts: { text: string }[] };

type TextToSpeechHook = {
  textToSpeechConvert: (text: string, imageUrl?: string) => Promise<void>;
  stopAudio: () => void;
  startMicStream: (imageUrl?: string) => Promise<void>;
  stopMicStream: () => void;
  isMicActive: boolean;
  isPlaying: boolean;
  frequencyData: number[];
};

const useTextToSpeech = (): TextToSpeechHook => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.teaching.data.isPlaying);
  const frequencyData = useAppSelector(state => state.teaching.data.frequencyData);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTime = useRef<number>(0);
  const playingRef = useRef<boolean>(false);
  const streamEndedRef = useRef<boolean>(false);

  // Session refs
  const liveSessionRef = useRef<Session | null>(null);
  const sessionImageUrlRef = useRef<string | null>(null);
  const sessionReadyRef = useRef<boolean>(false);
  const sessionImageBytesRef = useRef<Uint8Array | null>(null);
  const activeSessionTokenRef = useRef<number>(0);
  const serverTurnActiveRef = useRef<boolean>(false);

  // Conversation history — survives session recreation so the model
  // remembers what was said even after an interruption.
  const historyRef = useRef<Turn[]>([]);
  const currentModelTranscriptRef = useRef<string>('');

  // Microphone streaming refs (voice-to-voice)
  const [isMicActive, setIsMicActive] = useState(false);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // When true, handleLiveMessage silently discards incoming audio chunks.
  // Used only during text interruption session-swap window.
  const skipAudioRef = useRef<boolean>(false);

  // Client-side speech detection: mutes gain instantly when user speaks,
  // well before the server's `interrupted` event arrives over WebSocket.
  const clientMutedRef = useRef<boolean>(false);

  // ─── Audio context ────────────────────────────────────────────────────────

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
      (window as any).__audioOutputNode = gainRef.current;
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Stop / cleanup ───────────────────────────────────────────────────────

  const stopCurrentAudioSources = useCallback(() => {
    sourcesRef.current.forEach(s => { try { s.stop(); s.disconnect(); } catch {} });
    sourcesRef.current = [];
    nextStartTime.current = audioCtxRef.current?.currentTime ?? 0;
    streamEndedRef.current = false;
  }, []);

  // ─── Mic streaming cleanup ──────────────────────────────────────────────

  const cleanupMicResources = useCallback(() => {
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch {}
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch {}
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const stopMicStream = useCallback(() => {
    cleanupMicResources();
    setIsMicActive(false);
    console.log('[GeminiLive] Mic stream stopped');
  }, [cleanupMicResources]);

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopCurrentAudioSources();
    stopMicStream();
    try { liveSessionRef.current?.close(); } catch {}
    liveSessionRef.current = null;
    sessionImageUrlRef.current = null;
    sessionReadyRef.current = false;
    sessionImageBytesRef.current = null;
    serverTurnActiveRef.current = false;
    playingRef.current = false;
    skipAudioRef.current = false;
    clientMutedRef.current = false;
    if (gainRef.current) gainRef.current.gain.value = 1;
    historyRef.current = [];
    currentModelTranscriptRef.current = '';
    dispatch(setIsPlaying(false));
    dispatch(setDotAnimation(false));
    dispatch(setFrequencyData(new Array(1024).fill(0)));
    if (audioCtxRef.current?.state === 'running') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  }, [dispatch, stopCurrentAudioSources, stopMicStream]);

  // ─── Image loading ────────────────────────────────────────────────────────

  const loadViaCanvas = useCallback((url: string): Promise<Uint8Array | null> => {
    if (!url || !url.trim()) return Promise.resolve(null);
    return new Promise(res => {
      const timer = setTimeout(() => res(null), 8000);
      const done = (val: Uint8Array | null) => { clearTimeout(timer); res(val); };

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const MAX = 1024;
          let w = img.naturalWidth, h = img.naturalHeight;
          if (w > MAX || h > MAX) {
            const r = Math.min(MAX / w, MAX / h);
            w = Math.round(w * r); h = Math.round(h * r);
          }
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const c2d = cv.getContext('2d');
          if (!c2d) { done(null); return; }
          c2d.drawImage(img, 0, 0, w, h);
          cv.toBlob(blob => {
            if (!blob) { done(null); return; }
            blob.arrayBuffer().then(buf => done(new Uint8Array(buf))).catch(() => done(null));
          }, 'image/jpeg', 0.85);
        } catch { done(null); }
      };
      img.onerror = () => done(null);
      img.src = url;
    });
  }, []);

  // ─── Flush partial model transcript into history ──────────────────────────

  const flushModelTranscript = useCallback(() => {
    const t = currentModelTranscriptRef.current.trim();
    if (t) {
      historyRef.current.push({ role: 'model', parts: [{ text: t }] });
      // Keep history manageable — last 10 turns max
      if (historyRef.current.length > 10) {
        historyRef.current = historyRef.current.slice(-10);
      }
    }
    currentModelTranscriptRef.current = '';
  }, []);

  // ─── Audio message handler ────────────────────────────────────────────────

  const handleLiveMessage = useCallback(async (message: LiveServerMessage) => {
    try {
      // Capture output transcription for conversation history + live display
      if ((message.serverContent as any)?.outputTranscription?.text) {
        const text = (message.serverContent as any).outputTranscription.text;
        currentModelTranscriptRef.current += text;
        dispatch(appendStreamingModelText(text));
      }

      // Capture input transcription (user's speech) for live display
      if ((message.serverContent as any)?.inputTranscription?.text) {
        const text = (message.serverContent as any).inputTranscription.text;
        dispatch(appendStreamingUserText(text));
      }

      const parts = message.serverContent?.modelTurn?.parts ?? [];

      if (parts.length > 0) {
        if (skipAudioRef.current) {
          skipAudioRef.current = false;
        }
        if (clientMutedRef.current) {
          clientMutedRef.current = false;
          if (gainRef.current) gainRef.current.gain.value = 1;
        }
        // Flush user transcript when model starts responding
        if (!serverTurnActiveRef.current) {
          dispatch(flushUserTranscript());
        }
        serverTurnActiveRef.current = true;

        for (const part of parts) {
          const inlineData = (part as any).inlineData as { data: string; mimeType: string } | undefined;
          if (!inlineData?.data) continue;

          const ctx = audioCtxRef.current;
          if (!ctx) continue;
          if (ctx.state !== 'running') await ctx.resume();

          dispatch(setDotAnimation(false));
          dispatch(setIsPlaying(true));
          playingRef.current = true;
          window.dispatchEvent(
            new CustomEvent('liveAudioPlayback', { detail: { state: 'playing' } })
          );

          nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
          const audioBuffer = await decodeAudioData(decode(inlineData.data), ctx, 24000, 1);

          const src = ctx.createBufferSource();
          src.buffer = audioBuffer;
          src.connect(gainRef.current ?? ctx.destination);
          src.start(nextStartTime.current);
          nextStartTime.current += audioBuffer.duration;
          sourcesRef.current.push(src);

          src.onended = () => {
            sourcesRef.current = sourcesRef.current.filter(s => s !== src);
            if (streamEndedRef.current && sourcesRef.current.length === 0) {
              dispatch(setIsPlaying(false));
              playingRef.current = false;
              window.dispatchEvent(
                new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })
              );
            }
          };
        }
      }

      if ((message.serverContent as any)?.interrupted) {
        window.dispatchEvent(
          new CustomEvent('liveAudioPlayback', { detail: { state: 'clearing' } })
        );
        sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
        sourcesRef.current = [];
        nextStartTime.current = audioCtxRef.current?.currentTime ?? 0;
        serverTurnActiveRef.current = false;
        clientMutedRef.current = false;
        if (gainRef.current) gainRef.current.gain.value = 1;
        dispatch(setIsPlaying(false));
        playingRef.current = false;
        flushModelTranscript();
        dispatch(flushModelTranscriptToChat());
        window.dispatchEvent(
          new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })
        );
        console.log('[GeminiLive] Interrupted');
      }

      if (message.serverContent?.turnComplete) {
        serverTurnActiveRef.current = false;
        streamEndedRef.current = true;
        skipAudioRef.current = false;
        flushModelTranscript();
        dispatch(flushModelTranscriptToChat());

        if (sourcesRef.current.length === 0) {
          dispatch(setIsPlaying(false));
          playingRef.current = false;
          window.dispatchEvent(
            new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })
          );
        }
        console.log('[GeminiLive] Turn complete');
      }
    } catch (err) {
      console.error('[GeminiLive] onmessage error:', err);
    }
  }, [dispatch, flushModelTranscript]);

  // ─── Session creation ─────────────────────────────────────────────────────

  const createSession = useCallback(async (imageUrl: string, seedHistory: boolean): Promise<void> => {
    const previousImageUrl = sessionImageUrlRef.current;
    const previousImageBytes = sessionImageBytesRef.current;
    const sessionToken = activeSessionTokenRef.current + 1;
    activeSessionTokenRef.current = sessionToken;

    try { liveSessionRef.current?.close(); } catch {}
    liveSessionRef.current = null;
    sessionImageUrlRef.current = null;
    sessionReadyRef.current = false;
    serverTurnActiveRef.current = false;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

    let imageBytes: Uint8Array | null = null;
    if (imageUrl) {
      if (previousImageBytes && previousImageUrl === imageUrl) {
        imageBytes = previousImageBytes;
      } else {
        imageBytes = await loadViaCanvas(imageUrl);
        if (!imageBytes) {
          try {
            const res = await fetch(imageUrl);
            if (res.ok) {
              const blob = await res.blob();
              imageBytes = await loadViaCanvas(URL.createObjectURL(blob));
            }
          } catch {
            console.warn('[GeminiLive] Image fetch failed');
          }
        }
      }
      sessionImageBytesRef.current = imageBytes;
    }

    const config: any = {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } } },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };

    const systemParts: any[] = [];

    if (imageBytes) {
      systemParts.push(
        { inlineData: { data: encode(imageBytes), mimeType: 'image/jpeg' } },
        { text: 'This image shows the book page being taught. Use it as visual context when answering student questions.' },
      );
    }

    if (seedHistory && historyRef.current.length > 0) {
      let historyText = '\n\nPrevious conversation:\n';
      for (const turn of historyRef.current) {
        const role = turn.role === 'user' ? 'Student' : 'Teacher';
        const content = turn.parts.map(p => p.text).join(' ');
        historyText += `${role}: ${content}\n`;
      }
      historyText += '\nContinue the conversation naturally. Remember what was already discussed and respond to the student\'s latest message.';
      systemParts.push({ text: historyText });
    }

    if (systemParts.length > 0) {
      config.systemInstruction = { parts: systemParts };
    }

    const client = new GoogleGenAI({ apiKey });

    let setupResolve: (() => void) | null = null;
    let setupReject: ((e: Error) => void) | null = null;
    const setupPromise = new Promise<void>((res, rej) => {
      setupResolve = res;
      setupReject = rej;
    });

    let localSessionReady = false;

    const session = await client.live.connect({
      model: GEMINI_MODEL,
      callbacks: {
        onopen: () => console.log('[GeminiLive] WebSocket opened'),
        onmessage: (message: LiveServerMessage) => {
          if (message.setupComplete) {
            if (activeSessionTokenRef.current !== sessionToken) return;
            localSessionReady = true;
            sessionReadyRef.current = true;
            sessionImageUrlRef.current = imageUrl;
            console.log('[GeminiLive] Session ready');
            setupResolve?.();
            return;
          }
          handleLiveMessage(message);
        },
        onerror: (event: ErrorEvent) => {
          if (activeSessionTokenRef.current !== sessionToken) return;
          if (!localSessionReady) {
            setupReject?.(new Error(event.message || 'Gemini Live error'));
          }
          liveSessionRef.current = null;
          sessionImageUrlRef.current = null;
          sessionReadyRef.current = false;
        },
        onclose: () => {
          if (activeSessionTokenRef.current !== sessionToken) return;
          const wasReady = localSessionReady;
          liveSessionRef.current = null;
          sessionImageUrlRef.current = null;
          sessionReadyRef.current = false;
          if (!wasReady) {
            setupReject?.(new Error('Session closed before ready'));
          }
        },
      },
      config,
    });

    liveSessionRef.current = session;
    await setupPromise;
  }, [loadViaCanvas, handleLiveMessage]);

  // ─── Main public function ─────────────────────────────────────────────────

  const textToSpeechConvert = useCallback(
    async (text: string, imageUrl?: string): Promise<void> => {
      if (!text.trim()) return;

      try {
        const url = imageUrl ?? '';

        // If mic is active, stop it before sending text
        if (mediaStreamRef.current) {
          cleanupMicResources();
          setIsMicActive(false);
        }

        const ctx = await initAudio();
        if (ctx.state !== 'running') await ctx.resume();

        const wasModelSpeaking = serverTurnActiveRef.current;

        // Instantly mute if model is speaking — skip stale audio from old turn
        if (wasModelSpeaking) {
          skipAudioRef.current = true;
        }

        stopCurrentAudioSources();

        // When interrupting, explicitly clear playback state so the visualizer
        // sees idle during the "thinking" window before new audio arrives.
        if (wasModelSpeaking) {
          dispatch(setIsPlaying(false));
          playingRef.current = false;
          window.dispatchEvent(
            new CustomEvent('liveAudioPlayback', { detail: { state: 'idle' } })
          );
          flushModelTranscript();
        }

        playingRef.current = true;
        dispatch(setDotAnimation(true));
        currentModelTranscriptRef.current = '';

        const canReuse =
          liveSessionRef.current &&
          sessionReadyRef.current &&
          url === sessionImageUrlRef.current &&
          !wasModelSpeaking;

        if (canReuse) {
          console.log('[GeminiLive] Reusing idle session');
        } else {
          // Seed history ONLY from prior turns (not current message)
          const shouldSeedHistory = wasModelSpeaking && historyRef.current.length > 0;
          console.log('[GeminiLive] Creating new session',
            wasModelSpeaking ? '(interrupting, seeding history)' : '');
          await createSession(url, shouldSeedHistory);
        }

        if (!liveSessionRef.current) {
          throw new Error('Session unavailable');
        }

        streamEndedRef.current = false;
        nextStartTime.current = ctx.currentTime;
        serverTurnActiveRef.current = true;
        skipAudioRef.current = false;

        console.log('[GeminiLive] Sending text:', text.slice(0, 50));
        liveSessionRef.current.sendRealtimeInput({ text });

        // Add to history AFTER sending so it's not duplicated in seeds
        historyRef.current.push({ role: 'user', parts: [{ text }] });
        if (historyRef.current.length > 10) {
          historyRef.current = historyRef.current.slice(-10);
        }

      } catch (error) {
        playingRef.current = false;
        streamEndedRef.current = true;
        dispatch(setIsPlaying(false));
        dispatch(setDotAnimation(false));
        console.error('[GeminiLive] textToSpeechConvert failed:', error);
      }
    },
    [dispatch, initAudio, createSession, stopCurrentAudioSources, flushModelTranscript, cleanupMicResources]
  );

  // ─── Voice-to-voice mic streaming ────────────────────────────────────────

  const startMicStream = useCallback(async (imageUrl?: string): Promise<void> => {
    const url = imageUrl ?? '';

    try {
      const ctx = await initAudio();
      if (ctx.state !== 'running') await ctx.resume();

      // DON'T stop audio, DON'T close session — model keeps talking.
      // Reuse existing session. Server VAD will interrupt when user speaks.
      if (!liveSessionRef.current || !sessionReadyRef.current) {
        console.log('[GeminiLive] Creating session for mic stream');
        await createSession(url, false);
      } else {
        console.log('[GeminiLive] Reusing session for mic stream');
      }

      if (!liveSessionRef.current) {
        throw new Error('Session unavailable');
      }

      // Create input AudioContext at 16kHz (Gemini expects 16kHz PCM)
      if (!inputAudioCtxRef.current || inputAudioCtxRef.current.state === 'closed') {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        try {
          inputAudioCtxRef.current = new Ctx({ sampleRate: 16000 });
        } catch {
          inputAudioCtxRef.current = new Ctx();
        }
      }
      if (inputAudioCtxRef.current.state === 'suspended') {
        await inputAudioCtxRef.current.resume();
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      mediaStreamRef.current = mediaStream;

      const sourceNode = inputAudioCtxRef.current.createMediaStreamSource(mediaStream);
      sourceNodeRef.current = sourceNode;

      const scriptProcessor = inputAudioCtxRef.current.createScriptProcessor(1024, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      const micToken = activeSessionTokenRef.current;

      const SPEECH_RMS_THRESHOLD = 0.02;

      scriptProcessor.onaudioprocess = (e) => {
        if (activeSessionTokenRef.current !== micToken) return;
        if (!liveSessionRef.current || !sessionReadyRef.current) return;
        const pcmData = e.inputBuffer.getChannelData(0);

        // Client-side instant mute: if user is speaking while model is
        // playing, drop gain to 0 immediately — don't wait for server.
        if (playingRef.current && !clientMutedRef.current) {
          let sumSq = 0;
          for (let i = 0; i < pcmData.length; i++) sumSq += pcmData[i] * pcmData[i];
          const rms = Math.sqrt(sumSq / pcmData.length);
          if (rms > SPEECH_RMS_THRESHOLD) {
            clientMutedRef.current = true;
            if (gainRef.current) gainRef.current.gain.value = 0;
          }
        }

        try {
          liveSessionRef.current.sendRealtimeInput({ audio: createBlob(pcmData) });
        } catch (err: any) {
          const msg = String(err?.message ?? err ?? '');
          console.error('[GeminiLive] sendRealtimeInput error:', msg);
          if (msg.includes('CLOSING') || msg.includes('CLOSED')) {
            sessionReadyRef.current = false;
            liveSessionRef.current = null;
          }
          cleanupMicResources();
          setIsMicActive(false);
        }
      };

      sourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioCtxRef.current.destination);

      streamEndedRef.current = false;
      skipAudioRef.current = false;
      setIsMicActive(true);
      console.log('[GeminiLive] Mic stream started — voice-to-voice active');
    } catch (error) {
      console.error('[GeminiLive] startMicStream failed:', error);
      cleanupMicResources();
      setIsMicActive(false);
    }
  }, [initAudio, createSession, cleanupMicResources]);

  // ─── Frequency analyser ───────────────────────────────────────────────────

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        rafId = requestAnimationFrame(update);
      } else if (!isPlaying) {
        dispatch(setFrequencyData(new Array(1024).fill(0)));
      }
    };
    if (isPlaying) update();
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, dispatch]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  return { textToSpeechConvert, stopAudio, startMicStream, stopMicStream, isMicActive, isPlaying, frequencyData };
};

export default useTextToSpeech;
