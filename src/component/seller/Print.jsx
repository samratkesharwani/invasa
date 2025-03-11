import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import tshirtFront from "../../imgs/frontTshirt.png";
import backTshirt from "../../imgs/backTshirt.png";
import tshirtLeftSide from "../../imgs/tshirtLeftSide.png";
import tshirtRightSide from "../../imgs/tshirtRightSide.png";
import { supabase } from "../../utils/supabase";

const Print = () => {
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
  const [totalPrintSize, setTotalPrintSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });
  const [saveTimeout, setSaveTimeout] = useState(null);
  
  // Resize state for showing size indicator
  const [isResizing, setIsResizing] = useState(false);
  
  // References
  const printAreaRef = useRef(null);

  // Get user session on component mount
  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        loadPrintData(session.user.id);
      }
    };
    
    fetchUserSession();
  }, []);

  // Load existing print data
  const loadPrintData = async (userId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prints')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error("Error loading print data:", error);
        return;
      }
      
      if (data) {
        // Set images if they exist
        if (data.front_image) setFrontImage(data.front_image);
        if (data.back_image) setBackImage(data.back_image);
        if (data.left_image) setLeftImage(data.left_image);
        if (data.right_image) setRightImage(data.right_image);
        
        // Set sizes if they exist
        if (data.front_size) setFrontSize(data.front_size);
        if (data.back_size) setBackSize(data.back_size);
        if (data.left_size) setLeftSize(data.left_size);
        if (data.right_size) setRightSize(data.right_size);
        
        // Set positions if they exist
        if (data.front_position) setFrontPosition(data.front_position);
        if (data.back_position) setBackPosition(data.back_position);
        if (data.left_position) setLeftPosition(data.left_position);
        if (data.right_position) setRightPosition(data.right_position);
      }
    } catch (err) {
      console.error("Error loading print data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save changes with debounce
  const autoSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    setSaveStatus({ message: "Saving changes...", type: "info" });
    
    const timeout = setTimeout(async () => {
      if (!userId) return;
      
      try {
        const printData = {
          user_id: userId,
          front_image: frontImage,
          back_image: backImage,
          left_image: leftImage,
          right_image: rightImage,
          front_size: frontSize,
          back_size: backSize,
          left_size: leftSize,
          right_size: rightSize,
          front_position: frontPosition,
          back_position: backPosition,
          left_position: leftPosition,
          right_position: rightPosition,
          total_print_size: totalPrintSize,
          updated_at: new Date()
        };
        
        const { error } = await supabase
          .from('prints')
          .upsert(printData, { onConflict: 'user_id' });
          
        if (error) {
          throw error;
        }
        
        setSaveStatus({ message: "All changes saved", type: "success" });
        
        setTimeout(() => {
          setSaveStatus({ message: "", type: "" });
        }, 3000);
      } catch (err) {
        console.error("Error saving print data:", err);
        setSaveStatus({ message: "Error saving changes", type: "error" });
      }
    }, 1000);
    
    setSaveTimeout(timeout);
  };

  // Calculate total print size whenever any size changes
  useEffect(() => {
    const calculateTotalSize = () => {
      const frontArea = frontImage ? (frontSize.width / DPI) * (frontSize.height / DPI) : 0;
      const backArea = backImage ? (backSize.width / DPI) * (backSize.height / DPI) : 0;
      const leftArea = leftImage ? (leftSize.width / DPI) * (leftSize.height / DPI) : 0;
      const rightArea = rightImage ? (rightSize.width / DPI) * (rightSize.height / DPI) : 0;
      
      const total = frontArea + backArea + leftArea + rightArea;
      setTotalPrintSize(total);
    };
    
    calculateTotalSize();
    
    if (userId && (frontImage || backImage || leftImage || rightImage)) {
      autoSave();
    }
  }, [frontSize, backSize, leftSize, rightSize, frontImage, backImage, leftImage, rightImage]);

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

  return (
    <div className="container mx-auto p-4 text-center bg-gray-800 dark:bg-dark-2 rounded-lg text-white">
      <h1 className="font-bold mb-4 text-xl">Design Your Print</h1>
      
      {/* Save Status Indicator */}
      {saveStatus.message && (
        <div className={`mb-4 py-2 px-4 rounded-md ${
          saveStatus.type === "success" ? "bg-green-800 text-green-100" : 
          saveStatus.type === "error" ? "bg-red-800 text-red-100" : 
          "bg-blue-800 text-blue-100"
        }`}>
          {saveStatus.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Upload Your Design</h2>
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
            {getCurrentImage() && <span className="ml-3">Image uploaded!</span>}
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            Upload your design to place on the product. Drag the corners to resize.
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Print Location</h2>
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
        </div>
      </div>

      {/* Print Preview */}
      <div className="relative mx-auto w-96 h-96 mt-6 border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
        {/* T-Shirt Image */}
        <img src={getTshirtImage()} alt="T-Shirt" className="w-full h-full object-contain" style={{ zIndex: 1 }} />

        {/* Print Area */}
        <div ref={printAreaRef} className="print-area" style={getPrintAreaStyle()}>
          {getCurrentImage() && (
            <>
              <Rnd
                size={getCurrentSize()}
                position={getCurrentPosition()}
                onDragStop={(e, d) => {
                  updateCurrentPosition({ x: d.x, y: d.y });
                }}
                onResizeStart={() => setIsResizing(true)}
                onResize={() => setIsResizing(true)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateCurrentSize({
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height)
                  });
                  updateCurrentPosition(position);
                  
                  // Hide size indicator after a delay
                  setTimeout(() => {
                    setIsResizing(false);
                  }, 1500);
                }}
                bounds="parent"
                minWidth={20}
                minHeight={20}
                maxWidth={getMaxSize()}
                maxHeight={getMaxSize()}
                style={{
                  border: '2px dashed white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 20
                }}
                resizeHandleStyles={{
                  bottomRight: {
                    width: '24px',
                    height: '24px',
                    background: 'white',
                    borderRadius: '50%',
                    border: '3px solid #333',
                    zIndex: 30,
                    right: '-12px',
                    bottom: '-12px'
                  }
                }}
                enableResizing={{
                  bottomRight: true,
                  bottomLeft: false,
                  topRight: false,
                  topLeft: false,
                  top: false,
                  right: false,
                  bottom: false,
                  left: false
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
              </Rnd>
            </>
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
      
      <p className="text-sm text-gray-400 mt-2">
        {view === "left" || view === "right" 
          ? `Maximum sleeve print size: ${sleeveInches} x ${sleeveInches} inches` 
          : `Maximum front/back print size: ${printWidthInches} x ${printHeightInches} inches`}
      </p>
    </div>
  );
};

export default Print;