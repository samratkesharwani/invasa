import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const Inventory = () => {
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
      <div className="w-full text-white pb-10">
        <div className="container mt-10 mb-5 rounded-lg dark:bg-dark-2 p-5 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          <span className="ml-3">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white pb-10">
      <div className="container mt-10 mb-5 rounded-lg dark:bg-dark-2 p-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Inventory Management</h2>
          <button 
            onClick={openAddModal}
            className="bg-secondary hover:bg-[#0BB489] text-white font-medium py-2 px-4 rounded"
          >
            Add New Product
          </button>
        </div>
        
        {/* Success Message */}
        {success && (
          <div className="mt-4 bg-green-800 text-green-100 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
      
      {inventory.length === 0 ? (
        <div className="container rounded-lg dark:bg-dark-2 p-10 text-center">
          <p className="text-gray-400 mb-4">No inventory items found.</p>
          <button 
            onClick={openAddModal}
            className="bg-secondary hover:bg-[#0BB489] text-white font-medium py-2 px-4 rounded"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              openModal={openModal} 
              openDeleteConfirmation={openDeleteConfirmation}
            />
          ))}
        </div>
      )}
      
      {isModalOpen && selectedItem && (
        <UpdateModal 
          item={selectedItem} 
          closeModal={closeModal} 
          updateInventory={updateInventory}
          isLoading={updateLoading}
        />
      )}
      
      {isAddModalOpen && (
        <AddProductModal
          closeModal={closeAddModal}
          addInventoryItem={addInventoryItem}
          products={availableProducts}
          isLoading={addLoading}
        />
      )}

      {isDeleteModalOpen && itemToDelete && (
        <DeleteConfirmationModal
          item={itemToDelete}
          closeModal={closeDeleteConfirmation}
          confirmDelete={deleteInventoryItem}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
};

const InventoryCard = ({ item, openModal, openDeleteConfirmation }) => {
  const calculateTotalQuantity = () => {
    if (!item.data || !Array.isArray(item.data)) return 0;
    
    let total = 0;
    item.data.forEach(colorData => {
      if (colorData && typeof colorData === 'object') {
        Object.keys(colorData).forEach(key => {
          if (key !== 'color' && key !== 'price') {
            total += parseInt(colorData[key] || 0, 10);
          }
        });
      }
    });
    
    return total;
  };
  
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white text-lg font-semibold">{item.product_name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal(item)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteConfirmation(item)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="text-gray-300 mb-2">
        <div className="flex justify-between mb-1">
          <span>Total Quantity:</span>
          <span>{calculateTotalQuantity()}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Price:</span>
          <span className="text-green-400 font-medium">{formatCurrency(item.price)}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <h4 className="text-gray-400 text-sm mb-2">Available Colors & Sizes</h4>
        <div className="space-y-2">
          {item.data && Array.isArray(item.data) && item.data.map((colorData, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center mb-1">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: colorData.color.toLowerCase() }}
                ></div>
                <span className="text-white">{colorData.color}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pl-6">
                {Object.keys(colorData).filter(key => key !== 'color' && key !== 'price').map(size => (
                  <div key={size} className="text-gray-400">
                    {size}: <span className="text-white">{colorData[size]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ item, closeModal, confirmDelete, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-800 bg-opacity-75">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold">{item.product_name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeModal}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => confirmDelete(item.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateModal = ({ item, closeModal, updateInventory, isLoading }) => {
  const [updatedItem, setUpdatedItem] = useState(item);
  const [price, setPrice] = useState(item.price || 0);

  const handleInputChange = (colorIndex, size, value) => {
    const newData = [...updatedItem.data];
    newData[colorIndex][size] = parseInt(value, 10) || 0;
    setUpdatedItem({ ...updatedItem, data: newData });
  };
  
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value === '' ? 0 : Number(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateInventory({ 
      ...updatedItem, 
      price,
      product_name: updatedItem.product_name
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-xl font-semibold mb-4">Update Inventory: {updatedItem.product_name}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-white mb-2">Product Price</label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white px-3 py-2 rounded-l-md">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={handlePriceChange}
                className="bg-gray-700 text-white px-3 py-2 rounded-r-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-white text-lg mb-3">Inventory by Color & Size</h3>
            
            {updatedItem.data.map((colorData, colorIndex) => (
              <div key={colorIndex} className="mb-6 bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: colorData.color.toLowerCase() }}
                  ></div>
                  <h4 className="text-white font-medium">{colorData.color}</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(colorData).filter(key => key !== 'color' && key !== 'price').map(size => (
                    <div key={size} className="mb-2">
                      <label className="block text-gray-300 text-sm mb-1">{size}</label>
                      <input
                        type="number"
                        min="0"
                        value={colorData[size]}
                        onChange={(e) => handleInputChange(colorIndex, size, e.target.value)}
                        className="bg-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Inventory'}
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
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    price: '',
    colors: [],
    sizes: [],
    colorSizeData: []
  });
  
  // Add state for input fields
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addColor = () => {
    const color = colorInput.trim();
    
    if (color && !formData.colors.includes(color)) {
      const newColors = [...formData.colors, color];
      
      // Update colorSizeData with the new color
      const newColorSizeData = [...formData.colorSizeData];
      const colorData = { color };
      
      // Add size fields
      formData.sizes.forEach(size => {
        colorData[size] = 0;
      });
      
      newColorSizeData.push(colorData);
      
      setFormData(prev => ({
        ...prev,
        colors: newColors,
        colorSizeData: newColorSizeData
      }));
      
      // Clear input
      setColorInput('');
    }
  };
  
  const removeColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color),
      colorSizeData: prev.colorSizeData.filter(data => data.color !== color)
    }));
  };
  
  const addSize = () => {
    const size = sizeInput.trim().toUpperCase();
    
    if (size && !formData.sizes.includes(size)) {
      const newSizes = [...formData.sizes, size];
      
      // Update colorSizeData with the new size
      const newColorSizeData = [...formData.colorSizeData];
      newColorSizeData.forEach(colorData => {
        colorData[size] = 0;
      });
      
      setFormData(prev => ({
        ...prev,
        sizes: newSizes,
        colorSizeData: newColorSizeData
      }));
      
      // Clear input
      setSizeInput('');
    }
  };
  
  const removeSize = (size) => {
    // Remove size from all color data
    const newColorSizeData = [...formData.colorSizeData];
    newColorSizeData.forEach(colorData => {
      delete colorData[size];
    });
    
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size),
      colorSizeData: newColorSizeData
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      alert('Please select a product');
      return;
    }
    
    if (formData.colors.length === 0) {
      alert('Please add at least one color');
      return;
    }
    
    if (formData.sizes.length === 0) {
      alert('Please add at least one size');
      return;
    }
    
    addInventoryItem(formData);
  };
  
  const handleQuantityChange = (colorIndex, size, value) => {
    const newColorSizeData = [...formData.colorSizeData];
    newColorSizeData[colorIndex][size] = parseInt(value, 10) || 0;
    
    setFormData(prev => ({
      ...prev,
      colorSizeData: newColorSizeData
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-xl font-semibold mb-4">Add New Inventory Item</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Product Selection */}
          <div className="mb-4">
            <label className="block text-white mb-2">Select Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="bg-gray-700 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              <option value="tshirt">T-shirt</option>
              <option value="oversize-tshirt">Oversize T-shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="oversize-hoodie">Oversize Hoodie</option>
              <option value="sweatshirt">Sweatshirt</option>
            </select>
          </div>
          
          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-white mb-2">Product Price</label>
            <div className="flex items-center">
              <span className="bg-gray-700 text-white px-3 py-2 rounded-l-md">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="bg-gray-700 text-white px-3 py-2 rounded-r-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
            </div>
          </div>
          
          {/* Colors Section */}
          <div className="mb-4">
            <label className="block text-white mb-2">Add Colors</label>
            <div className="flex space-x-2 mb-2">
              <select
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a color</option>
                <option value="White">White</option>
                <option value="Black">Black</option>
                <option value="Navy">Navy</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Gray">Gray</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Pink">Pink</option>
                <option value="Purple">Purple</option>
                <option value="Orange">Orange</option>
              </select>
              <button
                type="button"
                onClick={addColor}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.colors.map(color => (
                <div key={color} className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center">
                  <span>{color}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sizes Section */}
          <div className="mb-4">
            <label className="block text-white mb-2">Add Sizes</label>
            <div className="flex space-x-2 mb-2">
              <select
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
              <button
                type="button"
                onClick={addSize}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sizes.map(size => (
                <div key={size} className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center">
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Inventory Grid */}
          {formData.colors.length > 0 && formData.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg mb-3">Set Inventory Quantities</h3>
              
              {formData.colorSizeData.map((colorData, colorIndex) => (
                <div key={colorIndex} className="mb-4 bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{colorData.color}</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.sizes.map(size => (
                      <div key={size} className="mb-2">
                        <label className="block text-gray-300 text-sm mb-1">{size}</label>
                        <input
                          type="number"
                          min="0"
                          value={colorData[size] || 0}
                          onChange={(e) => handleQuantityChange(colorIndex, size, e.target.value)}
                          className="bg-gray-600 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Inventory Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;

