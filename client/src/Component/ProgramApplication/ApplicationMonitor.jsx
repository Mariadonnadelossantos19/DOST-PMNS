import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const ApplicationMonitor = () => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);

   // Fetch user's applications
   const fetchApplications = async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch(API_ENDPOINTS.SETUP_MY_APPLICATIONS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            throw new Error('Failed to fetch applications');
         }

         const result = await response.json();
         if (result.success) {
            setApplications(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch applications');
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchApplications();
   }, []);

   // Get status badge color
   const getStatusColor = (status) => {
      switch (status) {
         case 'approved': return 'bg-green-100 text-green-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         case 'returned': return 'bg-yellow-100 text-yellow-800';
         case 'pending': return 'bg-blue-100 text-blue-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   // Get PSTO status badge color
   const getPSTOStatusColor = (status) => {
      switch (status) {
         case 'approved': return 'bg-green-100 text-green-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         case 'returned': return 'bg-yellow-100 text-yellow-800';
         case 'pending': return 'bg-blue-100 text-blue-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   // Get status bar color for top border
   const getStatusBarColor = (status) => {
      switch (status) {
         case 'approved': return 'bg-green-500';
         case 'rejected': return 'bg-red-500';
         case 'returned': return 'bg-yellow-500';
         case 'pending': return 'bg-blue-500';
         default: return 'bg-gray-500';
      }
   };

   // Format date
   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   // Render application details modal
   const renderApplicationDetails = () => {
      if (!selectedApplication) return null;

      return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Application Details</h3>
                  <button
                     onClick={() => setSelectedApplication(null)}
                     className="text-gray-500 hover:text-gray-700"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                     <h4 className="font-semibold text-lg text-gray-800">Basic Information</h4>
                     <div className="space-y-2">
                        <div>
                           <span className="font-medium">Application ID:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.applicationId}</span>
                        </div>
                        <div>
                           <span className="font-medium">Enterprise Name:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.enterpriseName}</span>
                        </div>
                        <div>
                           <span className="font-medium">Contact Person:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.contactPerson}</span>
                        </div>
                        <div>
                           <span className="font-medium">Position:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.position}</span>
                        </div>
                        <div>
                           <span className="font-medium">Office Address:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.officeAddress}</span>
                        </div>
                     </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                     <h4 className="font-semibold text-lg text-gray-800">Contact Details</h4>
                     <div className="space-y-2">
                        <div>
                           <span className="font-medium">Phone:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.contactPersonTel}</span>
                        </div>
                        <div>
                           <span className="font-medium">Email:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.contactPersonEmail}</span>
                        </div>
                        <div>
                           <span className="font-medium">Website:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.website || 'N/A'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Enterprise Details */}
                  <div className="space-y-4">
                     <h4 className="font-semibold text-lg text-gray-800">Enterprise Details</h4>
                     <div className="space-y-2">
                        <div>
                           <span className="font-medium">Year Established:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.yearEstablished}</span>
                        </div>
                        <div>
                           <span className="font-medium">Organization Type:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.organizationType}</span>
                        </div>
                        <div>
                           <span className="font-medium">Profit Type:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.profitType}</span>
                        </div>
                        <div>
                           <span className="font-medium">Registration No:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.registrationNo}</span>
                        </div>
                     </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                     <h4 className="font-semibold text-lg text-gray-800">Business Information</h4>
                     <div className="space-y-2">
                        <div>
                           <span className="font-medium">Business Activity:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.businessActivity || 'N/A'}</span>
                        </div>
                        <div>
                           <span className="font-medium">Specific Product:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.specificProduct || 'N/A'}</span>
                        </div>
                        <div>
                           <span className="font-medium">Technology Needs:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.technologyNeeds || 'N/A'}</span>
                        </div>
                        <div>
                           <span className="font-medium">Current Tech Level:</span>
                           <span className="ml-2 text-gray-600">{selectedApplication.currentTechnologyLevel}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Status Information */}
               <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-lg text-gray-800 mb-3">Status Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <span className="font-medium">Application Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getStatusColor(selectedApplication.status)}`}>
                           {selectedApplication.status?.toUpperCase()}
                        </span>
                     </div>
                     <div>
                        <span className="font-medium">PSTO Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getPSTOStatusColor(selectedApplication.pstoStatus)}`}>
                           {selectedApplication.pstoStatus?.toUpperCase()}
                        </span>
                     </div>
                     <div>
                        <span className="font-medium">Submitted:</span>
                        <span className="ml-2 text-gray-600">{formatDate(selectedApplication.createdAt)}</span>
                     </div>
                     <div>
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2 text-gray-600">{formatDate(selectedApplication.updatedAt)}</span>
                     </div>
                  </div>
               </div>

               {/* Comments */}
               {(selectedApplication.pstoComments || selectedApplication.comments) && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                     <h4 className="font-semibold text-lg text-gray-800 mb-2">Comments</h4>
                     <p className="text-gray-700">
                        {selectedApplication.pstoComments || selectedApplication.comments}
                     </p>
                  </div>
               )}
            </div>
         </div>
      );
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
               <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
               </div>
               <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Applications</h3>
                  <div className="mt-2 text-sm text-red-700">
                     <p>{error}</p>
                  </div>
                  <div className="mt-3">
                     <button
                        onClick={fetchApplications}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                     >
                        Retry
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
               <p className="text-gray-600">Track the status of your submitted applications</p>
            </div>
            <button
               onClick={fetchApplications}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
               Refresh
            </button>
         </div>

         {/* Applications List */}
         {applications.length === 0 ? (
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
               <p className="mt-1 text-sm text-gray-500">Get started by submitting your first application.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {applications.map((application) => (
                  <div key={application._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                     {/* Status Bar */}
                     <div className={`h-1 rounded-t-lg ${getStatusBarColor(application.status)}`}></div>
                     
                     <div className="p-6">
                        {/* Header with ID and Status */}
                        <div className="flex items-start justify-between mb-4">
                           <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                 {application.applicationId}
                              </h3>
                              <p className="text-sm text-gray-600">
                                 {application.enterpriseName}
                              </p>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status?.toUpperCase()}
                           </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-4">
                           SETUP Application
                        </p>

                        {/* Two Column Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                 Request Type
                              </p>
                              <p className="text-sm text-gray-900">
                                 {application.organizationType || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                 Submitted On
                              </p>
                              <p className="text-sm text-gray-900">
                                 {formatDate(application.createdAt)}
                              </p>
                           </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mb-4">
                           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Contact Person
                           </p>
                           <p className="text-sm text-gray-900">
                              {application.contactPerson}
                           </p>
                        </div>

                        {/* PSTO Status */}
                        {application.pstoStatus && (
                           <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                 PSTO Status
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPSTOStatusColor(application.pstoStatus)}`}>
                                 {application.pstoStatus?.toUpperCase()}
                              </span>
                           </div>
                        )}

                        {/* Comments */}
                        {application.pstoComments && (
                           <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                 Comments
                              </p>
                              <p className="text-sm text-gray-700">
                                 {application.pstoComments}
                              </p>
                           </div>
                        )}

                        {/* Actions */}
                        <div>
                           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Actions:
                           </p>
                           <div className="flex space-x-2">
                              <button
                                 onClick={() => setSelectedApplication(application)}
                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                 title="View Details"
                              >
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                 </svg>
                              </button>
                              <button
                                 onClick={fetchApplications}
                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                 title="Refresh"
                              >
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                 </svg>
                              </button>
                              <button
                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                 title="Download"
                              >
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Application Details Modal */}
         {renderApplicationDetails()}
      </div>
   );
};

export default ApplicationMonitor;
