import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FiEye, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, [filter]);

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('businessOnboardForm')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setSellers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sellerId, newStatus) => {
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('businessOnboardForm')
        .update({ status: newStatus })
        .eq('id', sellerId);
      
      if (error) throw error;
      
      // Update local state
      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, status: newStatus } : seller
      ));
      
      // Close modal if open
      if (showModal && selectedSeller?.id === sellerId) {
        setSelectedSeller({ ...selectedSeller, status: newStatus });
      }
    } catch (err) {
      alert(`Error updating seller status: ${err.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ViewModal = ({ seller, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-2 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-dark-2 z-10">
          <h2 className="text-xl font-semibold text-white">Seller Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Business Info */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Business Information</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Business Name</p>
                  <p className="text-white">{seller.businessName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Owner Name</p>
                  <p className="text-white">{seller.ownerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{seller.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Contact Number</p>
                  <p className="text-white">{seller.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Registration Date</p>
                  <p className="text-white">{formatDate(seller.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                    seller.status === 'approved' ? 'bg-green-900 text-green-200' :
                    seller.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {seller.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Address Info */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Address Information</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              <p className="text-white">{seller.address || 'N/A'}</p>
              <p className="text-white">{seller.city || 'N/A'}, {seller.state || 'N/A'} {seller.pincode || 'N/A'}</p>
            </div>
          </div>
          
          {/* Business Details */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Business Details</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Business Type</p>
                  <p className="text-white">{seller.businessType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">GST Number</p>
                  <p className="text-white">{seller.gstNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">PAN Number</p>
                  <p className="text-white">{seller.panNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Years in Business</p>
                  <p className="text-white">{seller.yearsInBusiness || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
            {seller.status !== 'approved' && (
              <button
                onClick={() => handleStatusChange(seller.id, 'approved')}
                disabled={processingAction}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheck className="mr-2" /> Approve Seller
              </button>
            )}
            {seller.status !== 'rejected' && (
              <button
                onClick={() => handleStatusChange(seller.id, 'rejected')}
                disabled={processingAction}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="mr-2" /> Reject Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Sellers Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={20} />
          <span>Error loading sellers: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-dark-2 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sellers.length > 0 ? (
        <div className="bg-dark-2 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-3">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Business Name</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id} className="border-t border-gray-800 hover:bg-dark-3 transition-colors">
                    <td className="p-4 text-white">{seller.businessName || 'N/A'}</td>
                    <td className="p-4 text-white">{seller.ownerName || 'N/A'}</td>
                    <td className="p-4 text-white">{seller.contactNumber || 'N/A'}</td>
                    <td className="p-4 text-white">{formatDate(seller.created_at)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        seller.status === 'approved' ? 'bg-green-900 text-green-200' :
                        seller.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {seller.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setShowModal(true);
                        }}
                        className="text-secondary hover:text-secondary-light"
                        aria-label="View seller details"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-dark-2 rounded-lg p-8 text-center">
          <p className="text-gray-400">No sellers found</p>
        </div>
      )}

      {showModal && selectedSeller && (
        <ViewModal
          seller={selectedSeller}
          onClose={() => {
            setShowModal(false);
            setSelectedSeller(null);
          }}
        />
      )}
    </div>
  );
};

export default Sellers; 