import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '../UI';
import axios from 'axios';

const TnaReviewPanel = () => {
   const [enrollments, setEnrollments] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedEnrollment, setSelectedEnrollment] = useState(null);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [reviewNotes, setReviewNotes] = useState('');
   const [reviewAction, setReviewAction] = useState('');
   const [activeSubTab, setActiveSubTab] = useState('pending');

   const API_BASE_URL = 'http://localhost:4000/api';

   // Load TNA enrollments for review
   const loadTnaEnrollments = async () => {
      try {
         setLoading(true);
         const response = await axios.get(`${API_BASE_URL}/enrollments/tna/for-review`);
         if (response.data.success) {
            setEnrollments(response.data.enrollments);
         }
      } catch (error) {
         console.error('Error loading TNA enrollments:', error);
         setError('Failed to load TNA enrollments');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadTnaEnrollments();
   }, []);

   const handleReview = (enrollment, action) => {
      setSelectedEnrollment(enrollment);
      setReviewAction(action);
      setReviewNotes('');
      setShowReviewModal(true);
   };

   const submitReview = async () => {
      if (!selectedEnrollment || !reviewAction) return;

      try {
         setLoading(true);
         const response = await axios.post(
            `${API_BASE_URL}/enrollments/${selectedEnrollment._id}/review-tna`,
            {
               action: reviewAction,
               reviewNotes: reviewNotes,
               reviewedBy: 'current-user-id' // This should come from auth context
            }
         );

         if (response.data.success) {
            // Update local state
            setEnrollments(prev => prev.map(enrollment => 
               enrollment._id === selectedEnrollment._id ? response.data.enrollment : enrollment
            ));
            setShowReviewModal(false);
            setSelectedEnrollment(null);
            setReviewNotes('');
            setReviewAction('');
         } else {
            throw new Error(response.data.message || 'Failed to submit review');
         }
      } catch (error) {
         console.error('Error submitting review:', error);
         setError(error.response?.data?.message || error.message || 'Failed to submit review');
      } finally {
         setLoading(false);
      }
   };


   const getStatusText = (tnaStatus) => {
      switch (tnaStatus) {
         case 'under_review': return 'Under Review';
         case 'approved': return 'Approved';
         case 'rejected': return 'Rejected';
         default: return tnaStatus;
      }
   };

   // Filter enrollments by status
   const getFilteredEnrollments = () => {
      switch (activeSubTab) {
         case 'pending':
            return enrollments.filter(enrollment => enrollment.tnaStatus === 'under_review');
         case 'approved':
            return enrollments.filter(enrollment => enrollment.tnaStatus === 'approved');
         case 'rejected':
            return enrollments.filter(enrollment => enrollment.tnaStatus === 'rejected');
         default:
            return enrollments;
      }
   };

   const filteredEnrollments = getFilteredEnrollments();

   // Get counts for each status
   const getStatusCounts = () => {
      return {
         pending: enrollments.filter(e => e.tnaStatus === 'under_review').length,
         approved: enrollments.filter(e => e.tnaStatus === 'approved').length,
         rejected: enrollments.filter(e => e.tnaStatus === 'rejected').length
      };
   };

   const statusCounts = getStatusCounts();

   return (
      <div className="space-y-4">
         {/* Compact Header */}
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-base font-medium text-gray-900">TNA Applications</h2>
               <p className="text-xs text-gray-500">Review and manage applications</p>
            </div>
            <button 
               onClick={loadTnaEnrollments} 
               disabled={loading}
               className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
               {loading ? 'Loading...' : 'Refresh'}
            </button>
         </div>

         {/* Compact Sub-tab Navigation */}
         <div className="border-b border-gray-200">
            <nav className="flex space-x-6">
               <button
                  onClick={() => setActiveSubTab('pending')}
                  className={`py-1.5 px-1 border-b-2 font-medium text-xs transition-colors ${
                     activeSubTab === 'pending'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Pending ({statusCounts.pending})
               </button>
               <button
                  onClick={() => setActiveSubTab('approved')}
                  className={`py-1.5 px-1 border-b-2 font-medium text-xs transition-colors ${
                     activeSubTab === 'approved'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Approved ({statusCounts.approved})
               </button>
               <button
                  onClick={() => setActiveSubTab('rejected')}
                  className={`py-1.5 px-1 border-b-2 font-medium text-xs transition-colors ${
                     activeSubTab === 'rejected'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Rejected ({statusCounts.rejected})
               </button>
            </nav>
         </div>

         {/* Error Display */}
         {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
               <p className="text-red-600">{error}</p>
            </div>
         )}

         {/* Enrollments List */}
         <div className="space-y-2">
            {loading && enrollments.length === 0 ? (
               <div className="text-center py-6">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading applications...</p>
               </div>
            ) : filteredEnrollments.length === 0 ? (
               <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                     No {activeSubTab} applications
                  </h3>
                  <p className="text-xs text-gray-500">
                     {activeSubTab === 'pending' 
                        ? 'No applications are currently under review'
                        : activeSubTab === 'approved'
                        ? 'No applications have been approved yet'
                        : 'No applications have been rejected'
                     }
                  </p>
               </div>
            ) : (
               <div className="space-y-2">
                  {filteredEnrollments.map(enrollment => (
                     <div key={enrollment._id} className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                 {enrollment.customer.name}
                              </h4>
                              <p className="text-xs text-gray-600">{enrollment.customer.businessName}</p>
                              <p className="text-xs text-gray-500">{enrollment.serviceData.name} • {enrollment.province}</p>
                              <p className="text-xs text-gray-400">
                                 Submitted {new Date(enrollment.submittedAt).toLocaleDateString()}
                              </p>
                           </div>
                           <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                 enrollment.tnaStatus === 'under_review' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : enrollment.tnaStatus === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                 {getStatusText(enrollment.tnaStatus)}
                              </span>
                           </div>
                        </div>

                        {/* TNA Information */}
                        {enrollment.tnaInfo && (
                           <div className="bg-gray-50 p-2 rounded mb-2">
                              <h5 className="text-xs font-medium text-gray-900 mb-1">TNA Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                                 <div>
                                    <span className="text-gray-600">Affiliation:</span> {enrollment.tnaInfo.affiliation}
                                    {enrollment.tnaInfo.otherAffiliation && ` (${enrollment.tnaInfo.otherAffiliation})`}
                                 </div>
                                 <div>
                                    <span className="text-gray-600">Contact:</span> {enrollment.tnaInfo.contactPerson}
                                 </div>
                                 <div>
                                    <span className="text-gray-600">Position:</span> {enrollment.tnaInfo.position}
                                 </div>
                                 <div>
                                    <span className="text-gray-600">Phone:</span> {enrollment.tnaInfo.contactNumber}
                                 </div>
                                 <div className="md:col-span-2">
                                    <span className="text-gray-600">Address:</span> {enrollment.tnaInfo.officeAddress}
                                 </div>
                                 <div>
                                    <span className="text-gray-600">Email:</span> {enrollment.tnaInfo.emailAddress}
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Review Notes */}
                        {enrollment.reviewNotes && (
                           <div className="bg-yellow-50 border border-yellow-200 p-1.5 rounded mb-2">
                              <h6 className="text-xs font-medium text-yellow-800 mb-0.5">Review Notes:</h6>
                              <p className="text-xs text-yellow-700">{enrollment.reviewNotes}</p>
                           </div>
                        )}

                        {/* Action Buttons - Only show for pending applications */}
                        {enrollment.tnaStatus === 'under_review' && activeSubTab === 'pending' && (
                           <div className="flex space-x-1.5">
                              <button
                                 onClick={() => handleReview(enrollment, 'approve')}
                                 disabled={loading}
                                 className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                 Approve
                              </button>
                              <button
                                 onClick={() => handleReview(enrollment, 'reject')}
                                 disabled={loading}
                                 className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                 Reject
                              </button>
                           </div>
                        )}

                        {/* Status Info for Approved/Rejected */}
                        {enrollment.tnaStatus !== 'under_review' && (
                           <div className="text-xs text-gray-500">
                              {enrollment.reviewedAt && (
                                 <span>
                                    {enrollment.tnaStatus === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                    {new Date(enrollment.reviewedAt).toLocaleDateString()}
                                    {enrollment.reviewedBy && ' by ' + enrollment.reviewedBy.firstName + ' ' + enrollment.reviewedBy.lastName}
                                 </span>
                              )}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Review Modal */}
         {showReviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                     {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
                  </h3>
                  
                  {selectedEnrollment && (
                     <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{selectedEnrollment.customer.name}</p>
                        <p className="text-xs text-gray-600">{selectedEnrollment.serviceData.name}</p>
                     </div>
                  )}

                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes {reviewAction === 'reject' ? '(Required)' : '(Optional)'}
                     </label>
                     <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder={`Enter notes for ${reviewAction === 'approve' ? 'approval' : 'rejection'}...`}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={reviewAction === 'reject'}
                     />
                  </div>

                  <div className="flex justify-end space-x-2">
                     <button
                        onClick={() => {
                           setShowReviewModal(false);
                           setSelectedEnrollment(null);
                           setReviewNotes('');
                           setReviewAction('');
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={submitReview}
                        disabled={loading || (reviewAction === 'reject' && !reviewNotes.trim())}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md disabled:opacity-50 ${
                           reviewAction === 'approve'
                              ? 'text-green-700 bg-green-100 border border-green-300 hover:bg-green-200'
                              : 'text-red-700 bg-red-100 border border-red-300 hover:bg-red-200'
                        }`}
                     >
                        {loading ? 'Processing...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'}`}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TnaReviewPanel;
