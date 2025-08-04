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
                            <h5>BOOKS WE TEACH</h5>
                        </div>
                        <h2>
                            Pick a Book<br />
                            Begin Your Journey!
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
                                        src="/assets/img/books/book1.jpg"
                                        alt="Class 7: Exploring Society"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-xl font-bold">
                                        <span className="text-[var(--thm-primary)]">Class 7:</span> Exploring Society
                                        </h2>
                                        <p className="books_card__description text-gray-200 leading-relaxed">
                                        Travel through India’s culture, people, and history in an exciting journey! Learn how society works through stories, maps, and missions – AI Onwards brings social science to life like never before.
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
                                        src="/assets/img/books/book2.jpg"
                                        alt="Class 8: Poorvi"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                        <span className="text-[var(--thm-primary)]">Class 8:</span> Poorvi
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                        Stories from the heart of India — told in English! Learn through village tales, real-life scenarios, and modern themes that connect language with everyday life. AI Onwards brings English alive through conversation and context.
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
                                        src="/assets/img/books/book3.jpg"
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
                                        src="/assets/img/books/book4.jpg"
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
                                        src="/assets/img/books/book5.jpg"
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

                        <SwiperSlide className="swiper-slide">
                            <div className="books_card group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}>
                                <div className="books_card__background relative h-80 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        src="/assets/img/books/book6.jpg"
                                        alt="Class VI: Poorvi"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                        <span className="text-[var(--thm-primary)]">Class 6:</span> Poorvi
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                        Step into a vibrant world of stories, poems, and conversations! Poorvi makes English learning fun with colorful illustrations and engaging content, only on AI Onwards – where learning comes alive.
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
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
                                        src="/assets/img/books/book7.jpg"
                                        alt="Class 6: मल्हार"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                        <span className="text-[var(--thm-primary)]">Class 6:</span> मल्हार
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                        कहानियों और कविताओं की रंगीन दुनिया में प्रवेश करें! ‘मल्हार’ आपके हिंदी ज्ञान को मज़ेदार और सरल तरीके से बढ़ाता है। AI Onwards के साथ भाषा को अनुभव करें, पढ़ें और बोलें
                                        </p>
                                    </div>
                                    <button className="books_card__button mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
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
                                        src="/assets/img/books/book8.jpg"
                                        alt="Class 7: Curiosity"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                </div>
                                <div className="books_card__content absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="books_card__content--container space-y-3">
                                        <h2 className="books_card__title text-2xl font-bold">
                                        <span className="text-[var(--thm-primary)]">Class 7:</span> Curiosity
                                        </h2>
                                        <p className="books_card__description text-gray-200 text-sm leading-relaxed">
                                        Why does a ball bounce? How do plants breathe? Explore the wonders of science with “Curiosity”! Learn by doing, imagining, and questioning — only with AI Onwards' interactive and fun platform.
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