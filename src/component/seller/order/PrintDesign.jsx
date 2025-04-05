import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../utils/supabase';

const PrintDesign = ({ setOrderData, orderData, printData, isDarkMode = false }) => {
  // Constants for size constraints (in pixels for the UI, representing inches)
  const PIXELS_PER_INCH = 16;
  const MAX_FRONT_BACK_WIDTH = 12 * PIXELS_PER_INCH; // 12 inches
  const MAX_FRONT_BACK_HEIGHT = 16 * PIXELS_PER_INCH; // 16 inches
  const MAX_SLEEVE_SIZE = 4 * PIXELS_PER_INCH; // 4x4 inches
  
  // State for each side's image, size, and position
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
  const [printSide, setPrintSide] = useState('front'); // front, back, left, right
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [totalPrintArea, setTotalPrintArea] = useState(0);
  const [currentPrintSize, setCurrentPrintSize] = useState({ width: 0, height: 0, area: 0 });
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef(null);
  const printAreaRef = useRef(null);
  
  // Load existing print data from orderData when component mounts
  useEffect(() => {
    if (orderData && orderData.printData && orderData.printData.length > 0) {
      // Restore saved print data
      orderData.printData.forEach(print => {
        if (!print.side || !print.image) return;
        
        switch (print.side) {
          case 'front':
            setFrontImage(print.image);
            if (print.width && print.height) {
              setFrontSize({ width: print.width, height: print.height });
            }
            if (print.x !== undefined && print.y !== undefined) {
              setFrontPosition({ x: print.x, y: print.y });
            }
            break;
          case 'back':
            setBackImage(print.image);
            if (print.width && print.height) {
              setBackSize({ width: print.width, height: print.height });
            }
            if (print.x !== undefined && print.y !== undefined) {
              setBackPosition({ x: print.x, y: print.y });
            }
            break;
          case 'left':
            setLeftImage(print.image);
            if (print.width && print.height) {
              setLeftSize({ width: print.width, height: print.height });
            }
            if (print.x !== undefined && print.y !== undefined) {
              setLeftPosition({ x: print.x, y: print.y });
            }
            break;
          case 'right':
            setRightImage(print.image);
            if (print.width && print.height) {
              setRightSize({ width: print.width, height: print.height });
            }
            if (print.x !== undefined && print.y !== undefined) {
              setRightPosition({ x: print.x, y: print.y });
            }
            break;
          default:
            break;
        }
      });
      
      console.log("Restored print data from orderData:", orderData.printData);
    }
  }, [orderData.printData]);
  
  // Calculate print area in square inches
  const calculatePrintArea = (size) => {
    return (size.width / PIXELS_PER_INCH) * (size.height / PIXELS_PER_INCH);
  };
  
  // Update current print size information
  useEffect(() => {
    const currentSize = getCurrentSize();
    const widthInches = (currentSize.width / PIXELS_PER_INCH).toFixed(1);
    const heightInches = (currentSize.height / PIXELS_PER_INCH).toFixed(1);
    const area = calculatePrintArea(currentSize).toFixed(1);
    
    setCurrentPrintSize({
      width: widthInches,
      height: heightInches,
      area: area
    });
  }, [frontSize, backSize, leftSize, rightSize, printSide]);
  
  // Update total print area
  useEffect(() => {
    let total = 0;
    
    if (frontImage) {
      total += calculatePrintArea(frontSize);
    }
    
    if (backImage) {
      total += calculatePrintArea(backSize);
    }
    
    if (leftImage) {
      total += calculatePrintArea(leftSize);
    }
    
    if (rightImage) {
      total += calculatePrintArea(rightSize);
    }
    
    setTotalPrintArea(total.toFixed(1));
  }, [frontImage, backImage, leftImage, rightImage, frontSize, backSize, leftSize, rightSize]);
  
  // Update order data when prints change
  useEffect(() => {
    if (!setOrderData) return;
    
    // Create print data array
    const prints = [];
    
    if (frontImage) {
      prints.push({
        side: 'front',
        image: frontImage,
        width: frontSize.width,
        height: frontSize.height,
        x: frontPosition.x,
        y: frontPosition.y,
        position: 'Front',
        area: parseFloat(calculatePrintArea(frontSize).toFixed(1)),
        rotation: 0,
        scale: 1
      });
    }
    
    if (backImage) {
      prints.push({
        side: 'back',
        image: backImage,
        width: backSize.width,
        height: backSize.height,
        x: backPosition.x,
        y: backPosition.y,
        position: 'Back',
        area: parseFloat(calculatePrintArea(backSize).toFixed(1)),
        rotation: 0,
        scale: 1
      });
    }
    
    if (leftImage) {
      prints.push({
        side: 'left',
        image: leftImage,
        width: leftSize.width,
        height: leftSize.height,
        x: leftPosition.x,
        y: leftPosition.y,
        position: 'Left Sleeve',
        area: parseFloat(calculatePrintArea(leftSize).toFixed(1)),
        rotation: 0,
        scale: 1
      });
    }
    
    if (rightImage) {
      prints.push({
        side: 'right',
        image: rightImage,
        width: rightSize.width,
        height: rightSize.height,
        x: rightPosition.x,
        y: rightPosition.y,
        position: 'Right Sleeve',
        area: parseFloat(calculatePrintArea(rightSize).toFixed(1)),
        rotation: 0,
        scale: 1
      });
    }
    
    // Only update if something has changed (deep comparison of arrays is tricky)
    // So we'll compare the stringified versions
    const currentPrints = JSON.stringify(prints);
    const previousPrints = JSON.stringify(orderData.printData || []);
    
    if (currentPrints !== previousPrints || parseFloat(totalPrintArea) !== orderData.totalPrintArea) {
      console.log("Updating order data with print information:", prints);
      
      // Update order data with print information and total area
      setOrderData(prevOrderData => ({
        ...prevOrderData,
        printData: prints,
        totalPrintArea: parseFloat(totalPrintArea)
      }));
    }
  }, [frontImage, backImage, leftImage, rightImage, frontSize, backSize, leftSize, rightSize, 
      frontPosition, backPosition, leftPosition, rightPosition, totalPrintArea, setOrderData, orderData.printData]);
  
  // Upload image to server and get URL
  const uploadImageToServer = async (file) => {
    if (!file) return null;
    
    setIsUploading(true);
    setUploadStatus('Uploading image...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use the production backend URL instead of localhost
      const response = await fetch('https://backendforinvasa.vercel.app/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result); // Log the result to see what's returned
      setUploadStatus('Upload successful!');
      
      // Return the URL of the uploaded image
      return result.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    }
  };
  
  // Capture and upload the print design with its position
  const captureAndUploadDesign = async (side) => {
    // Get the current image, position, and size based on the side
    let image, position, size;
    
    switch (side) {
      case 'front':
        image = frontImage;
        position = frontPosition;
        size = frontSize;
        break;
      case 'back':
        image = backImage;
        position = backPosition;
        size = backSize;
        break;
      case 'left':
        image = leftImage;
        position = leftPosition;
        size = leftSize;
        break;
      case 'right':
        image = rightImage;
        position = rightPosition;
        size = rightSize;
        break;
      default:
        return null;
    }
    
    // If no image, return null
    if (!image) {
      console.log(`No image for ${side} side`);
      return null;
    }
    
    setIsUploading(true);
    setUploadStatus(`Capturing ${side} design...`);
    
    try {
      // Create a canvas to draw the design
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match the container
      canvas.width = 300;
      canvas.height = 300;
      
      // Draw background (t-shirt template)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load the t-shirt template
      const templateImg = new Image();
      templateImg.crossOrigin = 'Anonymous';
      
      // Get the appropriate template based on the side
      let templateSrc;
      switch (side) {
        case 'front': templateSrc = '/images/tshirt-front.svg'; break;
        case 'back': templateSrc = '/images/tshirt-back.svg'; break;
        case 'left': templateSrc = '/images/tshirt-left.svg'; break;
        case 'right': templateSrc = '/images/tshirt-right.svg'; break;
        default: templateSrc = '/images/tshirt-front.svg';
      }
      
      // Create a promise to wait for the template image to load
      const templatePromise = new Promise((resolve) => {
        templateImg.onload = () => {
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        templateImg.onerror = () => {
          console.error(`Failed to load template: ${templateSrc}`);
          resolve(); // Resolve anyway to continue with the process
        };
        templateImg.src = templateSrc;
      });
      
      // Load the design image
      const designImg = new Image();
      designImg.crossOrigin = 'Anonymous';
      
      // Create a promise to wait for the design image to load
      const designPromise = new Promise((resolve) => {
        designImg.onload = () => {
          resolve();
        };
        designImg.onerror = () => {
          console.error(`Failed to load design: ${image}`);
          resolve(); // Resolve anyway to continue with the process
        };
        designImg.src = image;
      });
      
      // Wait for both images to load
      await Promise.all([templatePromise, designPromise]);
      
      // Draw the design on top of the template
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.drawImage(designImg, 0, 0, size.width, size.height);
      ctx.restore();
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      // Create a File object from the blob
      const file = new File([blob], `${side}-design-${Date.now()}.png`, { type: 'image/png' });
      
      // Upload the file to the server
      const uploadedImageUrl = await uploadImageToServer(file);
      
      if (!uploadedImageUrl) {
        throw new Error('Failed to upload captured design');
      }
      
      setUploadStatus(`${side} design captured and uploaded successfully!`);
      
      // Return the uploaded image URL along with position data
      return {
        side,
        capturedImage: uploadedImageUrl,
        position: side.charAt(0).toUpperCase() + side.slice(1),
        width: size.width,
        height: size.height,
        x: position.x,
        y: position.y,
        area: parseFloat(calculatePrintArea(size).toFixed(1)),
        rotation: 0,
        scale: 1
      };
    } catch (error) {
      console.error(`Error capturing and uploading ${side} design:`, error);
      setUploadStatus(`Failed to capture ${side} design: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    }
  };
  
  // Add this function to capture and upload all designs
  const captureAndUploadAllDesigns = async () => {
    setUploadStatus('Capturing all designs...');
    
    const capturedDesigns = [];
    
    // Capture and upload each side that has an image
    if (frontImage) {
      const frontDesign = await captureAndUploadDesign('front');
      if (frontDesign) capturedDesigns.push(frontDesign);
    }
    
    if (backImage) {
      const backDesign = await captureAndUploadDesign('back');
      if (backDesign) capturedDesigns.push(backDesign);
    }
    
    if (leftImage) {
      const leftDesign = await captureAndUploadDesign('left');
      if (leftDesign) capturedDesigns.push(leftDesign);
    }
    
    if (rightImage) {
      const rightDesign = await captureAndUploadDesign('right');
      if (rightDesign) capturedDesigns.push(rightDesign);
    }
    
    if (capturedDesigns.length > 0) {
      // Update order data with captured designs
      setOrderData({
        ...orderData,
        capturedDesigns: capturedDesigns
      });
      
      setUploadStatus(`Captured and uploaded ${capturedDesigns.length} designs!`);
    } else {
      setUploadStatus('No designs to capture.');
    }
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setUploadStatus('');
    }, 3000);
    
    return capturedDesigns;
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // First upload the file to the server
    const uploadedImageUrl = await uploadImageToServer(file);
    
    // If upload failed, don't proceed
    if (!uploadedImageUrl) {
      return;
    }
    
    // Set image based on current side
    switch (printSide) {
      case 'front': setFrontImage(uploadedImageUrl); break;
      case 'back': setBackImage(uploadedImageUrl); break;
      case 'left': setLeftImage(uploadedImageUrl); break;
      case 'right': setRightImage(uploadedImageUrl); break;
    }
  };
  
  // Update current side
  const updatePrintSide = (newSide) => {
    setPrintSide(newSide);
  };
  
  // Get current image based on selected side
  const getCurrentImage = () => {
    switch (printSide) {
      case 'front': return frontImage;
      case 'back': return backImage;
      case 'left': return leftImage;
      case 'right': return rightImage;
      default: return null;
    }
  };
  
  // Get current size based on selected side
  const getCurrentSize = () => {
    switch (printSide) {
      case 'front': return frontSize;
      case 'back': return backSize;
      case 'left': return leftSize;
      case 'right': return rightSize;
      default: return { width: 80, height: 80 };
    }
  };
  
  // Get current position based on selected side
  const getCurrentPosition = () => {
    switch (printSide) {
      case 'front': return frontPosition;
      case 'back': return backPosition;
      case 'left': return leftPosition;
      case 'right': return rightPosition;
      default: return { x: 0, y: 0 };
    }
  };
  
  // Update current size based on selected side - with snap to 10px grid
  const handleResize = (e, { size }) => {
    setIsResizing(true);
    
    // Clear any existing timeout
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }
    
    // Round to nearest 10px and ensure min/max constraints
    const roundedWidth = Math.round(size.width / 10) * 10;
    const roundedHeight = Math.round(size.height / 10) * 10;
    
    // Get max constraints
    const maxWidth = printSide === 'left' || printSide === 'right' ? MAX_SLEEVE_SIZE : MAX_FRONT_BACK_WIDTH;
    const maxHeight = printSide === 'left' || printSide === 'right' ? MAX_SLEEVE_SIZE : MAX_FRONT_BACK_HEIGHT;
    
    // Apply constraints
    const constrainedSize = {
      width: Math.min(Math.max(roundedWidth, 40), maxWidth),
      height: Math.min(Math.max(roundedHeight, 40), maxHeight)
    };
    
    // Update size based on current side
    switch (printSide) {
      case 'front': setFrontSize(constrainedSize); break;
      case 'back': setBackSize(constrainedSize); break;
      case 'left': setLeftSize(constrainedSize); break;
      case 'right': setRightSize(constrainedSize); break;
    }
    
    // Hide size indicator after delay
    window.resizeTimeout = setTimeout(() => {
      setIsResizing(false);
    }, 1000);
  };
  
  // Update current position based on selected side - with snap to 10px grid
  const handleDrag = (e, data) => {
    // Round to nearest 10px
    const x = Math.round(data.x / 10) * 10;
    const y = Math.round(data.y / 10) * 10;
    
    // Update position based on current side
    switch (printSide) {
      case 'front': setFrontPosition({ x, y }); break;
      case 'back': setBackPosition({ x, y }); break;
      case 'left': setLeftPosition({ x, y }); break;
      case 'right': setRightPosition({ x, y }); break;
    }
  };
  
  // Handle start of drag operation
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle end of drag operation
  const handleDragStop = (e, data) => {
    // Ensure we're updating with the final rounded position
    handleDrag(e, data);
    
    // Hide drag indicator after delay
    setTimeout(() => {
      setIsDragging(false);
    }, 1000);
  };
  
  // Get max size constraints based on selected side
  const getMaxConstraints = () => {
    if (printSide === 'left' || printSide === 'right') {
      return [MAX_SLEEVE_SIZE, MAX_SLEEVE_SIZE];
    }
    return [MAX_FRONT_BACK_WIDTH, MAX_FRONT_BACK_HEIGHT];
  };
  
  // Get individual print areas
  const getIndividualPrintAreas = () => {
    return [
      { 
        side: 'front', 
        area: frontImage ? calculatePrintArea(frontSize).toFixed(1) : 0,
        hasImage: !!frontImage
      },
      { 
        side: 'back', 
        area: backImage ? calculatePrintArea(backSize).toFixed(1) : 0,
        hasImage: !!backImage
      },
      { 
        side: 'left', 
        area: leftImage ? calculatePrintArea(leftSize).toFixed(1) : 0,
        hasImage: !!leftImage
      },
      { 
        side: 'right', 
        area: rightImage ? calculatePrintArea(rightSize).toFixed(1) : 0,
        hasImage: !!rightImage
      }
    ];
  };
  
  // Get active print count
  const getActivePrintCount = () => {
    let count = 0;
    if (frontImage) count++;
    if (backImage) count++;
    if (leftImage) count++;
    if (rightImage) count++;
    return count;
  };
  
  // Get product color from order data
  const getProductColor = () => {
    if (!orderData || !orderData.productData) {
      return 'white';
    }
    
    const color = orderData.productData.selectedColor || '';
    
    // Map color names to CSS colors
    const colorMap = {
      'white': 'white',
      'black': '#222',
      'gray': '#888',
      'blue': '#2563eb',
      'red': '#dc2626',
      'green': '#16a34a',
      'yellow': '#eab308',
      'purple': '#9333ea',
      'pink': '#ec4899',
      'orange': '#f97316',
      'brown': '#78350f'
    };
    
    // Return mapped color or default to white
    return colorMap[color.toLowerCase()] || 'white';
  };
  
  // Get product type from order data
  const getProductType = () => {
    if (!orderData || !orderData.productData) {
      return 'tshirt';
    }
    
    const product = orderData.productData.selectedProduct || '';
    
    if (product.toLowerCase().includes('hoodie')) {
      return 'hoodie';
    } else if (product.toLowerCase().includes('sweatshirt')) {
      return 'sweatshirt';
    } else {
      return 'tshirt';
    }
  };
  
  // Render the appropriate product preview based on product type and side
  const renderProductPreview = () => {
    const productType = getProductType();
    const productColor = getProductColor();
    
    // Common styles
    const containerStyle = { width: '240px', height: '300px' };
    
    // Different product shapes based on type and side
    let productShape;
    
    if (productType === 'hoodie') {
      if (printSide === 'front') {
        productShape = 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 90%, 75% 100%, 25% 100%, 0% 90%, 0% 25%)';
      } else if (printSide === 'back') {
        productShape = 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 90%, 75% 100%, 25% 100%, 0% 90%, 0% 25%)';
      } else if (printSide === 'left') {
        productShape = 'polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%, 10% 50%)';
      } else { // right
        productShape = 'polygon(0% 0%, 70% 0%, 90% 50%, 70% 100%, 0% 100%)';
      }
    } else if (productType === 'sweatshirt') {
      if (printSide === 'front' || printSide === 'back') {
        productShape = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)';
      } else if (printSide === 'left') {
        productShape = 'polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%, 10% 50%)';
      } else { // right
        productShape = 'polygon(0% 0%, 70% 0%, 90% 50%, 70% 100%, 0% 100%)';
      }
    } else { // tshirt
      if (printSide === 'front' || printSide === 'back') {
        productShape = 'polygon(25% 0%, 75% 0%, 90% 20%, 90% 100%, 10% 100%, 10% 20%)';
      } else if (printSide === 'left') {
        productShape = 'polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%, 10% 50%)';
      } else { // right
        productShape = 'polygon(0% 0%, 70% 0%, 90% 50%, 70% 100%, 0% 100%)';
      }
    }
    
    // Print area container
    const printAreaStyle = {
      position: 'absolute',
      width: printSide === 'left' || printSide === 'right' ? `${MAX_SLEEVE_SIZE}px` : `${MAX_FRONT_BACK_WIDTH}px`,
      height: printSide === 'left' || printSide === 'right' ? `${MAX_SLEEVE_SIZE}px` : `${MAX_FRONT_BACK_HEIGHT}px`,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      border: '1px dashed rgba(255, 255, 255, 0.5)',
      overflow: 'hidden'
    };
    
    return (
      <div 
        ref={containerRef}
        style={{
          ...containerStyle,
          position: 'relative',
          margin: '0 auto',
          backgroundColor: '#333',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Product Shape */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: productColor,
            clipPath: productShape,
            position: 'relative'
          }}
        >
          {/* Print Area */}
          <div ref={printAreaRef} style={printAreaStyle}>
            {/* Draggable and Resizable Print */}
            {getCurrentImage() && (
              <Draggable
                position={getCurrentPosition()}
                onStop={handleDragStop}
                onStart={handleDragStart}
                onDrag={handleDrag}
                bounds="parent"
                grid={[10, 10]}
              >
                <ResizableBox
                  width={getCurrentSize().width}
                  height={getCurrentSize().height}
                  onResize={handleResize}
                  minConstraints={[40, 40]}
                  maxConstraints={getMaxConstraints()}
                  resizeHandles={['se']}
                  handle={
                    <div
                      style={{
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        bottom: '0',
                        right: '0',
                        cursor: 'se-resize',
                        background: isDarkMode ? '#0BB489' : '#3B82F6',
                        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                      }}
                    />
                  }
                  className="!absolute cursor-move"
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      border: '2px dashed white',
                      background: `url(${getCurrentImage()}) center/contain no-repeat`
                    }}
                  >
                    {/* Size indicator during resize */}
                    {isResizing && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {currentPrintSize.width}" × {currentPrintSize.height}"
                      </div>
                    )}
                  </div>
                </ResizableBox>
              </Draggable>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Add handler for order completion
  const handleOrderSubmit = async () => {
    try {
      // Ensure we have at least one print
      if (!frontImage && !backImage && !leftImage && !rightImage) {
        setUploadStatus('Please add at least one design');
        setTimeout(() => setUploadStatus(''), 3000);
        return;
      }
      
      // Capture designs if needed
      setUploadStatus('Preparing order...');
      const capturedDesigns = await captureAndUploadAllDesigns();
      
      // Ensure we have required IDs for database insertion
      const ensuredOrderData = { ...orderData };
      
      // Get current user session to get a valid sellerId
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting user session:", sessionError);
        throw new Error("Authentication error. Please log in again.");
      }
      
      if (!session || !session.user) {
        throw new Error("No user session found. Please log in again.");
      }
      
      // Use the current user's ID as the seller ID (this should be a valid reference)
      const currentUserId = session.user.id;
      ensuredOrderData.sellerId = currentUserId;
      console.log("Using current user ID as sellerId:", currentUserId);
      
      // Try to get a valid brandId from the brandsOnboardForm table for the current user
      const { data: brandData, error: brandError } = await supabase
        .from("brandsOnboardForm")
        .select("id")
        .eq("id", currentUserId)
        .single();
        
      if (brandError && brandError.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error("Error fetching brand data:", brandError);
      }
      
      // If the user has a brand registered, use that as brandId
      if (brandData && brandData.id) {
        ensuredOrderData.brandId = brandData.id;
        console.log("Using existing brand ID:", brandData.id);
      } else {
        // If no brand found, we need to create one before we can continue
        setUploadStatus('You need to register a brand before completing an order');
        console.error("No brand found for user. Brand registration required.");
        
        // Alert with a clearer explanation
        alert(
          "Brand Registration Required\n\n" +
          "To complete your order, you need to register your brand with us first. " +
          "This is required for all sellers to ensure we have your brand details for printing. " +
          "You'll be redirected to a quick brand registration form. " +
          "After registering, you'll be able to complete your order."
        );
        
        setTimeout(() => {
          setUploadStatus('Redirecting to brand registration...');
          // Redirect to brand registration form
          if (window.location) {
            setTimeout(() => {
              window.location.href = '/brand/register';
            }, 1500);
          }
        }, 1500);
        return; // Don't proceed with order submission
      }
      
      // Make sure we have an order ID
      if (!ensuredOrderData.orderId || ensuredOrderData.orderId === "") {
        console.log("Generating orderId as it was missing");
        ensuredOrderData.orderId = uuidv4();
      }
      
      // If customer info is missing, create a basic structure
      if (!ensuredOrderData.customerInfo) {
        ensuredOrderData.customerInfo = {
          name: "Test Customer",
          email: "test@example.com",
          phone: "1234567890"
        };
      }
      
      // Mark order as completed
      setOrderData({
        ...ensuredOrderData,
        orderStatus: 'completed',
        paymentStatus: 'completed',
        paymentAmount: 1, // 1 Rs for testing
        paymentCurrency: 'INR',
        paymentDate: new Date().toISOString(),
        orderCompleted: true,
        orderCompletedAt: new Date().toISOString(),
        // Set transaction ID if missing
        transactionId: ensuredOrderData.transactionId || `test_tx_${Date.now()}`
      });
      
      setUploadStatus('Order completed successfully!');
      setTimeout(() => setUploadStatus(''), 3000);
      
      console.log("Order submitted with data:", ensuredOrderData);
      
      // Optionally redirect to confirmation page
      if (window.location && window.location.href.includes('/order')) {
        setTimeout(() => {
          window.location.href = '/order/confirmation';
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error completing order:', error);
      setUploadStatus(`Error completing order: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };
  
  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Print side selection tabs */}
      <div className="flex mb-4">
        {['front', 'back', 'left', 'right'].map((side) => (
          <button
            key={side}
            onClick={() => updatePrintSide(side)}
            className={`px-4 py-2 border-b-2 ${
              printSide === side
                ? isDarkMode
                  ? 'border-secondary text-secondary'
                  : 'border-blue-600 text-blue-600'
                : isDarkMode
                  ? 'border-gray-700 text-gray-400 hover:text-gray-300'
                  : 'border-gray-200 text-gray-600 hover:text-gray-800'
            }`}
          >
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Print size information */}
      <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-gray-50 border border-gray-200'}`}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          Current Size: {currentPrintSize.width}" × {currentPrintSize.height}" 
          (Area: {currentPrintSize.area} sq. in)
        </p>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          Total Print Area: {totalPrintArea} sq. in
        </p>
      </div>
      
      {/* Upload button and status */}
      <div className="mb-4">
        <input
          type="file"
          id="image-upload"
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={`inline-block px-4 py-2 rounded-lg cursor-pointer ${
            isDarkMode
              ? 'bg-dark-4 text-white hover:bg-gray-700'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Upload Image for {printSide.charAt(0).toUpperCase() + printSide.slice(1)}
        </label>
        
        {uploadStatus && (
          <span className={`ml-2 text-sm ${
            uploadStatus.includes('failed')
              ? 'text-red-500'
              : isDarkMode
                ? 'text-green-400'
                : 'text-green-500'
          }`}>
            {uploadStatus}
          </span>
        )}
      </div>
      
      {/* Product preview area */}
      <div 
        className={`relative w-full h-[300px] border ${
          isDarkMode 
            ? 'border-gray-700 bg-dark-4' 
            : 'border-gray-300 bg-gray-100'
        } rounded-lg mb-4 overflow-hidden`}
      >
        {/* T-shirt or product representation - changes color based on selected product */}
        <div className="absolute inset-0 flex items-center justify-center">
          {renderProductPreview()}
        </div>
      </div>
      
      {/* Print area information */}
      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-gray-50 border border-gray-200'}`}>
        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Print Areas:</h4>
        <div className="grid grid-cols-2 gap-2">
          {getIndividualPrintAreas().map(({ side, area, hasImage }) => (
            <div key={side} className={`text-xs ${hasImage ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
              {side.charAt(0).toUpperCase() + side.slice(1)}: {area} sq. in {hasImage ? '✓' : ''}
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            // Reset current side
            switch (printSide) {
              case 'front':
                setFrontImage(null);
                break;
              case 'back':
                setBackImage(null);
                break;
              case 'left':
                setLeftImage(null);
                break;
              case 'right':
                setRightImage(null);
                break;
              default:
                break;
            }
          }}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={!getCurrentImage()}
        >
          Clear {printSide.charAt(0).toUpperCase() + printSide.slice(1)}
        </button>
      </div>
      
      {/* Add order completion button */}
      <button
        onClick={handleOrderSubmit}
        className={`px-6 py-2 rounded-lg font-medium ${
          isDarkMode
            ? 'bg-secondary text-white hover:bg-green-400'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        disabled={isUploading || (!frontImage && !backImage && !leftImage && !rightImage)}
      >
        Complete Order (₹1)
      </button>
    </div>
  );
};

export default PrintDesign;