import { fabric } from 'fabric';

import { Node } from '../common/node';
import Tool from './Tools';
import { ToolType } from './ToolType';

export default class Point extends Tool {
  constructor(
    toolID: string,
    nodes?: Node[],
    id?:string,    
    
    name?: string,
    { fill = 'white', stroke = 'yellow' } = {},
  ) {
    super(toolID, nodes, id, name, { fill, stroke });
  }

  type() {
    return ToolType.Point;
  }

  isComplete() {
    return this.nodes.length === 1;
  }

  onMouseDown(event: fabric.IEvent, canvas: fabric.Canvas): void {
    if (this.isComplete()) return;
    if (event.target) return;

    const { x, y } = canvas.getPointer(event.e);

    super.createControl(canvas, { x, y });
    this.nodes.push({ x, y });
  }

  onObjectMoving(event: fabric.IEvent, canvas: fabric.Canvas): void {
    const { x, y } = canvas.getPointer(event.e);
    this.nodes[0] = { x, y };
  }

  render(canvas: fabric.Canvas): void {
    this.clearDrawing();
    if (this.isComplete()) {
      super.createControl(canvas, this.nodes[0]);
    }
  }
}
