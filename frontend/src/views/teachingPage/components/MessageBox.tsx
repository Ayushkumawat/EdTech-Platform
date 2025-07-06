import React, { useState, useRef, useEffect } from 'react'

import { HiOutlineUser } from 'react-icons/hi'
import Avatar from '@/components/ui/Avatar/Avatar'
import MessageInput from './MessageInput'

const MessageBox = () => {
  
    const [chatMessages, setChatMessages] = useState<string[] | undefined>([])
  
    return (
        <>
        <div className='flex relative h-full justify-center items-center'>
        

        <div className={`chat-message-box-container`}>
            <img src='/assets/img/chat_box_background/chat_background2.png' className='absolute inset-0 w-full h-full object-cover opacity-35 dark:opacity-25'  />
            <div className="chat-message-box-header z-10">
                <div className="chat-message-box-avatar-container">
                    <Avatar
                        size={35}
                        shape="circle"
                        src="/img/avatars/thumb-11.jpg"
                        className="bg-slate-200 text-slate-400"
                        icon={<HiOutlineUser />}
                    />
                </div>
                <div className="chat-message-box-header-content">
                    <h4>Space Teacher</h4>
                    <h3>Prof. Adam Brown</h3>
                </div>
            </div>

            <div className="chat-message-box-body">
                {chatMessages?.map((message, index) => (
                    <div key={index} className="chat-message-box-body-content">
                        {message}
                    </div>
                ))}
            </div>
            <MessageInput setChatMessages={setChatMessages} chatMessages={chatMessages} />

 
        </div>
        </div>
        </>
    )
}

export default MessageBox
