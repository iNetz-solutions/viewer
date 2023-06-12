import React from 'react'

type Props = {
    children: React.ReactNode
}
/**
 * 
 * @param param0 
 * @returns 
 * 
 * Tool bar holds the list of tools loaded by the app
 * User can click to activate the tool for measuring
 */

const ToolBar = ({ children }: Props) => {
    return (
        <div className="w-full   bg-white border  shadow-sm 
                        overflow-hidden flex items-stretch">
            <div className='w-full space-x-1 px-1 py-1 flex items-stretch'>
                {children}
            </div>
        </div>
    )
}
export default ToolBar