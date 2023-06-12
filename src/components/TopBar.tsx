import React from 'react'
import logo from '../components/img/logo-placeholder.png'


type props = {
    children: any
}
/**
 * 
 * @param param0 
 * @returns 
 * Top Bar (Header)  displays the application logo and
 * child component that holds subject data info
 */

export default function TopBar({ children }: props) {
    return (
        <div className="w-full rounded-t-lg mx-auto bg-white border border-gray-300 shadow-sm
        overflow-hidden flex" >
            <div className="h-16 w-24 md:shrink-0 items-start rounded-xl px-1 py-1" >                
                <img className="w-full object-cover"  width="0" height="0" src={logo} alt={'logo'} />
            </div>
            <div className='h-24 w-full px-1'>
                {children}
            </div>
            <div className="md:shrink-0 items-start rounded-xl px-1 py-1" >
                <div className="h-24 w-full object-cover md:h-full md:w-12 border border-indigo-400">

                </div>
            </div>
        </div>
    )
}
