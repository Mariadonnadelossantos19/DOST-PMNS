import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, DataTable, Modal, Input, Textarea } from '../UI';

const ProponentManagement = ({ currentUser }) => {
   const [proponents, setProponents] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedProponent, setSelectedProponent] = useState(null);
   const [showModal, setShowModal] = useState(false);
   const [modalAction, setModalAction] = useState(''); // 'activate', 'deactivate', 'reset-password'
   const [newPassword, setNewPassword] = useState('');
   const [resetReason, setResetReason] = useState('');
   const [actionLoading, setActionLoading] = useState(false);
   const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'pending', 'inactive'

   // Fetch all proponents for the PSTO's province
   const fetchProponents = useCallback(async () => {
      try {
         setLoading(true);
         console.log('Fetching all proponents for province:', currentUser.province);
         console.log('Current user:', currentUser);
         
         // Use the correct endpoint with province parameter
         let response = await fetch(`http://localhost:4000/api/users/psto/${currentUser.province}/proponents`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });
         
         console.log('Response status:', response.status);
         
         // If the province-specific endpoint doesn't work, try the pending proponents endpoint
         if (response.status === 404) {
            console.log('Province-specific endpoint not found, trying pending proponents endpoint...');
            response = await fetch('http://localhost:4000/api/users/psto/pending-proponents', {
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
               }
            });
         }
         
         if (response.ok) {
            const data = await response.json();
            console.log('Full response data:', data);
            console.log('Proponents data:', data.proponents);
            console.log('Data keys:', Object.keys(data));
            console.log('First proponent:', data.proponents?.[0]);
            
            // Handle both response formats
            const proponentsData = data.proponents || data.data || [];
            console.log('Processed proponents data:', proponentsData);
            console.log('Number of proponents:', proponentsData.length);
            
            setProponents(proponentsData);
         } else {
            const errorData = await response.json();
            console.error('Failed to load proponents:', errorData);
            
            if (response.status === 404) {
               console.log('No proponents found for province:', currentUser.province);
               setProponents([]);
            } else {
               setError(errorData.message || 'Failed to fetch proponents');
               setProponents([]);
            }
         }
      } catch (err) {
         console.error('Error loading proponents:', err);
         setError('Network error. Please check your connection and try again.');
         setProponents([]);
      } finally {
         setLoading(false);
      }
   }, [currentUser]);

   // Activate proponent account
   const activateProponent = async (proponentId) => {
      try {
         setActionLoading(true);
         console.log('Activating proponent:', proponentId);
         const response = await fetch(`http://localhost:4000/api/users/psto/activate-proponent/${proponentId}`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });
         
         console.log('Activation response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('Activation successful:', data);
            alert(`Proponent ${data.proponent.name} activated successfully!`);
            fetchProponents();
            setShowModal(false);
         } else {
            const errorData = await response.json();
            console.error('Activation failed:', errorData);
            alert(`Failed to activate proponent: ${errorData.message}`);
         }
      } catch (err) {
         console.error('Error activating proponent:', err);
         alert('Error activating proponent: ' + err.message);
      } finally {
         setActionLoading(false);
      }
   };

   // Deactivate proponent account
   const deactivateProponent = async (proponentId) => {
      try {
         setActionLoading(true);
         console.log('Deactivating proponent:', proponentId);
         const response = await fetch(`http://localhost:4000/api/users/${proponentId}/deactivate`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });
         
         console.log('Deactivation response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('Deactivation successful:', data);
            const proponentName = data.user ? `${data.user.firstName} ${data.user.lastName}` : 'proponent';
            alert(`Proponent ${proponentName} deactivated successfully!`);
            fetchProponents();
            setShowModal(false);
         } else {
            const errorData = await response.json();
            console.error('Deactivation failed:', errorData);
            alert(`Failed to deactivate proponent: ${errorData.message}`);
         }
      } catch (err) {
         console.error('Error deactivating proponent:', err);
         console.error('Error details:', err);
         alert('Error deactivating proponent: ' + (err.message || 'Unknown error occurred'));
      } finally {
         setActionLoading(false);
      }
   };

   // Reset proponent password
   const resetPassword = async (proponentId) => {
      try {
         setActionLoading(true);
         console.log('Resetting password for proponent:', proponentId);
         const response = await fetch(`http://localhost:4000/api/users/psto/reset-password/${proponentId}`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               newPassword: newPassword,
               reason: resetReason
            })
         });
         
         console.log('Password reset response status:', response.status);
         if (response.ok) {
            const data = await response.json();
            console.log('Password reset successful:', data);
            alert(`Password reset successfully! New password: ${data.newPassword}`);
            fetchProponents();
            setShowModal(false);
            setNewPassword('');
            setResetReason('');
         } else {
            const errorData = await response.json();
            console.error('Password reset failed:', errorData);
            alert(`Failed to reset password: ${errorData.message}`);
         }
      } catch (err) {
         console.error('Error resetting password:', err);
         alert('Error resetting password: ' + err.message);
      } finally {
         setActionLoading(false);
      }
   };

   // Handle action button clicks
   const handleAction = (action, proponent) => {
      setSelectedProponent(proponent);
      setModalAction(action);
      setShowModal(true);
   };

   // Handle modal action execution
   const handleModalAction = () => {
      if (!selectedProponent) return;

      switch (modalAction) {
         case 'activate':
            activateProponent(selectedProponent._id);
            break;
         case 'deactivate':
            deactivateProponent(selectedProponent._id);
            break;
         case 'reset-password':
            if (!newPassword.trim()) {
               alert('Please enter a new password');
               return;
            }
            resetPassword(selectedProponent._id);
            break;
         default:
            break;
      }
   };

   // Filter proponents based on status
   const getFilteredProponents = () => {
      if (filterStatus === 'all') return proponents;
      return proponents.filter(proponent => {
         if (filterStatus === 'active') return proponent.status === 'active';
         if (filterStatus === 'pending') return proponent.status === 'pending';
         if (filterStatus === 'inactive') return proponent.status === 'inactive';
         return true;
      });
   };

   // Get status badge
   const getStatusBadge = (status) => {
      const statusConfig = {
         active: { className: 'bg-green-100 text-green-800', label: 'Active' },
         pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
         inactive: { className: 'bg-red-100 text-red-800', label: 'Inactive' }
      };
      
      const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800', label: status };
      return <Badge className={config.className}>{config.label}</Badge>;
   };

   useEffect(() => {
      fetchProponents();
   }, [fetchProponents]);

   // Define table columns
   const columns = [
      {
         key: 'name',
         header: 'Name',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return (
               <div>
                  <div className="font-medium text-gray-900">
                     {row.firstName || 'N/A'} {row.lastName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">{row.email || 'N/A'}</div>
               </div>
            );
         }
      },
      {
         key: 'business',
         header: 'Business/Organization',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return (
               <div>
                  {row.proponentInfo?.businessName ? (
                     <div>
                        <div className="font-medium text-gray-900">{row.proponentInfo.businessName}</div>
                        <div className="text-sm text-gray-500">{row.proponentInfo.organizationType}</div>
                     </div>
                  ) : (
                     <span className="text-gray-400 italic">Not provided</span>
                  )}
               </div>
            );
         }
      },
      {
         key: 'province',
         header: 'Province',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return <span className="text-gray-900">{row.province || 'N/A'}</span>;
         }
      },
      {
         key: 'phone',
         header: 'Contact',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return (
               <div>
                  {row.proponentInfo?.phone ? (
                     <span className="text-gray-900">{row.proponentInfo.phone}</span>
                  ) : (
                     <span className="text-gray-400 italic">Not provided</span>
                  )}
               </div>
            );
         }
      },
      {
         key: 'status',
         header: 'Status',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return getStatusBadge(row.status);
         }
      },
      {
         key: 'registered',
         header: 'Registered',
         render: (value, row) => {
            if (!row) return <span className="text-gray-400">N/A</span>;
            return (
               <span className="text-gray-900">
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
               </span>
            );
         }
      }
   ];

   // Define table actions
   const getActions = (row) => {
      if (!row) return <span className="text-gray-400">N/A</span>;
      
      return (
         <div className="flex space-x-2">
            {(row.status === 'pending' || row.status === 'inactive') && (
               <Button
                  onClick={() => handleAction('details', row)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
               >
                  Review & Activate
               </Button>
            )}
            {row.status === 'active' && (
               <Button
                  onClick={() => handleAction('deactivate', row)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
               >
                  Deactivate
               </Button>
            )}
            <Button
               onClick={() => handleAction('reset-password', row)}
               className="bg-blue-600 hover:bg-blue-700 text-white"
               size="sm"
            >
               Reset Password
            </Button>
         </div>
      );
   };

   const filteredProponents = getFilteredProponents();

   return (
      <div className="space-y-6">
         {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
               {error}
            </div>
         )}
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Proponent Management</h2>
               <p className="text-gray-600 mt-1">Manage proponent accounts - activate, deactivate, and reset passwords</p>
            </div>
            <Button onClick={fetchProponents} disabled={loading}>
               {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
         </div>
      
         {/* Filter Tabs */}
         <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex space-x-4">
               <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     filterStatus === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
               >
                  All ({proponents.length})
               </button>
               <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     filterStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
               >
                  Active ({proponents.filter(p => p.status === 'active').length})
               </button>
               <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     filterStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
               >
                  Pending ({proponents.filter(p => p.status === 'pending').length})
               </button>
               <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                     filterStatus === 'inactive'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
               >
                  Inactive ({proponents.filter(p => p.status === 'inactive').length})
               </button>
            </div>
         </div>

         {/* Proponents Table */}
         {filteredProponents.length === 0 && !loading ? (
            <Card className="p-8 text-center">
               <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No Proponents Found</h3>
                  <p className="text-sm">No proponents match the current filter criteria.</p>
               </div>
            </Card>
         ) : (
            <DataTable
               data={filteredProponents}
               columns={columns}
               actions={getActions}
               loading={loading}
               emptyMessage="No proponents found for the current filter."
            />
         )}

         {/* Action Modal */}
         <Modal
            isOpen={showModal}
            onClose={() => {
               setShowModal(false);
               setSelectedProponent(null);
               setModalAction('');
               setNewPassword('');
               setResetReason('');
            }}
            title={
               modalAction === 'activate' ? 'Activate Proponent' :
               modalAction === 'deactivate' ? 'Deactivate Proponent' :
               modalAction === 'reset-password' ? 'Reset Password' :
               modalAction === 'details' ? 'Proponent Details' : 'Action'
            }
         >
            {selectedProponent && (
               <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="font-medium text-gray-900">Proponent Details</h4>
                     <p className="text-sm text-gray-600">
                        {selectedProponent.firstName} {selectedProponent.lastName}
                     </p>
                     <p className="text-sm text-gray-600">{selectedProponent.email}</p>
                  </div>

                  {modalAction === 'activate' && (
                     <div>
                        <p className="text-gray-700">
                           Are you sure you want to activate this proponent's account? 
                           They will be able to log in and access the system.
                        </p>
                     </div>
                  )}

                  {modalAction === 'deactivate' && (
                     <div>
                        <p className="text-gray-700">
                           Are you sure you want to deactivate this proponent's account? 
                           They will no longer be able to log in.
                        </p>
                     </div>
                  )}

                  {modalAction === 'reset-password' && (
                     <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                             New Password
                          </label>
                          <Input
                             type="password"
                             value={newPassword}
                             onChange={(e) => setNewPassword(e.target.value)}
                             placeholder="Enter new password"
                             className="w-full"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                             Reason for Reset (Optional)
                          </label>
                          <Textarea
                             value={resetReason}
                             onChange={(e) => setResetReason(e.target.value)}
                             placeholder="Enter reason for password reset"
                             className="w-full"
                             rows={3}
                          />
                       </div>
                    </div>
                  )}

                  {modalAction === 'details' && (
                     <div className="space-y-4">
                        {(selectedProponent.status === 'pending' || selectedProponent.status === 'inactive') && (
                           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center">
                                 <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                 </svg>
                                 <div className="text-sm text-yellow-800">
                                    <strong>Review Required:</strong> Please review the proponent details below before activating their account. Verify all information is correct and complete.
                                 </div>
                              </div>
                           </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Full Name</label>
                              <p className="text-sm text-gray-900">
                                 {selectedProponent.firstName} {selectedProponent.lastName}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <p className="text-sm text-gray-900">{selectedProponent.email}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <p className="text-sm text-gray-900">{selectedProponent.proponentInfo?.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Province</label>
                              <p className="text-sm text-gray-900">{selectedProponent.province}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Business Name</label>
                              <p className="text-sm text-gray-900">{selectedProponent.proponentInfo?.businessName || 'N/A'}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Business Type</label>
                              <p className="text-sm text-gray-900">{selectedProponent.proponentInfo?.businessType || 'N/A'}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Organization Type</label>
                              <p className="text-sm text-gray-900">{selectedProponent.proponentInfo?.organizationType || 'N/A'}</p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Status</label>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                 selectedProponent.status === 'active' ? 'bg-green-100 text-green-800' :
                                 selectedProponent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                 'bg-yellow-100 text-yellow-800'
                              }`}>
                                 {selectedProponent.status}
                              </span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Address</label>
                           <p className="text-sm text-gray-900">{selectedProponent.proponentInfo?.address || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Registered</label>
                              <p className="text-sm text-gray-900">
                                 {selectedProponent.createdAt ? new Date(selectedProponent.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                              <p className="text-sm text-gray-900">
                                 {selectedProponent.updatedAt ? new Date(selectedProponent.updatedAt).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                     {modalAction === 'details' ? (
                        <div className="flex space-x-3">
                           <Button
                              variant="outline"
                              onClick={() => {
                                 setShowModal(false);
                                 setSelectedProponent(null);
                                 setModalAction('');
                              }}
                           >
                              Close
                           </Button>
                           {(selectedProponent.status === 'pending' || selectedProponent.status === 'inactive') && (
                              <Button
                                 onClick={() => {
                                    setModalAction('activate');
                                 }}
                                 className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                 Activate Proponent
                              </Button>
                           )}
                        </div>
                     ) : (
                        <>
                           <Button
                              variant="outline"
                              onClick={() => {
                                 setShowModal(false);
                                 setSelectedProponent(null);
                                 setModalAction('');
                                 setNewPassword('');
                                 setResetReason('');
                              }}
                              disabled={actionLoading}
                           >
                              Cancel
                           </Button>
                           <Button
                              onClick={handleModalAction}
                              disabled={actionLoading}
                              className={
                                 modalAction === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                                 modalAction === 'deactivate' ? 'bg-red-600 hover:bg-red-700' :
                                 'bg-blue-600 hover:bg-blue-700'
                              }
                           >
                              {actionLoading ? 'Processing...' : 
                               modalAction === 'activate' ? 'Activate' :
                               modalAction === 'deactivate' ? 'Deactivate' :
                               'Reset Password'}
                           </Button>
                        </>
                     )}
                  </div>
               </div>
            )}
         </Modal>
      </div>
   );
};

export default ProponentManagement;
