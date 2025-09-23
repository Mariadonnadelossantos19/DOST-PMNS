import React, { useState, useEffect } from 'react';
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
   const [applicationData, setApplicationData] = useState(null);
   const [loading, setLoading] = useState(false);

   // Helper function to get data from application or fallback to nested structure
   const getApplicationField = (field) => {
      return applicationData?.[field] || selectedApplication.applicationId?.[field] || 'N/A';
   };

   // Fetch application data when modal opens
   useEffect(() => {
      const fetchApplicationData = async () => {
         if (!selectedApplication?.applicationId) return;
         
         setLoading(true);
         try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:4000/api/programs/setup/${selectedApplication.applicationId}`, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            });
            
            if (response.ok) {
               const data = await response.json();
               setApplicationData(data.data);
            } else {
               console.error('Failed to fetch application data');
            }
         } catch (error) {
            console.error('Error fetching application data:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchApplicationData();
   }, [selectedApplication?.applicationId]);

   // Handle file viewing with proper authentication
   const handleViewFile = async (fileType) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please log in to view files');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/programs/setup/${selectedApplication.applicationId}/download/${fileType}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
         } else {
            alert('Error viewing file');
         }
      } catch (error) {
         console.error('Error viewing file:', error);
         alert('Error viewing file');
      }
   };

   // Handle review submission
   const handleReviewSubmit = async (e) => {
      e.preventDefault();
      
      if (!reviewStatus) {
         alert('Please select a review status');
         return;
      }

      try {
         setIsSubmitting(true);
         await reviewApplication(selectedApplication._id);
      } catch (error) {
         console.error('Error submitting review:', error);
         alert('Error submitting review. Please try again.');
      } finally {
         setIsSubmitting(false);
      }
   };
   
   if (!selectedApplication) return null;

   if (loading) {
      return (
         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading application data...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
         <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-2xl">
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">Application Review</h2>
                        <p className="text-green-100">DOST MIMAROPA Review Panel</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setSelectedApplication(null)}
                     className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-50 border-b border-gray-200">
               <div className="flex space-x-8 px-6">
                  {['overview', 'tna-report', 'enterprise', 'business', 'technology', 'documents'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                           activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                     >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                     </button>
                  ))}
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
               {/* Overview Tab */}
               {activeTab === 'overview' && (
                  <div className="space-y-6">
                     {/* Quick Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Application ID</p>
                                 <p className="text-lg font-bold text-blue-900 mt-1">
                                    {getApplicationField('applicationId')}
                                 </p>
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
                                 <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Status</p>
                                 <Badge 
                                    status={selectedApplication.status} 
                                    className="mt-1"
                                 />
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
                                    {getApplicationField('enterpriseName')}
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

                     {/* TNA Status Card */}
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                           </svg>
                           TNA Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <p className="text-sm font-medium text-gray-500">TNA Status</p>
                              <Badge status={selectedApplication.status || 'N/A'} />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.scheduledDate ? new Date(selectedApplication.scheduledDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* TNA Report Tab */}
               {activeTab === 'tna-report' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                           TNA Report Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA ID</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {selectedApplication._id?.slice(-8) || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Application ID</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {getApplicationField('applicationId')}
                              </p>
                           </div>
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Program</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {selectedApplication.programName || getApplicationField('programName') || 'SETUP'}
                              </p>
                           </div>
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Scheduled Date</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {selectedApplication.scheduledDate ? new Date(selectedApplication.scheduledDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Location</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {selectedApplication.location || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA Report File</p>
                              <p className="text-lg font-bold text-blue-900 mt-1">
                                 {selectedApplication.tnaReport?.originalName || selectedApplication.tnaReport?.filename || 'N/A'}
                              </p>
                           </div>
                        </div>
                        
                        {selectedApplication.reportSummary && (
                           <div className="mt-6">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">Report Summary</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                 <p className="text-gray-700">{selectedApplication.reportSummary}</p>
                              </div>
                           </div>
                        )}
                        
                        {selectedApplication.reportRecommendations && (
                           <div className="mt-6">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">Recommendations</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                 <p className="text-gray-700">{selectedApplication.reportRecommendations}</p>
                              </div>
                           </div>
                        )}

                        {/* Application Details Section */}
                        <div className="mt-8 bg-blue-50 rounded-xl p-6">
                           <h4 className="text-lg font-semibold text-blue-900 mb-4">Application Details</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <p className="text-sm font-medium text-blue-700">Application ID</p>
                                 <p className="text-lg font-bold text-blue-900">
                                    {getApplicationField('applicationId')}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-blue-700">Enterprise Name</p>
                                 <p className="text-lg font-bold text-blue-900">
                                    {getApplicationField('enterpriseName')}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-blue-700">Business Activity</p>
                                 <p className="text-lg font-bold text-blue-900">
                                    {getApplicationField('businessActivity')}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-blue-700">Application Status</p>
                                 <Badge status={getApplicationField('status')} />
                              </div>
                           </div>
                           
                           <div className="mt-4">
                              <h5 className="text-md font-semibold text-blue-800 mb-2">Proponent Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-sm font-medium text-blue-700">Name</p>
                                    <p className="text-lg font-bold text-blue-900">
                                       {selectedApplication.proponentId?.firstName} {selectedApplication.proponentId?.lastName}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-blue-700">Email</p>
                                    <p className="text-lg font-bold text-blue-900">
                                       {selectedApplication.proponentId?.email || 'N/A'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-blue-700">Province</p>
                                    <p className="text-lg font-bold text-blue-900">
                                       {selectedApplication.proponentId?.province || 'N/A'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-blue-700">Phone</p>
                                    <p className="text-lg font-bold text-blue-900">
                                       {selectedApplication.proponentId?.phone || 'N/A'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Enterprise Tab */}
               {activeTab === 'enterprise' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                           Enterprise Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <p className="text-sm font-medium text-gray-500">Enterprise Name</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('enterpriseName')}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Contact Person</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.proponentId?.firstName} {selectedApplication.proponentId?.lastName}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Position</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.proponentId?.position || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Office Address</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('officeAddress') || selectedApplication.proponentId?.officeAddress || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Province</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.proponentId?.province || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Contact Person Email</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.proponentId?.email || 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Business Tab */}
               {activeTab === 'business' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                           Business Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <p className="text-sm font-medium text-gray-500">Year Established</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('yearEstablished') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Organization Type</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('organizationType') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Registration No</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('registrationNo') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Capital Classification</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('capitalClassification') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Initial Capital</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('initialCapital')?.toLocaleString() || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Direct Workers</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('directWorkers') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Production Workers</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('productionWorkers') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Total Workers</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('totalWorkers') || 'N/A'}
                              </p>
                           </div>
                           <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">Business Activity</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('businessActivity') || 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Technology Tab */}
               {activeTab === 'technology' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                           </svg>
                           Technology Information
                        </h3>
                        <div className="space-y-6">
                           <div>
                              <p className="text-sm font-medium text-gray-500">Technology Needs</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('technologyNeeds') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Current Technology Level</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('currentTechnologyLevel') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Desired Technology Level</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('desiredTechnologyLevel') || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-500">Expected Outcomes</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {getApplicationField('expectedOutcomes') || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">General Agreement</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-sm font-medium text-gray-500">Accepted</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                       {getApplicationField('generalAgreement')?.accepted ? 'Yes' : 'No'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-gray-500">Signatory Name</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                       {getApplicationField('generalAgreement')?.signatoryName || 'N/A'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-gray-500">Position</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                       {getApplicationField('generalAgreement')?.position || 'N/A'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-gray-500">Signed Date</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                       {getApplicationField('generalAgreement')?.signedDate ? new Date(getApplicationField('generalAgreement').signedDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Documents Tab */}
               {activeTab === 'documents' && (
                  <div className="space-y-6">
                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                           Document Attachments
                        </h3>
                        <div className="space-y-4">
                           <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <h4 className="font-medium text-gray-900">Letter of Intent</h4>
                                    <p className="text-sm text-gray-500">
                                       {getApplicationField('letterOfIntent')?.originalName || getApplicationField('letterOfIntent')?.filename || 'No file uploaded'}
                                    </p>
                                    {getApplicationField('letterOfIntent')?.size && (
                                       <p className="text-xs text-gray-400">
                                          Size: {(getApplicationField('letterOfIntent').size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    )}
                                 </div>
                                 {getApplicationField('letterOfIntent')?.filename && (
                                    <button
                                       onClick={() => handleViewFile('letterOfIntent')}
                                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View
                                    </button>
                                 )}
                              </div>
                           </div>

                           <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <h4 className="font-medium text-gray-900">Enterprise Profile</h4>
                                    <p className="text-sm text-gray-500">
                                       {getApplicationField('enterpriseProfile')?.originalName || getApplicationField('enterpriseProfile')?.filename || 'No file uploaded'}
                                    </p>
                                    {getApplicationField('enterpriseProfile')?.size && (
                                       <p className="text-xs text-gray-400">
                                          Size: {(getApplicationField('enterpriseProfile').size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    )}
                                 </div>
                                 {getApplicationField('enterpriseProfile')?.filename && (
                                    <button
                                       onClick={() => handleViewFile('enterpriseProfile')}
                                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View
                                    </button>
                                 )}
                              </div>
                           </div>

                           <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <h4 className="font-medium text-gray-900">Business Plan</h4>
                                    <p className="text-sm text-gray-500">
                                       {getApplicationField('businessPlan')?.originalName || getApplicationField('businessPlan')?.filename || 'No file uploaded'}
                                    </p>
                                    {getApplicationField('businessPlan')?.size && (
                                       <p className="text-xs text-gray-400">
                                          Size: {(getApplicationField('businessPlan').size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    )}
                                 </div>
                                 {getApplicationField('businessPlan')?.filename && (
                                    <button
                                       onClick={() => handleViewFile('businessPlan')}
                                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View
                                    </button>
                                 )}
                              </div>
                           </div>

                           <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <h4 className="font-medium text-gray-900">General Agreement Signature</h4>
                                    <p className="text-sm text-gray-500">
                                       {getApplicationField('generalAgreement')?.signature?.originalName || getApplicationField('generalAgreement')?.signature?.filename || 'No file uploaded'}
                                    </p>
                                    {getApplicationField('generalAgreement')?.signature?.size && (
                                       <p className="text-xs text-gray-400">
                                          Size: {(getApplicationField('generalAgreement').signature.size / 1024 / 1024).toFixed(2)} MB
                                       </p>
                                    )}
                                 </div>
                                 {getApplicationField('generalAgreement')?.signature?.filename && (
                                    <button
                                       onClick={() => handleViewFile('generalAgreement')}
                                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       View
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Review Form */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
               <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
                        <select
                           value={reviewStatus}
                           onChange={(e) => setReviewStatus(e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           required
                        >
                           <option value="">Select Status</option>
                           <option value="approved">Approve</option>
                           <option value="rejected">Reject</option>
                           <option value="returned">Return for Revision</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                        <textarea
                           value={reviewComments}
                           onChange={(e) => setReviewComments(e.target.value)}
                           rows={3}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter your review comments..."
                        />
                     </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                     <button
                        type="button"
                        onClick={() => setSelectedApplication(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={isSubmitting || !reviewStatus}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default DostMimaropaReviewModal;