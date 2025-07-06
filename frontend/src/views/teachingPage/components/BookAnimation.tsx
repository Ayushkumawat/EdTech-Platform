import React, { useRef, useState } from 'react';
import HTMLFlipBook from "react-pageflip";

// Import audio files
import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';



// Refactor Book to a const component
const BookAnimation: React.FC = () => {
  // Array of sample image URLs
  const images = [
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/1.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/2.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/3.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/4.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/5.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/6.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/7.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/8.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/9.jpg",
    "https://raw.githubusercontent.com/Ayushkumawat/Ayushkumawatportfolio/refs/heads/main/src/images/logo/10.jpg",
  ];

  // Preload audio refs
  const audioRefs = useRef([
    new Audio(flip2),
    new Audio(flip3),
    new Audio(flip4)
  ]);

  // Track if last interaction was a click/tap
  const clickInitiatedRef = useRef(false);

  // Play audio
  const playRandomFlipSound = () => {
    const idx = Math.floor(Math.random() * audioRefs.current.length);
    const audio = audioRefs.current[idx];
    audio.currentTime = 0;
    audio.play();
  };

  // On click/tap: play sound and set ref
  const handlePagePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.type === 'mousedown' && 'button' in e && e.button !== 0) return;
    clickInitiatedRef.current = true;
    playRandomFlipSound();
  };

  // On flip: if not click/tap, play sound
  const handleFlip = () => {
    if (!clickInitiatedRef.current) {
      playRandomFlipSound();
    }
    // Reset for next interaction
    clickInitiatedRef.current = false;
  };

  const coverTexture = {
    background: `
      linear-gradient(135deg, #d5c9a1 25%, transparent 25%),
      linear-gradient(225deg, #d5c9a1 25%, transparent 25%),
      linear-gradient(315deg, #d5c9a1 25%, transparent 25%),
      linear-gradient(45deg, #d5c9a1 25%, transparent 25%)`,
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
  };const [bookSize, setBookSize] = useState({ width: 800, height: 600 });

  return (
    <div className="w-full h-[90vh] relative flex items-center justify-center">

      <HTMLFlipBook
        width={1}
        height={1.2}
        size="stretch"
        minWidth={200}
        maxWidth={1200}
        minHeight={200}
        maxHeight={1300}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        maxShadowOpacity={0.5}
        drawShadow={true}
       
        onFlip={handleFlip}
        startPage={0}
        flippingTime={1000}
        usePortrait={true}
        startZIndex={0}
        useMouseEvents={true}
        clickEventForward={true}
        mobileScrollSupport={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {images.map((url, idx) => (
          <div
            className="page"
            key={idx}
            style={{ padding: 0, width: '90%', height: '90%' }}
            onMouseDown={handlePagePointerDown}
            onTouchStart={handlePagePointerDown}
          >
              <img 
                src={url} 
                alt={`Page ${idx + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', objectPosition: 'center -38px' }}
              />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
}

export default BookAnimation
    
