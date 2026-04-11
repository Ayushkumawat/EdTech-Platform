import React, { useRef, useState, useEffect } from "react";
import reducer, { setDotAnimation, useAppSelector, useAppDispatch, setMobileVisual } from "../store";
import { injectReducer } from "@/store";

interface AudioVisualizerProps {
  initialHeight: number[];
  intensity: number;
}

injectReducer("teaching", reducer);

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ intensity }) => {
  const dotAnimation = useAppSelector((state) => state.teaching.data.dotAnimation);
  const mobileVisual = useAppSelector((state) => state.teaching.data.mobileVisual);
  const isPlaying = useAppSelector((state) => state.teaching.data.isPlaying);
  const dispatch = useAppDispatch();

  const [liveAudioPlaying, setLiveAudioPlaying] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Smoothers for organic movement
  const currentAmpRef = useRef<number>(0);
  const currentDispRef = useRef<number>(0);

  type DustParticle = {
    nx: number;
    drift: number;
    seed: number;
    seed2: number;
    sz: number;
    depth: number;
    ySm: number;
    xSm: number;
  };

  const dustParticlesRef = useRef<DustParticle[] | null>(null);
  const lastCanvasKeyRef = useRef<string>('');
  /** 1 = ideal idle (full particle field), 0 = merged into center vertical line */
  const particleMorphRef = useRef(1);

  const dotAnimationRef = useRef(dotAnimation);
  const liveAudioPlayingRef = useRef(liveAudioPlaying);
  const isPlayingRef = useRef(isPlaying);
  dotAnimationRef.current = dotAnimation;
  liveAudioPlayingRef.current = liveAudioPlaying;
  isPlayingRef.current = isPlaying;
  
  // Store the theme primary color
  const primaryColorRef = useRef({ r: 168, g: 85, b: 247 }); // Fallback purple

  // Extract --thm-primary color from CSS
  useEffect(() => {
    const extractThemeColor = () => {
      const tempEl = document.createElement('div');
      tempEl.style.color = 'var(--thm-primary, #a855f7)';
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);
      
      const computedColor = window.getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);

      const rgbMatch = computedColor.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        primaryColorRef.current = {
          r: parseInt(rgbMatch[0], 10),
          g: parseInt(rgbMatch[1], 10),
          b: parseInt(rgbMatch[2], 10),
        };
      }
    };
    
    extractThemeColor();
  }, []);

  useEffect(() => {
    const handlePlaybackState = (event: Event) => {
      const { state } = (event as CustomEvent).detail;
      setLiveAudioPlaying(state === 'playing');
      if (state === 'playing') {
        dispatch(setDotAnimation(false));
      }
    };
    window.addEventListener('liveAudioPlayback', handlePlaybackState);
    return () => window.removeEventListener('liveAudioPlayback', handlePlaybackState);
  }, [dispatch]);

  const setupAnalyser = (): boolean => {
    try {
      const gdmLiveAudio = document.querySelector('gdm-live-audio') as any;
      let outputNode: GainNode | null = null;

      if (gdmLiveAudio?.outputNode) {
        outputNode = gdmLiveAudio.outputNode;
      } else if ((window as any).__audioOutputNode) {
        outputNode = (window as any).__audioOutputNode;
      }

      if (outputNode) {
        if (analyserRef.current) {
          analyserRef.current.disconnect();
        }

        const ctx = outputNode.context as AudioContext;
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.8;
        const binCount = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(new ArrayBuffer(binCount));

        outputNode.connect(analyserRef.current);
        return true;
      }
    } catch (error) {
      console.warn('Failed to setup analyser:', error);
    }
    return false;
  };

  const loop = () => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });

    if (!canvas || !parent || !ctx) {
      rafIdRef.current = requestAnimationFrame(loop);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const time = Date.now() * 0.0015;

    const data = dataArrayRef.current;
    if (analyserRef.current && data) {
      analyserRef.current.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Additive blending for the glowing energy effect
    ctx.globalCompositeOperation = 'lighter';

    // Process audio data into Bass (amplitude) and Treble (particle dispersion)
    const numBins = data ? Math.floor(data.length * 0.5) : 0;
    let bass = 0;
    let treble = 0;
    
    if (data && numBins > 0) {
      const half = Math.floor(numBins * 0.5);
      for (let i = 0; i < numBins; i++) {
        if (i < half) bass += data[i];
        else treble += data[i];
      }
      bass = (bass / half) / 255;
      treble = (treble / (numBins - half)) / 255;
    }

    const isWaiting = dotAnimationRef.current && !analyserRef.current;
    
    // Target values - Reduced multipliers to keep waves inside the box
    const targetAmp = isWaiting ? 0.25 : Math.min(1.0, Math.max(0.05, bass * 1.8));
    const targetDisp = isWaiting ? 0.1 : Math.min(1.0, Math.max(0.02, treble * 1.5));
        
    // Smooth interpolation
    currentAmpRef.current += (targetAmp - currentAmpRef.current) * 0.15;
    currentDispRef.current += (targetDisp - currentDispRef.current) * 0.15;
    
    const amp = currentAmpRef.current * (intensity / 50);
    const disp = currentDispRef.current * (intensity / 50);

    // Dynamic Theme Color
    const { r, g, b } = primaryColorRef.current;
    
    // Create a slightly brighter version for the hot core
    const mixW = (c: number) => Math.min(255, c + 60);
    const coreR = mixW(r), coreG = mixW(g), coreB = mixW(b);

    // Premium Gradient using Theme Primary Color
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${coreR}, ${coreG}, ${coreB}, 1)`);
    gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    // 1. Draw the Core Energy Waves (3 intertwined lines)
    const layers = 3;
    for (let l = 0; l < layers; l++) {
      ctx.beginPath();
      // Use uniform frequency and clean phase offsets for a perfectly even wave
      const phase = time * 2.5 + (l * Math.PI * 0.66);
      const freq = 0.02; 
      const layerAmp = 1 - l * 0.15;

      for (let x = 0; x <= width; x += 2 * dpr) {
        const nx = x / width;
        // Smooth bell curve envelope to taper the ends perfectly
        const env = Math.pow(Math.sin(nx * Math.PI), 2.5);
        
        // Clean, single uniform sine wave
        const w1 = Math.sin(x * freq + phase);
        
        const yOffset = w1 * height * 0.32 * amp * layerAmp * env;
        const y = centerY + yOffset;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1.5, (3.5 - l)) * dpr;
      ctx.shadowBlur = 14 + l * 6;
      ctx.shadowColor = `rgba(${coreR}, ${coreG}, ${coreB}, 0.9)`;
      ctx.stroke();
    }

    // 2. Persistent particle field — inertia + layered turbulence reads more natural than
    //    frame-snap sin/cos columns (feels like dust / embers in air).
    const canvasKey = `${Math.round(width)}_${Math.round(height)}`;
    if (!dustParticlesRef.current || lastCanvasKeyRef.current !== canvasKey) {
      lastCanvasKeyRef.current = canvasKey;
      const logicalW = width / dpr;
      const count = Math.min(300, Math.max(72, Math.floor(logicalW * 1.4)));
      dustParticlesRef.current = Array.from({ length: count }, () => ({
        nx: Math.random(),
        drift: (Math.random() - 0.5) * 14,
        seed: Math.random() * Math.PI * 2,
        seed2: Math.random() * Math.PI * 2,
        sz: 0.5 + Math.random() ** 1.4 * 1.15,
        depth: Math.random(),
        ySm: centerY,
        xSm: Math.random() * width,
      }));
    }

    const dust = dustParticlesRef.current;
    const spreadBase = (4 + disp * 14) * dpr;
    const follow = 0.14 + amp * 0.06;
    const marginY = height * 0.06;

    // Ideal = no active playback — particles bloom; when audio plays they ease into a vertical column.
    // Also treat as idle if isPlaying is stuck true but analyser has no data (stale state).
    const hasRealAudio = !!(analyserRef.current && bass > 0.01);
    const isIdealParticle =
      (!liveAudioPlayingRef.current && !isPlayingRef.current) ||
      (!liveAudioPlayingRef.current && !hasRealAudio && !dotAnimationRef.current);
    const morphTarget = isIdealParticle ? 1 : 0;
    particleMorphRef.current += (morphTarget - particleMorphRef.current) * 0.09;
    const morph = particleMorphRef.current;
    const morphEase = morph * morph * (3 - 2 * morph);
    const visScale = morphEase;
    const sizeScale = morphEase;

    ctx.shadowBlur = 0;

    const lineX = width * 0.5;
    const wCenter = Math.sin(lineX * 0.02 + time * 2.5);
    const yWaveCenter = centerY + wCenter * height * 0.25 * amp;

    for (let i = 0; i < dust.length; i++) {
      const p = dust[i];
      const env = Math.pow(Math.sin(p.nx * Math.PI), 2.1);
      const colX = p.nx * width;
      const w = Math.sin(colX * 0.02 + time * 2.5);
      const yWave = centerY + w * height * 0.25 * amp * env;

      const t1 = time * (1.05 + p.depth * 0.6);
      const t2 = time * (0.62 - p.depth * 0.25);
      const ox =
        (Math.sin(p.seed + t1) + Math.sin(p.seed2 * 1.7 - t2) * 0.55 + Math.sin(p.seed * 3.1 + t1 * 1.9) * 0.28) *
        spreadBase *
        0.42 *
        env;
      // Stronger vertical spread at horizontal center (env peaks mid-bar)
      const verticalCenterBoost = 1.28 + 0.85 * env;
      const stratifyY = (p.depth - 0.5) * spreadBase * 0.52 * env;
      const oy =
        (Math.cos(p.seed - t2) + Math.sin(p.seed2 + t1 * 1.2) * 0.5 + Math.cos(p.seed * 2.4 - t1 * 1.1) * 0.32) *
        spreadBase *
        env *
        verticalCenterBoost +
        stratifyY;

      const fullTargetX = colX + ox + p.drift * dpr * 0.12;
      const fullTargetY = yWave + oy;

      const lineSpread = height * 0.5;
      const collapseX = lineX + Math.sin(p.seed * 2.1 + time * 0.35) * 1.4 * dpr;
      const collapseY =
        yWaveCenter +
        ((p.nx + p.depth) * 0.5 - 0.5) * lineSpread +
        Math.sin(p.seed + time * 0.9) * 2.2 * dpr;

      const targetX = fullTargetX * morph + collapseX * (1 - morph);
      const targetY = fullTargetY * morph + collapseY * (1 - morph);
      p.xSm += (targetX - p.xSm) * follow;
      p.ySm += (targetY - p.ySm) * (follow * 0.92);

      const py = Math.min(height - marginY, Math.max(marginY, p.ySm));
      const px = Math.min(width - 2 * dpr, Math.max(2 * dpr, p.xSm));

      const pr = 1.15 * p.sz * dpr * sizeScale;
      const haloA = (0.05 + p.depth * 0.07 + amp * 0.06) * env * visScale;
      const coreA = Math.min(0.95, (0.22 + p.depth * 0.45 + amp * 0.22) * env * visScale);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${haloA})`;
      ctx.arc(px, py, pr * 2.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(${coreR}, ${coreG}, ${coreB}, ${coreA})`;
      ctx.arc(px, py, pr * 0.92, 0, Math.PI * 2);
      ctx.fill();
    }

    rafIdRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const shouldPlay = liveAudioPlaying || isPlaying;

    if (shouldPlay) {
      dispatch(setDotAnimation(false));
      dispatch(setMobileVisual(false));

      const trySetup = () => {
        if (setupAnalyser()) {
          console.log('Audio visualization started');
        } else {
          setTimeout(trySetup, 100);
        }
      };
      trySetup();
    } else {
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
        dataArrayRef.current = null;
      }
    }
  }, [liveAudioPlaying, isPlaying, dispatch]);

  useEffect(() => {
    if (!rafIdRef.current) {
      loop();
    }
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className="audio-visulizer-container" style={{ pointerEvents: 'none' }}>
      <div className="canvas" style={{ width: '100%', height: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;
