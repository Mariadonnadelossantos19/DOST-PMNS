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
   const [activeTab, setActiveTab] = useState('overview');

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
         <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
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
               {/* Tab Navigation */}
               <div className="mb-6">
                  <div className="border-b border-gray-200">
                     <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        {[
                           { id: 'overview', name: 'Overview', icon: '📊' },
                           { id: 'enterprise', name: 'Enterprise', icon: '🏢' },
                           { id: 'business', name: 'Business', icon: '💼' },
                           { id: 'technology', name: 'Technology', icon: '🔬' },
                           { id: 'documents', name: 'Documents', icon: '📄' },
                           { id: 'review', name: 'Review', icon: '✅' }
                        ].map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                                 activeTab === tab.id
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                           >
                              <span className="mr-2">{tab.icon}</span>
                              {tab.name}
                           </button>
                        ))}
                     </nav>
                  </div>
               </div>

               {/* Tab Content */}
               {activeTab === 'overview' && (
                  <div className="space-y-6">
                     {/* Application Summary */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                     <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200 shadow-sm">
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
                  </div>
               )}

               {/* Enterprise Tab */}
               {activeTab === 'enterprise' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enterprise Information */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">Enterprise Information</h4>
                                 <p className="text-sm text-blue-600">Complete business details</p>
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
                                 <p className="text-xs font-medium text-gray-600">Position</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.position || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Office Address</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.officeAddress || 'N/A'}</p>
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
                           </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">Contact Information</h4>
                                 <p className="text-sm text-green-600">Communication details</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Contact Person Tel</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.contactPersonTel || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Contact Person Email</p>
                                 <p className="text-sm font-semibold text-gray-900">
                                    {selectedApplication.contactPersonEmail ? (
                                       <a href={`mailto:${selectedApplication.contactPersonEmail}`} className="text-blue-600 hover:underline">
                                          {selectedApplication.contactPersonEmail}
                                       </a>
                                    ) : 'N/A'}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Factory Tel</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.factoryTel || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Factory Email</p>
                                 <p className="text-sm font-semibold text-gray-900">
                                    {selectedApplication.factoryEmail ? (
                                       <a href={`mailto:${selectedApplication.factoryEmail}`} className="text-blue-600 hover:underline">
                                          {selectedApplication.factoryEmail}
                                       </a>
                                    ) : 'N/A'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Business Tab */}
               {activeTab === 'business' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Business Profile */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">Business Profile</h4>
                                 <p className="text-sm text-purple-600">Company structure and details</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Year Established</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.yearEstablished || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Organization Type</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.organizationType || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Registration No</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.registrationNo || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Capital Classification</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.capitalClassification || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Initial Capital</p>
                                 <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.initialCapital?.toLocaleString() || 'N/A'}</p>
                              </div>
                           </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">Employment Details</h4>
                                 <p className="text-sm text-orange-600">Workforce information</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Direct Workers</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.directWorkers || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Production Workers</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.productionWorkers || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Total Workers</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.totalWorkers || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Business Activity</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.businessActivity || 'N/A'}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Technology Tab */}
               {activeTab === 'technology' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Technology Information */}
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">Technology Information</h4>
                                 <p className="text-sm text-teal-600">SETUP technology needs</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Technology Needs</p>
                                 <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded text-xs">
                                    {selectedApplication.technologyNeeds || 'N/A'}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Current Technology Level</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.currentTechnologyLevel || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Desired Technology Level</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.desiredTechnologyLevel || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Expected Outcomes</p>
                                 <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded text-xs">
                                    {selectedApplication.expectedOutcomes || 'N/A'}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* General Agreement */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-gray-900">General Agreement</h4>
                                 <p className="text-sm text-yellow-600">Legal agreement details</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Agreement Accepted</p>
                                 <Badge className={`px-2 py-1 rounded-full text-xs font-bold ${selectedApplication.generalAgreement?.accepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedApplication.generalAgreement?.accepted ? 'YES' : 'NO'}
                                 </Badge>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Signatory Name</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.generalAgreement?.signatoryName || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Signatory Position</p>
                                 <p className="text-sm font-semibold text-gray-900">{selectedApplication.generalAgreement?.position || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-600">Signed Date</p>
                                 <p className="text-sm font-semibold text-gray-900">
                                    {selectedApplication.generalAgreement?.signedDate ? formatDate(selectedApplication.generalAgreement.signedDate) : 'N/A'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Documents Tab */}
               {activeTab === 'documents' && (
                  <div className="space-y-6">
                     <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
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
                           <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-3">
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
                                 <div className="space-y-2">
                                    <div className="text-xs text-gray-600">
                                       <p><span className="font-medium">File:</span> {selectedApplication.letterOfIntent.originalName}</p>
                                       <p><span className="font-medium">Size:</span> {(selectedApplication.letterOfIntent.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                       onClick={() => handleViewFile('letterOfIntent')}
                                       className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View Document
                                    </button>
                                 </div>
                              )}
                           </div>

                           {/* Enterprise Profile */}
                           <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-3">
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
                                 <div className="space-y-2">
                                    <div className="text-xs text-gray-600">
                                       <p><span className="font-medium">File:</span> {selectedApplication.enterpriseProfile.originalName}</p>
                                       <p><span className="font-medium">Size:</span> {(selectedApplication.enterpriseProfile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                       onClick={() => handleViewFile('enterpriseProfile')}
                                       className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View Document
                                    </button>
                                 </div>
                              )}
                           </div>

                           {/* Business Plan */}
                           <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-3">
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
                                 <div className="space-y-2">
                                    <div className="text-xs text-gray-600">
                                       <p><span className="font-medium">File:</span> {selectedApplication.businessPlan.originalName}</p>
                                       <p><span className="font-medium">Size:</span> {(selectedApplication.businessPlan.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                       onClick={() => handleViewFile('businessPlan')}
                                       className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View Document
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* General Agreement Signature */}
                        {selectedApplication.generalAgreement?.signature?.filename && (
                           <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center mb-3">
                                 <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className="text-sm font-semibold text-gray-900">General Agreement Signature</p>
                                    <p className="text-xs text-gray-500">Digital signature file</p>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="text-xs text-gray-600">
                                    <p><span className="font-medium">File:</span> {selectedApplication.generalAgreement.signature.originalName}</p>
                                    <p><span className="font-medium">Size:</span> {(selectedApplication.generalAgreement.signature.size / 1024).toFixed(1)} KB</p>
                                 </div>
                                 <button
                                    onClick={() => handleViewFile('generalAgreement')}
                                    className="px-3 py-2 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                                 >
                                    View Signature
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Review Tab */}
               {activeTab === 'review' && (
                  <div className="space-y-6">
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
               )}
            </div>
         </div>
      </div>
   );
};

export default DostMimaropaReviewModal;
