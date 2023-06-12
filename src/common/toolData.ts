import { v4 as uuid } from 'uuid';

import { Node } from './node';


export class ToolData {

  constructor(
    
    public toolID: string,
    public imageID: number,
    public frameID: number,
    public regionID: number,
    public toolName: string = '',
    public nodes: Node[],
    public edited: boolean,
    public value: number,
    public id: string = uuid(),
    public unit: string,
    public name: string,
  ) { }

  serialize() {
    const {
  
      toolID,
      imageID,
      frameID,
      regionID,
      toolName,
      nodes,
      edited,
      value,
      id,
      unit,
      name

    } = this;

    return {
      
      toolID,
      imageID,
      frameID,
      regionID,
      toolName,
      nodes,
      edited,
      value,
      id,
      unit,
      name,
    };
  }
}

