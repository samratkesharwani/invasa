import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const Inventory = ({ isDarkMode }) => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Predefined products
  const availableProducts = [
    { id: 'tshirt', name: 'T-shirt' },
    { id: 'oversize-tshirt', name: 'Oversize T-shirt' },
    { id: 'hoodie', name: 'Hoodie' },
    { id: 'oversize-hoodie', name: 'Oversize Hoodie' },
    { id: 'sweatshirt', name: 'Sweatshirt' }
  ];
  
  // Predefined colors and sizes
  const availableColors = [
    { id: 'white', name: 'White' },
    { id: 'black', name: 'Black' },
    { id: 'navy', name: 'Navy' },
    { id: 'red', name: 'Red' },
    { id: 'blue', name: 'Blue' },
    { id: 'gray', name: 'Gray' },
    { id: 'green', name: 'Green' },
    { id: 'yellow', name: 'Yellow' },
    { id: 'pink', name: 'Pink' },
    { id: 'purple', name: 'Purple' },
    { id: 'orange', name: 'Orange' }
  ];
  
  const availableSizes = [
    { id: 'xs', name: 'XS' },
    { id: 's', name: 'S' },
    { id: 'm', name: 'M' },
    { id: 'l', name: 'L' },
    { id: 'xl', name: 'XL' },
    { id: 'xxl', name: 'XXL' },
    { id: 'xxxl', name: 'XXXL' }
  ];
  
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          console.error("No user session found.");
          setError("Authentication error. Please log in again.");
          setIsLoading(false);
          return;
        }
        
        // Fetch inventory data
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('brand_id', session.user.id);
          
        if (inventoryError) {
          throw inventoryError;
        }
        
        setInventory(inventoryData || []);
      } catch (error) {
        console.error('Error fetching inventory:', error.message);
        setError('Failed to load inventory data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  // Control body scroll when modals are open
  useEffect(() => {
    // If any modal is open, prevent body scrolling
    if (isModalOpen || isAddModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isAddModalOpen, isDeleteModalOpen]);

  const openModal = (item) => {
    console.log("Opening update modal for item:", item);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log("Closing update modal");
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const openAddModal = () => {
    console.log("Opening add product modal");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    console.log("Closing add product modal");
    setIsAddModalOpen(false);
  };

  const openDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const updateInventory = async (updatedItem) => {
    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          product_name: updatedItem.product_name,
          price: updatedItem.price,
          data: updatedItem.data,
          updated_at: new Date()
        })
        .eq('id', updatedItem.id);
      
      if (error) throw error;
      
      // Update local state
      setInventory(prevItems => 
        prevItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      setSuccess('Inventory updated successfully!');
      closeModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error updating inventory:', error.message);
      setError('Failed to update inventory. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const addInventoryItem = async (newItem) => {
    setAddLoading(true);
    try {
      // Get user ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }
      
      // Find the product name from the availableProducts array
      const product = availableProducts.find(p => p.id === newItem.product_id);
      const productName = product ? product.name : 'Unknown Product';
      
      // Create inventory data structure
      const inventoryData = {
        brand_id: session.user.id,
        product_name: productName,
        price: parseFloat(newItem.price) || 0,
        data: newItem.colorSizeData
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('inventory')
        .insert([inventoryData])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setInventory(prevItems => [...prevItems, data[0]]);
      
      setSuccess('Inventory item added successfully!');
      closeAddModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error adding inventory item:', error.message);
      setError('Failed to add inventory item. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setAddLoading(false);
    }
  };

  const deleteInventoryItem = async (itemId) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
      setInventory(inventory.filter(item => item.id !== itemId));
      
      setSuccess('Inventory item deleted successfully');
      closeDeleteConfirmation();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting inventory item:', error.message);
      setError('Failed to delete inventory item. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading && inventory.length === 0) {
    return (
      <div className={`w-full ${isDarkMode ? 'text-white' : 'text-gray-800'} pb-10`}>
        <div className={`container mt-10 mb-5 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-5 flex justify-center items-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E0A4]"></div>
          <span className="ml-3">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isDarkMode ? 'text-white' : 'text-gray-800'} pb-10`}>
      <div className="container mb-5 rounded-lg p-5">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory Management</h2>
          <button 
            onClick={openAddModal}
            className={`${isDarkMode ? 'text-white' : 'text-gray-900'} bg-[#00E0A4] hover:bg-[#0BB489] font-medium py-2 px-6 rounded-lg transition-all duration-300`}
          >
            Add New Product
          </button>
        </div>
      </div>

      {error && (
        <div className={`container mb-5 ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} p-4 rounded-lg`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`container mb-5 ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'} p-4 rounded-lg`}>
          {success}
        </div>
      )}

      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => (
          <InventoryCard 
            key={item.id} 
            item={item} 
            openModal={openModal} 
            openDeleteConfirmation={openDeleteConfirmation}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {console.log("isModalOpen:", isModalOpen, "selectedItem:", selectedItem)}
      {isModalOpen && selectedItem && (
        <UpdateModal 
          item={selectedItem} 
          closeModal={closeModal} 
          updateInventory={updateInventory} 
          isLoading={updateLoading}
          isDarkMode={isDarkMode}
        />
      )}

      {console.log("isAddModalOpen:", isAddModalOpen)}
      {isAddModalOpen && (
        <AddProductModal 
          closeModal={closeAddModal} 
          addInventoryItem={addInventoryItem} 
          products={availableProducts} 
          colors={availableColors}
          sizes={availableSizes}
          isLoading={addLoading}
          isDarkMode={isDarkMode}
        />
      )}

      {console.log("isDeleteModalOpen:", isDeleteModalOpen, "itemToDelete:", itemToDelete)}
      {isDeleteModalOpen && itemToDelete && (
        <DeleteConfirmationModal 
          item={itemToDelete} 
          closeModal={closeDeleteConfirmation} 
          confirmDelete={deleteInventoryItem} 
          isLoading={deleteLoading}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

const InventoryCard = ({ item, openModal, openDeleteConfirmation, isDarkMode }) => {
  const calculateTotalQuantity = () => {
    if (!item.data || !Array.isArray(item.data)) {
      return 0;
    }
    
    return item.data.reduce((total, colorData) => {
      if (!colorData.sizes) return total;
      
      const colorTotal = Object.values(colorData.sizes).reduce(
        (sum, quantity) => sum + parseInt(quantity || 0, 10), 
        0
      );
      return total + colorTotal;
    }, 0);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const totalQuantity = calculateTotalQuantity();

  return (
    <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f8f9fa] border'}`}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.product_name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(item)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition duration-300"
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteConfirmation(item)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition duration-300"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3 text-white">
          <div className="flex justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Quantity:</span>
            <span className={` font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price:</span>
            <span className="font-medium text-[#00E0A4]">{formatCurrency(item.price)}</span>
          </div>
        </div>

        {item.data && Array.isArray(item.data) && item.data.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm text-gray-400 mb-3">Available Colors & Sizes</h4>
            {item.data.map((colorData, colorIndex) => (
              <div key={colorIndex} className="mb-4">
                <div className="flex items-center mb-2">
                  <div 
                    className={`w-4 h-4 rounded-full mr-2 border-2`}
                    style={{ backgroundColor: colorData.color.toLowerCase() }}
                  ></div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{colorData.color}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 ml-6">
                  {colorData.sizes && Object.entries(colorData.sizes).map(([size, quantity]) => {
                    const quantityValue = parseInt(quantity || 0, 10);
                    return quantityValue > 0 ? (
                      <div key={size} className="text-sm text-gray-300">
                        <span>{size}: {quantity}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ item, closeModal, confirmDelete, isLoading, isDarkMode }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{backdropFilter: 'blur(5px)'}}>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-300'
        } rounded-lg w-full max-w-md p-6 border relative z-10`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Product</h3>
          <button 
            onClick={closeModal}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Are you sure you want to delete "{item.product_name}" from your inventory? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } transition-colors`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => confirmDelete(item.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateModal = ({ item, closeModal, updateInventory, isLoading, isDarkMode }) => {
  // Clone the item to avoid mutating the original
  const [formData, setFormData] = useState(() => {
    const clonedItem = JSON.parse(JSON.stringify(item));
    
    // Ensure data and sizes are properly initialized for each color
    if (clonedItem && clonedItem.data) {
      clonedItem.data = clonedItem.data.map(colorData => ({
        ...colorData,
        // Ensure sizes is always an object
        sizes: colorData.sizes || {}
      }));
    }
    
    return clonedItem;
  });
  
  const handleInputChange = (colorIndex, size, value) => {
    const newData = [...formData.data];
    newData[colorIndex].sizes[size] = value;
    setFormData({ ...formData, data: newData });
  };
  
  const handlePriceChange = (e) => {
    setFormData({ ...formData, price: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateInventory(formData);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{backdropFilter: 'blur(5px)'}}>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-300'
        } rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border p-6 relative z-10`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit {formData.product_name}</h3>
          <button 
            onClick={closeModal}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} text-xl flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
            <div className={`relative rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ₹
              </div>
              <input
                type="number"
                value={formData.price}
                onChange={handlePriceChange}
                step="0.01"
                min="0"
                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-[#00E0A4] focus:border-[#00E0A4]' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#00E0A4] focus:border-[#00E0A4]'
                } focus:outline-none focus:ring-2`}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory by Color & Size</h4>
            {formData.data.map((colorData, colorIndex) => (
              <div key={colorIndex} className={`mb-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-4">
                  <div 
                    className="w-5 h-5 rounded-full mr-2" 
                    style={{ backgroundColor: colorData.color.toLowerCase() }}
                  ></div>
                  <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{colorData.color}</h5>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {colorData.sizes && Object.keys(colorData.sizes).map(size => (
                    <div key={size} className="flex flex-col">
                      <label className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size}</label>
                      <input
                        type="number"
                        value={colorData.sizes[size]}
                        onChange={(e) => handleInputChange(colorIndex, size, e.target.value)}
                        min="0"
                        className={`w-full px-3 py-2 rounded border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white focus:ring-[#00E0A4] focus:border-[#00E0A4]' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-[#00E0A4] focus:border-[#00E0A4]'
                        } focus:outline-none focus:ring-2`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition-colors`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#00E0A4] hover:bg-[#0BB489] text-black font-medium px-4 py-2 rounded-lg transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddProductModal = ({ 
  closeModal, 
  addInventoryItem, 
  products, 
  colors: availableColors,
  sizes: availableSizes,
  isLoading,
  isDarkMode
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    price: '',
    colors: [],
    sizes: [],
    colorSizeData: []
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const addColor = () => {
    const colorSelect = document.getElementById('colorSelect');
    if (!colorSelect) return;
    
    const selectedColor = colorSelect.value;
    
    if (selectedColor && !formData.colors.includes(selectedColor)) {
      const newColors = [...formData.colors, selectedColor];
      const newColorSizeData = [...formData.colorSizeData];
      
      // Add new color data with empty sizes
      newColorSizeData.push({
        color: selectedColor,
        sizes: (formData.sizes || []).reduce((acc, size) => {
          acc[size] = "0";
          return acc;
        }, {})
      });
      
      setFormData({ 
        ...formData, 
        colors: newColors, 
        colorSizeData: newColorSizeData 
      });
      
      // Reset the select element
      colorSelect.value = '';
    }
  };
  
  const removeColor = (color) => {
    const newColors = formData.colors.filter(c => c !== color);
    const newColorSizeData = (formData.colorSizeData || []).filter(data => data.color !== color);
    
    setFormData({
      ...formData,
      colors: newColors,
      colorSizeData: newColorSizeData
    });
  };
  
  const addSize = () => {
    const sizeSelect = document.getElementById('sizeSelect');
    if (!sizeSelect) return;
    
    const selectedSize = sizeSelect.value;
    
    if (selectedSize && !formData.sizes.includes(selectedSize)) {
      const newSizes = [...formData.sizes, selectedSize];
      const newColorSizeData = (formData.colorSizeData || []).map(colorData => {
        const newSizesObj = { ...(colorData.sizes || {}) };
        newSizesObj[selectedSize] = "0";
        return {
          ...colorData,
          sizes: newSizesObj
        };
      });
      
      setFormData({
        ...formData,
        sizes: newSizes,
        colorSizeData: newColorSizeData
      });
      
      // Reset the select element
      sizeSelect.value = '';
    }
  };
  
  const removeSize = (size) => {
    const newSizes = formData.sizes.filter(s => s !== size);
    const newColorSizeData = (formData.colorSizeData || []).map(colorData => {
      const newSizesObj = { ...(colorData.sizes || {}) };
      if (newSizesObj && size in newSizesObj) {
        delete newSizesObj[size];
      }
      return {
        ...colorData,
        sizes: newSizesObj
      };
    });
    
    setFormData({
      ...formData,
      sizes: newSizes,
      colorSizeData: newColorSizeData
    });
  };
  
  const handleQuantityChange = (colorIndex, size, value) => {
    // Validate the value is a non-negative number
    const numValue = parseInt(value, 10) >= 0 ? value : "0";
    
    const newColorSizeData = [...formData.colorSizeData];
    if (newColorSizeData[colorIndex]) {
      if (!newColorSizeData[colorIndex].sizes) {
        newColorSizeData[colorIndex].sizes = {};
      }
      newColorSizeData[colorIndex].sizes[size] = numValue;
      setFormData({
        ...formData,
        colorSizeData: newColorSizeData
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product_id || !formData.price) {
      console.error("Missing required fields");
      return;
    }
    
    // Validate colors and sizes
    if (!formData.colors || formData.colors.length === 0) {
      console.error("At least one color is required");
      return;
    }
    
    if (!formData.sizes || formData.sizes.length === 0) {
      console.error("At least one size is required");
      return;
    }
    
    // Validate color-size data
    if (!formData.colorSizeData || formData.colorSizeData.length === 0) {
      console.error("Color-size data is required");
      return;
    }
    
    // Check if any size has a quantity greater than 0
    const hasInventory = formData.colorSizeData.some(colorData => {
      if (!colorData.sizes) return false;
      return Object.values(colorData.sizes).some(quantity => parseInt(quantity, 10) > 0);
    });
    
    if (!hasInventory) {
      console.error("At least one size must have a quantity greater than 0");
      return;
    }
    
    // Format the data before submission if needed
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      colorSizeData: formData.colorSizeData.map(colorData => ({
        color: colorData.color,
        sizes: colorData.sizes || {}
      }))
    };
    
    // Submit the data
    addInventoryItem(submissionData);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{backdropFilter: 'blur(5px)'}}>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className={`w-full max-w-2xl rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} relative z-10`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl font-bold`}>Add New Product</h2>
          <button 
            onClick={closeModal} 
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Product Type</label>
            <select 
              name="product_id" 
              value={formData.product_id} 
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-black bg-white border-gray-300'}`}
              required
            >
              <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} value="">Select Product</option>
              {products && products.map(product => (
                <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Price</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white' : ' text-gray-900'}`}
              placeholder="Enter price" 
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Add Colors</label>
            <div className="flex items-center">
              <select 
                id="colorSelect" 
                className={`flex-1 px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-black'}`}
              >
                <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} value="">Select Color</option>
                {availableColors && availableColors.map(color => (
                  !formData.colors.includes(color.name) && (
                    <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} key={color.id} value={color.name}>
                      {color.name}
                    </option>
                  )
                ))}
              </select>
              <button 
                type="button" 
                onClick={addColor}
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.colors && formData.colors.map(color => (
                <div 
                  key={color}
                  className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded"
                >
                  <span>{color}</span>
                  <button 
                    type="button"
                    onClick={() => removeColor(color)}
                    className="ml-1 text-blue-800 hover:text-blue-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Add Sizes</label>
            <div className="flex items-center">
              <select 
                id="sizeSelect" 
                className={`flex-1 px-3 py-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
              >
                <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} value="">Select Size</option>
                {availableSizes && availableSizes.map(size => (
                  !formData.sizes.includes(size.name) && (
                    <option className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`} key={size.id} value={size.name}>
                      {size.name}
                    </option>
                  )
                ))}
              </select>
              <button 
                type="button" 
                onClick={addSize}
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.sizes && formData.sizes.map(size => (
                <div 
                  key={size}
                  className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded"
                >
                  <span>{size}</span>
                  <button 
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-1 text-green-800 hover:text-green-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Color-Size Quantity Matrix */}
          {formData.colors && formData.colors.length > 0 && formData.sizes && formData.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="block mb-2 text-sm font-medium">Set Quantities</h3>
              <div className={`border rounded overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <th className="px-4 py-2 text-left">Color</th>
                      {formData.sizes.map(size => (
                        <th key={size} className="px-4 py-2 text-center">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.colorSizeData && formData.colorSizeData.map((colorData, index) => (
                      <tr key={colorData.color} className={`${isDarkMode ? 'border-t border-gray-600' : 'border-t border-gray-200'}`}>
                        <td className="px-4 py-2 font-medium">{colorData.color}</td>
                        {formData.sizes && formData.sizes.map(size => (
                          <td key={size} className="px-4 py-2 text-center">
                            <input 
                              type="number" 
                              value={colorData.sizes && colorData.sizes[size] ? colorData.sizes[size] : "0"} 
                              onChange={(e) => handleQuantityChange(index, size, e.target.value)}
                              className={`w-16 px-2 py-1 text-center border rounded ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                              min="0"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={closeModal}
              className={`px-4 py-2 mr-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00E0A4] text-black rounded hover:bg-[#0BB489] flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding
                </>
              ) : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;

