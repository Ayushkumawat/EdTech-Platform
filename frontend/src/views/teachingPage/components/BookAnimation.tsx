import React, { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useAppSelector, useAppDispatch, setCurrentPage, setInputPage } from '../store';

import flip2 from '../../../assets/audios/flip2.mp3';
import flip3 from '../../../assets/audios/flip3.mp3';
import flip4 from '../../../assets/audios/flip4.mp3';

interface BookAnimationProps {
  pages?: string[];
  startPageNumber?: number;
}

const BookAnimation: React.FC<BookAnimationProps> = ({ pages = [], startPageNumber = 1 }) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state) => state.teaching.data.currentPage);
  const inputPage = useAppSelector((state) => state.teaching.data.inputPage);

  const audioRefs = useRef([new Audio(flip2), new Audio(flip3), new Audio(flip4)]);
  const bookRef = useRef<any>(null);
  const clickInitiatedRef = useRef(false);
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);
  const [isHoverTransitioning, setIsHoverTransitioning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoPageNum, setInfoPageNum] = useState<number | null>(null);
  const [infoImgUrl, setInfoImgUrl] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setInputPage(startPageNumber));
  }, [dispatch, startPageNumber]);

  const playRandomFlipSound = () => {
    const idx = Math.floor(Math.random() * audioRefs.current.length);
    const audio = audioRefs.current[idx];
    audio.currentTime = 0;
    audio.play();
  };

  const handlePagePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.type === 'mousedown' && e.button !== 0) return;
    clickInitiatedRef.current = true;
    playRandomFlipSound();
  };

  const handleFlip = () => {
    if (!clickInitiatedRef.current) playRandomFlipSound();
    clickInitiatedRef.current = false;
    if (bookRef.current) {
      const idx = bookRef.current.pageFlip().getCurrentPageIndex();
      const pageNum = idx + startPageNumber;
      dispatch(setInputPage(pageNum));
    }
  };


  const handleContinueThisPage = useCallback((pageNumber: number, imgUrl?: string) => {
    dispatch(setCurrentPage(pageNumber));
    dispatch(setInputPage(pageNumber));
    setHoveredPage(null);
    setInfoPageNum(pageNumber);
    setInfoImgUrl(imgUrl || null);
    setShowInfo(true);
    setTimeout(() => setShowInfo(false), 3000);
  }, [dispatch]);

  const handleMouseEnter = useCallback((pageNum: number) => {
    if (pageNum !== currentPage && !isHoverTransitioning) {
      setIsHoverTransitioning(true);
      setHoveredPage(pageNum);
      setTimeout(() => setIsHoverTransitioning(false), 50);
    }
  }, [currentPage, isHoverTransitioning]);

  const handleMouseLeave = useCallback(() => {
    if (!isHoverTransitioning) {
      setIsHoverTransitioning(true);
      setHoveredPage(null);
      setTimeout(() => setIsHoverTransitioning(false), 50);
    }
  }, [isHoverTransitioning]);

  const pages1= ["https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f100236eaeac48/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f3003d0cfdae20/view?project=685987e3000799209566",
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f4002ba73d251e/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f6002d903d266a/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f7002ce8b40386/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117f8000abf354e5a/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117fa003d97e7335d/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117fb001f141c632e/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117fc00275017dd1a/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117fe00276a884cf1/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687117ff0002e8cf611e/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687118000017a1d10500/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687118020033931b8249/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/687118030023e31139a8/view?project=685987e3000799209566",      
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68711804002f5cb7f348/view?project=685987e3000799209566",      
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68711805000f7c592fdf/view?project=685987e3000799209566",      
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68711806002dabd9dc6b/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68711807000f584f4558/view?project=685987e3000799209566",     
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68711808001e2f265d3b/view?project=685987e3000799209566",
    "https://fra.cloud.appwrite.io/v1/storage/buckets/685a7bd100084facdc95/files/68728a60003cade11309/view?project=685987e3000799209566" ]


  return (
    <div className="w-[100%] h-[88vh] flex items-center justify-center relative">
      {showInfo && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded px-6 py-3 z-[9999] text-center">
          <div className="font-bold text-gray-800">Page: {infoPageNum}</div>
          <div className="text-xs text-blue-600 break-all">{infoImgUrl}</div>
        </div>
      )}
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
        startPage={startPageNumber}
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
        {pages1.map((url, idx) => {
          const pageNum = idx + startPageNumber;
          const isCurrentPage = pageNum === currentPage;
          
          return (
            <div
              key={pageNum}
              className={
                `group relative overflow-hidden w-full h-full ${!isCurrentPage ? 'cursor-pointer' : 'cursor-default'}`
              }
              onMouseDown={handlePagePointerDown}
              onTouchStart={handlePagePointerDown}
              onMouseEnter={() => handleMouseEnter(pageNum)}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={url}
                alt={`Page ${pageNum}`}
                className={`w-full h-full object-cover object-center transition-filter duration-300 ease-in-out ${!isCurrentPage ? 'group-hover:brightness-75' : ''}`}
              />

              <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 invisible pointer-events-none transition-opacity duration-300 cursor-default ${!isCurrentPage ? 'group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto' : ''}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinueThisPage(pageNum, url);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="relative block bg-[var(--thm-black)] text-white font-bold uppercase text-[15px] px-5 py-2 transition-colors duration-300 ease-in-out hover:bg-[var(--thm-primary)] cursor-pointer"
                >
                  Continue This Page
                </button>
              </div>
            </div>
          );
        })}
      </HTMLFlipBook>

    </div>
  );
};

export default BookAnimation;
