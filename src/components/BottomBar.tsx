import React from 'react'

type Props = {
    data: any
}

/**
 * 
 * @param param0 
 * @returns 
 * Bottom bar (footer) holds footer data for now it is a just place holder
 */

const BottomBar = ({ data }: Props) => {
    return (
        <div className="w-full   bg-white border  shadow-sm 
                        overflow-hidden flex items-stretch">
            <div className='w-full space-x-1 px-1 py-1 flex items-stretch'>
                
            </div>
        </div>
    )
}
export default BottomBar