import { fabric } from 'fabric';

import { Node } from '../common/node';
import Tool, { Control } from './Tools';
import { ToolType } from './ToolType';

export default class Line extends Tool {
  constructor(
    toolID: string,
    nodes?: Node[], 
    id?: string,    
    name?: string,
    { fill = 'white', stroke = 'yellow' } = {},
  ) {
    super(toolID, nodes, id, name, { fill, stroke });
  }

  type() {
    return ToolType.Line;
  }

  isComplete() {
    return this.nodes.length === 2;
  }

  // Initialize line start point; endpoint to be adjusted in onMouseMove.
  onMouseDown(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (this.isComplete()) return;
    if (event.target) return;

    const { x, y } = canvas.getPointer(event.e);
    this.nodes.push({ x, y });

    super.createControl(canvas, { x, y });
    super.createControl(canvas, { x, y });
    super.createLine(canvas, [x, y, x, y]);
  }

  // Update endpoint to the event coordinates as user drags.
  onMouseMove(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (this.isComplete()) return;
    if (this.nodes.length === 0) return;
    if (this.lines.length !== 1) return;

    const { x, y } = canvas.getPointer(event.e);

    this.lines[0].set({
      x1: this.nodes[0].x,
      y1: this.nodes[0].y,
      x2: x,
      y2: y,
    });
    this.lines[0].setCoords();

    // redraw endPoint
    this.controls[1].set({
      left: x,
      top: y,
    });
    this.controls[1].setCoords();
  }

  /**
   * Push the most recent coordinates of the end point to nodes array and
   * persist all nodes.
   */
  onMouseUp(_event: fabric.IEvent, _canvas: fabric.Canvas) {
    if (this.nodes.length === 0) return;

    if (!this.isComplete()) {
      const point = this.controls[1];
      this.nodes.push({ x: point.left || 0, y: point.top || 0 });
    }
  }

  onObjectMoving(event: fabric.IEvent, _canvas: fabric.Canvas) {
    if (!this.lines[0]) return;

    if (event.target instanceof Control) {
      // find an index of point that is being moved.
      const pointIndex = this.controls.indexOf(event.target);
      if (pointIndex < 0) return;

      const point = this.controls[pointIndex];

      const pointLeft = point.left || 0;
      const pointTop = point.top || 0;

      this.nodes[pointIndex] = { x: pointLeft, y: pointTop };

      // redraw relevant lines depending on the point index
      if (pointIndex === 0) {
        this.lines[0].set({
          x1: pointLeft,
          y1: pointTop,
        });
      }

      if (pointIndex === 1) {
        this.lines[0].set({
          x2: pointLeft,
          y2: pointTop,
        });
      }
      this.lines[0].setCoords();
    }
  }

  render(canvas: fabric.Canvas) {
    this.clearDrawing();
    if (this.isComplete()) {
      super.createControl(canvas, this.nodes[0]);
      super.createControl(canvas, this.nodes[1]);
      const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = this.nodes;
      super.createLine(canvas, [x1, y1, x2, y2]);
    }
  }
}
