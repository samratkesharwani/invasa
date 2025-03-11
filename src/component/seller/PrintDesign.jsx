import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import tshirtFront from "../../imgs/frontTshirt.png";
import backTshirt from "../../imgs/backTshirt.png";
import tshirtLeftSide from "../../imgs/tshirtLeftSide.png";
import tshirtRightSide from "../../imgs/tshirtRightSide.png";

const PrintDesign = ({ setOrderData, orderData }) => {
  // Constants for print dimensions
  const DPI = 10; // 1 inch = 10 pixels
  const printWidthInches = 12;  // 12 inches
  const printHeightInches = 16; // 16 inches
  const sleeveInches = 4;      // 4x4 inches for sleeves

  // Calculate pixel dimensions
  const printArea = {
    width: printWidthInches * DPI,
    height: printHeightInches * DPI,
  };
  const sidePrintSize = sleeveInches * DPI;

  // State for each view's image, size, and position
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [leftImage, setLeftImage] = useState(null);
  const [rightImage, setRightImage] = useState(null);
  
  const [frontSize, setFrontSize] = useState({ width: 80, height: 80 });
  const [backSize, setBackSize] = useState({ width: 80, height: 80 });
  const [leftSize, setLeftSize] = useState({ width: 40, height: 40 });
  const [rightSize, setRightSize] = useState({ width: 40, height: 40 });
  
  const [frontPosition, setFrontPosition] = useState({ x: 50, y: 50 });
  const [backPosition, setBackPosition] = useState({ x: 50, y: 50 });
  const [leftPosition, setLeftPosition] = useState({ x: 10, y: 10 });
  const [rightPosition, setRightPosition] = useState({ x: 10, y: 10 });
  
  // UI state
  const [view, setView] = useState("front");
  const [isLoading, setIsLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // References
  const printAreaRef = useRef(null);

  // Update order data when prints change
  useEffect(() => {
    if (!setOrderData || !orderData) return;
    
    const calculatePrintArea = (size) => {
      return (size.width / DPI) * (size.height / DPI);
    };
    
    const prints = [];
    
    if (frontImage) {
      prints.push({
        side: "front",
        image: frontImage,
        size: frontSize,
        position: frontPosition,
        area: calculatePrintArea(frontSize)
      });
    }
    
    if (backImage) {
      prints.push({
        side: "back",
        image: backImage,
        size: backSize,
        position: backPosition,
        area: calculatePrintArea(backSize)
      });
    }
    
    if (leftImage) {
      prints.push({
        side: "left",
        image: leftImage,
        size: leftSize,
        position: leftPosition,
        area: calculatePrintArea(leftSize)
      });
    }
    
    if (rightImage) {
      prints.push({
        side: "right",
        image: rightImage,
        size: rightSize,
        position: rightPosition,
        area: calculatePrintArea(rightSize)
      });
    }
    
    setOrderData({
      ...orderData,
      prints: prints,
      totalPrintArea: prints.reduce((total, print) => total + print.area, 0)
    });
  }, [frontImage, backImage, leftImage, rightImage, frontSize, backSize, leftSize, rightSize, frontPosition, backPosition, leftPosition, rightPosition]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      
      switch (view) {
        case "front":
          setFrontImage(result);
          setFrontSize({ width: 80, height: 80 });
          setFrontPosition({ x: 50, y: 50 });
          break;
        case "back":
          setBackImage(result);
          setBackSize({ width: 80, height: 80 });
          setBackPosition({ x: 50, y: 50 });
          break;
        case "left":
          setLeftImage(result);
          setLeftSize({ width: 40, height: 40 });
          setLeftPosition({ x: 10, y: 10 });
          break;
        case "right":
          setRightImage(result);
          setRightSize({ width: 40, height: 40 });
          setRightPosition({ x: 10, y: 10 });
          break;
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const getTshirtImage = () => {
    switch (view) {
      case "front": return tshirtFront;
      case "back": return backTshirt;
      case "left": return tshirtLeftSide;
      case "right": return tshirtRightSide;
      default: return tshirtFront;
    }
  };

  const getCurrentImage = () => {
    switch (view) {
      case "front": return frontImage;
      case "back": return backImage;
      case "left": return leftImage;
      case "right": return rightImage;
      default: return frontImage;
    }
  };

  const getCurrentSize = () => {
    switch (view) {
      case "front": return frontSize;
      case "back": return backSize;
      case "left": return leftSize;
      case "right": return rightSize;
      default: return frontSize;
    }
  };

  const getCurrentPosition = () => {
    switch (view) {
      case "front": return frontPosition;
      case "back": return backPosition;
      case "left": return leftPosition;
      case "right": return rightPosition;
      default: return frontPosition;
    }
  };

  const updateCurrentSize = (newSize) => {
    switch (view) {
      case "front": setFrontSize(newSize); break;
      case "back": setBackSize(newSize); break;
      case "left": setLeftSize(newSize); break;
      case "right": setRightSize(newSize); break;
    }
  };

  const updateCurrentPosition = (newPosition) => {
    switch (view) {
      case "front": setFrontPosition(newPosition); break;
      case "back": setBackPosition(newPosition); break;
      case "left": setLeftPosition(newPosition); break;
      case "right": setRightPosition(newPosition); break;
    }
  };

  const getMaxSize = () => {
    return view === "left" || view === "right" ? sidePrintSize : Math.max(printArea.width, printArea.height);
  };

  // Set proper print area size based on view
  const getPrintAreaStyle = () => {
    const isSleeveView = view === "left" || view === "right";
    return {
      position: 'absolute',
      width: isSleeveView ? `${sidePrintSize}px` : `${printArea.width}px`,
      height: isSleeveView ? `${sidePrintSize}px` : `${printArea.height}px`,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: '2px dashed rgba(255, 0, 0, 0.5)',
      backgroundColor: 'rgba(255, 0, 0, 0.05)', // Light red background to see the area better
      zIndex: 5
    };
  };

  // Format size for display
  const formatSize = (size) => {
    const widthInches = (size.width / DPI).toFixed(1);
    const heightInches = (size.height / DPI).toFixed(1);
    const areaInches = (widthInches * heightInches).toFixed(1);
    return `${widthInches}" × ${heightInches}" (${areaInches} sq in)`;
  };

  // Handle drag stop
  const handleDragStop = (e, data) => {
    // Get print area bounds
    if (!printAreaRef.current) return;
    
    const printAreaBounds = printAreaRef.current.getBoundingClientRect();
    const currentSize = getCurrentSize();
    
    // Calculate max position to keep within bounds
    const maxX = printAreaBounds.width - currentSize.width;
    const maxY = printAreaBounds.height - currentSize.height;
    
    // Constrain position
    const boundedX = Math.max(0, Math.min(data.x, maxX));
    const boundedY = Math.max(0, Math.min(data.y, maxY));
    
    updateCurrentPosition({ x: boundedX, y: boundedY });
  };

  // Handle resize
  const handleResize = (e, { size }) => {
    setIsResizing(true);
    updateCurrentSize({
      width: size.width,
      height: size.height
    });
    
    // Hide size indicator after a delay
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      setIsResizing(false);
    }, 1500);
  };

  return (
    <div className="bg-dark-3 p-4 rounded-lg">
      <h3 className="text-white mb-4">Design Your Print</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-white mb-3">Upload Your Design</h4>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded cursor-pointer inline-block"
            >
              Choose File
            </label>
            {getCurrentImage() && <span className="ml-3 text-white">Image uploaded!</span>}
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            Upload your design to place on the product. Drag the corners to resize.
          </p>
          
          <h4 className="text-white mb-3">Print Location</h4>
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setView("front")} 
              className={`px-3 py-1 rounded ${view === "front" ? "bg-secondary text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Front
            </button>
            <button 
              onClick={() => setView("back")} 
              className={`px-3 py-1 rounded ${view === "back" ? "bg-secondary text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Back
            </button>
            <button 
              onClick={() => setView("left")} 
              className={`px-3 py-1 rounded ${view === "left" ? "bg-secondary text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Left Sleeve
            </button>
            <button 
              onClick={() => setView("right")} 
              className={`px-3 py-1 rounded ${view === "right" ? "bg-secondary text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Right Sleeve
            </button>
          </div>
          
          <p className="text-sm text-gray-300">
            {view === "left" || view === "right" 
              ? `Maximum sleeve print size: ${sleeveInches} x ${sleeveInches} inches` 
              : `Maximum front/back print size: ${printWidthInches} x ${printHeightInches} inches`}
          </p>
        </div>
        
        <div>
          {/* Print Preview */}
          <div className="relative w-full h-80 border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
            {/* T-Shirt Image */}
            <img src={getTshirtImage()} alt="T-Shirt" className="w-full h-full object-contain" style={{ zIndex: 1 }} />

            {/* Print Area */}
            <div ref={printAreaRef} className="print-area" style={getPrintAreaStyle()}>
              {getCurrentImage() && (
                <Draggable
                  position={getCurrentPosition()}
                  onStop={handleDragStop}
                  bounds="parent"
                >
                  <div className="relative">
                    <ResizableBox
                      width={getCurrentSize().width}
                      height={getCurrentSize().height}
                      onResize={handleResize}
                      minConstraints={[20, 20]}
                      maxConstraints={[getMaxSize(), getMaxSize()]}
                      resizeHandles={['se']}
                      handle={
                        <div
                          className="resize-handle"
                          style={{
                            position: 'absolute',
                            width: '24px',
                            height: '24px',
                            background: 'white',
                            borderRadius: '50%',
                            bottom: '-12px',
                            right: '-12px',
                            cursor: 'se-resize',
                            border: '3px solid #333',
                            zIndex: 30
                          }}
                        />
                      }
                      style={{
                        border: '2px dashed white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 20
                      }}
                    >
                      <img
                        src={getCurrentImage()}
                        alt="Uploaded"
                        className="w-full h-full object-contain"
                        style={{ pointerEvents: 'none' }}
                      />
                      
                      {/* Real-time Size Indicator - Only shows during resize */}
                      {isResizing && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            zIndex: 40,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {formatSize(getCurrentSize())}
                        </div>
                      )}
                    </ResizableBox>
                  </div>
                </Draggable>
              )}
            </div>
            
            {/* Instructions */}
            {getCurrentImage() ? (
              <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white bg-black bg-opacity-50 p-1">
                Drag to position, resize using corner handle
              </div>
            ) : (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white bg-black bg-opacity-50 p-2 rounded">
                Upload an image for the {view} view
              </div>
            )}
          </div>
          
          {/* Print Summary */}
          <div className="mt-4 text-white">
            <h4 className="mb-2">Print Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {frontImage && (
                <div>Front: {formatSize(frontSize)}</div>
              )}
              {backImage && (
                <div>Back: {formatSize(backSize)}</div>
              )}
              {leftImage && (
                <div>Left Sleeve: {formatSize(leftSize)}</div>
              )}
              {rightImage && (
                <div>Right Sleeve: {formatSize(rightSize)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintDesign; 