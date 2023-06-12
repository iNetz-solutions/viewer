import React from 'react'
import logo from '../components/img/logo-placeholder.png'

type Props = {
    thumbnail: string;
}
/**
 * 
 * @param props 
 * @returns 
 * Thumbnail item holds a thumbnail image.  for now it is just a place holder
 */
const ThumbnailItem = (props: Props) => {
  
    return (
        <div className='rounded-sm' >
            
            <div className='overscroll-contain h-24 w-24 py-1 px-1' onClick={() => { alert() }}>
                <img width='0' height='0' src={logo} alt={'thumbnail'} />
            </div>
        </div>
    )
}
export default ThumbnailItem