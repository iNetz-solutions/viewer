import {Node} from './common/node'
import { ReferencePixel } from './common/region';
import clickCount from 'each-cons';




export interface FormulaParams{
    nodes: Node[];
    pixelRatioX: number;
    pixelRatioY: number;
    unitX: string;
    unitY: string;
    reference?: ReferencePixel;
    value?: number;
}

export interface Formula{
    (formulaParams: FormulaParams): number;
}

const standardizeUnit = (value: number, unit: string) => {
    let newValue: number;
    switch (unit) {
      case 'seconds':
        newValue = value * 1000;
        break;
      default:
        newValue = value;
    }
    return newValue;
  };

  /**
   * 
   * @param a 
   * @param b 
   * @returns 
   * Gets the absolute distance of point a and b
   */
  
  const getAbsolutePixelDistance = (a: number, b: number) => {
    return Math.abs(a - b);
  };
  
  const scaleValue = (value: number, pixelRatio: number) => {
    return Math.abs(value * pixelRatio);
  };


/**
 * 
 * @param a 
 * @param b 
 * @param pixelRatio 
 * @param unit 
 * @returns 
 * 
 * This method transtlated pxiel distance to real world units
 */
  
const pixelsToPhysicalDistance = (
    a: number,
    b: number,
    pixelRatio: number,
    unit: string,
  ) => {
    const distance = getAbsolutePixelDistance(a, b);
    const scaledDistance = scaleValue(distance, pixelRatio);
    return standardizeUnit(scaledDistance, unit);
  };
  
  /**
   * 
   * @param formulaParams 
   * @returns 
   * Physical distance of two points considering the line run and rise
   */
  const absoluteDistance = (formulaParams: FormulaParams) => {
    return Math.sqrt(
      Math.pow(lineRise(formulaParams), 2) + Math.pow(lineRun(formulaParams), 2),
    );
  };

  /**
   * 
   * @param param0 
   * @returns 
   * 
   * The distance to Rise of Y1 and Y2
   */
  
  const lineRise = ({ nodes, pixelRatioY, unitY }: FormulaParams) => {
    const [{ y: y1 }, { y: y2 }] = nodes;
    return pixelsToPhysicalDistance(y1, y2, pixelRatioY, unitY);
  };

  /**
   * 
   * @param param0 
   * @returns 
   * 
   * The distance of Run of X1 and X2
   */
  
  const lineRun = ({ nodes, pixelRatioX, unitX }: FormulaParams) => {
    const [{ x: x1 }, { x: x2 }] = nodes;
    return pixelsToPhysicalDistance(x1, x2, pixelRatioX, unitX);
  };

  const pointDistanceFromReference = ({
    nodes,
    pixelRatioX,
    pixelRatioY,
    unitX,
    unitY,
    reference,
  }: FormulaParams) => {
    if (reference) {
      return lineRise({
        nodes: [...nodes, reference],
        pixelRatioX,
        pixelRatioY,
        unitX,
        unitY,
      });
    } else {
      return 0;
    }
  };

  /*
 * The following function uses the shoelace formula (https://en.wikipedia.org/wiki/Shoelace_formula)
 * for calculating the area of a polygon.
 * The formula is derived by taking each edge AB, and calculating the area of triangle ABO with a
 * vertex at the origin O, by taking the cross-product (which gives the area of a parallelogram)
 * and dividing by 2.
 */
const traceArea = ({ nodes, pixelRatioX, pixelRatioY }: FormulaParams) => {
  let area = 0;
  const nodesLength = nodes.length;
  let prevNodeIdx = nodesLength - 1;
  for (let i = 0; i < nodes.length; i++) {
    area +=
      nodes[prevNodeIdx].x * pixelRatioX * (nodes[i].y * pixelRatioY) -
      nodes[i].x * pixelRatioX * (nodes[prevNodeIdx].y * pixelRatioY);
    prevNodeIdx = i;
  }
  return Math.abs(area / 2);
};

/**
 * Maping list of Tools
 */
  

  const formulaMappings = new Map<String, Formula>([
    ['line', absoluteDistance],
    ['traceArea', traceArea],
    ['point', pointDistanceFromReference]

  ]);

  /**
   * 
   * @param measurementID 
   * @param formulaName 
   * @returns 
   * 
   * Maping Tools to callable function
   */

  export function getFormulaFor(toolID: string, formulaName: string) {
    const formula = formulaMappings.get(formulaName);
    if (!formula)
      console.error(
        `Couldn't read formula matching ${formulaName} for measurementId ${toolID}`,
      );
    return formula || absoluteDistance;
  }