import React, { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useAppSelector, useAppDispatch, putChapterProgress, setInputPage, setStartButton } from '../store';
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2';
import { AnimatePresence, motion } from 'framer-motion';

import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';

interface BookAnimationProps {
  pages?: string[];
  startPageNumber?: number;
  handleApiCall: (userInput: string, imageUrl?: string) => void;
  isAudioPlaying?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const BookAnimation: React.FC<BookAnimationProps> = ({
  pages,
  startPageNumber = 1,
  handleApiCall,
  isAudioPlaying,
}) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((s) => s.teaching.data.currentPage);
  const inputPage = useAppSelector((s) => s.teaching.data.inputPage);
  const chapterId = useAppSelector((s) => s.teaching.data.chapter_completion_id);
  // const { isPlaying } = useTextToSpeech2();

  const audioRefs = React.useMemo(
    () => [new Audio(flip2), new Audio(flip3), new Audio(flip4)],
    []
  );
  const bookRef = useRef<any>(null);
  const clickRef = useRef(false);

  const [hoveredPage, setHoveredPage] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const hoverTimer = useRef<number>();

  const lastPageIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof currentPage === 'number') {
      lastPageIndexRef.current = currentPage - startPageNumber;
    }
  }, [currentPage, startPageNumber]);

  const playSound = () => {
    const idx = Math.floor(Math.random() * audioRefs.length);
    const aud = audioRefs[idx];
    aud.currentTime = 0;
    aud.play().catch(() => {});
  };

  const handlePtrDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Allow clicks on buttons and interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // Allow button clicks
    }
    
    // Completely prevent mouse events, but allow touch events for swipe
    if (e.type === 'mousedown') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Allow touch events for swipe functionality
    if (e.type === 'touchstart') {
      clickRef.current = true;
      playSound();
    }
  };

  const handleFlip = () => {
    const inst = bookRef.current?.pageFlip?.();
    if (!inst || typeof inst.getCurrentPageIndex !== 'function') return;
    const newIdx = inst.getCurrentPageIndex();
    
    // Only update inputPage if it's currently 0 (not during AI speech)
    if (lastPageIndexRef.current !== null && typeof inputPage === 'number' && inputPage === 0) {
      if (newIdx > lastPageIndexRef.current) dispatch(setInputPage(inputPage + 1));
      else if (newIdx < lastPageIndexRef.current) dispatch(setInputPage(inputPage - 1));
    }
    
    lastPageIndexRef.current = newIdx;
    if (!clickRef.current) playSound();
    clickRef.current = false;
  };

  const continuePage = (pageNum: number, url: string) => {
    console.log('continuePage called with:', pageNum, url);
    if (chapterId) dispatch(putChapterProgress({ uid: chapterId, current_page: pageNum }));
    playSound();
    const inst = bookRef.current?.pageFlip?.();
    const target = pageNum - startPageNumber;
    if (inst?.flip) {
      inst.flip(target);
      lastPageIndexRef.current = target;
    }
    dispatch(setInputPage(0));
    dispatch(setStartButton(false)); 
    // Added: set startButton to false
    handleApiCall('start teaching this page', url);
  };

  const handleMouseEnter = (pageNum: number) => {
    if (isFlipping || pageNum === currentPage) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setHoveredPage(pageNum);
    }, 200);
  };

  const handleMouseLeave = () => {
    window.clearTimeout(hoverTimer.current);
    setHoveredPage(null);
  };

  useEffect(() => {
    const inst = bookRef.current?.pageFlip?.();
    if (currentPage === null) return;
    const target = currentPage - startPageNumber;
    if (
      inst?.getCurrentPageIndex &&
      inst?.flip &&
      inst.getCurrentPageIndex() !== target
    ) {
      inst.flip(target);
      lastPageIndexRef.current = target;
    }
  }, [currentPage, startPageNumber]);

  return (
    <div className="w-full h-[88vh] flex items-center justify-center relative">
      {Array.isArray(pages) && typeof currentPage === 'number' ? (
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
          maxShadowOpacity={0.5}
          drawShadow
          onFlip={handleFlip}
          startPage={currentPage - startPageNumber}
          flippingTime={800}
          usePortrait
          useMouseEvents={true}
          swipeDistance={30}
          autoSize
          style={{}}
          startZIndex={0}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={false}
          showPageCorners={true}
          disableFlipByClick={true}
        >
          {pages.map((url, idx) => {
            const pageNum = idx + startPageNumber;
            const isCurrent = pageNum === currentPage;
            const isHovered = hoveredPage === pageNum;

            return (
              <div
                key={pageNum}
                className={`relative overflow-hidden w-full h-full ${!isCurrent ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => handleMouseEnter(pageNum)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={url}
                  alt={`Page ${pageNum}`}
                  className={
                    `w-full h-full object-cover transition-filter duration-500 ease-in-out` +
                    (isHovered && !isCurrent ? ' brightness-75' : '')
                  }
                />

                <AnimatePresence>
                  {isHovered && !isCurrent && (
                    <motion.div
                      className="inset-0 absolute bg-black bg-opacity-50 flex items-center justify-center"
                      style={{ zIndex: 9999 }}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={overlayVariants}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      <motion.button
                        onClick={() => continuePage(pageNum, url)}
                        whileHover={{ scale: 1.1 }}
                        className={
                          `bg-[var(--thm-black)] text-white font-bold uppercase px-6 py-3 transition-colors duration-200 hover:bg-[var(--thm-primary)]` +
                          (isAudioPlaying ? ' opacity-50 cursor-not-allowed' : '')
                        }
                        disabled={!!isAudioPlaying}
                      >
                        Continue This Page
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </HTMLFlipBook>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading pages…</p>
        </div>
      )}
    </div>
  );
};

export default BookAnimation;
