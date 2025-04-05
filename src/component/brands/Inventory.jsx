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
    'White', 'Black', 'Navy', 'Red', 'Blue',
    'Gray', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'
  ];
  
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
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

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
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
            className="bg-[#00E0A4] hover:bg-[#0BB489] text-black font-medium py-2 px-6 rounded-lg transition-all duration-300"
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

      {isModalOpen && selectedItem && (
        <UpdateModal 
          item={selectedItem} 
          closeModal={closeModal} 
          updateInventory={updateInventory} 
          isLoading={updateLoading}
          isDarkMode={isDarkMode}
        />
      )}

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
    let total = 0;
    if (item.data && Array.isArray(item.data)) {
      item.data.forEach(colorData => {
        Object.keys(colorData.sizes || {}).forEach(size => {
          total += parseInt(colorData.sizes[size] || 0, 10);
        });
      });
    }
    return total;
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
                  {Object.entries(colorData.sizes || {}).map(([size, quantity]) => (
                    parseInt(quantity, 10) > 0 && (
                      <div key={size} className="text-sm text-gray-300">
                        <span>{size}: {quantity}</span>
                      </div>
                    )
                  ))}
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-300'
        } rounded-lg w-full max-w-md p-6 border`}>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Product</h3>
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
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(item)));
  
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-300'
        } rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit {formData.product_name}</h3>
          <button 
            onClick={closeModal}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} text-xl`}
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
                  {Object.keys(colorData.sizes).map(size => (
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
    const selectedColor = colorSelect.value;
    
    if (selectedColor && !formData.colors.includes(selectedColor)) {
      const newColors = [...formData.colors, selectedColor];
      const newColorSizeData = [...formData.colorSizeData];
      
      // Add new color data with empty sizes
      newColorSizeData.push({
        color: selectedColor,
        sizes: formData.sizes.reduce((acc, size) => {
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
    const newColorSizeData = formData.colorSizeData.filter(data => data.color !== color);
    
    setFormData({
      ...formData,
      colors: newColors,
      colorSizeData: newColorSizeData
    });
  };
  
  const addSize = () => {
    const sizeSelect = document.getElementById('sizeSelect');
    const selectedSize = sizeSelect.value;
    
    if (selectedSize && !formData.sizes.includes(selectedSize)) {
      const newSizes = [...formData.sizes, selectedSize];
      const newColorSizeData = formData.colorSizeData.map(colorData => {
        const newSizes = { ...colorData.sizes };
        newSizes[selectedSize] = "0";
        return {
          ...colorData,
          sizes: newSizes
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
    const newColorSizeData = formData.colorSizeData.map(colorData => {
      const newSizes = { ...colorData.sizes };
      delete newSizes[size];
      return {
        ...colorData,
        sizes: newSizes
      };
    });
    
    setFormData({
      ...formData,
      sizes: newSizes,
      colorSizeData: newColorSizeData
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.colors.length === 0 || formData.sizes.length === 0) {
      alert('Please add at least one color and one size.');
      return;
    }
    
    addInventoryItem(formData);
  };
  
  const handleQuantityChange = (colorIndex, size, value) => {
    const newColorSizeData = [...formData.colorSizeData];
    newColorSizeData[colorIndex].sizes[size] = value;
    
    setFormData({
      ...formData,
      colorSizeData: newColorSizeData
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-300'
        } rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Product</h3>
          <button 
            onClick={closeModal}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} text-xl`}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Type</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-[#00E0A4] focus:border-[#00E0A4]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-[#00E0A4] focus:border-[#00E0A4]'
                } focus:outline-none focus:ring-2`}
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
              <div className={`relative rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ₹
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
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
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Colors</label>
              <div className="flex space-x-2">
                <select 
                  id="colorSelect" 
                  className={`px-3 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select a color</option>
                  {availableColors.filter(color => !formData.colors.includes(color)).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={addColor}
                  className="bg-[#00E0A4] hover:bg-[#0BB489] text-black px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.colors.map(color => (
                <div 
                  key={color} 
                  className={`flex items-center space-x-2 px-3 py-1 rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color.toLowerCase() }}
                  ></div>
                  <span>{color}</span>
                  <button 
                    type="button" 
                    onClick={() => removeColor(color)}
                    className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sizes</label>
              <div className="flex space-x-2">
                <select 
                  id="sizeSelect" 
                  className={`px-3 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select a size</option>
                  {availableSizes.filter(size => !formData.sizes.includes(size)).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={addSize}
                  className="bg-[#00E0A4] hover:bg-[#0BB489] text-black px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map(size => (
                <div 
                  key={size} 
                  className={`flex items-center space-x-2 px-3 py-1 rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <span>{size}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSize(size)}
                    className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {formData.colors.length > 0 && formData.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory Quantities</h4>
              
              {formData.colorSizeData.map((colorData, colorIndex) => (
                <div key={colorIndex} className={`mb-6 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-5 h-5 rounded-full mr-2" 
                      style={{ backgroundColor: colorData.color.toLowerCase() }}
                    ></div>
                    <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{colorData.color}</h5>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.keys(colorData.sizes).map(size => (
                      <div key={size} className="flex flex-col">
                        <label className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size}</label>
                        <input
                          type="number"
                          value={colorData.sizes[size]}
                          onChange={(e) => handleQuantityChange(colorIndex, size, e.target.value)}
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
          )}
          
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

