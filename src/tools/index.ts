import Tool, {
    toolToolKey, 
    existingToolId,  
    Control,
  } from './Tools';
  import { ToolType } from './ToolType';
  import { Node } from '../common/node';
 
  import Line from './Line';
  import Point from './Point';
  import TraceLine from './TraceLine';
  import TraceArea from './TraceArea';
  import NoAction from './NoAction';

 
  function getToolFor(
  
    toolName: string,
    toolID: string,
    nodes?: Node[],
    id?: string,
  ): Tool {
    switch (toolName) {
      case ToolType.Line:
        return new Line(toolID, nodes, id);
      case ToolType.Point:
        return new Point(toolID, nodes, id);
      case ToolType.TraceLine:
        return new TraceLine(toolID, nodes, id);
      case ToolType.TraceArea:
        return new TraceArea(toolID, nodes, id);      
      default:
        return new NoAction(toolID, nodes, id);
    }
  }
  
  export {
    Tool,
    NoAction,
    Line,
    toolToolKey,
    existingToolId,    
    getToolFor,
    Control,
  };
  
