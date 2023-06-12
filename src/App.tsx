import React from 'react';
import './App.css';
import styles from '@/styles/Home.module.css'
import ToolBar from './components/ToolBar';
import axios from 'axios';
import { ToolData } from './common/toolData';
import TopBar from './components/TopBar'
import { SubjectInfo } from './components/SubjectInfo'
import ThumbnailItem from './components/ThumbnailItem'
import SideBar from './components/Sidebar'
import ToolBarItem from './components/ToolbarItem'
import ImageContext from './contexts/ImageContext';
import ToolSelectContext from './contexts/ToolSelectContext';
import ImageControl from './components/ImageControl'
import { ImageView } from './common/image';
import { ToolMap, ToolResult } from './common/toolResult';
import DataControl from './components/DataControl';
import BottomBar from './components/BottomBar';
import { Region } from './common/region';
import { Node } from './common/node'
import { Subject } from './common/subject';

interface AppProps { }

interface AppState {
  hasError: boolean;
  validURL: boolean;
  errorMessage: string;
  imageIdx: number;
  tools: ToolMap;
  currentToolId: string;
  toolData: ToolData[]


  images: ImageView[];
  isToolDataLoaded: boolean;
  testId: string;
  subject: Subject;
}
const sideBarContent = (
  <>
    <ThumbnailItem thumbnail='components/img/logo-placeholder.png' />
    <ThumbnailItem thumbnail='components/img/logo-placeholder.png' />
    <ThumbnailItem thumbnail='components/img/logo-placeholder.png' />

  </>
);

class Home extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    /**
     * Read Url patameters after "/"
     */

    let params = ""
    if (typeof window !== "undefined") {
      params = window.location.search;
    }

    /**
     * If appliaction did not load proper paramets and user did not supply
     * defualt to testId 1  
     */

    if (params === '' || params === undefined)
      params = '?1'


    const ID = params.replace('?', '');

    let validURL = false;

    /**
     * If the TestId is found assume it is a valid Url
     */
    if (ID !== '') {
      validURL = true;
    }



    this.state = {
      hasError: false,
      validURL,
      errorMessage: 'Oops',
      imageIdx: 0,
      images: [],
      tools: new Map(),
      currentToolId: '',
      toolData: [],
      isToolDataLoaded: false,
      testId: ID,
      subject: { Id: '', Name: '', SessionId: '', Date: '', Dob: '' }
    };

    this.updateImageIdx = this.updateImageIdx.bind(this);
    this.setCurrentTool = this.setCurrentTool.bind(this);
    this.persistToolData = this.persistToolData.bind(this);

  }

  /**
   * component did mount is reponsible to load Image data 
   * TooldData was design to hold ToolData so it wont be lost after test change or close
   *  However, this feature is out of scope..  Appliation will keep tool data in memoty while test is actibe
   */

  async componentDidMount() {

    const { hasError, validURL, testId } = this.state;

    if (validURL) {
      const tooldatas: ToolData[] = [];
      this.setState({ toolData: tooldatas });
    }

    /**
     * Loading subject data or person image wwas acquired from
     */

    if (validURL) {
      try {

        const { data: subject } = await axios({

          url: testId + '\\subject.json',
          responseType: 'json'
        });

        this.setState({ subject })


      } catch (error) { }

    }

    /***
     * Loading images and image data 
     */

    if (validURL) {
      try {

        const { data: imageList } = await axios({

          url: testId + '\\images.json',
          responseType: 'json'
        });

        let images: ImageView[] = imageList.map((imageJSON: any) => {

          return ImageView.fromRawJSON(imageJSON);

        });
        images = await Promise.all(
          images.map(async image => {
            try {
              const { data: imageBlob } = await axios({
                url: image.imageURL,
                responseType: 'blob'
              });

              Object.assign(image, {
                src: URL.createObjectURL(imageBlob),
              });
            } catch (error) {
            }
            return image;
          }),
        );

        this.setState({ images })
      } catch (error) { }
    }

    /**
     * Loading tools  
     * For this assigment there will only three tools
     * 1. Line measuremnet (Ruler)
     * 2. Trace Area which measures the Area of traced area
     * 3. Point which measures velocity for specific type of images thas has dopler frequency
     *  and it use refence line in the image, which part of DICOM data alreas exported
     */

    if (validURL) {
      let tools: ToolMap = new Map();
      try {

        const { data: toolJSON } = await axios({
          url: 'toolBox.json',
          responseType: 'json'
        });
        Object.keys(toolJSON).forEach(toolID => {
          tools.set(
            toolID,
            ToolResult.fromRawJSON(
              toolID,
              toolJSON[toolID],
            ),
          );
        });

        this.setState({ tools })
      } catch (error) {
      }
    }

    
  }


 /**
  * 
  * @param imageIdx 
  * Sets the current image index
  */
  updateImageIdx(imageIdx: number) {
    this.setState({ imageIdx });
  }

  setCurrentTool(toolId: string) {

    const { currentToolId } = this.state;
    if (currentToolId === toolId) return;

    this.setState({ currentToolId: toolId });

  }

  /**
   * 
   * @param id 
   * @param toolID 
   * @param toolName 
   * @param nodes 
   * @param region 
   * @param frameID 
   * @param name 
   * 
   * Saves the tool data in memory and it will only accessable while test is active
   */
  persistToolData(
    id: string | undefined,
    toolID: string,
    toolName: string,
    nodes: Node[],
    region: Region,
    frameID: number,
    name: string,
  ) {

    const { toolData, tools, imageIdx } = this.state;

    const { pixelRatioX, pixelRatioY, unitX, unitY } = region;

    const tool = tools.get(toolID);

    const refrenceLine = region.getReferencePixelAbsolutePosition();

    if (tool) {
      const currentValue = tool.calculatedValue({
        nodes,
        pixelRatioX,
        pixelRatioY,
        unitX,
        unitY,
        reference: refrenceLine,
      })

      const completedTool = new ToolData(
        toolID,
        imageIdx,
        frameID,
        region.id,
        toolName,
        nodes,
        true,
        currentValue,
        id === '' ? undefined : id,
        tool.unit,
        tool.name
      )

      const existingToolId = toolData.findIndex(t => {
        return t.id === id;
      });

      if (existingToolId === -1) {
        toolData.push(completedTool);
      }
      else {
        toolData[existingToolId] = completedTool;
      }
    
    }

    this.setState({
      toolData,
      currentToolId: '',

    })
  }

  /**
   * 
   * @returns 
   * Render GUI elements
   */

  render() {

    const {
      hasError,
      errorMessage,
      imageIdx,
      images,
      tools,
      currentToolId,
      toolData,
      subject
    } = this.state;


    let mainContent;
    let toolBarContent;

    //.log("image loaded")

    //console.log(images[0])

    toolBarContent = (
      <>
        {Array.from(tools,
          ([key, { name, toolId }]) => (
            <ToolBarItem key={key} icon={name} toolId={toolId}
            />
          ),
        )}
      </>
    )

    if (images[imageIdx]) {
      const tool = tools.get(currentToolId) || {
        imageTypes: [],
        toolName: '',
        name: ''
      };
      mainContent = (
        <ImageControl
          imageIdx={imageIdx}
          image={images[imageIdx]}
          initialToolId={currentToolId}
          toolRegions={tool.imageTypes}
          toolName={tool.toolName}
          name={tool.name}
          tooldata={toolData}
          persistToolData={this.persistToolData}
        />
      );
    }   

    return (
      <>
        <div className="flex flex-col h-screen App px-1 py-1 space-y-1 ">
          <div id='header'>
            <TopBar>
              <SubjectInfo Id={subject.Id} Name={subject.Name} SessionId={subject.SessionId} Date={subject.Date} Dob={subject.Dob} />
            </TopBar>

            <ToolSelectContext.Provider
              value={{ setCurrentTool: this.setCurrentTool }}
            >
              <ToolBar children={toolBarContent} />

            </ToolSelectContext.Provider>
          </div>

          <div className="w-full rounded-t-lg  bg-white border border-gray-300 shadow-sm  overflow-hidden flex" >

            <SideBar children={sideBarContent} />

            {images.length > 1 && (<ImageContext.Provider
              value={{
                imageIdx,
                maxIdx: images.length - 1,
                updateImageIdx: this.updateImageIdx,
              }}
            >
              <div className='w-full overflow-auto content-center' style={{ backgroundColor: '#292E30' }}>
                {mainContent}
              </div>

            </ImageContext.Provider>)}

            <DataControl datas={toolData} imageId = {imageIdx}/>

          </div>

          <div id='footer'>
            <BottomBar data={undefined} />
          </div>

        </div>
      </>
    )

  }
}
export default Home;
