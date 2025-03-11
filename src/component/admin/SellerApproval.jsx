import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const SellerApproval = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Fetch sellers based on status filter
  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setSellers(data || []);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellers();
  }, [statusFilter]);

  // Handle seller status change
  const handleStatusChange = async (sellerId, newStatus) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: newStatus })
        .eq('id', sellerId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, status: newStatus } : seller
      ));
      
      // Close modal if open
      if (showModal) {
        setShowModal(false);
      }
      
    } catch (error) {
      console.error('Error updating seller status:', error);
      alert('Failed to update seller status');
    }
  };

  // View seller details
  const viewSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seller Approval</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded ${statusFilter === 'approved' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded ${statusFilter === 'rejected' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Rejected
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading sellers...</p>
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-xl">No sellers found with status: {statusFilter}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{seller.businessName}</div>
                    <div className="text-sm text-gray-400">{seller.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{seller.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{seller.contactNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(seller.status)}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => viewSellerDetails(seller)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      View
                    </button>
                    
                    {seller.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(seller.id, 'approved')}
                          className="text-green-400 hover:text-green-300 mr-3"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusChange(seller.id, 'rejected')}
                          className="text-red-400 hover:text-red-300"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {seller.status === 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(seller.id, 'rejected')}
                        className="text-red-400 hover:text-red-300"
                      >
                        Suspend
                      </button>
                    )}
                    
                    {seller.status === 'rejected' && (
                      <button 
                        onClick={() => handleStatusChange(seller.id, 'approved')}
                        className="text-green-400 hover:text-green-300"
                      >
                        Reinstate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Seller Details Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Seller Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Information</h3>
                <div className="bg-gray-700 p-4 rounded">
                  <p><span className="text-gray-400">Name:</span> {selectedSeller.businessName}</p>
                  <p><span className="text-gray-400">Email:</span> {selectedSeller.email}</p>
                  <p><span className="text-gray-400">GST Number:</span> {selectedSeller.gstNumber || 'Not provided'}</p>
                  <p><span className="text-gray-400">Address:</span> {selectedSeller.address || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Owner Information</h3>
                <div className="bg-gray-700 p-4 rounded">
                  <p><span className="text-gray-400">Name:</span> {selectedSeller.ownerName}</p>
                  <p><span className="text-gray-400">Contact:</span> {selectedSeller.contactNumber}</p>
                  <p><span className="text-gray-400">ID Proof:</span> {selectedSeller.idProof || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Business Description</h3>
              <div className="bg-gray-700 p-4 rounded">
                <p>{selectedSeller.description || 'No description provided'}</p>
              </div>
            </div>
            
            {selectedSeller.documents && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Documents</h3>
                <div className="bg-gray-700 p-4 rounded">
                  {/* Display document links if available */}
                  {selectedSeller.documents.map((doc, index) => (
                    <div key={index} className="mb-2">
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {doc.name || `Document ${index + 1}`}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              {selectedSeller.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(selectedSeller.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedSeller.id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {selectedSeller.status === 'approved' && (
                <button 
                  onClick={() => handleStatusChange(selectedSeller.id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Suspend
                </button>
              )}
              
              {selectedSeller.status === 'rejected' && (
                <button 
                  onClick={() => handleStatusChange(selectedSeller.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Reinstate
                </button>
              )}
              
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApproval; 