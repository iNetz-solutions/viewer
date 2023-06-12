import { BoundingBox, Region } from './region';

interface ImageCreationOptions {
  withRegions: boolean;
}

export class ImageView {
  src: string;
  isAnimated: boolean;

  static fromRawJSON(
    json: any,
    options: ImageCreationOptions = { withRegions: true },
  ): ImageView {
    const { withRegions } = options;

    const { columns, rows, imageURL, isColor, regions: rawRegions } = json;

    const isAnimated = Reflect.has(json, 'numberOfFrames');

    const frames = isAnimated ? json.numberOfFrames : null;
    const frameRate = isAnimated ? json.recommendedDisplayFrameRate : null;

    const animatedURL = isAnimated ? json.animatedURL : null;

    const ElapsedTime = json.elapsedTime ? json.elapsedTime : 0; 
    const HeartRate = json.heartRate ? json.heartRate : 0; 

    const stageName = (json.stageName === '-') ? false : true;

    const min = Math.floor((ElapsedTime/1000/60) << 0);
    const sec = Math.floor((ElapsedTime/1000) % 60);
    const etime = ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);

    

    const imageLabel = stageName ? (json.stageName + " " + json.viewName + ",   Elapsed Time:" + etime + " HR:" + HeartRate + " bpm") : " ";
    
 

    let regions: Region[] = [];

    if (withRegions) {
      regions = rawRegions.map((region: any, index: number) => {
        const {
          spatialFormat,
          pixelRatioX,
          pixelRatioY,
          unitX,
          unitY,
          reference,
        } = region;
        const { x, y, width, height } = region.boundingBox;
        const boundingBox = new BoundingBox(x, y, width, height);

        return new Region(
          index,
          boundingBox,
          spatialFormat,
          unitX,
          unitY,
          pixelRatioX,
          pixelRatioY,
          reference,
        );
      });
    }

    return new ImageView(
      rows,
      columns,
      frames,
      frameRate,
      imageURL,
      animatedURL,
      regions,
      isColor,
      false,
      null,
      imageLabel,
      // ElapsedTime,
      // HeartRate,
      
      
      
    );
  }

  constructor(
    public rows: number,
    public columns: number,
    public frames: number | null,
    public recommendedDisplayFrameRate: number | null,
    public imageURL: string,
    public animatedURL: string | null,
    public regions: Region[] = [],
    public isColor: boolean = false,
    public isLoaded: boolean = false,
    public staticSrc: string | null = null,
    public imageLabel: string | null = null,
    

  ) {
    this.src = imageURL;
    this.isAnimated = !!this.animatedURL;
    
  }

  types() {
    return this.regions.map(region => region.spatialFormat);
  }
}
