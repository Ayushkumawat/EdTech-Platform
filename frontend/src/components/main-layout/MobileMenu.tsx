import { useLocation, Link, useNavigate } from 'react-router-dom'
import { FaTimes } from "react-icons/fa";
import navigationConfig from '@/configs/navigation.config'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa'
import { RiInstagramFill } from 'react-icons/ri'
import { IoCall } from 'react-icons/io5'
import useAuth from '@/utils/hooks/useAuth'
import classNames from 'classnames'
import Avatar from '../ui/Avatar/Avatar'
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from 'react-icons/hi'
import { FiActivity } from 'react-icons/fi'
import { useConfig } from '../ui/ConfigProvider'
import Menu from '@/components/ui/Menu'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import VerticalMenuIcon from '../template/VerticalMenuContent/VerticalMenuIcon';

import type { ReactNode } from 'react'
export default function MobileMenu({ handleMobileMenu }: any) {

    const { authenticated, signOut } = useAuth()
    const navigate = useNavigate()
    const { mode } = useConfig()

    type DropdownList = {
        label: string
        path: string
        icon: JSX.Element
    }

    const dropdownItemList: DropdownList[] = [
        {
            label: 'Profile',
            path: '/app/account/settings/profile',
            icon: <HiOutlineUser />,
        },
        {
            label: 'Account Setting',
            path: '/app/account/settings/profile',
            icon: <HiOutlineCog />,
        },
        {
            label: 'Activity Log',
            path: '/app/account/activity-log',
            icon: <FiActivity />,
        },
    ]

    const MenuProfileContent = () => {
        return (
            <div className='profile-card'>
                <div className="profile-info">
                    <div className='profile-icon flex items-center gap-1  border-[var(--thm-primary)] border-[2px] p-[3px] rounded-full'>
                        <Avatar
                            size={51}
                            shape="circle"
                            src="/img/avatars/thumb-11.jpg"
                            className="bg-slate-200 text-slate-400"
                            icon={<HiOutlineUser />}
                        />
                    </div>
                    <div className="profile-details">
                        <h5 className="greeting">
                            Hi, Abhishek Jain
                        </h5>
                        <p className="welcome-text">Welcome back</p>
                    </div>
                </div>
            </div>
        )
    }

    const MenuContent = ({ icon, label }: { icon: ReactNode, label: string }) => {
        return (
            <div className="flex items-center gap-2">
                <span className={'text-xl opacity-50'}>{icon}</span>
                <span>{label}</span>
            </div>
        )
    }

    return (
        <>
            <div className="mobile-menu">
                <nav className="menu-box">
                    <div className="close-btn1" onClick={handleMobileMenu}>
                        <FaTimes />
                    </div>
                    <div className="menu-box-header">
                        <div className="nav-logo">
                            <DoubleSidedImage
                                src="/assets/img/resource/logo-2.png"

                                darkModeSrc="/assets/img/resource/logo-1.png"
                                alt="elstar"
                            />
                        </div>

                    </div>

                    <div className="menu-outer">
                        {!authenticated ? (
                            <div className='mobile-sign__in'>
                                <Link to="/sign-in" className='sign__in'>SIGN IN</Link>
                                <Link to="/sign-up" className='sign__up'>SIGN UP</Link>
                            </div>
                        ) : (


                            <Menu variant={mode === 'dark' ? 'dark' : 'light'}>
                                <Menu.MenuCollapse
                                    eventKey="others"
                                    className="mb-1 h-fit bg-gray-100 dark:!bg-gray-800 hover:!bg-gray-200 dark:hover:!bg-gray-800"
                                    label={<MenuProfileContent />}
                                >
                                    <div className=''>
                                        {dropdownItemList.map((item) => (
                                            <Menu.MenuItem
                                                eventKey={item.path}

                                                className="text-[15px] border-b border-gray-200 dark:border-gray-700"
                                            >
                                                <Link
                                                    className='pl-3'
                                                    to={item.path}
                                                >
                                                    <MenuContent icon={item.icon} label={item.label}/>
                                                </Link>
                                            </Menu.MenuItem>

                                        ))}


                                        <Menu.MenuItem
                                            eventKey="Sign Out"
                                            className='border-b border-gray-200 dark:border-gray-700'
                                            onSelect={signOut}
                                        >
                                            <div className='pl-3 flex gap-2 items-center'>
                                            <span className="text-xl opacity-50 ">
                                                <HiOutlineLogout />
                                            </span>
                                            <span>Sign Out</span>
                                            </div>
                                        </Menu.MenuItem>
                                    </div>

                                </Menu.MenuCollapse>
                            </Menu>
                        )}

                        <Menu className='' variant={mode === 'dark' ? 'dark' : 'light'}>
                            {navigationConfig.map((item, index) => {
                                const filteredSubMenu =
                                    item.subMenu?.filter(
                                        (subItem) =>
                                            !subItem.checkAuthentication || authenticated,
                                    ) ?? [];


                                // Determine whether to render as a collapsible menu or single menu item
                                if (filteredSubMenu.length > 0) {
                                    return (
                                        <Menu.MenuCollapse
                                            key={index}
                                            eventKey={item.path}
                                            className='text-[15px] border-b border-gray-200 dark:border-gray-700'
                                            label={item.label}
                                        >
                                            {filteredSubMenu.map((subItem, subIndex) => (
                                                <Menu.MenuItem
                                                    key={subIndex}
                                                    eventKey={subItem.path}
                                                    onSelect={() => { navigate(subItem.path || '#') }}
                                                    className='!ml-0  text-[15px] border-b border-gray-200 dark:border-gray-700'

                                                >
                                                    <Link
                                                        to={subItem.path || '#'}
                                                        className='pl-3'
                                                        onClick={handleMobileMenu}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                </Menu.MenuItem>
                                            ))}
                                        </Menu.MenuCollapse>
                                    );
                                }

                                // Render as a single menu item if no subMenu exists
                                return (
                                    <Menu.MenuItem
                                        key={index}
                                        eventKey={item.path}
                                        className='text-[15px] border-b border-gray-200 dark:border-gray-700'

                                    >
                                        <Link
                                            to={item.path || '#'}
                                            onClick={handleMobileMenu}
                                        >
                                            {item.label}
                                        </Link>
                                    </Menu.MenuItem>
                                );
                            })}
                        </Menu>
                    </div>

                    <div className="contact-info">
                        <div className="icon-box">
                            <span className="icon-call !text-[19px]">
                                <IoCall />
                            </span>
                        </div>
                        <h6>(629) 555-0129</h6>
                    </div>

                    <div className="social-links">
                        <ul className="clearfix list-wrap">
                            <li>
                                <a href="#">
                                    <i className="fab fa-facebook-f">
                                        <FaFacebookF />
                                    </i>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fab fa-twitter">
                                        <FaTwitter />
                                    </i>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fab fa-instagram">
                                        <RiInstagramFill />
                                    </i>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fab fa-linkedin-in">
                                        <FaLinkedinIn />
                                    </i>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <i className="fab fa-youtube">
                                        <FaYoutube />
                                    </i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>


        </>
    )
}
