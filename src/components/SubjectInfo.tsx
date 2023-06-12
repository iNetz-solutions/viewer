import React from 'react'

type props = {
  Id: string,
  Name: string,
  Dob: string,
  SessionId: string,
  Date: string
}

/**
 * 
 * @param props 
 * @returns 
 * Subject infoo holds the subject and test info
 */

export const SubjectInfo = (props: props) => {
  return (
    <>
      <div className="w-full mx-auto flex items-stretch">
        <div className='flex'>
          <h1 className='text-2xl font-medium'>{props.Id}</h1>
          <h1 className='py-1 px-2  text-xl font-ligth'>{props.Name + " " + props.Dob}</h1>
        </div>

      </div>
      <div className=" mx-auto flex">
        <div className='flex'>
          <h1 className=' text-xl font-medium'>{props.SessionId}</h1>
        </div>
        <div className='w-full '>
        <div className='text-md font-ligth float-right'>{props.Date}</div>
      </div>
      </div>

      

    </>
  )
}