import React, { useRef, useState, useEffect, useMemo } from "react";
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
  const isPlaying=useAppSelector((state)=>state.teaching.data.isPlaying)
  const dispatch=useAppDispatch()

  // Create dummy animation using setInterval for continuous updates
  useEffect(() => {
    if (!isPlaying) {
      setDotHeights(initialHeight);
      dispatch(setMobileVisual(false))
      return;
    }

    console.log("this is playing")
    dispatch(setDotAnimation(false))

    // Set up continuous animation updates
    const intervalId = setInterval(() => {
      const time = Date.now() * 0.005; // Animation speed
      const newHeights = initialHeight.map((baseHeight, index) => {
        const wave = Math.sin(time + index * 0.5) * 0.5 + 0.5; // Sine wave between 0 and 1
        const randomFactor = Math.sin(time * 0.3 + index * 1.2) * 0.3 + 0.7; // Additional variation
        return baseHeight + (wave * randomFactor * intensity);
      });
      setDotHeights(newHeights);
    }, 50); // Update every 50ms for smooth animation

    // Cleanup interval on unmount or when isPlaying changes
    return () => clearInterval(intervalId);

  }, [isPlaying, initialHeight, intensity, dispatch]);

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
