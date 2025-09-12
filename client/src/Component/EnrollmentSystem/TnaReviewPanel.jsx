import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../UI';
import TnaReviewModal from './TnaReviewModal';
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
         setError(null); // Clear previous errors
         
         console.log('Submitting review:', {
            enrollmentId: selectedEnrollment._id,
            action: reviewAction,
            reviewNotes: reviewNotes
         });
         
         const response = await axios.post(
            `${API_BASE_URL}/enrollments/${selectedEnrollment._id}/review-tna`,
            {
               action: reviewAction,
               reviewNotes: reviewNotes
            }
         );

         console.log('Review response:', response.data);

         if (response.data.success) {
            alert(`Application ${reviewAction}d successfully!`);
            setShowReviewModal(false);
            setSelectedEnrollment(null);
            setReviewAction('');
            setReviewNotes('');
            loadTnaEnrollments(); // Reload the list
         } else {
            throw new Error(response.data.message || 'Failed to submit review');
         }
      } catch (error) {
         console.error('Error submitting review:', error);
         const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
         setError(errorMessage);
         alert(`Error: ${errorMessage}`);
      } finally {
         setLoading(false);
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

         {/* Applications Table */}
         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading && enrollments.length === 0 ? (
               <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading applications...</p>
               </div>
            ) : filteredEnrollments.length === 0 ? (
               <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                     No {activeSubTab} applications
                  </h3>
                  <p className="text-sm text-gray-500">
                     {activeSubTab === 'pending' 
                        ? 'No applications are currently under review'
                        : activeSubTab === 'approved'
                        ? 'No applications have been approved yet'
                        : 'No applications have been rejected'
                     }
                  </p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Enrollment ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Province
                           </th>
                           <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEnrollments.map(enrollment => (
                           <tr key={enrollment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-900">
                                    {enrollment.enrollmentId || enrollment._id}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">
                                    {enrollment.serviceData.name}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                    {enrollment.service}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-900">
                                    {enrollment.customer.name}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                    {enrollment.customer.businessName}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">
                                    {enrollment.province}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                 <div className="flex items-center justify-center space-x-2">
                                    {/* View Button */}
                                    <button
                                       onClick={() => handleReview(enrollment, 'view')}
                                       className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                       title="View Details"
                                    >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                       </svg>
                                    </button>

                                    {/* Approve Button - Only for pending applications */}
                                    {enrollment.tnaStatus === 'under_review' && activeSubTab === 'pending' && (
                                       <button
                                          onClick={() => handleReview(enrollment, 'approve')}
                                          disabled={loading}
                                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50 transition-colors"
                                          title="Approve Application"
                                       >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                       </button>
                                    )}

                                    {/* Reject Button - Only for pending applications */}
                                    {enrollment.tnaStatus === 'under_review' && activeSubTab === 'pending' && (
                                       <button
                                          onClick={() => handleReview(enrollment, 'reject')}
                                          disabled={loading}
                                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                                          title="Reject Application"
                                       >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* Review Modal */}
         <TnaReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            selectedEnrollment={selectedEnrollment}
            reviewAction={reviewAction}
            reviewNotes={reviewNotes}
            setReviewNotes={setReviewNotes}
            onSubmitReview={submitReview}
            loading={loading}
         />
      </div>
   );
};

export default TnaReviewPanel;