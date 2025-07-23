import React, { useRef, useState, useEffect } from "react";
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
 
  useEffect(() => {
     
    if (isPlaying){
      console.log("this is playing")
      dispatch(dispatch(setDotAnimation(false)))
    }

    if (!isPlaying) {
      setDotHeights(initialHeight);
      dispatch(setMobileVisual(false))
      return;
    }

    const newDotHeights = [30, 20, 10, 50].map(
      (index) => (frequencyData[index] / 255) * intensity + initialHeight[0]
    );

    setDotHeights((prevHeights) => {
      if (JSON.stringify(prevHeights) !== JSON.stringify(newDotHeights)) {
        return newDotHeights;
      }
      return prevHeights;
    });

  }, [frequencyData, isPlaying]);

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
