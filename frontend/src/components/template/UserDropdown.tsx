import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Spinner from '@/components/ui/Spinner'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { FiActivity } from 'react-icons/fi'
import { useAppSelector, useAppDispatch, fetchCurrentUser, setUser } from '@/store'


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
        label: 'Current Usage',
        path: '/app/account/settings/profile',
        icon: <HiOutlineCog />,
    },
    {
        label: 'Account Setting',
        path: '/app/account/settings/profile',
        icon: <HiOutlineCog />,
    }
]
const _UserDropdown = ({ className }: CommonProps) => {

    const { signOut } = useAuth()
    const user = useAppSelector((state) => state.auth.user)
    const dispatch = useAppDispatch()

    // Fetch user credits only once when component mounts or when user changes
    useEffect(() => {
        if (!user.email) {
            // User not logged in yet
            return
        }
        
        // Fetch user data once on mount or when user changes
        dispatch(fetchCurrentUser())
    }, [user.email, dispatch])

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-1  border-[var(--thm-primary)] border-[2px] p-[3px]')}>
            <Avatar size={38} shape="circle"   src={user.avatar || "/img/avatars/thumb-11.jpg"} className="bg-slate-200 text-slate-400" icon={<HiOutlineUser />} />
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240, marginTop:"5px",borderRadius:"0px" }}
                renderTitle={UserAvatar}
                placement="bottom-end"
                trigger='hover'
            >
                <Dropdown.Item variant="header">
                    <div className="py-3 px-3 flex items-center gap-2">
                        <Avatar src={user.avatar || "/img/avatars/thumb-11.jpg"} shape="circle" icon={<HiOutlineUser />} />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User'}
                            </div>
                            <div className="text-xs">{user.email || 'user@mail.com'}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="!rounded-none py-5 hover:!text-white hover:!bg-[var(--thm-primary)]"

                    >
                        <Link 
                            className="flex w-full justify-between items-center" 
                            to={item.path}
                        >
                            <span className="flex gap-2">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </span>
                            {item.label === 'Current Usage' && (
                                <span className="text-sm opacity-75">
                                    {user.loading ? (
                                        <Spinner size={14} />
                                    ) : (
                                        (user.daily_credits || 0).toLocaleString()
                                    )}
                                </span>
                            )}
                        </Link>
                    </Dropdown.Item>
                ))}
                {/* <Dropdown.Item variant="divider" /> */}
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2 hover:!text-white hover:!bg-[var(--thm-primary)]"
                    onClick={signOut}
                >
                    
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
