import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useDarkMode } from '../Context';

const ApplicationMonitor = () => {
   const { isDarkMode } = useDarkMode();
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [filterStatus, setFilterStatus] = useState('all');
   const [searchTerm, setSearchTerm] = useState('');

   // Fetch user's applications
   const fetchApplications = async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('authToken');
         
         console.log('Fetching applications...');
         console.log('API Endpoint:', API_ENDPOINTS.SETUP_MY_APPLICATIONS);
         console.log('Token:', token ? 'Present' : 'Missing');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch(API_ENDPOINTS.SETUP_MY_APPLICATIONS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         console.log('Response status:', response.status);
         console.log('Response ok:', response.ok);

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         console.log('Response data:', result);
         
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

   // Filter applications based on status and search term
   const filteredApplications = applications.filter(application => {
      const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
         application.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         application.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         application.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
   });

   // Get status badge color - Program Application style
   const getStatusColor = (status) => {
      switch (status) {
         case 'approved': return isDarkMode ? 'bg-green-900/90 text-green-200 border border-green-700/60' : 'bg-green-50 text-green-800 border border-green-200';
         case 'rejected': return isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700/60' : 'bg-red-50 text-red-800 border border-red-200';
         case 'returned': return isDarkMode ? 'bg-yellow-900/90 text-yellow-200 border border-yellow-700/60' : 'bg-yellow-50 text-yellow-800 border border-yellow-200';
         case 'pending': return isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200';
         default: return isDarkMode ? 'bg-gray-900/90 text-gray-200 border border-gray-700/60' : 'bg-gray-50 text-gray-800 border border-gray-200';
      }
   };

   // Get PSTO status badge color - Program Application style
   const getPSTOStatusColor = (status) => {
      switch (status) {
         case 'approved': return isDarkMode ? 'bg-green-900/90 text-green-200 border border-green-700/60' : 'bg-green-50 text-green-800 border border-green-200';
         case 'rejected': return isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700/60' : 'bg-red-50 text-red-800 border border-red-200';
         case 'returned': return isDarkMode ? 'bg-yellow-900/90 text-yellow-200 border border-yellow-700/60' : 'bg-yellow-50 text-yellow-800 border border-yellow-200';
         case 'pending': return isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200';
         default: return isDarkMode ? 'bg-gray-900/90 text-gray-200 border border-gray-700/60' : 'bg-gray-50 text-gray-800 border border-gray-200';
      }
   };

   // Get status bar color for top border - Program Application style
   const getStatusBarColor = (status) => {
      switch (status) {
         case 'approved': return 'bg-gradient-to-r from-green-500 to-green-600';
         case 'rejected': return 'bg-gradient-to-r from-red-500 to-red-600';
         case 'returned': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
         case 'pending': return 'bg-gradient-to-r from-blue-500 to-blue-600';
         default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
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
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
               {/* Header */}
               <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-bold">Application Details</h3>
                        <p className="text-blue-100 text-sm">{selectedApplication.applicationId}</p>
                     </div>
                     <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-white hover:text-blue-200 transition-colors p-1"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  </div>
               </div>

               <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                  <div className="p-4">
                     {/* Status Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                           <div className="flex items-center">
                              <div className="p-1.5 bg-blue-100 rounded mr-2">
                                 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-500">Status</p>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                                    {selectedApplication.status?.toUpperCase()}
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                           <div className="flex items-center">
                              <div className="p-1.5 bg-green-100 rounded mr-2">
                                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-500">PSTO</p>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPSTOStatusColor(selectedApplication.pstoStatus)}`}>
                                    {selectedApplication.pstoStatus?.toUpperCase()}
                                 </span>
                                 {selectedApplication.forwardedToPSTO && (
                                    <p className="text-xs text-green-600 mt-1">✓ Forwarded to PSTO</p>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                           <div className="flex items-center">
                              <div className="p-1.5 bg-purple-100 rounded mr-2">
                                 <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-gray-500">Submitted</p>
                                 <p className="text-xs text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Main Content Grid */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                           {/* Basic Information */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                 <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                 </svg>
                                 Basic Information
                              </h4>
                              <div className="space-y-2">
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Enterprise Name:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.enterpriseName}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Contact Person:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.contactPerson}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Position:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.position}</span>
                                 </div>
                                 <div className="py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Office Address:</span>
                                    <p className="text-sm text-gray-900 mt-1">{selectedApplication.officeAddress}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Contact Details */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                 <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                 </svg>
                                 Contact Details
                              </h4>
                              <div className="space-y-2">
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.contactPersonTel}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Email:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.contactPersonEmail}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Website:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.website || 'N/A'}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Enterprise Details */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                 <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                                 Enterprise Details
                              </h4>
                              <div className="space-y-2">
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Year Established:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.yearEstablished}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Organization Type:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.organizationType}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Profit Type:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.profitType}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Registration No:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.registrationNo}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                           {/* Business Information */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                 <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                 </svg>
                                 Business Information
                              </h4>
                              <div className="space-y-2">
                                 <div className="py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Business Activity:</span>
                                    <p className="text-sm text-gray-900 mt-1">{selectedApplication.businessActivity || 'N/A'}</p>
                                 </div>
                                 <div className="py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Specific Product:</span>
                                    <p className="text-sm text-gray-900 mt-1">{selectedApplication.specificProduct || 'N/A'}</p>
                                 </div>
                                 <div className="py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Technology Needs:</span>
                                    <p className="text-sm text-gray-900 mt-1">{selectedApplication.technologyNeeds || 'N/A'}</p>
                                 </div>
                                 <div className="flex justify-between py-1.5 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Current Tech Level:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.currentTechnologyLevel}</span>
                                 </div>
                                 <div className="flex justify-between py-1.5">
                                    <span className="text-sm font-medium text-gray-600">Desired Tech Level:</span>
                                    <span className="text-sm text-gray-900">{selectedApplication.desiredTechnologyLevel}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Files Section */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                                 <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 Attached Files
                              </h4>
                              <div className="space-y-2">
                                 {selectedApplication.letterOfIntent ? (
                                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                       <div className="flex items-center">
                                          <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <div>
                                             <p className="text-sm font-medium text-gray-900">Letter of Intent</p>
                                             <p className="text-xs text-gray-500">{selectedApplication.letterOfIntent}</p>
                                          </div>
                                       </div>
                                       <button
                                          onClick={() => window.open(`/api/programs/setup/${selectedApplication._id}/download/letterOfIntent`, '_blank')}
                                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                       >
                                          Download
                                       </button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded border border-gray-200">
                                       <div className="flex items-center">
                                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <div>
                                             <p className="text-sm font-medium text-gray-500">Letter of Intent</p>
                                             <p className="text-xs text-gray-400">No file uploaded</p>
                                          </div>
                                       </div>
                                    </div>
                                 )}

                                 {selectedApplication.enterpriseProfile ? (
                                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                       <div className="flex items-center">
                                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <div>
                                             <p className="text-sm font-medium text-gray-900">Enterprise Profile</p>
                                             <p className="text-xs text-gray-500">{selectedApplication.enterpriseProfile}</p>
                                          </div>
                                       </div>
                                       <button
                                          onClick={() => window.open(`/api/programs/setup/${selectedApplication._id}/download/enterpriseProfile`, '_blank')}
                                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                       >
                                          Download
                                       </button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded border border-gray-200">
                                       <div className="flex items-center">
                                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <div>
                                             <p className="text-sm font-medium text-gray-500">Enterprise Profile</p>
                                             <p className="text-xs text-gray-400">No file uploaded</p>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Comments */}
                           {(selectedApplication.pstoComments || selectedApplication.comments) && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                 <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Comments
                                 </h4>
                                 <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                                    {selectedApplication.pstoComments || selectedApplication.comments}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
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
      <div className={`space-y-4 transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
         {/* Program Application Style Header */}
         <div className={`rounded-lg p-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-blue-600/40' : 'bg-gradient-to-br from-white to-gray-50 border-blue-200/60'
         } border shadow-lg`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
               <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                     isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'
                  }`}>
                     <svg className={`w-5 h-5 text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <div>
                     <h2 className={`text-xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>My Applications</h2>
                     <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>Track the status of your submitted applications</p>
                  </div>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Bar */}
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                     <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-7 pr-3 py-1.5 border rounded text-xs transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                           isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white'
                        }`}
                     />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                     className={`px-2 py-1.5 border rounded text-xs transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white' 
                           : 'bg-white border-gray-300 text-gray-900'
                     }`}
                  >
                     <option value="all">All Status</option>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                     <option value="returned">Returned</option>
                  </select>
                  
                  {/* Refresh Button - Program Application Style */}
                  <button
                     onClick={fetchApplications}
                     className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 text-xs hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-md hover:shadow-lg ring-1 ring-blue-500/20 hover:ring-blue-500/40"
                  >
                     <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                     </div>
                  </button>
               </div>
            </div>
            
            {/* Program Application Style Stats Cards */}
            <div className="mt-4 grid grid-cols-4 gap-2">
               {[
                  { label: 'Total', count: applications.length, color: 'blue' },
                  { label: 'Pending', count: applications.filter(app => app.status === 'pending').length, color: 'blue' },
                  { label: 'Approved', count: applications.filter(app => app.status === 'approved').length, color: 'green' },
                  { label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length, color: 'red' }
               ].map((stat, index) => (
                  <div key={index} className={`p-2 rounded-lg border transition-colors duration-300 ${
                     isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                  } shadow-sm hover:shadow-md`}>
                     <div className="flex items-center justify-between">
                        <div className={`p-1 rounded-lg ${
                           stat.color === 'blue' ? (isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100') :
                           stat.color === 'green' ? (isDarkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100') :
                           (isDarkMode ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-50 to-red-100')
                        }`}>
                           <svg className={`w-3 h-3 ${
                              stat.color === 'blue' ? 'text-blue-600' :
                              stat.color === 'green' ? 'text-green-600' :
                              'text-red-600'
                           }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                           </svg>
                        </div>
                        <div className="text-right">
                           <p className={`text-xs font-bold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>{stat.count}</p>
                           <p className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                           }`}>{stat.label}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Applications List */}
         {filteredApplications.length === 0 ? (
            <div className={`text-center py-12 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
               <div className={`p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
               }`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <h3 className={`mt-4 text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                  {searchTerm || filterStatus !== 'all' ? 'No matching applications' : 'No applications'}
               </h3>
               <p className={`mt-2 text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>
                  {searchTerm || filterStatus !== 'all' 
                     ? 'Try adjusting your search or filter criteria.' 
                     : 'Get started by submitting your first application.'
                  }
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredApplications.map((application) => (
                  <div key={application._id} className={`group rounded-lg border shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 ${
                     isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300'
                  }`}>
                     {/* Status Bar */}
                     <div className={`h-1 rounded-t-lg ${getStatusBarColor(application.status)}`}></div>
                     
                     <div className="p-4">
                        {/* Compact Header with ID and Status */}
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className={`p-1.5 rounded-lg ${
                                 application.status === 'approved' ? (isDarkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100') :
                                 application.status === 'rejected' ? (isDarkMode ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-50 to-red-100') :
                                 application.status === 'returned' ? (isDarkMode ? 'bg-gradient-to-br from-yellow-900 to-yellow-800' : 'bg-gradient-to-br from-yellow-50 to-yellow-100') :
                                 (isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100')
                              }`}>
                                 <svg className={`w-3 h-3 ${
                                    application.status === 'approved' ? 'text-green-600' :
                                    application.status === 'rejected' ? 'text-red-600' :
                                    application.status === 'returned' ? 'text-yellow-600' :
                                    'text-blue-600'
                                 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h3 className={`text-sm font-bold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                 } truncate`}>
                                    {application.applicationId}
                                 </h3>
                                 <p className={`text-xs transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                 } truncate`}>
                                    {application.enterpriseName}
                                 </p>
                              </div>
                           </div>
                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status?.toUpperCase()}
                           </span>
                        </div>

                        {/* Program Application Style Description */}
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium mb-3 ${
                           isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                           <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                           SETUP
                        </div>

                        {/* Compact Info Grid */}
                        <div className="space-y-2 mb-3">
                           <div className="flex justify-between items-center">
                              <span className={`text-xs font-medium transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>Business Type:</span>
                              <span className={`text-xs transition-colors duration-300 ${
                                 isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{application.organizationType || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className={`text-xs font-medium transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>Contact:</span>
                              <span className={`text-xs transition-colors duration-300 ${
                                 isDarkMode ? 'text-white' : 'text-gray-900'
                              } truncate max-w-24`}>{application.contactPerson}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className={`text-xs font-medium transition-colors duration-300 ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>Submitted:</span>
                              <span className={`text-xs transition-colors duration-300 ${
                                 isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{new Date(application.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>

                        {/* Program Application Style PSTO Status */}
                        {application.pstoStatus && (
                           <div className="mb-3">
                              <div className="flex items-center justify-between">
                                 <span className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                 }`}>PSTO Status:</span>
                                 <div className="flex items-center space-x-1">
                                    <div className={`p-1 rounded-lg ${
                                       application.pstoStatus === 'approved' ? (isDarkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100') :
                                       application.pstoStatus === 'rejected' ? (isDarkMode ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-50 to-red-100') :
                                       application.pstoStatus === 'returned' ? (isDarkMode ? 'bg-gradient-to-br from-yellow-900 to-yellow-800' : 'bg-gradient-to-br from-yellow-50 to-yellow-100') :
                                       (isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100')
                                    }`}>
                                       <svg className={`w-2.5 h-2.5 ${
                                          application.pstoStatus === 'approved' ? 'text-green-600' :
                                          application.pstoStatus === 'rejected' ? 'text-red-600' :
                                          application.pstoStatus === 'returned' ? 'text-yellow-600' :
                                          'text-blue-600'
                                       }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPSTOStatusColor(application.pstoStatus)}`}>
                                       {application.pstoStatus?.toUpperCase()}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Compact Forwarding Status */}
                        {application.forwardedToPSTO && (
                           <div className={`mb-3 p-2 rounded border transition-colors duration-300 ${
                              isDarkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'
                           }`}>
                              <div className="flex items-center">
                                 <div className="p-1 bg-green-100 rounded mr-2">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className={`text-xs font-semibold transition-colors duration-300 ${
                                       isDarkMode ? 'text-green-300' : 'text-green-800'
                                    }`}>Forwarded to PSTO</p>
                                    <p className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-green-400' : 'text-green-600'
                                    }`}>
                                       {application.forwardedAt ? new Date(application.forwardedAt).toLocaleDateString() : 'Recently forwarded'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Compact Comments */}
                        {application.pstoComments && (
                           <div className={`mb-3 p-2 rounded border transition-colors duration-300 ${
                              isDarkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
                           }`}>
                              <div className="flex items-start space-x-2">
                                 <div className="p-1 bg-yellow-100 rounded flex-shrink-0 mt-0.5">
                                    <svg className="w-2.5 h-2.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className={`text-xs font-semibold transition-colors duration-300 ${
                                       isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                                    }`}>Comments</p>
                                    <p className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                                    }`}>
                                       {application.pstoComments}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Program Application Style Actions */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                           <div className="flex space-x-1">
                              <button
                                 onClick={() => setSelectedApplication(application)}
                                 className={`flex-1 px-2 py-1.5 border rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    isDarkMode 
                                       ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                                       : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                                 }`}
                                 title="View Details"
                              >
                                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                 </svg>
                                 <span className="text-xs">View</span>
                              </button>
                              <button
                                 onClick={fetchApplications}
                                 className={`flex-1 px-2 py-1.5 border rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                    isDarkMode 
                                       ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                                       : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                                 }`}
                                 title="Refresh"
                              >
                                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                 </svg>
                                 <span className="text-xs">Refresh</span>
                              </button>
                              <button
                                 className={`flex-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-md hover:shadow-lg ring-1 ring-blue-500/20 hover:ring-blue-500/40`}
                                 title="Download"
                              >
                                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <span className="text-xs">Download</span>
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
