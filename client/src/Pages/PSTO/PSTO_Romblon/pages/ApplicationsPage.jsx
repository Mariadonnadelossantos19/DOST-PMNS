import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { API_ENDPOINTS } from '../../../../config/api';

const ApplicationsPage = () => {
   const [applications, setApplications] = useState([]);
   const [applicationsLoading, setApplicationsLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [_error, setError] = useState(null);

   // Helper functions
   const getStatusColor = (status) => {
      switch (status) {
         case 'pending': return 'bg-yellow-100 text-yellow-800';
         case 'approved': return 'bg-green-100 text-green-800';
         case 'returned': return 'bg-blue-100 text-blue-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   // Fetch applications for PSTO review
   const fetchApplications = async () => {
      try {
         setApplicationsLoading(true);
         setError(null);
         const token = localStorage.getItem('authToken');
         
         console.log('Fetching PSTO applications...');
         console.log('API Endpoint:', API_ENDPOINTS.PSTO_APPLICATIONS);
         console.log('Token:', token ? 'Present' : 'Missing');
         
         if (!token) {
            setError('Please login first');
            return;
         }

         const response = await fetch(API_ENDPOINTS.PSTO_APPLICATIONS, {   
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         console.log('Response status:', response.status);
         console.log('Response ok:', response.ok);

         if (!response.ok) {
            if (response.status === 403) {
               setError('Access denied. PSTO role required.');
               return;
            }
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
         }

         const data = await response.json();
         console.log('Applications response:', data);
         setApplications(data.data || []);
      } catch (err) {
         console.error('Error fetching applications:', err);
         setError(err.message);
      } finally {
         setApplicationsLoading(false);
      }
   };

   // Review application
   const reviewApplication = async (applicationId) => {
      try {
         const token = localStorage.getItem('authToken');
         
         const response = await fetch(`${API_ENDPOINTS.PSTO_APPLICATIONS}/${applicationId}/review`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: reviewStatus,
               comments: reviewComments
            })
         });

         if (!response.ok) {
            throw new Error('Failed to review application');
         }

         const data = await response.json();
         console.log('Application reviewed:', data);
         
         // Refresh applications list
         fetchApplications();
         setSelectedApplication(null);
         setReviewStatus('');
         setReviewComments('');
         
         alert('Application reviewed successfully!');
      } catch (err) {
         console.error('Error reviewing application:', err);
         alert('Error reviewing application: ' + err.message);
      }
   };

   useEffect(() => {
      fetchApplications();
   }, []);

   return (
      <div className="space-y-6">
         {/* Enhanced Header Section */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                     <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">SETUP Applications</h2>
                     <p className="text-sm text-gray-600 mt-1">
                        Review and manage applications from proponents in your province
                     </p>
                  </div>
               </div>
               
               <div className="flex items-center space-x-3">
                  <div className="text-right">
                     <p className="text-sm font-medium text-gray-900">{applications.length}</p>
                     <p className="text-xs text-gray-500">Total Applications</p>
                  </div>
                  <Button 
                     onClick={fetchApplications} 
                     disabled={applicationsLoading}
                     className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                     {applicationsLoading ? (
                        <>
                           <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                           </svg>
                           Refreshing...
                        </>
                     ) : (
                        <>
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           Refresh
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </div>

         {applicationsLoading ? (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
               <p className="text-gray-500 mt-4">Loading applications...</p>
            </div>
         ) : applications.length === 0 ? (
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
               <p className="mt-1 text-sm text-gray-500">No applications are currently pending review.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {/* Applications Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applications.map((application) => (
                     <Card key={application._id} className="p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                           <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                 <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <h3 className="text-lg font-bold text-gray-900">
                                    {application.applicationId}
                                 </h3>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                 {application.enterpriseName}
                              </p>
                           </div>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(application.pstoStatus)}`}>
                              {application.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </div>

                        {/* Card Content */}
                        <div className="space-y-3 mb-6">
                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-gray-900">{application.contactPerson}</p>
                                 <p className="text-xs text-gray-500">Contact Person</p>
                              </div>
                           </div>

                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-gray-900">{application.proponentId?.province || 'N/A'}</p>
                                 <p className="text-xs text-gray-500">Province</p>
                              </div>
                           </div>

                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-gray-900">{formatDate(application.createdAt)}</p>
                                 <p className="text-xs text-gray-500">Submitted</p>
                              </div>
                           </div>

                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-gray-900">{application.businessActivity || 'N/A'}</p>
                                 <p className="text-xs text-gray-500">Business Activity</p>
                              </div>
                           </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-100">
                           <Button
                              onClick={() => setSelectedApplication(application)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                           >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Review
                           </Button>
                           <Button
                              onClick={() => window.open(`/api/programs/psto/applications/${application._id}/download/letterOfIntent`, '_blank')}
                              variant="outline"
                              className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center justify-center"
                           >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Files
                           </Button>
                        </div>
                     </Card>
                  ))}
               </div>
            </div>
         )}

         {/* Review Modal */}
         {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Review Application</h3>
                        <button
                           onClick={() => setSelectedApplication(null)}
                           className="text-gray-500 hover:text-gray-700"
                        >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>

                     <div className="space-y-4 mb-6">
                        <div>
                           <h4 className="font-semibold text-gray-900">Application Details</h4>
                           <div className="mt-2 space-y-2">
                              <p><span className="font-medium">Application ID:</span> {selectedApplication.applicationId}</p>
                              <p><span className="font-medium">Enterprise:</span> {selectedApplication.enterpriseName}</p>
                              <p><span className="font-medium">Contact Person:</span> {selectedApplication.contactPerson}</p>
                              <p><span className="font-medium">Business Activity:</span> {selectedApplication.businessActivity}</p>
                              <p><span className="font-medium">Technology Needs:</span> {selectedApplication.technologyNeeds}</p>
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Decision
                           </label>
                           <select
                              value={reviewStatus}
                              onChange={(e) => setReviewStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           >
                              <option value="">Select decision</option>
                              <option value="approved">Approve</option>
                              <option value="returned">Return for Revision</option>
                              <option value="rejected">Reject</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comments
                           </label>
                           <textarea
                              value={reviewComments}
                              onChange={(e) => setReviewComments(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter your review comments..."
                           />
                        </div>
                     </div>

                     <div className="flex justify-end space-x-3">
                        <Button
                           onClick={() => setSelectedApplication(null)}
                           variant="outline"
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={() => reviewApplication(selectedApplication._id)}
                           disabled={!reviewStatus}
                        >
                           Submit Review
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ApplicationsPage;