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
                                        manualMode={true}
                                        animationDuration={0.5}
                                        blurAmount={3}
                                        borderColor="red"
                                        glowColor="rgba(233, 11, 53, 0.6)"
                                    >
                                        {/* Feature 1 */}
                                        <li className='why-choose-us-one__content'>
                                            <div className="inner">
                                                <div className="icon-box">
                                                    <span className="icon-bed"><PiBookOpenText /></span>
                                                </div>
                                                <div className="content-box">
                                                    <h2>Personalized Lessons</h2>
                                                    <p>
                                                        Every topic is tailored to the student's learning pace and level of understanding. No more memorization—just real comprehension.
                                                    </p>
                                                </div>
                                            </div>
                                        </li>

                                        {/* Feature 2 */}
                                        <li className='why-choose-us-one__content'>
                                            <div className="inner">
                                                <div className="icon-box">
                                                    <span className="icon-targeted"><PiGraduationCap /></span>
                                                </div>
                                                <div className="content-box">
                                                    <h2>Multilingual Support</h2>
                                                    <p>
                                                        Our AI tutors speak your language. Whether it's Hindi, English, or Chinese—students learn in the language they’re most comfortable with.
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                       


                                        {/* Feature 3 */}
                                       
                                        <li className='why-choose-us-one__content'>
                                            <div className="inner">
                                                <div className="icon-box">
                                                    <span><HiOutlineUserGroup /></span>
                                                </div>
                                                <div className="content-box">
                                                    <h2>Why Smart Work Beats Hard Work</h2>
                                                    <p>
                                                        Our AI tutors focus on helping students truly understand concepts—not just memorize them. With personalized lessons and real-time guidance, learning becomes faster, easier, and more effective.
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
