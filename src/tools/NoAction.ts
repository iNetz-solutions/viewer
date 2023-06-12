import { fabric } from 'fabric';

import { Node } from '../common/node';
import Tool from './Tools';
import { ToolType } from './ToolType';

export default class NoAction extends Tool {
  constructor(
    toolID: string,    
    nodes?: Node[],
    id?: string | undefined,    
    name?: string,
    { fill = 'white', stroke = 'white' } = {},
  ) {
    super(toolID, nodes, id, name, { fill, stroke });
  }

  type() {
    return ToolType.NoAction;
  }

  onMouseDown(_event: fabric.IEvent, _canvas: fabric.Canvas) {}

  onMouseMove(_event: fabric.IEvent, _canvas: fabric.Canvas) {}

  onMouseUp(_event: fabric.IEvent, _canvas: fabric.Canvas) {}

  onObjectMoving(_event: fabric.IEvent, _canvas: fabric.Canvas) {}

  render(_canvas: fabric.Canvas) {}
}