import React, { useState, useEffect } from 'react';

// Design Preview Component - Shows interactive design preview similar to PrintDesign
const DesignPreview = ({ prints, productType = 'tshirt' }) => {
  const [activeSide, setActiveSide] = useState('front');
  const [containerColor, setContainerColor] = useState('#333');
  const PIXELS_PER_INCH = 16;
  
  // Constants for size constraints (in pixels for the UI, representing inches)
  const MAX_FRONT_BACK_WIDTH = 12 * PIXELS_PER_INCH; // 12 inches = 192px
  const MAX_FRONT_BACK_HEIGHT = 16 * PIXELS_PER_INCH; // 16 inches = 256px
  const MAX_SLEEVE_SIZE = 4 * PIXELS_PER_INCH; // 4x4 inches = 64px
  
  // Scale factor to ensure designs are properly sized relative to the print area
  const SCALE_FACTOR = 1.0; // Use natural scaling to match the original design interface
  
  // Add a debug mode to show positioning details
  const [showPositioningDetails, setShowPositioningDetails] = useState(false);
  
  // Get the active print based on the selected side
  const getActivePrint = () => {
    if (!prints || prints.length === 0) return null;
    
    return prints.find(print => {
      const position = print.position?.toLowerCase() || print.side?.toLowerCase() || '';
      return position.includes(activeSide.toLowerCase());
    });
  };
  
  // Get product color based on product type
  const getProductColor = () => {
    // This function can be modified or removed if you want to use the fetched color only
    return containerColor; // Use the fetched container color instead
  };
  
  // Get background image based on print position and product type
  const getBackgroundImage = (position) => {
    // Normalize position to lowercase for case-insensitive comparison
    const normalizedPosition = position ? position.toLowerCase() : '';
    const normalizedProductType = productType ? productType.toLowerCase() : 'tshirt';
    
    // Use hardcoded paths to ensure they're correct
    if (normalizedProductType.includes('tshirt') || normalizedProductType.includes('t-shirt')) {
      if (normalizedPosition.includes('front')) {
        return '/images/tshirt-front.svg';
      } else if (normalizedPosition.includes('back')) {
        return '/images/tshirt-back.svg';
      } else if (normalizedPosition.includes('left')) {
        return '/images/tshirt-left.svg';
      } else if (normalizedPosition.includes('right')) {
        return '/images/tshirt-right.svg';
      }
    }
    
    return null;
  };
  
  // Get the print area dimensions based on the active side
  const getPrintAreaDimensions = () => {
    if (activeSide === 'left' || activeSide === 'right') {
      return {
        width: `${MAX_SLEEVE_SIZE}px`,
        height: `${MAX_SLEEVE_SIZE}px`,
        maxWidth: `${MAX_SLEEVE_SIZE}px`,
        maxHeight: `${MAX_SLEEVE_SIZE}px`
      };
    } else {
      return {
        width: `${MAX_FRONT_BACK_WIDTH}px`,
        height: `${MAX_FRONT_BACK_HEIGHT}px`,
        maxWidth: `${MAX_FRONT_BACK_WIDTH}px`,
        maxHeight: `${MAX_FRONT_BACK_HEIGHT}px`
      };
    }
  };
  
  // Fetch color from the database
  const fetchContainerColor = async () => {
    try {
      const response = await fetch('/api/getColor'); // Adjust the API endpoint as needed
      const data = await response.json();
      setContainerColor(data.color || '#333'); // Default to #333 if no color is returned
    } catch (error) {
      console.error('Error fetching color:', error);
      setContainerColor('#333'); // Fallback color
    }
  };

  useEffect(() => {
    fetchContainerColor(); // Fetch color on component mount
  }, []);
  
  // Container style for the preview
  const containerStyle = {
    position: 'relative',
    width: '240px',
    height: '300px',
    backgroundColor: containerColor, // Ensure this is the fetched color
    border: '1px solid #444',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };
  
  // Get the active print for the current side
  const activePrint = getActivePrint();
  
  // Calculate print style for positioning
  const getPrintStyle = (print) => {
    if (!print) return {};
    
    // If this is a captured design, just display it as is
    if (print.isCaptured) {
      return {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${print.image})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 10
      };
    }
    
    // Calculate the position relative to the print area
    // We need to adjust the position to match the print area dimensions
    const printAreaWidth = activeSide === 'left' || activeSide === 'right' ? MAX_SLEEVE_SIZE : MAX_FRONT_BACK_WIDTH;
    const printAreaHeight = activeSide === 'left' || activeSide === 'right' ? MAX_SLEEVE_SIZE : MAX_FRONT_BACK_HEIGHT;
    
    // Use the original x, y coordinates from the print data
    // These are relative to the original container in the design phase
    const x = print.x;
    const y = print.y;
    
    // Use the original width and height
    const width = print.width;
    const height = print.height;
    
    return {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundImage: `url(${print.image})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transform: `rotate(${print.rotation || 0}deg) scale(${print.scale || 1})`,
      transformOrigin: 'center',
      pointerEvents: 'none',
      zIndex: 10,
      border: showPositioningDetails ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
    };
  };
  
  // Get available sides from prints
  const getAvailableSides = () => {
    if (!prints || prints.length === 0) return [];
    
    return prints.map(print => {
      const position = print.position?.toLowerCase() || print.side?.toLowerCase() || '';
      if (position.includes('front')) return 'front';
      if (position.includes('back')) return 'back';
      if (position.includes('left')) return 'left';
      if (position.includes('right')) return 'right';
      return null;
    }).filter(Boolean);
  };
  
  const availableSides = getAvailableSides();
  const printAreaDimensions = getPrintAreaDimensions();
  
  // Get product shape based on product type and side
  const getProductShape = () => {
    if (activeSide === 'left') {
      return 'polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%, 10% 50%)';
    } else if (activeSide === 'right') {
      return 'polygon(0% 0%, 70% 0%, 90% 50%, 70% 100%, 0% 100%)';
    } else if (activeSide === 'front' || activeSide === 'back') {
      return 'polygon(25% 0%, 75% 0%, 90% 20%, 90% 100%, 10% 100%, 10% 20%)';
    }
    return 'polygon(25% 0%, 75% 0%, 90% 20%, 90% 100%, 10% 100%, 10% 20%)';
  };
  
  return (
    <div className="design-preview bg-dark-3 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-medium">Design Preview</h3>
        <button 
          className={`text-xs px-2 py-1 rounded ${showPositioningDetails ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setShowPositioningDetails(!showPositioningDetails)}
        >
          {showPositioningDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {/* Side selection buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableSides.includes('front') && (
          <button
            className={`px-3 py-1 rounded ${activeSide === 'front' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveSide('front')}
          >
            Front
          </button>
        )}
        {availableSides.includes('back') && (
          <button
            className={`px-3 py-1 rounded ${activeSide === 'back' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveSide('back')}
          >
            Back
          </button>
        )}
        {availableSides.includes('left') && (
          <button
            className={`px-3 py-1 rounded ${activeSide === 'left' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveSide('left')}
          >
            Left Sleeve
          </button>
        )}
        {availableSides.includes('right') && (
          <button
            className={`px-3 py-1 rounded ${activeSide === 'right' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveSide('right')}
          >
            Right Sleeve
          </button>
        )}
      </div>
      
      {/* Design preview container */}
      <div 
        style={{
          ...containerStyle,
          position: 'relative',
          margin: '0 auto',
        }}
      >
        {activePrint?.isCaptured ? (
          // If it's a captured design, just show it directly
          <div style={getPrintStyle(activePrint)} />
        ) : (
          <>
            {/* Product Shape */}
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: getProductColor(),
                clipPath: getProductShape(),
                position: 'relative'
              }}
            >
              {/* Print Area */}
              <div 
                style={{
                  position: 'absolute',
                  width: activeSide === 'left' || activeSide === 'right' ? `${MAX_SLEEVE_SIZE}px` : `${MAX_FRONT_BACK_WIDTH}px`,
                  height: activeSide === 'left' || activeSide === 'right' ? `${MAX_SLEEVE_SIZE}px` : `${MAX_FRONT_BACK_HEIGHT}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: '1px dashed rgba(255, 255, 255, 0.5)',
                  overflow: 'visible'
                }}
              >
                {/* Print design overlay */}
                {activePrint && activePrint.image && (
                  <div style={getPrintStyle(activePrint)} />
                )}
                
                {/* Positioning grid (only shown when details are enabled) */}
                {showPositioningDetails && (
                  <div className="positioning-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 4 }}>
                    {/* Horizontal lines */}
                    <div style={{ position: 'absolute', top: '25%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div style={{ position: 'absolute', top: '75%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    
                    {/* Vertical lines */}
                    <div style={{ position: 'absolute', top: 0, left: '25%', width: '1px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div style={{ position: 'absolute', top: 0, left: '50%', width: '1px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div style={{ position: 'absolute', top: 0, left: '75%', width: '1px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Print information */}
      {activePrint && (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-gray-300">Position: <span className="text-white">{activePrint.position}</span></p>
          <p className="text-gray-300">Size: <span className="text-white">
            {(activePrint.width / PIXELS_PER_INCH).toFixed(1)}" × {(activePrint.height / PIXELS_PER_INCH).toFixed(1)}"
          </span></p>
          <p className="text-gray-300">Area: <span className="text-white">
            {activePrint.area} sq in
          </span></p>
          
          {/* Show positioning details when enabled */}
          {showPositioningDetails && (
            <>
              <p className="text-gray-300">X Position: <span className="text-white">{activePrint.x}px</span></p>
              <p className="text-gray-300">Y Position: <span className="text-white">{activePrint.y}px</span></p>
              <p className="text-gray-300">Rotation: <span className="text-white">{activePrint.rotation || 0}°</span></p>
              <p className="text-gray-300">Scale: <span className="text-white">{activePrint.scale || 1}x</span></p>
            </>
          )}
        </div>
      )}
      
      {!activePrint && (
        <div className="mt-3 text-center py-2">
          <p className="text-gray-400 text-sm">No design available for {activeSide} side</p>
        </div>
      )}
      
      {/* Size constraints and positioning instructions */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <p className="text-gray-400 text-xs mb-1">
          {activeSide === 'left' || activeSide === 'right' 
            ? `Maximum sleeve print size: 4 x 4 inches` 
            : `Maximum front/back print size: 12 x 16 inches`
          }
        </p>
        <p className="text-gray-400 text-xs">
          This preview shows exactly how the buyer positioned the design. Use the "Show Details" button to see precise positioning information.
        </p>
      </div>
    </div>
  );
};

export default DesignPreview; 