import Menu from "../Menu"
import MobileMenu from "../MobileMenu"
import UserDropdown from "@/components/template/UserDropdown"
import { useNavigate } from "react-router-dom"
import useAuth from "@/utils/hooks/useAuth"
import { Link } from "react-router-dom"
export default function Header4({ scroll, isMobileMenu, handleMobileMenu, isSidebar, handlePopup, handleSidebar }:any) {
    const navigate = useNavigate();
    const { authenticated } = useAuth()
    return (
        <>
            {/* <header className="main-header main-header-one style4"> */}
            
            <header className={`main-header main-header-one style4 ${scroll ? "" : ""}`}>
            <div className={`menu-area ${scroll ? "sticky-menu" : ""}`}>
                {/* header-lower */}
                <div className="main-header-four__top">
                    <div className="container mx-auto px-5">
                        <div className="main-header-four__top-inner">
                            <div className="header-contact-box">
                                <ul>
                                    <li><a href="tel:123456789">1(800)234-34-45</a></li>
                                    <li><a href="mailto:yourmail@email.com">GurukulAIcompany@gmail.com</a></li>
                                </ul>
                            </div>

                            <div className="header-social-as">
                                <ul>
                                    <li><a href="#"><span className="icon-facebook"></span></a></li>
                                    <li><a href="#"><span className="icon-instagram"></span></a></li>
                                    <li><a href="#"><span className="icon-tik-tok"></span></a></li>
                                    <li><a href="#"><span className="icon-youtube"></span></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>


                
                <div className="main-header-four__bottom">
                    <div className="container mx-auto px-5">
                        <div className="menu-area__inner">
                            <div className="mobile-nav-toggler" onClick={handleMobileMenu}><i className="fas fa-bars"></i></div>
                            <div className="menu-wrap">
                                <nav className="menu-nav">
                                    <div className="main-header-one__inner">
                                        <div className="main-header-one__left">
                                            <div className="logo-box">
                                                <a href="/"> <img src="/assets/img/resource/logo-2.png"
                                                        alt=""/></a>
                                            </div>
                                        </div>

                                        <div className="main-header-one__middle">
                                            <div className="navbar-wrap main-menu">
                                                <Menu/>
                                            </div>
                                        </div>

                                        <div className="main-header-one__right">
                                            
                                        {authenticated?<UserDropdown/>:(<div className="flex gap-x-3">                        
                                            <Link to="/sign-in" className="thm-btn-two !pb-[8px] !pt-[8px] !pr-[20px] !pl-[20px] !text-[12px]"><span><span className='txt'>Sign In</span></span></Link>
                                            <Link to="/sign-up"  className="thm-btn-one !pb-[8px] !pt-[8px] !pr-[20px] !pl-[20px] !text-[12px]"><span><span className='txt'>Sign Up</span></span></Link>
                                            </div>)}
                                         
                                           
                                      </div>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </header>

            <MobileMenu handleMobileMenu={handleMobileMenu} isSidebar={isSidebar} handleSidebar={handleSidebar} />
            

            
        </>
    )
}
