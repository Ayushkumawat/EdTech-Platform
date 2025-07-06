
import { useEffect, useState, useRef } from "react"
import BackToTop from '@/components/elements/BackToTop'
import DataBg from "../elements/DataBg"
import Breadcrumb from './Breadcrumb'
import Sidebar from "./Sidebar"
import Footer1 from './footer/Footer1'
import WOW from 'wow.js';
import MobileMenu from "./MobileMenu"


declare global {
  interface Window {
    wow: any;
  }
}


import Header1 from "./header/Header1"
import Header2 from './header/Header2'
import Header3 from "./header/Header3"
import Header4 from "./header/Header4"

export default function Layout({ headerStyle, footerStyle, headTitle, breadcrumbTitle, children, wrapperCls }:any) {
    const [scroll, setScroll] = useState(false)
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [isMobileMenu, setMobileMenu] = useState(false)
    const handleMobileMenu = () => {
        setMobileMenu(!isMobileMenu)
        !isMobileMenu ? document.body.classList.add("mobile-menu-visible") : document.body.classList.remove("mobile-menu-visible")
    }

    useEffect(() => {
        const wow = new WOW({
            live: false
        });
    
        setTimeout(() => {
            wow.init();
        }, 100);
    
        window.wow = wow;
    },[scroll])
    useEffect(() => {
        
        
        const handleScroll = () => {
            const currentPosition = window.scrollY;
            const scrollCheck = currentPosition > 100;
            const scrollCheck2 = currentPosition > 200;
            if (scrollCheck2){
            setIsScrollingDown(currentPosition > scrollPosition);
            setScrollPosition(currentPosition);
            }

            
            if (scrollCheck !== scroll) {
                setScroll(scrollCheck);
                
            }
        };
        

        document.addEventListener("scroll", handleScroll);
        return () => {
            document.removeEventListener("scroll", handleScroll);
        };
    }, [scroll,scrollPosition]);

    return (
        <>
            <DataBg />
            
            <div className={`body-dark-bg `} id="#top" >
                
                {headerStyle == 1 ? <Header1 isScrollingDown={isScrollingDown} scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu}  /> : null}
                {headerStyle == 2 ? <Header2 isScrollingDown={isScrollingDown} scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} /> : null}
                {headerStyle == 3 ? <Header3 isScrollingDown={isScrollingDown} scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} /> : null}
                {headerStyle == 4 ? <Header4 isScrollingDown={isScrollingDown} scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} /> : null}
 


               
              

                {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}
                

                {children}
              

                
                {footerStyle == 1 ? < Footer1 /> : null}
                
            </div>
            <BackToTop scroll={scroll} />
            <MobileMenu handleMobileMenu={handleMobileMenu}/>
        </>
    )
}
