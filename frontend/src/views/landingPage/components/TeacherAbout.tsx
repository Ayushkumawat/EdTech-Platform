import React, { useRef, useState } from 'react';
import { MdWavingHand } from 'react-icons/md';
import LanguageSelector from './LanguageSelector';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Import Swiper styles

const TeacherAbout = () => {
    // Teacher data with image, name, and language
    const teacherData = [
        { image: '/assets/img/teacher-1.jpg', name: 'Proff. Adam Brown', lang: 'en' },
        { image: '/assets/img/teacher-2.jpg', name: 'Proff. Li Wei', lang: 'zhCn' },
        { image: '/assets/img/teacher-3.avif', name: 'Proff. Carlos Gomez', lang: 'es' },
        { image: '/assets/img/teacher-4.jpg', name: 'Proff. Ahmed Al-Farsi', lang: 'ar' },
    ];

    const [currentTeacher, setCurrentTeacher] = useState(teacherData[0]); // Track current teacher
    const [isAnimating, setIsAnimating] = useState(false); // Track animation state
    const [selectedLang, setSelectedLang] = useState(teacherData[0].lang); // Track selected language in dropdown
    const swiperRef = useRef(null);

    // Handle language change from dropdown
    const handleLanguageChange = (langValue: string) => {
        console.log('Selected Language:', langValue); // Debug selected language
        const newIndex = teacherData.findIndex((teacher) => teacher.lang === langValue);
        console.log('New Index:', newIndex); // Debug new index

        if (newIndex === -1) return; // Do nothing if the language is not found

        // Update the selected language in the dropdown
        setSelectedLang(langValue);

        // Slide to the corresponding image
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideToLoop(newIndex); // Use slideToLoop for loop mode
        }

        // Trigger the animation
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentTeacher(teacherData[newIndex]);
            setIsAnimating(false);
        }, 300);
    };

    // Handle Swiper slide change
    const handleSlideChange = (swiper) => {
        const realIndex = swiper.realIndex; // Use realIndex for looping
        const newTeacher = teacherData[realIndex];
        console.log('New Teacher:', newTeacher); // Debug new teacher

        // Update the current teacher and selected language
        setCurrentTeacher(newTeacher);
        setSelectedLang(newTeacher.lang);
    };

    // Swiper configuration
    const swiperOptions = {
        modules: [Autoplay, Navigation, Pagination],
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true, // Enable loop mode
        navigation: {
            nextEl: '.h1n',
            prevEl: '.h1p',
        },
        pagination: {
            el: '.swiper-pagination1',
            clickable: true,
        },
        onSlideChange: handleSlideChange, // Listen to slide change events
    };

    return (
        <section className="feauture-three overflow-hidden">
            <div className="flex justify-center w-[100%] max-w-[1200px] px-4">
                <div className="flex flex-wrap flex-row-reverse items-center justify-center">
                    {/* Start Feauture Three Img */}
                    <div
                        className="w-fit xl:w-2/5 wow animated fadeInRight"
                        data-wow-delay="0.7s"
                    >
                        <div className="feauture-three__img bg-[url('/assets/img/resource/teacher_background.png')] bg-cover relative">
                            <div className="feauture-three__teacher border-[3px] border-[var(--thm-primary)] h-[370px] w-[330px] relative flex justify-center shadow-[40px_40px_45px_rgba(0,0,0,0.8)] overflow-hidden">
                                {/* Swiper for teacher images */}
                                <Swiper
                                    ref={swiperRef}
                                    {...swiperOptions}
                                    className="h-full w-full"
                                >
                                    {teacherData.map((teacher, index) => (
                                        <SwiperSlide key={index} className="h-full w-full">
                                            <img
                                                className="object-cover !shadow-[inset_0_-50px_25px_rgba(0,0,0,0.9)] h-full w-full"
                                                src={teacher.image}
                                                alt={`Teacher ${index + 1}`}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Teacher name with animation */}
                                <div className="absolute bottom-[0px] h-[50px] !shadow-[inset_0_-18px_13px_rgba(0,0,0,0.9)] text-gray-100 z-40 w-full flex justify-center items-center overflow-hidden">
                                    <div className={`relative h-full w-full ${isAnimating ? 'animate-slide' : ''}`}>
                                        <div className="absolute inset-0 flex justify-center items-center text-[20px] font-semibold">
                                            {currentTeacher.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Feauture Three Content */}
                    <div className="w-full xl:w-3/5 wow animated fadeInLeft" data-wow-delay="0.2s">
                        <div className="feauture-three__content">
                            <div className="sec-title">
                                <div className="sub-title">
                                    <h5 className="text-sm">OUR AI TEACHERS</h5>
                                </div>
                                <h2 className="flex text-4xl">They will Guide You</h2>
                                <h2 className="flex text-4xl">Through the Wonders</h2>
                                <h2 className="flex text-4xl items-center">
                                    of Academics{' '}
                                    <div className="teacher_language_box">
                                        <LanguageSelector
                                            onLanguageChange={handleLanguageChange}
                                            selectedLang={selectedLang} // Pass the selected language
                                        />
                                    </div>
                                </h2>
                            </div>

                            <div className="text-box">
                                <p>
                                <p>
    Meet our multilingual AI teachers — always ready to explain, simplify, and engage. From solving math problems to exploring science and mastering language, they tailor each lesson based on the student's understanding. Available 24/7, they’re your personal academic guides across every subject.
</p>

                                </p>
                            </div>
                            <div className="btn-box">
                                <a className="thm-btn-one" href="/contact">
                                    <span>
                                        <span className="txt">Discover More</span>
                                        <span className="ml-2 text-[17px] text-yellow-300 txt">
                                            <MdWavingHand />
                                        </span>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* End Feauture Three Content */}
                </div>
            </div>
        </section>
    );
};

export default TeacherAbout;
