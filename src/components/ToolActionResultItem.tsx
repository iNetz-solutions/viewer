import React from 'react'

type props = { 
  Name: string,
  Value: number,
  Unit: string  
}

/**
 * 
 * @param props 
 * @returns 
 * Tool Acction Result Item is responsible to display 
 * the data result after tool process is completed
 * the tool data result stays in memory while session is active
 */

export const ToolActionResultItem = (props: props) => {
  return (
    <>
      <div className="w-full mx-auto flex items-stretch">
        <div className='flex'>
          <div className='text-2xl font-medium shadow p-2 mb-5 bg-body rounded'>{props.Name}</div>
          
        </div>
        <div className='flex'>
          <div className='text-2xl font-medium shadow p-2 mb-5 bg-body rounded'>{props.Value} </div>
         
        </div>
        <div className='flex'>
          <div className='text-2xl font-medium shadow p-2 mb-5 bg-body rounded'>{ props.Unit}</div>
          
        </div>

      </div>   

      

    </>
  )
}