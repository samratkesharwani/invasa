import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

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
  
  // Update current size based on selected side
  const handleResize = (e, { size }) => {
    setIsResizing(true);
    
    // Clear any existing timeout
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }
    
    // Ensure size is within constraints
    const maxConstraints = getMaxConstraints();
    const constrainedSize = {
      width: Math.min(Math.max(size.width, 40), maxConstraints[0]),
      height: Math.min(Math.max(size.height, 40), maxConstraints[1])
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
    }, 1500);
  };
  
  // Update current position based on selected side
  const handleDrag = (e, data) => {
    // Update position based on current side
    switch (printSide) {
      case 'front': setFrontPosition({ x: data.x, y: data.y }); break;
      case 'back': setBackPosition({ x: data.x, y: data.y }); break;
      case 'left': setLeftPosition({ x: data.x, y: data.y }); break;
      case 'right': setRightPosition({ x: data.x, y: data.y }); break;
    }
  };
  
  // Handle start of drag operation
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle end of drag operation
  const handleDragStop = (e, data) => {
    // Ensure we're updating with the final position
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
                bounds="parent"
                grid={[1, 1]}
                defaultPosition={{x: 0, y: 0}}
                scale={1}
              >
                <div style={{ position: 'absolute', cursor: 'move' }}>
                  <ResizableBox
                    width={getCurrentSize().width}
                    height={getCurrentSize().height}
                    onResize={handleResize}
                    minConstraints={[40, 40]}
                    maxConstraints={getMaxConstraints()}
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
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: getCurrentImage() 
                          ? `url(${getCurrentImage()}) center/cover no-repeat` 
                          : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        cursor: 'move',
                        position: 'relative'
                      }}
                    >
                      {/* Drag handle indicator */}
                      <div 
                        className="drag-handle-indicator"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          opacity: isDragging ? 0.8 : 0,
                          transition: 'opacity 0.3s',
                          pointerEvents: 'none'
                        }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <path d="M10,9A1,1 0 0,1 11,8A1,1 0 0,1 12,9A1,1 0 0,1 11,10A1,1 0 0,1 10,9M10,13A1,1 0 0,1 11,12A1,1 0 0,1 12,13A1,1 0 0,1 11,14A1,1 0 0,1 10,13M10,17A1,1 0 0,1 11,16A1,1 0 0,1 12,17A1,1 0 0,1 11,18A1,1 0 0,1 10,17M14,9A1,1 0 0,1 15,8A1,1 0 0,1 16,9A1,1 0 0,1 15,10A1,1 0 0,1 14,9M14,13A1,1 0 0,1 15,12A1,1 0 0,1 16,13A1,1 0 0,1 15,14A1,1 0 0,1 14,13M14,17A1,1 0 0,1 15,16A1,1 0 0,1 16,17A1,1 0 0,1 15,18A1,1 0 0,1 14,17Z" />
                        </svg>
                      </div>
                      
                      {/* Size indicator during resize */}
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
                          {currentPrintSize.width}" × {currentPrintSize.height}" ({currentPrintSize.area} sq in)
                        </div>
                      )}
                    </div>
                  </ResizableBox>
                </div>
              </Draggable>
            )}
          </div>
        </div>
      </div>
    );
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
        ref={containerRef}
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
        
        {/* Current print overlay */}
        {getCurrentImage() && (
          <Draggable
            bounds="parent"
            position={getCurrentPosition()}
            onStart={handleDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
            disabled={isResizing}
          >
            <ResizableBox
              width={getCurrentSize().width}
              height={getCurrentSize().height}
              minConstraints={[20, 20]}
              maxConstraints={getMaxConstraints()}
              onResize={handleResize}
              onResizeStart={() => setIsResizing(true)}
              onResizeStop={() => setIsResizing(false)}
              className="!absolute cursor-move"
              resizeHandles={['se']}
              handle={
                <div className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${
                  isDarkMode ? 'bg-secondary' : 'bg-blue-600'
                }`}></div>
              }
            >
              <img
                src={getCurrentImage()}
                alt={`${printSide} print`}
                className="w-full h-full object-contain"
              />
            </ResizableBox>
          </Draggable>
        )}
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
    </div>
  );
};

export default PrintDesign;