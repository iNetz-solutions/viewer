import { fabric } from 'fabric';
import { Node } from './node';

export class BoundingBox {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}
}

export class ReferencePixel {
  constructor(public x: number, public y: number) {}
}

export class Region {
  constructor(
    public id: number,
    public boundingBox: BoundingBox,
    public spatialFormat: string,
    public unitX: string,
    public unitY: string,
    public pixelRatioX: number,
    public pixelRatioY: number,
    public reference: ReferencePixel | undefined,
  ) {}

  contains({ x, y }: Node) {
    return (
      x > this.boundingBox.x &&
      y > this.boundingBox.y &&
      x < this.boundingBox.x + this.boundingBox.width &&
      y < this.boundingBox.y + this.boundingBox.height
    );
  }

  drawBorder(canvas: fabric.Canvas) {
    const regionBorder = new fabric.Rect({
      left: this.boundingBox.x,
      top: this.boundingBox.y,
      width: this.boundingBox.width,
      height: this.boundingBox.height,
      fill: undefined,
      stroke: 'white',
      hasRotatingPoint: false,
      strokeUniform: true,
      objectCaching: false,
      selectable: false,
      evented: false,
    });

    canvas.add(regionBorder);
    canvas.sendToBack(regionBorder);

    return regionBorder;
  }

  getReferencePixelAbsolutePosition() {
    if (this.reference) {
      return { x: this.reference.x, y: this.reference.y + this.boundingBox.y };
    } else {
      return undefined;
    }
  }
}
