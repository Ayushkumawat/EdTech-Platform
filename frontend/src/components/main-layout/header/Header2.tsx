import Menu from "../Menu"
import MobileMenu from "../MobileMenu"
import UserDropdown from "@/components/template/UserDropdown"
import useAuth from "@/utils/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { IoMenu } from "react-icons/io5";
export default function Header2({ isScrollingDown, scroll, isMobileMenu, handleMobileMenu, isSidebar, handlePopup, handleSidebar }: any) {
    const { authenticated } = useAuth()
    const navigate = useNavigate();
    return (
        <>
            <header className={`main-header main-header-one style2 ${scroll ? "" : ""}`}>
                <div className={`menu-area ${scroll ? "sticky-menu" : ""} ${isScrollingDown ? "sticky-menu-deactive" : ""}`}>
                    {/* header-lower */}
                    <div className="auto-container">
                        <div className="menu-area__inner">
                        <div className="mobile-nav-toggler" onClick={handleMobileMenu}><IoMenu/></div>
                            <div className="menu-wrap">
                                <nav className="menu-nav">
                                    <div className="main-header-one__inner">
                                        <div className="main-header-one__left">
                                        <div className="flex !items-center gap-2">
                                                <a href="/"> <img src="/assets/img/resource/logo3.png" alt="" className="max-w-[55px] h-auto"/></a>
                                                <img src="/assets/img/resource/logo3_text.png" alt="IONWARDS" className="h-[28px] relative top-[3px] left-[-5px]"/>
                                            </div>

                                            <div className="navbar-wrap main-menu">
                                                <Menu />
                                            </div>
                                        </div>

                                        <div className="main-header-one__right">

                                            {authenticated ? <UserDropdown /> : (<div className="flex gap-x-3">
                                                <Link to="/sign-in" className="thm-btn-two !pb-[8px] !pt-[8px] !pr-[20px] !pl-[20px] !text-[12px]"><span><span className='txt'>Sign In</span></span></Link>
                                                <Link to="/sign-up" className="thm-btn-one !pb-[8px] !pt-[8px] !pr-[20px] !pl-[20px] !text-[12px]"><span><span className='txt'>Sign Up</span></span></Link>
                                            </div>)}


                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <MobileMenu handleMobileMenu={handleMobileMenu} isSidebar={isSidebar} handleSidebar={handleSidebar} />
            </header>

        </>
    )
}
