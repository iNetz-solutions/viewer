import { ToolData } from '../common/toolData'
import React from 'react'
import { ToolActionResultItem } from './ToolActionResultItem'


type Props = {
    datas?: ToolData[],
    imageId: number

}
/**
 * 
 * @param param0 
 * @returns 
 * Data controls holds data items related to the current image
 */
const DataControl = ({ datas, imageId }: Props) => {
    return (
        <div className="h-screen w-1/3 py-0 border border-indigo-400 shadow-md overflow-y-auto">
            <div >
                {(datas !== undefined && datas.length > 0) && (
                    <>
                        {datas.map((toolData, index) => (

                            toolData.imageID === imageId && <ToolActionResultItem key={index} Name={toolData.name} Value={toolData.value} Unit={toolData.unit} />

                        ))}

                    </>
                )}
            </div>
        </div>
    )
}

export default DataControl