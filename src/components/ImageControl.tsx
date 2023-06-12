import React from 'react';
import { fabric } from 'fabric';

// import { Inter } from '@next/font/google'

// const inter = Inter({ subsets: ['latin'] })

import { ImageView } from '../common/image';
import { Node } from '../common/node';

import { Region } from '../common/region';

import ImageContext from '../contexts/ImageContext';

import { toolToolKey, Control, Tool, getToolFor } from '../tools'
import { ToolData } from '../common/toolData';


/**  
 * Enum for image list scroll up or down 
 */

enum UpOrDown {
  UP,
  DOWN,
}


/**
 * Note: Image data is created and conditioned by the image export tool as per DICOM standards, and it is out of scope 
 * This application uses the exported data as it fits the essential features that ate possibly during the assignment time 
 */


/**
 * Image Viewer properties 
 * 
 */

interface ImageViewerProps {
  imageIdx: number;
  image: ImageView;
  tooldata: ToolData[];
  initialToolId: string;
  toolRegions: string[];
  toolName: string;
  name: string;
  persistToolData: (
    id: string | undefined,
    toolID: string,
    toolName: string,
    nodes: Node[],
    region: Region,
    frame: number,

    name: string,

  ) => void;

}

/**
 * Image viwer state 
 * for only dealing with Single images 
 * no looped images 
 */
interface ImageViewerState {

  currentFrame: number;
  timeStep?: number;
}

/***
 * Image viewer
 * This reponsible of showing canvas data both background canvas 
 * with holds the image 
 * and fromend canvas which holds tool drown notations
 * This also reponsble state of mouse movements when tool is active
 */

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {

  private activeRegion?: Region = undefined;
  private activeTool?: Tool = undefined;

  private canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private canvas: fabric.Canvas | null = null;
  private videoRef: React.RefObject<HTMLVideoElement> = React.createRef();

  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      currentFrame: 0,
      timeStep: undefined,
    };

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onObjectMoving = this.onObjectMoving.bind(this);
    this.canvasInit = this.canvasInit.bind(this);
    this.setFrame = this.setFrame.bind(this);
    this.setImage = this.setImage.bind(this);
  }


  /**
   * Component mount is reponsible to initialize canvas
   */
  componentDidMount() {
    const { image } = this.props;
  
    this.canvasInit();

    //this.setFrame(0);  
  }

  /***
   * DidUpdate is reponsible 
   * Clearing the canvas and setting canvas to current image
   */

  componentDidUpdate(prevProps: ImageViewerProps) {
    const {
      image,
      tooldata,
      initialToolId,
      toolRegions,
      toolName,
    } = this.props;

    const { currentFrame, timeStep } = this.state;
    const { imageIdx } = this.props

    if ((image && image.imageURL === prevProps.image.imageURL) 
    ||
      tooldata !== prevProps.tooldata ||
      initialToolId !== prevProps.initialToolId ||
      toolRegions !== prevProps.toolRegions ||
      toolName !== prevProps.toolName
    ) {

      if (this.canvas) {
        this.canvas.clear();
        this.setCanvasImage(this.canvas);
        //this.drawToolData(this.canvas, imageIdx);

        let tt = this.canvas;

        tooldata
        .filter(tooldata => tooldata.imageID === imageIdx)
        .forEach(t => {
          const tool = getToolFor(t.toolName, t.toolID, t.nodes, t.id);
          tool.render(tt);
        });

        if (toolName !== '') {
          this.drawRegions(
            this.canvas, image.regions.filter(r => toolRegions.includes(r.spatialFormat),
            ),
          );
        }

        //this.setFrame(0);
        window.removeEventListener('resize', this.resizeCanvas)
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeCanvas);
  }
  /**
   * Canvas init 
   * Attachs all events needed
   * and sets the area that will drown as per image type
   */

  canvasInit() {
    const { image, toolRegions, toolName } = this.props;
    const { currentFrame } = this.state;

    if (this.canvasRef.current) {
      // ensure that fabric didn't initialize canvas previously
      if (document.querySelectorAll('.canvas-container').length < 1) {
        this.canvas = new fabric.Canvas(this.canvasRef.current, {
          selection: false, // Disable drag-selection box
        });

        this.canvas.on('mouse:up', this.onMouseUp);
        this.canvas.on('mouse:down', this.onMouseDown);
        this.canvas.on('mouse:move', this.onMouseMove);
        this.canvas.on('object:moving', this.onObjectMoving);
      }

      // center absolutely positioned canvases, created by fabric.
      [
        document.querySelector<HTMLElement>('.upper-canvas'),
        document.querySelector<HTMLElement>('.lower-canvas'),
      ].forEach(canvas => {
        if (canvas) {
          canvas.style.margin = 'auto';
          canvas.style.top = '0';
          canvas.style.bottom = '0';
        }
      });

      window.addEventListener('resize', this.resizeCanvas);
      if (this.canvas) {
        this.setCanvasImage(this.canvas);
        this.drawToolData(this.canvas, currentFrame);

        if (toolName !== '') {
          this.drawRegions(
            this.canvas,
            image.regions.filter(region => toolRegions.includes(region.spatialFormat),
            ),
          );
        }

      }
    }
  }
  /**
   * 
   * @param frame 
   * @param currentImageId 
   * after image is change setFrame will lood and draw tool data assosicate 
   * Current image 
   */

  setFrame(frame: number, currentImageId: number) {
    
    this.setState({ currentFrame: frame }, () => {     

      if (this.canvas) {
        this.canvas.clear();

        this.drawToolData(this.canvas, currentImageId );
      }
    });
  }

  /**
   * 
   * @param event 
   * Mouse up is reponsible to save tool data after 
   * Tool drowing completed
   */

  onMouseUp(event: fabric.IEvent) {

    const { name, toolName, persistToolData } = this.props;
    const { currentFrame } = this.state;

    if (this.activeTool) {
      this.activeTool.onMouseUp(event, this.canvas!);

      if (this.activeTool.isComplete() && this.activeRegion) {

        persistToolData(
          this.activeTool.id,   //I dont what typescrip has issue with item
          this.activeTool.toolID,
          this.activeTool.type(),
          this.activeTool.nodes,
          this.activeRegion,
          currentFrame,
          name,

        );
      }

      this.activeTool = undefined;
      this.activeRegion = undefined;
    }
  }


   /**
    * 
    * @param event 
    * @returns 
    * Mouse down is reponsible to activate erea that will be drown 
    * Check if existing is click other wise start a new tool process
    * and start drwing any number of clicks and lines to show the progress of the tool process
    */

  onMouseDown(event: fabric.IEvent) {

    const { imageIdx, image, initialToolId, toolRegions, tooldata, toolName } = this.props;
    const { currentFrame } = this.state;

    if (initialToolId === '' && !(event.target instanceof Control))
      return

    const pointer = this.canvas!.getPointer(event.e);

    if (event.target instanceof Control) {

      this.activeRegion = image.regions.find(region =>
        region.contains(pointer),);

      this.activeTool = event.target[toolToolKey];

    } else {

      this.activeRegion = image.regions
        .filter(region => toolRegions.includes(region.spatialFormat))
        .find(region => region.contains(pointer));

      if (this.activeRegion &&
        this.activeRegion.spatialFormat === '2D (tissue or flow)'
      ) {
        const existingToolData = tooldata.find(tooldata => {
          return (
            tooldata.toolID === initialToolId &&
            tooldata.imageID === imageIdx  &&
            tooldata.frameID === currentFrame &&
            tooldata.regionID === this.activeRegion!.id

          );
        });

        if (!existingToolData) {
          this.activeTool =
            this.activeTool || getToolFor(toolName, initialToolId);
        } else {
          this.activeTool = undefined;
        }
      }
      else {
        this.activeTool = this.activeTool || getToolFor(toolName, initialToolId);


      }
    }

    if (this.activeRegion && this.activeTool) {
      this.drawRegions(this.canvas!, [this.activeRegion]);
    }

    if (
      this.activeTool &&
      this.activeRegion &&
      this.activeRegion.contains(pointer)
    ) {
      this.activeTool.onMouseDown(event, this.canvas!);
      this.canvas!.renderAll();
    }

    

  }

  /**
   * 
   * @param event 
   * Upadated tool process if there is an acive tool
   */
  onMouseMove(event: fabric.IEvent) {

    if (this.activeTool) {
      this.confineToRegion(this.canvas!.getPointer(event.e))
      this.activeTool.onMouseMove(event, this.canvas!);
      this.canvas!.renderAll();

    }

  }

  /**
   * 
   * 
   * @param event 
   * 
   * Updated the position of node that was moved during active tool 
   * change
   */

  onObjectMoving(event: fabric.IEvent) {
    if (this.activeTool) {
      this.confineToRegion(this.canvas!.getPointer(event.e));
      const { x, y } = this.canvas!.getPointer(event.e);
      Object.assign(event.target!, { top: y, left: x });
      this.activeTool.onObjectMoving(event, this.canvas!);
    }
  }

  /**
   * 
   * @param canvas 
   * set canvas images loads the cuurent image into 
   * background canvas
   * The canvas libs is use has to canvases one for Image 
   * and top one for drowing
   */

  setCanvasImage(canvas: fabric.Canvas) {
    const { image } = this.props;

    const img = document.createElement('img');
    console.log(image.src)
    img.setAttribute('src', image.staticSrc || image.src);

    img.addEventListener('load', () => {
      canvas.setDimensions({ width: img.width, height: img.height });


      this.resizeCanvas();

      if (image) {
        canvas.setBackgroundImage(
          new fabric.Image(img),
          canvas.renderAll.bind(this.canvas));
      }

    });


  }

 /**
  * This method resize the canvas with respect to the image size 
  * and  active window size
  */

  resizeCanvas() {
    // The following three elements are created by fabric.
    const upperCanvas = document.querySelector<HTMLCanvasElement>(
      '.upper-canvas',
    );
    const lowerCanvas = document.querySelector<HTMLCanvasElement>(
      '.lower-canvas',
    );
    const canvasContainer = document.querySelector<HTMLDivElement>(
      '.canvas-container',
    );

    if (upperCanvas && lowerCanvas && canvasContainer) {
      upperCanvas.style.height = 'auto';
      lowerCanvas.style.height = 'auto';

      const canvasHeight = lowerCanvas.clientHeight;
      const canvasWidth = lowerCanvas.clientWidth;

      const headerDiv = document.querySelector<HTMLDivElement>('#header');
      const animationControlsDiv = document.querySelector<HTMLDivElement>(
        '#animationControls',
      );

      let imgViewerHeight = window.innerHeight;

      if (headerDiv) imgViewerHeight -= (headerDiv.clientHeight + 100);

      if (animationControlsDiv)
        imgViewerHeight -= animationControlsDiv.clientHeight;

      canvasContainer.style.height = imgViewerHeight + 'px';

      if (canvasWidth > 1 && imgViewerHeight > 1) {
        const imgAspectRatio = canvasWidth / canvasHeight;

        // Calculate the new width of the image based on the height of
        // the image viewer, preserving the aspect ratio.
        const newWidth = imgViewerHeight * imgAspectRatio;

        upperCanvas.style.width = newWidth + 'px';
        lowerCanvas.style.width = newWidth + 'px';
        canvasContainer.style.width = newWidth + 'px';
      }
    }
  }

  /**
   * 
   * @param canvas 
   * @param frameID 
   * 
   * drow tool data is reponsible drowing tool data after new image is loaded
   */

  drawToolData(canvas: fabric.Canvas, frameID: number) {

    if (this.canvas) this.canvas.clear();
    const { tooldata } = this.props;

    tooldata
      .filter(tooldata => tooldata.imageID === frameID)
      .forEach(t => {
        const tool = getToolFor(t.toolName, t.toolID, t.nodes, t.id);
        tool.render(canvas);
      });

  }

  /**
   * 
   * @param canvas 
   * @param regions
   * 
   * This method is responsible to draw a box and frame 
   * the active drawable region of the image 
   * as per image type
   * Note: image data is create and condition by imgage export tool as DICOM standrad and it os out of scope 
   *      This application is using the export data as it fits basic feature possible during the assigment time  
   */

  drawRegions(canvas: fabric.Canvas, regions: Region[]) {
    for (const region of regions) {
      region.drawBorder(canvas);
    }
  }

  /**
   * 
   * @param pointer 
   * This method limits the pointer within
   * drawable area
   */

  confineToRegion(pointer: Node) {
    if (this.activeRegion) {
      const { boundingBox } = this.activeRegion;

      const top = boundingBox.y;
      const left = boundingBox.x
      const right = boundingBox.x + boundingBox.width;
      const bottom = boundingBox.y + boundingBox.height;

      if (pointer.x < left) {
        Object.assign(pointer, { x: left });
      }
      if (pointer.x > right) {
        Object.assign(pointer, { x: right });
      }

      if (pointer.y < top) {
        Object.assign(pointer, { y: top });
      }
      if (pointer.y > bottom) {
        Object.assign(pointer, { y: bottom });
      }
    }
  }

  /**
   * 
   * @param upordown 
   * @param imageIdx 
   * @param maxIdx 
   * @param updateImageIdx 
   * 
   * Set current image when user clicks UP or DOWN buttons
   * and calles setFrame 
   */

  setImage(
    upordown: UpOrDown,



    imageIdx: number,
    maxIdx: number,
    updateImageIdx: (_imageIdx: number) => void,
  ) {

   
    let newImageIdx: number;

    switch (upordown) {
      case UpOrDown.UP:
        newImageIdx = imageIdx === 0 ? 0 : imageIdx - 1;       
        break;
      case UpOrDown.DOWN:       
        newImageIdx = imageIdx === maxIdx ? maxIdx : imageIdx + 1;
        break;
      default:
        throw new Error('Wrong image index');

    }

    updateImageIdx(newImageIdx);
    this.setFrame(0, newImageIdx);
    
  }

  /**
   * 
   * @returns 
   * Render from GUI elemenst to the screen
   */

  render() {
    const { image } = this.props;
    const { currentFrame } = this.state;

    return (
      <>
        <div className='flex w-full justify-center relative' >
          <ImageContext.Consumer>
            {({ imageIdx, maxIdx, updateImageIdx }) => (
              <div>

                <button
                  type='button'
                  className='flex justify-center w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={() =>
                    this.setImage(
                      UpOrDown.UP,
                      imageIdx,
                      maxIdx,
                      updateImageIdx
                    )
                  }
                >
                  <svg className="fill-current w-4 h-4 mr-2" transform="scale(1 -1)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg>

                </button>

                <div className='flex w-full justify-center relative' >
                  <canvas
                    className='aspect-auto'
                    ref={this.canvasRef}

                  />
                </div>



                <button
                  type='button'
                  className='flex justify-center w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'

                  onClick={() =>
                    this.setImage(
                      UpOrDown.DOWN,
                      imageIdx,
                      maxIdx,
                      updateImageIdx
                    )
                  }
                >
                  <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg>


                </button>

              </div>
            )}
          </ImageContext.Consumer>
        </div>
      </>
    );

  }
}

export default ImageViewer;

