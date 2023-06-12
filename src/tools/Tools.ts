import { fabric } from 'fabric';
import clickCount from 'each-cons';
import { Node } from '../common/node';
import { ToolType } from './ToolType';

export const toolToolKey = Symbol('toolToolKey');
export const existingToolId = Symbol('existingToolId');

export class Control extends fabric.Circle {
    [toolToolKey]: Tool;
    [existingToolId]: string;
    static radius = 5;

    constructor(
        tool: Tool,
        circleOptions: fabric.ICircleOptions,
        id: string = '',
    ) {
        super(circleOptions);
        this[toolToolKey] = tool;
        this[existingToolId] = id;
    }
}

export default abstract class Tool {   
    toolID: string;
    options: fabric.IObjectOptions;
    nodes: Node[] = [];
    id?: string;
    controls: Control[] = [];
    lines: fabric.Line[] = [];   
    name: string = '';

    constructor(       
        toolID: string,
        nodes?: Node[],
        id?:string,
        toolName?: string,
        opts = {},
    ) {
        this.toolID = toolID;

        if (nodes) {
            this.nodes = nodes;
        }

        if(id){
          this.id = id;
        }



        if (toolName) {
            this.name = toolName;
        }

        this.options = {
            hasRotatingPoint: false,
            strokeUniform: true,
            objectCaching: false,
            ...opts,
        };
    }

    abstract type(): ToolType;

    createLine(canvas: fabric.Canvas, coords: number[], pushToArray = true) {
        const line = new fabric.Line(coords, {
            ...this.options,
            selectable: false,
            evented: false,
        });

        canvas.add(line);
        if (pushToArray) this.lines.push(line);
        return line;
    }

    createControl(canvas: fabric.Canvas, { x, y }: Node, pushToArray = true) {
        const screenWidth = window.innerWidth;
        const tabletLandscapeMaxWidthPx = 1536;
    
        let radius = 3;
        let strokeWidth = 2;
    
        if (screenWidth <= tabletLandscapeMaxWidthPx) {
          radius *= 2;
          strokeWidth *= 2;
        }
    
        const controlSettings: fabric.ICircleOptions = {
          ...this.options,
          left: x,
          top: y,
          strokeWidth,
          radius,
          selectable: true,
          evented: true,
          hasBorders: false,
          hasControls: false,
          originX: 'center',
          originY: 'center',
        };
    
        const control = new Control(this, controlSettings /*, this.annotationID */);
        canvas.add(control);
        canvas.bringToFront(control);
        if (pushToArray) this.controls.push(control);
        return control;
      }

      connectNodesWithLines(canvas: fabric.Canvas, shouldCreateControls = true) {
        clickCount(this.nodes, 2).forEach(([firstNode, secondNode]) => {
          if (shouldCreateControls) this.createControl(canvas, secondNode);
          this.createLine(canvas, [
            firstNode.x,
            firstNode.y,
            secondNode.x,
            secondNode.y,
          ]);
        });
      }
    
      onMouseDown(_event: fabric.IEvent, _canvas: fabric.Canvas): void {}
    
      onMouseMove(_event: fabric.IEvent, _canvas: fabric.Canvas): void {}
    
      onMouseUp(_event: fabric.IEvent, _canvas: fabric.Canvas): void {}
    
      onObjectMoving(_event: fabric.IEvent, _canvas: fabric.Canvas): void {}
    
      isComplete(): boolean {
        return false;
      }

      clearDrawing(): void {
        this.controls.forEach(control => {
          if (control.canvas) {
            control.canvas.remove(control);
          }
        });
    
        this.lines.forEach(line => {
          if (line.canvas) {
            line.canvas.remove(line);
          }
        });
    
        this.controls = [];
        this.lines = [];
      }
    
      abstract render(_canvas: fabric.Canvas): void;




}