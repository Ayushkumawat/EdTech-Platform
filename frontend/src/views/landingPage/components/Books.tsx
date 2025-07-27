import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';

export default function Books() {
    const swiperRef = useRef<any>(null);

    const handleMouseEnter = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.autoplay.stop();
        }
    };

    const handleMouseLeave = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.autoplay.start();
        }
    };

    return (
        <>
            {/*Start Project One */}
            <section className="project-one">
                <div className="container mx-auto max-w-[1300px] px-4">
                    <div className="sec-title text-center">
                        <div className="sub-title">
                            <h5>OUR RECENT COURSES</h5>
                        </div>
                        <h2>
                            Books We Designed <br />
                            Check Our Work
                        </h2>
                    </div>
                    
                    <Swiper
                        ref={swiperRef}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: false,
                        }}
                        speed={3000}
                        allowTouchMove={true}
                        modules={[Autoplay]}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 20 },
                            1024: { slidesPerView: 3, spaceBetween: 30 },
                            1280: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                        className="books-swiper !pb-12"
                    >
                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
                                        alt="Modern Book Design"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                            Modern <span>Design</span>
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                            Explore contemporary design principles and innovative approaches to modern book creation.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop"
                                        alt="Creative Literature"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                            Creative <span>Literature</span>
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                            Discover the art of storytelling through beautifully crafted literary works and narratives.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop"
                                        alt="Educational Content"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                            Educational <span>Content</span>
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                            Comprehensive learning materials designed to educate and inspire knowledge seekers.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop"
                                        alt="Technical Guides"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                            Technical <span>Guides</span>
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                            In-depth technical documentation and guides for professionals and enthusiasts.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=600&fit=crop"
                                        alt="Art & Culture"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                            Art & <span className="text-pink-400">Culture</span>
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                            Explore diverse cultures and artistic expressions from around the world.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>
            {/*End Project One */}
        </>
    );
}