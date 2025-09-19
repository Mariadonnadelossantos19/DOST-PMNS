import React, { useState } from 'react';
import { Badge } from '../../../Component/UI';
import { API_ENDPOINTS } from '../../../config/api';

const DostMimaropaReviewModal = ({ 
   selectedApplication, 
   setSelectedApplication, 
   reviewStatus, 
   setReviewStatus, 
   reviewComments, 
   setReviewComments, 
   reviewApplication,
   getStatusColor,
   formatDate 
}) => {
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Handle file viewing with proper authentication
   const handleViewFile = async (fileType) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please log in to view files');
            return;
         }

         const response = await fetch(`/api/programs/setup/${selectedApplication._id}/view/${fileType}`, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to view file: ${response.status} ${response.statusText}`);
         }

         // Get the file blob
         const blob = await response.blob();
         
         // Create a URL for the blob
         const fileUrl = window.URL.createObjectURL(blob);
         
         // Open in new tab
         window.open(fileUrl, '_blank');
         
         // Clean up the URL after a delay
         setTimeout(() => {
            window.URL.revokeObjectURL(fileUrl);
         }, 1000);
      } catch (error) {
         console.error('Error viewing file:', error);
         alert(`Failed to view file: ${error.message}`);
      }
   };

   // Handle DOST MIMAROPA review submission
   const handleReviewSubmit = async () => {
      if (!reviewStatus) {
         alert('Please select a review decision');
         return;
      }

      setIsSubmitting(true);
      try {
         await reviewApplication(selectedApplication._id);
      } catch (error) {
         console.error('Error submitting review:', error);
      } finally {
         setIsSubmitting(false);
      }
   };
   
   if (!selectedApplication) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
         <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-2xl">
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold">DOST MIMAROPA Review</h3>
                        <p className="text-green-100 text-sm">Final approval decision for PSTO-approved applications</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setSelectedApplication(null)}
                     className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
               {/* Application Summary */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Application ID</p>
                           <p className="text-lg font-bold text-blue-900 mt-1">{selectedApplication.applicationId}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-green-600 uppercase tracking-wide">PSTO Status</p>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(selectedApplication.pstoStatus)}`}>
                              {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </div>
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Enterprise</p>
                           <p className="text-sm font-bold text-purple-900 mt-1 truncate">
                              {typeof selectedApplication.enterpriseName === 'string' 
                                 ? selectedApplication.enterpriseName 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>

               {/* PSTO Review Summary */}
               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200 shadow-sm mb-6">
                  <div className="flex items-center mb-4">
                     <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900">PSTO Review Summary</h4>
                        <p className="text-sm text-yellow-600">This application has been reviewed and approved by PSTO</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs font-medium text-gray-600">PSTO Decision</p>
                        <Badge className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.pstoStatus)}`}>
                           {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                        </Badge>
                     </div>
                     <div>
                        <p className="text-xs font-medium text-gray-600">Forwarded Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                           {selectedApplication.forwardedToDostMimaropaAt ? formatDate(selectedApplication.forwardedToDostMimaropaAt) : 'N/A'}
                        </p>
                     </div>
                     {selectedApplication.pstoComments && (
                        <div className="col-span-2">
                           <p className="text-xs font-medium text-gray-600">PSTO Comments</p>
                           <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded mt-1">
                              {selectedApplication.pstoComments}
                           </p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Key Application Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Enterprise Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Enterprise Details</h4>
                           <p className="text-sm text-blue-600">Key business information</p>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Enterprise Name</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {typeof selectedApplication.enterpriseName === 'string' 
                                 ? selectedApplication.enterpriseName 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {typeof selectedApplication.contactPerson === 'string' 
                                 ? selectedApplication.contactPerson 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Province</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {typeof selectedApplication.proponentId === 'object' 
                                 ? selectedApplication.proponentId?.province || 'N/A'
                                 : selectedApplication.proponentId || 'N/A'
                              }
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Business Activity</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.businessActivity || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Project Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Project Details</h4>
                           <p className="text-sm text-green-600">Technology and project information</p>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Technology Needs</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.technologyNeeds || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Expected Outcomes</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.expectedOutcomes || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Initial Capital</p>
                           <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.initialCapital?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Total Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.totalWorkers || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Documents Section */}
               <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200 shadow-sm mb-6">
                  <div className="flex items-center mb-4">
                     <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900">Required Documents</h4>
                        <p className="text-sm text-indigo-600">Review submitted documents</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* Letter of Intent */}
                     <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                           <div className="p-2 bg-red-100 rounded-lg mr-3">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-gray-900">Letter of Intent</p>
                              <p className="text-xs text-gray-500">
                                 {selectedApplication.letterOfIntent?.filename ? 'Available' : 'Not provided'}
                              </p>
                           </div>
                        </div>
                        {selectedApplication.letterOfIntent?.filename && (
                           <button
                              onClick={() => handleViewFile('letterOfIntent')}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                           >
                              View
                           </button>
                        )}
                     </div>

                     {/* Enterprise Profile */}
                     <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                           <div className="p-2 bg-green-100 rounded-lg mr-3">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-gray-900">Enterprise Profile</p>
                              <p className="text-xs text-gray-500">
                                 {selectedApplication.enterpriseProfile?.filename ? 'Available' : 'Not provided'}
                              </p>
                           </div>
                        </div>
                        {selectedApplication.enterpriseProfile?.filename && (
                           <button
                              onClick={() => handleViewFile('enterpriseProfile')}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                           >
                              View
                           </button>
                        )}
                     </div>

                     {/* Business Plan */}
                     <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center">
                           <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-gray-900">Business Plan</p>
                              <p className="text-xs text-gray-500">
                                 {selectedApplication.businessPlan?.filename ? 'Available' : 'Not provided'}
                              </p>
                           </div>
                        </div>
                        {selectedApplication.businessPlan?.filename && (
                           <button
                              onClick={() => handleViewFile('businessPlan')}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                           >
                              View
                           </button>
                        )}
                     </div>
                  </div>
               </div>

               {/* DOST MIMAROPA Review Form */}
               <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                     <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900">DOST MIMAROPA Final Decision</h4>
                        <p className="text-sm text-gray-600">Make your final approval decision for this PSTO-approved application</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Final Decision
                        </label>
                        <select
                           value={reviewStatus}
                           onChange={(e) => setReviewStatus(e.target.value)}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        >
                           <option value="">Select final decision</option>
                           <option value="approved">✅ Final Approval</option>
                           <option value="returned">🔄 Return to PSTO for Revision</option>
                           <option value="rejected">❌ Final Rejection</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Priority Level
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                           <option value="">Select priority</option>
                           <option value="high">🔴 High Priority</option>
                           <option value="medium">🟡 Medium Priority</option>
                           <option value="low">🟢 Low Priority</option>
                        </select>
                     </div>
                  </div>

                  <div className="mt-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        DOST MIMAROPA Comments
                     </label>
                     <textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Provide your final review comments and any specific requirements..."
                     />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                     <button
                        onClick={() => setSelectedApplication(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleReviewSubmit}
                        disabled={!reviewStatus || isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                     >
                        {isSubmitting ? 'Submitting...' : 'Submit Final Decision'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DostMimaropaReviewModal;
