import React from 'react'

const ToolSelectContext = React.createContext({
    setCurrentTool: (_id: string) => {}
});

export default ToolSelectContext;