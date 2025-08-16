import { IoShareSocialSharp } from "react-icons/io5";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaGlobe} from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";


export default function Team() {
    return (
        <>
            
            {/*Start Team Two */}
            <section className="team-two">
                <div className="containe">
                    <div className="sec-title text-center">
                        <div className="sub-title">
                            <h5>OUR FOUNDING TEAM</h5>
                        </div>
                        <h2>Founders Of AI Onwards<br/>
                            Visionaries Behind  AI Onwards</h2>
                    </div>
                    <div className="row grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 place-items-center ">
                        {/*Start Team Two Single */}
                        <div className="wow fadeInUp" data-wow-delay=".3s">
                            <div className="team-two__single relative overflow-hidden">
                                <div className="team-two__single-img relative">
                                    <div className="inner">
                                        <img  className="img1" src="/assets/img/team/member1.jpg" alt=""/>
                                    </div>
                                    
                                    {/* Gradient overlay for text visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

                                    <div className="content-box relative z-10">
                                        <h3><a href="/team-details">Ayush Kumawat</a></h3>
                                        <p>Chief Technology Officer</p>
                                    </div>
                                    <ul className="social-links clearfix relative z-10">
                                        <li className="share"><a href="#"><span className="icon-share"><IoShareSocialSharp/></span></a>
                                            <ul className="social-links-inner">
                                                <li><a target="_blank" href="https://www.linkedin.com/in/ayush-kumawat"><i className="icon-aedin-big-logo"><FaLinkedinIn/></i></a></li>
                                                <li><a target="_blank" href="https://wa.me/919098984098?text=Hi,%20good%20to%20see%20you!"><i className="icon-instagram"><IoLogoWhatsapp/></i></a>
                                                </li>
                                                <li><a target="_blank" href="https://www.ayushkumawat.us/"><i className="icon-facebook"><FaGlobe/></i></a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/*End Team Two Single */}

 
                        {/*End Team Two Single */}

                        {/*Start Team Two Single */}
                        <div className="wow fadeInUp" data-wow-delay=".3s">
                            <div className="team-two__single relative shadow-lg !bg-black/50 backdrop-blur-sm overflow-hidden">
                                <div className="team-two__single-img relative">
                                    <div className="inner">
                                    <img  className="img2 object-[center_-75px]" src="/assets/img/team/member2.jpg" alt=""/>
                                    </div>
                                    
                                    {/* Gradient overlay for text visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

                                    <div className="content-box relative z-10">
                                        <h3 className="!text-[var(--thm-primary)]"><a href="/team-details">Abhishek Jain</a></h3>
                                        <p>Chief Executive Officer</p>
                                    </div>
                                    <ul className="social-links clearfix relative z-10">
                                        <li className="share"><a href="#"><span className="icon-share"><IoShareSocialSharp/></span></a>
                                            <ul className="social-links-inner">
                                                <li><a target="_blank" href="https://www.linkedin.com/in/abhishek-jain-59a760210"><i className="icon-aedin-big-logo"><FaLinkedinIn/></i></a></li>
                                                <li><a target="_blank" href="https://www.instagram.com/abhishek__jain1"><i className="icon-instagram"><FaInstagram/></i></a>
                                                </li>
                                                <li><a target="_blank" href="https://abhishek12234.github.io/Abhishek-portfolio"><i className="icon-facebook"><FaGlobe/></i></a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/*End Team Two Single */}


                        {/*End Team Two Single */}
                    </div>
                </div>
            </section>
            {/*End Team Two */}

        </>
    )
}
