import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, putChapterProgress, setInputPage, setStartButton, setDotAnimation } from '../store';
import { AnimatePresence, motion } from 'framer-motion';
import { APP_PREFIX_PATH } from '@/constants/route.constant';
import { HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';

import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';

interface BookAnimationProps {
  pages?: string[];
  startPageNumber?: number;
  handleApiCall: (userInput: string, imageUrl?: string) => void;
  isAudioPlaying?: boolean;
  isUsageInactive?: boolean;
  bookId?: string;
  chapterId?: string;
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
  isUsageInactive = false,
  bookId,
  chapterId: chapterIdProp,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((s) => s.teaching.data.currentPage);
  const inputPage = useAppSelector((s) => s.teaching.data.inputPage);
  const chapterId = useAppSelector((s) => s.teaching.data.chapter_completion_id);
  const passedAt = useAppSelector((s) => s.teaching.data.passed_at);

  const isLastPage =
    typeof currentPage === 'number' &&
    Array.isArray(pages) &&
    pages.length > 0 &&
    currentPage === pages.length;

  const handleTakeQuiz = () => {
    if (bookId && chapterIdProp) {
      navigate(`${APP_PREFIX_PATH}/my_books/book_detail/${bookId}/chapter/${chapterIdProp}/quiz`);
    }
  };

  const audioRefs = React.useMemo(
    () => [new Audio(flip2), new Audio(flip3), new Audio(flip4)],
    []
  );
  const bookRef = useRef<any>(null);
  const clickRef = useRef(false);

  const [hoveredPage, setHoveredPage] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isProcessingPage, setIsProcessingPage] = useState(false);
  const hoverTimer = useRef<number>();

  const lastPageIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof currentPage === 'number') {
      lastPageIndexRef.current = currentPage - startPageNumber;
    }
  }, [currentPage, startPageNumber]);

  const placeholderImageUrl = 'https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/689f2d4700084dd7da73/view?project=685987e3000799209566&mode=admin';
  const displayPages = React.useMemo(() => {
    if (!Array.isArray(pages)) return pages;
    return pages.length % 2 === 1 ? [...pages, placeholderImageUrl] : pages;
  }, [pages]);

  const playSound = () => {
    const idx = Math.floor(Math.random() * audioRefs.length);
    const aud = audioRefs[idx];
    aud.currentTime = 0;
    aud.play().catch(() => {});
  };

  const handlePtrDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    if (e.type === 'mousedown') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    if (e.type === 'touchstart') {
      clickRef.current = true;
      playSound();
    }
  };

  const handleFlip = () => {
    const inst = bookRef.current?.pageFlip?.();
    if (!inst || typeof inst.getCurrentPageIndex !== 'function') return;
    const newIdx = inst.getCurrentPageIndex();

    if (lastPageIndexRef.current !== null && typeof inputPage === 'number' && inputPage === 0) {
      if (newIdx > lastPageIndexRef.current) dispatch(setInputPage(inputPage + 1));
      else if (newIdx < lastPageIndexRef.current) dispatch(setInputPage(inputPage - 1));
    }

    lastPageIndexRef.current = newIdx;
    if (!clickRef.current) playSound();
    clickRef.current = false;
  };

  const continuePage = (pageNum: number, url: string) => {
    if (isUsageInactive || isProcessingPage) return;
    setIsProcessingPage(true);

    dispatch(setDotAnimation(true));

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
    handleApiCall('start teaching this page', url);

    setTimeout(() => setIsProcessingPage(false));
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
    <div className="w-full h-[88vh] flex flex-col items-center justify-center relative">
      {Array.isArray(displayPages) && typeof currentPage === 'number' ? (
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
          maxShadowOpacity={0.6}
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
          {displayPages.map((url, idx) => {
            const pageNum = idx + startPageNumber;
            const isCurrent = pageNum === currentPage;
            const isRightPage = idx % 2 === 1;
            const isExtraPlaceholder = Array.isArray(pages) && pages.length % 2 === 1 && idx === displayPages.length - 1;

            return (
              <div
                key={pageNum}
                className={`relative overflow-hidden w-full h-full ${!isCurrent && !isExtraPlaceholder ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => { if (!isExtraPlaceholder) handleMouseEnter(pageNum); }}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={url}
                  alt={`Page ${pageNum}`}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => {
                    try { console.warn('Image failed to load:', url); } catch {}
                  }}
                  className={
                    `w-full h-full object-cover transition-filter duration-500 ease-in-out` +
                    (hoveredPage === pageNum && !isCurrent && !isExtraPlaceholder ? ' brightness-75' : '')
                  }
                />

                {/* Static inner-edge shadows (gutter/spine effect) */}
                {!isExtraPlaceholder && (
                  <div className="pointer-events-none absolute inset-0 z-[5]">
                    {isRightPage ? (
                      <>
                        {/* RIGHT PAGE: shadow on the LEFT edge (spine side) */}
                        <div
                          className="absolute top-0 bottom-0 left-0 w-32"
                          style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0))',
                            opacity: 0.7,
                          }}
                        />
                        <div
                          className="absolute top-0 bottom-0 left-0 w-12"
                          style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.1), rgba(0,0,0,0))',
                            opacity: 0.6,
                          }}
                        />
                      </>
                    ) : (
                      <>
                        {/* LEFT PAGE: shadow on the RIGHT edge (spine side) */}
                        <div
                          className="absolute top-0 bottom-0 right-0 w-32"
                          style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,0.35), rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0))',
                            opacity: 0.7,
                          }}
                        />
                        <div
                          className="absolute top-0 bottom-0 right-0 w-12"
                          style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,0.45), rgba(0,0,0,0.1), rgba(0,0,0,0))',
                            opacity: 0.6,
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                <AnimatePresence>
                  {hoveredPage === pageNum && !isCurrent && !isExtraPlaceholder && (
                    <motion.div
                      className={`inset-0 absolute flex flex-col items-center justify-center gap-3 ${
                        isUsageInactive ? 'bg-red-900 bg-opacity-70' : 'bg-black bg-opacity-50'
                      }`}
                      style={{ zIndex: 9999 }}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={overlayVariants}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      <motion.button
                        onClick={() => continuePage(pageNum, url)}
                        whileHover={!isUsageInactive ? { scale: 1.1 } : {}}
                        className="font-bold uppercase px-6 py-3 bg-[var(--thm-black)] text-white hover:bg-[var(--thm-primary)]"
                        disabled={isUsageInactive}
                      >
                        {isUsageInactive ? 'Usage Limit Reached' : 'Continue This Page'}
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

      {/* Take Quiz CTA — shown only on the last page */}
      <AnimatePresence>
        {isLastPage && bookId && chapterIdProp && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-[100]"
          >
            {passedAt && (
              <div className="flex items-center gap-1.5 text-green-500 text-xs font-semibold">
                <HiOutlineCheckCircle className="text-base" />
                Completed
              </div>
            )}
            <button
              onClick={handleTakeQuiz}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'var(--thm-primary)' }}
            >
              <HiOutlineAcademicCap className="text-lg" />
              {passedAt ? 'Retake Quiz' : 'Take Quiz'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookAnimation;
