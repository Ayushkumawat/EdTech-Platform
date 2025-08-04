import { useState } from 'react'
import ModalVideo from 'react-modal-video'
import { SpinningText } from '@/components/animation/SpinningText';
import React from 'react';
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import { FaPlay } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { GiBookCover } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 0,
    autoplay: {
        delay: 7000,
        disableOnInteraction: false,
    },
    loop: true,

    // Navigation
    navigation: {
        nextEl: '.h1n',
        prevEl: '.h1p',
    },

    // Pagination
    pagination: {
        el: '.swiper-pagination1',
        clickable: true,
    },



}
const slides = [
  {
    image: "/assets/img/slider/1.jpg",
    h3: "Personalized",
    h2: "Learning"
  },
  {
    image: "/assets/img/slider/home_image3.jpg",
    h3: "Innovative",
    h2: "Education"
  },
  {
    image: "/assets/img/slider/2.png",
    h3: "Think",
    h2: "Beyond"
  },
  {
    image: "/assets/img/slider/home_image2.jpg",
      h3: "Infinite",
    h2: "Learning"
  },
];

export default function Banner() {
    const [isOpen, setOpen] = useState(false)
    const navigate = useNavigate();

    const handleBookIconClick = () => {
        navigate('/app/all_books');
    };

    const handleDiscoverMoreClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const featureSection = document.querySelector('.project-one');
        if (featureSection) {
            featureSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
  return (
    <>
    
    <section className="main-slider main-slider-one relative">
        
    
  
    
      <Swiper {...swiperOptions} className="banner-carousel owl-theme owl-carousel owl-nav-none owl-dots-none">   
        {slides.map((slide, idx) => (
          <SwiperSlide className="swiper-slide" key={idx}>
            <div className="image-layer" style={{backgroundImage: `url(${slide.image})`}}></div>
            <div className="shape1"><img src="/assets/img/shape/slider-v1-shape1.png" alt=""/></div>
            <div className="container px-5 py-5">
              <div className="main-slider-one__single">
                <div className="main-slider-one__content">
                  <div className="shape2 float-bob-x"><img src="/assets/img/shape/slider-v1-shape2.png" alt=""/></div>
                  <div className='main-slider-one__content-container'>
                    <h3>{slide.h3}</h3>
                    <h2>{slide.h2}</h2>
                    <div className="btn-box">
                      <div className="btn-one">
                        <a className="thm-btn-one !bg-gray-300 hover:!text-gray-900" onClick={handleBookIconClick} >
                          <span><span className='txt'>Discover More</span></span>
                        </a>
                      </div>
                      <div className="btn-two">
                        <a onClick={handleDiscoverMoreClick} className="video-popup" data-fancybox="video-1" data-caption="">
                          <div className="main-slider-one__icon">
                            <i ><GiBookCover/></i>
                            <span>Explore Your Books</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className='contact-info-footer'>
                    <div className="contact-info">
                      <ul>
                        <li>
                          <div className="icon-box">
                            <span> <IoLocationOutline/></span>
                          </div>
                          <div className="text-box">
                            <p>465 NT Road, Indore, Madhya Pradesh, India</p>
                          </div>
                        </li>
                        <li>
                          <div className="icon-box">
                            <span><FaRegEnvelope/></span>
                          </div>
                          <div className="text-box">
                            <p><a href="mailto:aionwards.founder@gmail.com">aionwards.founder@gmail.com</a></p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
       
        <div className="swiper-pagination1 swiper-pagination1-clickable swiper-pagination1-bullets" id="main-slider-one__pagination">
            <span className="swiper-pagination1-bullet swiper-pagination1-bullet-active"  role="button" aria-label="Go to slide 1"></span>
            <span className="swiper-pagination1-bullet" role="button" aria-label="Go to slide 2"></span>
            <span className="swiper-pagination1-bullet" role="button" aria-label="Go to slide 3"></span>
        </div>
      </Swiper>
      {/* <div className='absolute bottom-32 right-24'>
        <SpinningText
      radius={5}
      fontSize={1.2}
      className='font-medium z-10 text-white'
    >
      {`pre-order • pre-order • pre-order • `}
    
    </SpinningText>

    </div> */}
    </section>
    <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="vfhzo499OeA" onClose={() => setOpen(false)} />
    </>
  );
};

