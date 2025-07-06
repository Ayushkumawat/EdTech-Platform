import React from 'react'

import { HiOutlineUserGroup } from "react-icons/hi2";
import { PiBookOpenText } from "react-icons/pi";
import { PiGraduationCap } from "react-icons/pi";
import TrueFocus from '@/components/animation/TrueFocus';
const Features = () => {

    return (


        <div className="why-choose-us-one">
            <div className="flex justify-center w-full bg-[#181e2b] shadow-[0_0_25px_rgba(0,0,0,0.1)]">
                <div className='w-full relative'>
                <img className="absolute bottom-0 left-0 w-[700px] h-auto" src="/featured_background.png" alt="" />
                <div className="row flex justify-end">
                    <div className="overlay"></div>


                    {/*Start Why Choose Us Content */}
                    <div className="why-choose-us-one__content-box_outer mr-0 sm:mr-10 wow animated fadeInLeft" data-wow-delay="0.1s">

                        <div className="why-choose-us-one__content-box my-11">
                            <ul className="flex flex-col gap-4">
                                <TrueFocus
                                    manualMode={true} // Enable manual control if needed
                                    animationDuration={0.5}
                                    blurAmount={3}
                                    borderColor="blue"
                                    glowColor="rgba(0, 0, 255, 0.6)"
                                >

                                    <li className='why-choose-us-one__content'>
                                        <div className="inner">
                                            <div className="icon-box">
                                                <span><HiOutlineUserGroup /></span>
                                            </div>
                                            <div className="content-box">
                                                <h2>AI Teaching</h2>
                                                <p>
                                                    Through a unique construction and design disciplines expertise,
                                                    Concor delivers unparalleled learning experiences.
                                                </p>
                                            </div>
                                        </div>
                                    </li>

                                    <li className='why-choose-us-one__content'>
                                        <div className="inner">
                                            <div className="icon-box">
                                                <span className="icon-bed"><PiBookOpenText/></span>
                                            </div>
                                            <div className="content-box">
                                                <h2>The Joy of Best Living</h2>
                                                <p>
                                                    Through a unique construction and design disciplines expertise,
                                                    Concor delivers unparalleled living experiences.
                                                </p>
                                            </div>
                                        </div>
                                    </li>

                                    <li className='why-choose-us-one__content'>
                                        <div className="inner">
                                            <div className="icon-box">
                                                <span className="icon-targeted"><PiGraduationCap /></span>
                                            </div>
                                            <div className="content-box">
                                                <h2>Professional Planning</h2>
                                                <p>
                                                    Through a unique construction and design disciplines expertise,
                                                    Concor delivers unparalleled planning solutions.
                                                </p>
                                            </div>
                                        </div>
                                    </li>

                                </TrueFocus>
                            </ul>

                        </div>
                    </div>
                    {/*End Why Choose Us Content */}
                </div>
            </div>
            </div>
        </div>

    )
}

export default Features
