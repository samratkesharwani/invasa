import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Dialog } from '@headlessui/react';
import DesignPreview from './DesignPreview';
import PrintDesign from '../seller/order/PrintDesign';

// Fixed PrintPreview Component - Shows exact positioning of designs with grid lines
const PrintPreview = ({ print, productType = 'tshirt', isDarkMode = true }) => {
  // Constants for display
  const PIXELS_PER_INCH = 16;
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '300px',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    border: isDarkMode ? '1px solid #333' : '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  // Get product color based on product type
  const getProductColor = () => {
    if (productType.toLowerCase().includes('black')) {
      return '#222';
    } else if (productType.toLowerCase().includes('white')) {
      return '#f8f8f8';
    } else if (productType.toLowerCase().includes('gray')) {
      return '#888';
    } else if (productType.toLowerCase().includes('blue')) {
      return '#2563eb';
    } else if (productType.toLowerCase().includes('red')) {
      return '#dc2626';
    } else {
      return '#f8f8f8'; // Default to white
    }
  };

  // Get background image based on print position and product type
  const getBackgroundImage = (position, productType) => {
    // Normalize position to lowercase for case-insensitive comparison
    const normalizedPosition = position ? position.toLowerCase() : '';
    
    // Default to T-Shirt if productType is not specified or is empty
    const normalizedProductType = productType ? productType.toLowerCase() : 'tshirt';
    
    console.log("Getting background image for:", { normalizedPosition, normalizedProductType });
    
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
    
    // Log if no matching template was found
    console.log("No matching template found for position:", normalizedPosition);
    return null;
  };

  // Calculate print position and size relative to container
  const getPrintStyle = () => {
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
    
    // Otherwise, use the stored position and size from the order data
    // Convert from pixels to percentage for responsive positioning
    const containerWidth = 300;
    const containerHeight = 300;
    
    const xPercent = (print.x / containerWidth) * 100;
    const yPercent = (print.y / containerHeight) * 100;
    
    return {
      position: 'absolute',
      left: `${xPercent}%`,
      top: `${yPercent}%`,
      width: `${print.width / PIXELS_PER_INCH}rem`,
      height: `${print.height / PIXELS_PER_INCH}rem`,
      backgroundImage: `url(${print.image})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transform: `rotate(${print.rotation || 0}deg) scale(${print.scale || 1})`,
      transformOrigin: 'center',
      pointerEvents: 'none', // Prevent interaction
      zIndex: 10 // Ensure design is above the product
    };
  };

  // Fallback if no background image is available
  const renderFallbackProduct = () => {
    const position = print.position.toLowerCase();
    let shape = 'rectangle';
    
    if (position.includes('sleeve')) {
      shape = 'circle';
    }
    
    return (
      <div 
        style={{
          width: shape === 'circle' ? '120px' : '200px',
          height: shape === 'circle' ? '120px' : '240px',
          backgroundColor: getProductColor(),
          borderRadius: shape === 'circle' ? '50%' : '8px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <span className="text-xs text-gray-500">{print.position}</span>
      </div>
    );
  };

  // Function to create grid lines
  const renderGridLines = () => {
    const gridLines = [];
    const gridSize = 25; // Size of each grid square in pixels
    const numHorizontalLines = Math.floor(300 / gridSize);
    const numVerticalLines = Math.floor(300 / gridSize);
    
    // Horizontal grid lines
    for (let i = 1; i < numHorizontalLines; i++) {
      gridLines.push(
        <div
          key={`h-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            top: `${i * gridSize}px`,
            width: '100%',
            height: '1px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            zIndex: 3
          }}
        />
      );
    }
    
    // Vertical grid lines
    for (let i = 1; i < numVerticalLines; i++) {
      gridLines.push(
        <div
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: `${i * gridSize}px`,
            top: 0,
            width: '1px',
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            zIndex: 3
          }}
        />
      );
    }
    
    // Center crosshair (optional)
    gridLines.push(
      <div
        key="crosshair-h"
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '100%',
          height: '1px',
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          zIndex: 4
        }}
      />
    );
    
    gridLines.push(
      <div
        key="crosshair-v"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '1px',
          height: '100%',
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          zIndex: 4
        }}
      />
    );
    
    return gridLines;
  };

  return (
    <div className="print-preview">
      <div style={containerStyle}>
        {/* Grid lines */}
        {renderGridLines()}
        
        {/* If this is a captured design, just show it directly */}
        {print.isCaptured ? (
          <div style={getPrintStyle()} />
        ) : (
          <>
            {/* Product background */}
            <div 
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: getProductColor(),
                zIndex: 1
              }}
            />
            
            {/* Product template image */}
            {getBackgroundImage(print.position, productType) ? (
              <img 
                src={getBackgroundImage(print.position, productType)} 
                alt={`${print.position} template`} 
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 5
                }}
                onError={(e) => {
                  console.error(`Error loading image: ${e.target.src}`);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {renderFallbackProduct()}
              </div>
            )}
            
            {/* Print design overlay */}
            {print.image && (
              <div style={getPrintStyle()} />
            )}
            
            {/* Add position indicators */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '10px',
              zIndex: 15
            }}>
              (0,0)
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '10px',
              zIndex: 15
            }}>
              (300,0)
            </div>
            
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '10px',
              zIndex: 15
            }}>
              (0,300)
            </div>
            
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '10px',
              zIndex: 15
            }}>
              (300,300)
            </div>
          </>
        )}
      </div>
      
      <div className="mt-3 space-y-1 text-sm">
        <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Position: <span className={isDarkMode ? "text-white" : "text-black"}>{print.position}</span></p>
        <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Coordinates: <span className={isDarkMode ? "text-white" : "text-black"}>
          x: {Math.round(print.x)}, y: {Math.round(print.y)}
        </span></p>
        {!print.isCaptured && (
          <>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Size: <span className={isDarkMode ? "text-white" : "text-black"}>
              {(print.width / PIXELS_PER_INCH).toFixed(1)}" × {(print.height / PIXELS_PER_INCH).toFixed(1)}"
            </span></p>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Area: <span className={isDarkMode ? "text-white" : "text-black"}>
              {print.area} sq in
            </span></p>
          </>
        )}
        {print.isCaptured && (
          <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}><span className="text-green-400 font-medium">✓ Captured Design</span></p>
        )}
      </div>
    </div>
  );
};

const OrdersComponent = ({ sellerId, isDarkMode = true }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showPrintDesign, setShowPrintDesign] = useState(false);
  const [orderData, setOrderData] = useState({});
  const [printData, setPrintData] = useState([]);

  useEffect(() => {
    checkSellerStatus();
  }, [sellerId]);

  // Check if the seller is approved (status is not pending)
  const checkSellerStatus = async () => {
    try {
      setLoading(true);
      console.log("Checking seller status for sellerId:", sellerId);
      
      const { data, error } = await supabase
        .from('businessOnboardForm')
        .select('status')
        .eq('id', sellerId)
        .single();
      
      if (error) throw error;
      
      console.log("Seller status data:", data);
      setSellerStatus(data.status);
      
      // If status is approved, fetch orders
      if (data.status === 'approved') {
        setIsApproved(true);
        fetchOrders();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking seller status:', error);
      setLoading(false);
    }
  };

    const fetchOrders = async () => {
      try {
      console.log("Fetching orders for sellerId:", sellerId);
      
      const { data, error } = await supabase
          .from('orders')
          .select('*')
        .eq('sellerId', sellerId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      console.log("Orders data:", data);
      
      // Process orders to extract print images
      const processedOrders = data.map(order => {
        const printImages = [];
        const productType = order.productData?.selectedProduct || 'T-Shirt';
        
        console.log(`Processing order ${order.id} with product type: ${productType}`);
        
        // First check for capturedDesigns (highest priority)
        if (order.productData && order.productData.capturedDesigns && Array.isArray(order.productData.capturedDesigns)) {
          console.log("Found capturedDesigns array in order:", order.id);
          
          order.productData.capturedDesigns.forEach((design, index) => {
            if (design.capturedImage) {
              console.log(`Captured design ${index} position: ${design.position}, image: ${design.capturedImage.substring(0, 50)}...`);
              
              printImages.push({
                position: design.position,
                image: design.capturedImage,
                width: design.width || 100,
                height: design.height || 100,
                area: design.area || 0,
                x: design.x || 150,
                y: design.y || 150,
                rotation: design.rotation || 0,
                scale: design.scale || 1,
                productType: productType,
                isCaptured: true
              });
            }
          });
        }
        
        // If no captured designs, check for printData (second priority)
        if (printImages.length === 0 && order.productData && order.productData.printData && Array.isArray(order.productData.printData)) {
          console.log("Found printData array in order:", order.id);
          
          // Extract print data from the printData array
          order.productData.printData.forEach((print, index) => {
            if (print.image) {
              // Normalize position to one of our standard positions
              let normalizedPosition = print.position || print.side || 'Front';
              
              // Convert to standard position names
              if (normalizedPosition.toLowerCase().includes('front')) {
                normalizedPosition = 'Front';
              } else if (normalizedPosition.toLowerCase().includes('back')) {
                normalizedPosition = 'Back';
              } else if (normalizedPosition.toLowerCase().includes('left')) {
                normalizedPosition = 'Left';
              } else if (normalizedPosition.toLowerCase().includes('right')) {
                normalizedPosition = 'Right';
              }
              
              console.log(`Print ${index} position: ${normalizedPosition}, image: ${print.image.substring(0, 50)}...`);
              
              printImages.push({
                position: normalizedPosition,
                image: print.image,
                width: print.width || 100,
                height: print.height || 100,
                area: print.area || 0,
                x: print.x || 150,
                y: print.y || 150,
                rotation: print.rotation || 0,
                scale: print.scale || 1,
                productType: productType
              });
            }
          });
        }
        
        // If still no images, check for productData.prints (lowest priority)
        if (printImages.length === 0 && order.productData && order.productData.prints) {
          console.log("Found prints object in order:", order.id);
          const { frontPrint, backPrint, leftSidePrint, rightSidePrint } = order.productData.prints;
          
          if (frontPrint && frontPrint.image) {
            console.log(`Front print image: ${frontPrint.image.substring(0, 50)}...`);
            printImages.push({
              position: 'Front',
              image: frontPrint.image,
              width: (frontPrint.size?.width || 0) * 16 || 100,
              height: (frontPrint.size?.height || 0) * 16 || 100,
              area: frontPrint.area || 0,
              x: frontPrint.position?.x || 150,
              y: frontPrint.position?.y || 150,
              rotation: 0,
              scale: 1,
              productType: productType
            });
          }
          
          if (backPrint && backPrint.image) {
            console.log(`Back print image: ${backPrint.image.substring(0, 50)}...`);
            printImages.push({
              position: 'Back',
              image: backPrint.image,
              width: (backPrint.size?.width || 0) * 16 || 100,
              height: (backPrint.size?.height || 0) * 16 || 100,
              area: backPrint.area || 0,
              x: backPrint.position?.x || 150,
              y: backPrint.position?.y || 150,
              rotation: 0,
              scale: 1,
              productType: productType
            });
          }
          
          if (leftSidePrint && leftSidePrint.image) {
            console.log(`Left print image: ${leftSidePrint.image.substring(0, 50)}...`);
            printImages.push({
              position: 'Left',
              image: leftSidePrint.image,
              width: (leftSidePrint.size?.width || 0) * 16 || 100,
              height: (leftSidePrint.size?.height || 0) * 16 || 100,
              area: leftSidePrint.area || 0,
              x: leftSidePrint.position?.x || 150,
              y: leftSidePrint.position?.y || 150,
              rotation: 0,
              scale: 1,
              productType: productType
            });
          }
          
          if (rightSidePrint && rightSidePrint.image) {
            console.log(`Right print image: ${rightSidePrint.image.substring(0, 50)}...`);
            printImages.push({
              position: 'Right',
              image: rightSidePrint.image,
              width: (rightSidePrint.size?.width || 0) * 16 || 100,
              height: (rightSidePrint.size?.height || 0) * 16 || 100,
              area: rightSidePrint.area || 0,
              x: rightSidePrint.position?.x || 150,
              y: rightSidePrint.position?.y || 150,
              rotation: 0,
              scale: 1,
              productType: productType
            });
          }
        }
        
        if (printImages.length > 0) {
          console.log(`Extracted ${printImages.length} print images for order:`, order.id);
        } else {
          console.log("No print images found for order:", order.id);
        }
        
        return {
          ...order,
          printImages
        };
      });
      
      setOrders(processedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const markAsReadyToDeliver = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'ready_to_deliver' })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'ready_to_deliver' } 
          : order
      ));
      
      closeModal();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Function to download print image
  const downloadPrintImage = async (imageUrl, position) => {
    if (!imageUrl) {
      console.error("No image URL provided for download");
      alert("Cannot download: Image URL is missing");
      return;
    }

    console.log("Attempting to download image:", imageUrl);
    
    // Open in new tab as the most reliable method
    window.open(imageUrl, '_blank');
    
    // Also try direct download as a secondary method
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `print-${position.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error with direct download:', error);
      // Already opened in new tab as fallback
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch(status?.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-200 text-yellow-800`;
      case 'processing':
        return `${baseClasses} bg-blue-200 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-green-200 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-200 text-red-800`;
      case 'approved':
        return `${baseClasses} bg-green-200 text-green-800`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // If currently viewing this order in the modal, update the selected order as well
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      alert(`Order status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowPrintDesign = () => {
    setShowPrintDesign(true);
  };

  const handleHidePrintDesign = () => {
    setShowPrintDesign(false);
  };

  return (
    <div className={isDarkMode ? "p-6 bg-dark-1 min-h-screen" : "p-6 bg-gray-100 min-h-screen"}>
      <h1 className={isDarkMode ? "text-2xl font-bold text-white mb-6" : "text-2xl font-bold text-gray-900 mb-6"}>Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : !isApproved ? (
        <div className={isDarkMode ? "text-center py-12 bg-dark-2 rounded-lg p-6" : "text-center py-12 bg-white rounded-lg p-6 shadow"}>
          <div className={getStatusBadgeClass(sellerStatus)} style={{display: 'inline-block', marginBottom: '12px'}}>
            {sellerStatus || 'Unknown'}
          </div>
          <p className={isDarkMode ? "text-gray-300 text-lg mb-2" : "text-gray-700 text-lg mb-2"}>Your business account is not yet approved</p>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>You will be able to view orders once your account is approved by the admin.</p>
          <p className={isDarkMode ? "text-gray-500 mt-4" : "text-gray-500 mt-4"}>Seller ID: {sellerId}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={isDarkMode ? "text-center py-12 bg-dark-2 rounded-lg" : "text-center py-12 bg-white rounded-lg shadow"}>
          <p className={isDarkMode ? "text-gray-400 text-lg" : "text-gray-600 text-lg"}>No orders found</p>
          <p className={isDarkMode ? "text-gray-500 mt-2" : "text-gray-500 mt-2"}>Seller ID: {sellerId}</p>
        </div>
      ) : (
        <div className={isDarkMode ? "bg-dark-2 rounded-lg overflow-hidden" : "bg-white rounded-lg shadow overflow-hidden"}>
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-700'}`}>
              <thead className={isDarkMode ? "bg-dark-3" : "bg-gray-50"}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Order ID</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Customer</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Product</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Prints</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={isDarkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}>
                {orders.map((order) => (
                  <tr key={order.id} className={isDarkMode ? "hover:bg-dark-4" : "hover:bg-gray-50"}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>#{order.id}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatDate(order.date)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.customerInfo?.customerName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.productData?.selectedProduct}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {order.printImages && order.printImages.length > 0 ? (
                          order.printImages.slice(0, 2).map((print, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={print.image} 
                                alt={`${print.position} Print`} 
                                className={`h-10 w-10 object-cover rounded border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 text-center rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                                {print.position}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className={isDarkMode ? "text-gray-500 text-sm" : "text-gray-400 text-sm"}>No prints</span>
                        )}
                        {order.printImages && order.printImages.length > 2 && (
                          <div className={`h-10 w-10 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-200'} rounded flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                            +{order.printImages.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(order.status)}>{order.status || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openModal(order)}
                        className="text-secondary hover:text-[#0BB489] transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view - cards */}
          <div className="block md:hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className={`p-4 ${isDarkMode ? 'hover:bg-dark-4' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-secondary">#{order.id}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(order.date)}</div>
                    </div>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className={`mb-3 mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center">
                      <span className={`w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer:</span>
                      <span className="flex-1 truncate">{order.customerInfo?.customerName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product:</span>
                      <span className="flex-1">{order.productData?.selectedProduct || 'N/A'}</span>
                    </div>
                    {order.printImages && order.printImages.length > 0 && (
                      <div className="flex items-center mt-1">
                        <span className={`w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prints:</span>
                        <div className="flex space-x-2">
                          {order.printImages.slice(0, 3).map((print, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={print.image} 
                                alt={`${print.position}`} 
                                className={`h-8 w-8 object-cover rounded border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                              />
                            </div>
                          ))}
                          {order.printImages.length > 3 && (
                            <div className={`h-8 w-8 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-200'} rounded flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                              +{order.printImages.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => openModal(order)}
                      className="text-secondary hover:text-[#0BB489] transition-colors duration-200 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

          <div className={isDarkMode ? "bg-dark-2 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10" : "bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-xl"}>
            {selectedOrder && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className={isDarkMode ? "text-xl md:text-2xl font-bold text-white" : "text-xl md:text-2xl font-bold text-gray-900"}>
                    Order Details
                  </Dialog.Title>
                  <button
                    onClick={closeModal}
                    className={isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div className={isDarkMode ? "bg-dark-3 p-4 rounded-lg" : "bg-gray-50 p-4 rounded-lg"}>
                    <h3 className={isDarkMode ? "text-lg font-semibold text-white mb-3" : "text-lg font-semibold text-gray-900 mb-3"}>Order Information</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Order ID: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.id}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Date: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{formatDate(selectedOrder.date)}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Status: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.status || 'Unknown'}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>City: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.selectedCity}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Payment: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.paymentAmount || 'N/A'}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Transaction ID: <span className={isDarkMode ? "text-white font-mono text-xs md:text-sm" : "text-gray-900 font-mono text-xs md:text-sm"}>{selectedOrder.transactionId || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className={isDarkMode ? "bg-dark-3 p-4 rounded-lg" : "bg-gray-50 p-4 rounded-lg"}>
                    <h3 className={isDarkMode ? "text-lg font-semibold text-white mb-3" : "text-lg font-semibold text-gray-900 mb-3"}>Customer Information</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Name: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.customerInfo?.customerName}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Contact: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.customerInfo?.customerContact}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Address: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.fullAddress?.address}</span></p>
                      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Pincode: <span className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.fullAddress?.pincode}</span></p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className={isDarkMode ? "bg-dark-3 p-4 rounded-lg mb-6" : "bg-gray-50 p-4 rounded-lg mb-6"}>
                  <h3 className={isDarkMode ? "text-lg font-semibold text-white mb-3" : "text-lg font-semibold text-gray-900 mb-3"}>Product Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm md:text-base">
                    <div>
                      <p className={isDarkMode ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>Product</p>
                      <p className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.productData?.selectedProduct || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={isDarkMode ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>Color</p>
                      <p className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.productData?.selectedColor || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={isDarkMode ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>Size</p>
                      <p className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.productData?.selectedSize || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={isDarkMode ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>Quantity</p>
                      <p className={isDarkMode ? "text-white" : "text-gray-900"}>{selectedOrder.productData?.quantity || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Print Designs */}
                <div className={isDarkMode ? "bg-dark-3 p-4 rounded-lg mb-6" : "bg-gray-50 p-4 rounded-lg mb-6"}>
                  <h3 className={isDarkMode ? "text-lg font-semibold text-white mb-3" : "text-lg font-semibold text-gray-900 mb-3"}>Print Designs</h3>
                  
                  {/* Add the DesignPreview component */}
                  {selectedOrder.printImages && selectedOrder.printImages.length > 0 ? (
                    <div className="mb-6">
                      <DesignPreview 
                        prints={selectedOrder.printImages} 
                        productType={selectedOrder.productData?.selectedProduct || 'tshirt'} 
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ) : null}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedOrder.printImages && selectedOrder.printImages.length > 0 ? (
                      selectedOrder.printImages.map((print, index) => (
                        <div key={index} className={isDarkMode ? "bg-dark-4 p-4 rounded-lg" : "bg-gray-100 p-4 rounded-lg"}>
                          <h4 className={isDarkMode ? "text-white font-medium mb-2" : "text-gray-900 font-medium mb-2"}>{print.position}</h4>
                          
                          {/* Print Preview Component */}
                          <div className="aspect-w-1 aspect-h-1">
                            <PrintPreview 
                              print={print} 
                              productType={print.productType} 
                              isDarkMode={isDarkMode}
                            />
                          </div>
                          
                          <button
                            onClick={() => downloadPrintImage(print.image, print.position)}
                            className="w-full mt-4 bg-secondary hover:bg-[#0BB489] text-white px-3 py-2 text-sm md:text-base rounded transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Print
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No print designs available for this order</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                    className={`px-4 py-2 rounded font-medium text-sm md:text-base ${
                      selectedOrder.status === 'processing' || selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    Mark as Processing
                  </button>
                  
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    disabled={selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                    className={`px-4 py-2 rounded font-medium text-sm md:text-base ${
                      selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Mark as Completed
                  </button>
                  
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    disabled={selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                    className={`px-4 py-2 rounded font-medium text-sm md:text-base ${
                      selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>

      
      {showPrintDesign && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleHidePrintDesign}>&times;</span>
            <PrintDesign setOrderData={setOrderData} orderData={orderData} printData={printData} isDarkMode={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersComponent;
