import React from 'react';

const ImageContext = React.createContext({
  imageIdx: 0,  
  maxIdx: 0,
    
  updateImageIdx: (_imageIdx: number) => {},
});

export default ImageContext;