import { fabric } from 'fabric';

import { Node } from '../common/node';
import Tool, { Control } from './Tools';
import { ToolType } from './ToolType';

export default class TraceLine extends Tool {
  isActive: boolean = true;

  constructor(
    toolID: string,
    nodes?: Node[],
    id?: string,     
    name?: string,
    { fill = 'white', stroke = 'yellow' } = {},
  ) {
    super(toolID, nodes, id, name, { fill, stroke });
    
    if (nodes) {
      this.isActive = false;
    }
  }

  type() {
    return ToolType.TraceLine;
  }

  isComplete() {
    return !this.isActive;
  }

  onMouseDown(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (this.isComplete()) return;
    if (event.target) return;

    const { x, y } = canvas.getPointer(event.e);
    this.nodes.push({ x, y });
  }

  onMouseMove(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (this.isComplete()) return;
    const numNodes = this.nodes.length;
    if (numNodes === 0) return;

    const { x: x1, y: y1 } = this.nodes[numNodes - 1];
    const { x: x2, y: y2 } = canvas.getPointer(event.e);

    this.nodes.push({ x: x2, y: y2 });
    super.createLine(canvas, [x1, y1, x2, y2]);
  }

  onMouseUp(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (!this.isComplete()) {
      this.decimateNodes(15);
      this.isActive = false;
      this.drawTraceLineWithControls(canvas);
    }
  }

  onObjectMoving(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (event.target instanceof Control) {
      const pointIndex = this.controls.indexOf(event.target);
      if (pointIndex < 0) return;

      const point = this.controls[pointIndex];
      const pointLeft = point.left || 0;
      const pointTop = point.top || 0;

      this.nodes[pointIndex] = { x: pointLeft, y: pointTop };

      if (this.lines[pointIndex - 1]) {
        this.lines[pointIndex - 1].set({
          x2: pointLeft,
          y2: pointTop,
        });
        this.lines[pointIndex - 1].setCoords();
      }

      if (this.lines[pointIndex]) {
        this.lines[pointIndex].set({
          x1: pointLeft,
          y1: pointTop,
        });
        this.lines[pointIndex].setCoords();
      }
    }
  }

  decimateNodes(minDistance: number) {
    const nodesLength = this.nodes.length;
    let prevDecimatedNode = this.nodes[0];
    // We don't append first element of this.nodes to updatedNodes because we push prevDecimatedNode in the loop below.
    let updatedNodes = [];

    for (let i = 1; i < nodesLength - 1; i++) {
      const lineRun = prevDecimatedNode.x - this.nodes[i].x;
      const lineRise = prevDecimatedNode.y - this.nodes[i].y;
      const lineLength = Math.sqrt(
        Math.pow(lineRun, 2) + Math.pow(lineRise, 2),
      );

      if (lineLength > minDistance) {
        updatedNodes.push(prevDecimatedNode);
        prevDecimatedNode = this.nodes[i];
      }
    }

    updatedNodes.push(this.nodes[nodesLength - 1]);
    this.nodes = updatedNodes;
  }

  render(canvas: fabric.Canvas) {
    if (this.isComplete()) {
      this.drawTraceLineWithControls(canvas);
    }
  }

  drawTraceLineWithControls(canvas: fabric.Canvas) {
    this.clearDrawing();
    if (this.isComplete()) {
      super.createControl(canvas, this.nodes[0]);
      super.connectNodesWithLines(canvas);
    }
  }
}
