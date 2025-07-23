import React, { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useAppSelector, useAppDispatch, putChapterProgress, setInputPage } from '../store';
import useTextToSpeech2 from '@/utils/hooks/useTextToSpeech2';

import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';

interface BookAnimationProps {
  pages?: string[];
  startPageNumber?: number;
  handleApiCall: (userInput: string, imageUrl?: string) => void;
}

const BookAnimation: React.FC<BookAnimationProps> = ({ pages, startPageNumber = 1, handleApiCall }) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state) => state.teaching.data.currentPage);
  const inputPage = useAppSelector((state) => state.teaching.data.inputPage);
  const chapterCompletionId = useAppSelector((state) => state.teaching.data.chapter_completion_id);
  const { isPlaying } = useTextToSpeech2();

  const audioRefs = React.useMemo(() => [new Audio(flip2), new Audio(flip3), new Audio(flip4)], []);
  const bookRef = useRef<any>(null);
  const clickInitiatedRef = useRef(false);
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);
  const [isHoverTransitioning, setIsHoverTransitioning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoPageNum, setInfoPageNum] = useState<number | null>(null);
  const [infoImgUrl, setInfoImgUrl] = useState<string | null>(null);
  
  // Track the last known page index to detect direction
  const lastPageIndexRef = useRef<number | null>(null);
  
  // Initialize lastPageIndexRef when component mounts or currentPage changes
  useEffect(() => {
    if (typeof currentPage === 'number' && bookRef.current) {
      const bookPageIndex = currentPage - startPageNumber;
      lastPageIndexRef.current = bookPageIndex;
      console.log('Initialized lastPageIndexRef to:', bookPageIndex);
    }
  }, [currentPage, startPageNumber]);

  useEffect(() => {
    console.log("Chapter completion id:", chapterCompletionId);
    console.log("Is playing:", isPlaying);
    console.log("Current page:", currentPage, "Input page:", inputPage);
  }, [chapterCompletionId, isPlaying, currentPage, inputPage]);

  const playRandomFlipSound = () => {
    const idx = Math.floor(Math.random() * audioRefs.length);
    const audio = audioRefs[idx];
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handlePagePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.type === 'mousedown' && e.button !== 0) return;
    clickInitiatedRef.current = true;
    playRandomFlipSound();
  };

  const handleFlip = () => {
    if (!bookRef.current) return;
    
    try {
      const pageFlipInstance = bookRef.current.pageFlip?.();
      if (!pageFlipInstance || typeof pageFlipInstance.getCurrentPageIndex !== 'function') {
        console.warn('Flipbook instance or getCurrentPageIndex not available');
        return;
      }
      const currentBookPageIndex = pageFlipInstance.getCurrentPageIndex();
      console.log('Book flip detected - Current book page index:', currentBookPageIndex);
      console.log('Last page index was:', lastPageIndexRef.current);
      
      // Only process if we have a valid previous page index and valid current state
      if (lastPageIndexRef.current !== null && 
          typeof currentPage === 'number' && 
          typeof inputPage === 'number') {
        
        // Determine flip direction and update inputPage accordingly
        if (currentBookPageIndex > lastPageIndexRef.current) {
          // Flipped forward (right)
          dispatch(setInputPage(inputPage + 1));
        } else if (currentBookPageIndex < lastPageIndexRef.current) {
          // Flipped backward (left)
          dispatch(setInputPage(inputPage - 1));
        }
      }
      
      // Always update the reference for next comparison
      lastPageIndexRef.current = currentBookPageIndex;
      
      // Play sound if flip wasn't click-initiated
      if (!clickInitiatedRef.current) {
        playRandomFlipSound();
      }
      
      // Reset click flag
      clickInitiatedRef.current = false;
      
    } catch (error) {
      console.error('Error in handleFlip:', error);
    }
  };

  useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  const handleContinueThisPage = (pageNumber: number, imgUrl?: string) => {
    console.log('Continue this page called for page:', pageNumber);
    
    if (chapterCompletionId) {
      dispatch(putChapterProgress({ uid: chapterCompletionId, current_page: pageNumber }));
    } else {
      console.log("Chapter completion ID not found");
    }

    // Play flip sound and visually flip the page first
    playRandomFlipSound();
    
    if (bookRef.current) {
      const targetBookPageIndex = pageNumber - startPageNumber;
      const pageFlipInstance = bookRef.current.pageFlip?.();
      if (pageFlipInstance && typeof pageFlipInstance.flip === 'function') {
        console.log('Flipping to book page index:', targetBookPageIndex);
        pageFlipInstance.flip(targetBookPageIndex);
        // Update our reference immediately to avoid confusion
        lastPageIndexRef.current = targetBookPageIndex;
      } else {
        console.warn('Flipbook instance or flip method not available');
      }
    }
    
    // Reset inputPage
    dispatch(setInputPage(0));


    setTimeout(() => {
      setHoveredPage(null);
      setIsHoverTransitioning(false);
    }, 200);

 
    handleApiCall('start teaching this page', imgUrl);
   
  };

  function handleMouseEnter(pageNum: number) {
    if (pageNum !== currentPage) {
      setIsHoverTransitioning(true);
      setHoveredPage(pageNum);
      setTimeout(() => setIsHoverTransitioning(false), 100);
    }
  }

  const handleMouseLeave = useCallback(() => {
    setIsHoverTransitioning(true);
    setHoveredPage(null);
    setTimeout(() => setIsHoverTransitioning(false), 100);
  }, []);

  // Sync book position when currentPage changes from external source
  useEffect(() => {
    if (typeof currentPage === 'number' && bookRef.current) {
      const targetBookPageIndex = currentPage - startPageNumber;
      const pageFlipInstance = bookRef.current.pageFlip?.();
      if (pageFlipInstance && typeof pageFlipInstance.getCurrentPageIndex === 'function') {
        const currentBookPageIndex = pageFlipInstance.getCurrentPageIndex();
        // Only flip if the book is not already on the correct page
        if (currentBookPageIndex !== targetBookPageIndex) {
          console.log('Syncing book to page:', currentPage, 'book index:', targetBookPageIndex);
          if (typeof pageFlipInstance.flip === 'function') {
            pageFlipInstance.flip(targetBookPageIndex);
            lastPageIndexRef.current = targetBookPageIndex;
          } else {
            console.warn('Flipbook instance or flip method not available');
          }
        }
      } else {
        console.warn('Flipbook instance or getCurrentPageIndex not available');
      }
    }
  }, [currentPage, startPageNumber]);

  return (
    <div className="w-[100%] h-[88vh] flex items-center justify-center relative">
      {showInfo && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded px-6 py-3 z-[9999] text-center">
          <div className="font-bold text-gray-800">Page: {infoPageNum}</div>
          <div className="text-xs text-blue-600 break-all">{infoImgUrl}</div>
        </div>
      )}
      
      {typeof currentPage === 'number' && pages && pages.length > 0 ? (
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
          drawShadow
          onFlip={handleFlip}
          startPage={currentPage - startPageNumber} // Convert to book index
          flippingTime={1000}
          usePortrait
          startZIndex={0}
          useMouseEvents
          clickEventForward
          mobileScrollSupport
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          autoSize
          showCover={false}
        >
          {pages?.map((url, idx) => {
            const pageNum = idx + startPageNumber;
            const isCurrentPage = pageNum === currentPage;
            const isHovered = hoveredPage === pageNum;
            
            return (
              <div
                key={pageNum}
                className={`group relative overflow-hidden w-full h-full ${
                  !isCurrentPage ? 'cursor-pointer' : 'cursor-default'
                }`}
                onMouseDown={handlePagePointerDown}
                onTouchStart={handlePagePointerDown}
                onMouseEnter={() => handleMouseEnter(pageNum)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={url}
                  alt={`Page ${pageNum}`}
                  className={`w-full h-full object-cover object-center transition-filter duration-300 ease-in-out ${
                    !isCurrentPage && isHovered ? 'brightness-75' : ''
                  }`}
                />

                {/* Show overlay only when not current page, hovered, and not transitioning */}
                {!isCurrentPage && isHovered && !isHoverTransitioning && (
                  <div
                    style={{ zIndex: 99999, pointerEvents: 'auto', position: 'absolute' }}
                    className="inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto"
                  >
                    <div
  className="inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  style={{ zIndex: 9999, pointerEvents: 'auto' }}
>
  <button
    style={{ zIndex: 10000, pointerEvents: 'auto', position: 'relative' }}
    onClick={(e) => {
    
      handleContinueThisPage(pageNum, url);
    }}
    className="bg-[var(--thm-black)] text-white font-bold uppercase px-5 py-2 hover:bg-[var(--thm-primary)]"
  >
    Continue This Page
  </button>
</div>

                  </div>
                )}
              </div>
            );
          })}
        </HTMLFlipBook>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading pages...</p>
        </div>
      )}
    </div>
  );
};

export default BookAnimation;