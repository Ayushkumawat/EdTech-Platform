import React, { useRef, useState } from 'react';
import HTMLFlipBook from "react-pageflip";

// Import audio files
import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';

// Define props type
interface BookAnimationProps {
  pages?: string[];
  startPageNumber?: number; // new prop
}

const BookAnimation: React.FC<BookAnimationProps> = ({ pages = [], startPageNumber = 18 }) => {
  // Preload audio refs
  const audioRefs = useRef([
    new Audio(flip2),
    new Audio(flip3),
    new Audio(flip4)
  ]);

  // Ref for HTMLFlipBook instance
  const bookRef = useRef<any>(null);

  // Track if last interaction was a click/tap
  const clickInitiatedRef = useRef(false);

  // State for input box (default to startPageNumber)
  const [inputPage, setInputPage] = useState(startPageNumber);

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

  // Handler for input change (now expects actual book page number)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(Number(e.target.value));
  };

  // Handler for button click to flip to page (convert to 0-based chapter index)
  const handleGoToPage = () => {
    if (
      bookRef.current &&
      !isNaN(inputPage) &&
      inputPage >= startPageNumber &&
      inputPage < startPageNumber + pages.length
    ) {
      const pageIndex = inputPage - startPageNumber;
      bookRef.current.pageFlip().flip(pageIndex);
    }
  };

  return (
    <div className="w-full h-[90vh] relative flex flex-col items-center justify-center">
      <HTMLFlipBook
        ref={bookRef}
        width={1}
        height={1.3}
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
        startPage={inputPage - startPageNumber}
        flippingTime={1000}
        usePortrait={true}
        startZIndex={0}
        useMouseEvents={true}
        clickEventForward={true}
        mobileScrollSupport={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
        autoSize={true}
        showCover={false}
      >
        {pages.map((url, idx) => (
          <div
            className="page"
            key={idx+1}
            style={{ padding: 0, width: '100%', height: '100%' }}
            onMouseDown={handlePagePointerDown}
            onTouchStart={handlePagePointerDown}
          >
              <img 
                src={url} 
                alt={`Page ${idx + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', objectPosition: 'center -7px' }}
              />
          </div>
        ))}
      </HTMLFlipBook>
      <div className="mt-4 flex gap-2 items-center">
        <input
          type="number"
          min={startPageNumber}
          max={startPageNumber + pages.length - 1}
          value={inputPage}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-24"
          placeholder="Book page #"
        />
        <button
          onClick={handleGoToPage}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Go to Page
        </button>
      </div>
    </div>
  );
}

export default BookAnimation
    
