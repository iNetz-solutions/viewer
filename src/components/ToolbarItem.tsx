import React, { useCallback, useContext } from 'react'
import ToolSelectContext from '../contexts/ToolSelectContext'
 
interface Props  {
   icon : string;
   toolId: string;
   //onClick: () => void;
}

/**
 * 
 * @param props 
 * @returns 
 * Tool Bar Item holds and item of tool bar where in this case 
 * Holds the name of the tool, I was planing to display as an icon 
 * but that need more time which I dont have
 */

const ToolBarItem = (props: Props) => {
  const {setCurrentTool} = useContext(ToolSelectContext);

  const handleClick = useCallback(() => {
    setCurrentTool(props.toolId);
    //props.onClick();   

  }, [setCurrentTool, props])

  return (
    <div  className='flex flex-initial rounded-lg  py-2 px-3 w-16 h-10 bg-red-200 hover:bg-red-300 text-center'
    onClick={handleClick}
    >
      {props.icon}
    </div>
  )
} 
export default ToolBarItem