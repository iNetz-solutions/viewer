import { fabric } from 'fabric';
import TraceLine from './TraceLine';
import { Control } from './Tools';
import { ToolType } from './ToolType';

export default class TraceArea extends TraceLine {
  type() {
    return ToolType.TraceArea;
  }

  onMouseUp(event: fabric.IEvent, canvas: fabric.Canvas) {
    if (!this.isComplete()) {
      this.decimateNodes(15);
      this.isActive = false;
      this.drawTraceLineWithControls(canvas);

      const nodesLength = this.nodes.length;
      const firstNode = this.nodes[0];
      const lastNode = this.nodes[nodesLength - 1];
      super.createLine(canvas, [
        firstNode.x,
        firstNode.y,
        lastNode.x,
        lastNode.y,
      ]);
    }
  }

  onObjectMoving(event: fabric.IEvent, canvas: fabric.Canvas) {
    super.onObjectMoving(event, canvas);
    if (event.target instanceof Control) {
      const pointIndex = this.controls.indexOf(event.target);
      const linesLength = this.lines.length;
      const point = this.controls[pointIndex];

      if (pointIndex === 0) {
        this.lines[linesLength - 1].set({
          x1: point.left,
          y1: point.top,
        });
      }
      if (pointIndex === this.controls.length - 1) {
        this.lines[linesLength - 1].set({
          x1: this.controls[0].left,
          y1: this.controls[0].top,
          x2: point.left,
          y2: point.top,
        });
      }
    }
  }

  render(canvas: fabric.Canvas) {
    super.render(canvas);
    const nodesLength = this.nodes.length;

    const firstNode = this.nodes[0];
    const lastNode = this.nodes[nodesLength - 1];
    super.createLine(canvas, [
      firstNode.x,
      firstNode.y,
      lastNode.x,
      lastNode.y,
    ]);
  }
}
