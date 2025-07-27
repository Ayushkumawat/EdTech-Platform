import React, { useRef, useState, useEffect, useMemo } from "react";
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2'
import reducer,{setDotAnimation,useAppSelector,useAppDispatch,setMobileVisual} from "../store"
import { injectReducer } from "@/store";

interface AudioVisualizerProps {
  initialHeight: number[]; 
  intensity: number;
}

injectReducer("teaching",reducer)

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({initialHeight,intensity}) => {

  const [dotHeights, setDotHeights] = useState<number[]>(initialHeight);
  const dotAnimation=useAppSelector((state)=>state.teaching.data.dotAnimation)
  const mobileVisual=useAppSelector((state)=>state.teaching.data.mobileVisual)
  const {isPlaying, stopAudio, frequencyData } = useTextToSpeech2()
  const dispatch=useAppDispatch()

  // Memoize dot heights calculation to prevent unnecessary re-renders
  const calculatedDotHeights = useMemo(() => {
    if (!isPlaying || !frequencyData || frequencyData.length === 0) {
      return initialHeight;
    }

    return [30, 20, 10, 50].map(
      (index) => (frequencyData[index] / 255) * intensity + initialHeight[0]
    );
  }, [frequencyData, isPlaying, initialHeight, intensity]);
 
  useEffect(() => {
    if (isPlaying){
      console.log("this is playing")
      dispatch(setDotAnimation(false))
    }

    if (!isPlaying) {
      setDotHeights(initialHeight);
      dispatch(setMobileVisual(false))
      return;
    }

    // Update dot heights only when calculated values change
    setDotHeights(calculatedDotHeights);

  }, [calculatedDotHeights, isPlaying, initialHeight, dispatch]);

  return (
    <div className={`audio-visulizer-container`} style={{ pointerEvents: 'none' }}>
      <div className="canvas">
        {dotHeights.map((height, index) => (
          <div
            key={index}
            className={`dot bg-[var(--thm-primary)] ${mobileVisual?"active-dot":""} ${dotAnimation?"dot-animation":""}`}
            style={{ height: `${height}px`}}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AudioVisualizer;
