import React, { useState } from 'react'
import ModalVideo from 'react-modal-video'
import { FaPlay } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
const About = () => {
    const [isOpen, setOpen] = useState(false)

    return (
        <>
            {/* Start About Two */}
            <section className="about-two">
                <div className="container w-fit px-8 max-w-[1300px]">
                    <div className="row flex flex-nowrap">
                        {/* Start About Two Img */}
                        <div className="w-fit">
                            <div className="about-two__img">
                                <div
                                    className="about-two__img1 wow animated fadeInLeft"
                                    data-wow-delay="200ms"
                                    data-wow-duration="1500ms"
                                >
                                    <div className="inner">
                                        <img
                                            className="w-[750px] h-auto"
                                            src="/assets/img/about/space_background.jpg"
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div
                                    className="about-two__img2 wow animated fadeInRight bg-[url('/assets/img/about/space_video.png')] bg-cover bg-center"
                                    data-wow-delay="200ms"
                                    data-wow-duration="1500ms"
                                >
                                    
                                    <div className="about-two__video-btn">
                                        <a
                                            onClick={() => setOpen(true)}
                                            className="about-two__icon video-popup cursor-pointer"
                                        >
                                            <span className="icon-play-button-1"><FaPlay/></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End About Two Img */}

                        {/* Start About Two Content */}
                        <div className="w-full xl:w-1/2 ">
                            <div className="about-two__content">
                                <div className="sec-title">
                                    <div className="sub-title">
                                        <h5>KNOW ABOUT AI ONWARDS</h5>
                                    </div>
                                    <h2>
                                    Stop Working Hard. <br /> Start Working Smart with AI.
                                    </h2>
                                </div>

                                <div className="about-two__content-text">
                                    <p>
                                    We believe learning is the ultimate adventure. Our platform is designed to ignite your natural curiosity, turning complex subjects into an exciting journey of discovery. With an AI tutor available 24/7, you can explore any concept, ask any question, and get instant answers tailored just for you.
                                    </p>
                                </div>

                                <div className="about-two__content-list">
                                    <ul>
                                        <li>
                                            <p>
                                                <span className="icon-verified"><FaCheckCircle/></span>{' '}
                                                Personalized Learning Paths
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span className="icon-verified"><FaCheckCircle/></span>{' '}
                                                24/7 On-Demand Tutoring
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span className="icon-verified"><FaCheckCircle/></span>{' '}
                                                Multi-Subject & Multilingual Support
                                            </p>
                                        </li>
                                    </ul>
                                </div>

                                <div className="about-two__content-bottom flex flex-wrap items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="img-box">
                                            <img
                                                src="assets/img/about/about-v2-img3.jpg"
                                                alt=""
                                            />
                                        </div>
                                        <div className="signature">
                                            <img
                                                src="assets/img/about/signature-1.png"
                                                alt=""
                                            />
                                        </div>
                                    </div>

                                    <div className="btn-box">
                                       
                                        <a className="thm-btn-one mr-[0px] mt-[15px] md:mr-[30px] md:mt-[0px]" >
                                      <span><span className='txt'>Discover More</span></span>
                                </a>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End About Two Content */}
                    </div>
                </div>
            </section>
            {/* End About Two */}

            <ModalVideo
                channel="youtube"
                autoplay
                isOpen={isOpen}
                videoId="vfhzo499OeA"
                onClose={() => setOpen(false)}
            />
        </>
    )
}

export default About
