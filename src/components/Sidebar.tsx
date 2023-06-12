import React from 'react'


type Props = {
    children: any
}
const SideBar = ({ children }: Props) => {
    return (
        <div className="h-screen w-36 py-0 border border-indigo-400 shadow-md overflow-y-auto">
            <div >
                {children}
            </div>
        </div>
    )
}

export default SideBar