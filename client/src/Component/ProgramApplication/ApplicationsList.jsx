import React, { useState } from 'react';
import { Card, Button, Badge } from '../UI';

const ApplicationsList = ({ 
   applications, 
   applicationsLoading, 
   setSelectedApplication, 
   getStatusColor, 
   formatDate 
}) => {
   const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
   const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'returned', 'rejected'

   // Filter applications based on status
   const filteredApplications = applications.filter(application => {
      if (statusFilter === 'all') return true;
      return application.pstoStatus === statusFilter;
   });

   // Get status counts for tabs
   const statusCounts = {
      all: applications.length,
      pending: applications.filter(app => app.pstoStatus === 'pending').length,
      approved: applications.filter(app => app.pstoStatus === 'approved').length,
      returned: applications.filter(app => app.pstoStatus === 'returned').length,
      rejected: applications.filter(app => app.pstoStatus === 'rejected').length,
   };

   // Handle delete application
   const handleDeleteApplication = async (applicationId) => {
      if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
         try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/programs/psto/applications/${applicationId}`, {
               method: 'DELETE',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            });

            if (!response.ok) {
               throw new Error('Failed to delete application');
            }

            // Refresh the page or update the applications list
            window.location.reload();
         } catch (error) {
            console.error('Error deleting application:', error);
            alert('Error deleting application: ' + error.message);
         }
      }
   };

   if (applicationsLoading) {
      return (
         <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading applications...</p>
         </div>
      );
   }

   if (applications.length === 0) {
      return (
         <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
            <p className="mt-1 text-sm text-gray-500">No applications are currently pending review.</p>
         </div>
      );
   }

   if (filteredApplications.length === 0) {
      return (
         <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {statusFilter} applications</h3>
            <p className="mt-1 text-sm text-gray-500">No applications found with the selected status filter.</p>
         </div>
      );
   }

   const renderCardView = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
         {filteredApplications.map((application) => (
            <Card key={application._id} className="p-3 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
               {/* Card Header */}
               <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                     <div className="flex items-center space-x-1.5 mb-1">
                        <div className="p-1 bg-purple-100 rounded-md">
                           <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 truncate">
                           {application.applicationId}
                        </h3>
                     </div>
                     <p className="text-xs text-gray-600 font-medium truncate">
                        {application.enterpriseName}
                     </p>
                  </div>
                  <Badge className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(application.pstoStatus)}`}>
                     {application.pstoStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
               </div>

               {/* Card Content */}
               <div className="space-y-1.5 mb-3">
                  <div className="flex items-center space-x-1.5">
                     <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{application.contactPerson}</p>
                        <p className="text-xs text-gray-500">Contact</p>
                     </div>
                  </div>
                  
                  {/* General Agreement Status */}
                  <div className="flex items-center space-x-1.5">
                     <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                           <div className={`w-1 h-1 rounded-full ${application.generalAgreement?.accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <p className="text-xs font-medium text-gray-900 truncate">
                              {application.generalAgreement?.accepted ? 'Accepted' : 'Not Accepted'}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                     <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{application.proponentId?.province || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Province</p>
                     </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                     <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{formatDate(application.createdAt)}</p>
                        <p className="text-xs text-gray-500">Submitted</p>
                     </div>
                  </div>
               </div>

               {/* Card Actions */}
               <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                     onClick={() => setSelectedApplication(application)}
                     className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                     title="Review Application"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                  </button>

                  <button
                     onClick={() => handleDeleteApplication(application._id)}
                     className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                     title="Delete Application"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                  </button>
               </div>
            </Card>
         ))}
      </div>
   );

   const renderListView = () => (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
               <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                           <span>Application ID</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                           <span>Enterprise Name</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span>Contact Person</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                           <span>Province</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                           <span>Business Activity</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                           <span>Submitted</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                           <span>Agreement</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                           <span>Status</span>
                        </div>
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                           <span>Actions</span>
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((application, index) => (
                     <tr key={application._id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                     }`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-gray-900">{application.applicationId}</div>
                                 <div className="text-xs text-gray-500">SETUP Program</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm font-semibold text-gray-900">{application.enterpriseName}</div>
                           <div className="text-xs text-gray-500 truncate max-w-32">{application.businessAddress}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{application.contactPerson}</div>
                           <div className="text-xs text-gray-500">{application.contactNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                 <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{application.proponentId?.province || 'N/A'}</span>
                           </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{application.businessActivity || 'N/A'}</div>
                           <div className="text-xs text-gray-500">{application.businessType || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">
                              {new Date(application.createdAt).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric'
                              })}
                           </div>
                           <div className="text-xs text-gray-500">
                              {new Date(application.createdAt).toLocaleTimeString('en-US', {
                                 hour: '2-digit',
                                 minute: '2-digit'
                              })}
                           </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                 application.generalAgreement?.accepted ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                 application.generalAgreement?.accepted 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                 {application.generalAgreement?.accepted ? 'Accepted' : 'Not Accepted'}
                              </span>
                           </div>
                           {application.generalAgreement?.signatoryName && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-24">
                                 {application.generalAgreement.signatoryName}
                              </div>
                           )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              application.pstoStatus === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                              application.pstoStatus === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                              application.pstoStatus === 'returned' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border border-yellow-200'
                           }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                 application.pstoStatus === 'approved' ? 'bg-green-500' :
                                 application.pstoStatus === 'rejected' ? 'bg-red-500' :
                                 application.pstoStatus === 'returned' ? 'bg-blue-500' :
                                 'bg-yellow-500'
                              }`}></div>
                              {application.pstoStatus?.toUpperCase() || 'PENDING'}
                           </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <div className="flex items-center space-x-2">
                              <button
                                 onClick={() => setSelectedApplication(application)}
                                 className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                                 title="Review Application"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                 </svg>
                              </button>
                              <button
                                 onClick={() => handleDeleteApplication(application._id)}
                                 className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                                 title="Delete Application"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         {/* View Toggle Header */}
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
                     <p className="text-sm font-medium text-gray-900">{filteredApplications.length}</p>
                     <p className="text-xs text-gray-500">
                        {statusFilter === 'all' ? 'Total Applications' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`}
                     </p>
                  </div>
                  
                  {/* View Toggle Buttons */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                     <button
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                           viewMode === 'card' 
                              ? 'bg-white text-purple-700 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                        }`}
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Card View
                     </button>
                     <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                           viewMode === 'list' 
                              ? 'bg-white text-purple-700 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                        }`}
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        List View
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Enhanced Status Filter Tabs */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
               <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center group ${
                     statusFilter === 'all'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
                  }`}
               >
                  <div className={`p-1 rounded-md mr-2 transition-colors ${
                     statusFilter === 'all' ? 'bg-purple-200' : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}>
                     <svg className={`w-3 h-3 ${statusFilter === 'all' ? 'text-purple-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <span>All Applications</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'all' 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                  }`}>
                     {statusCounts.all}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center group ${
                     statusFilter === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
                  }`}
               >
                  <div className={`p-1 rounded-md mr-2 transition-colors ${
                     statusFilter === 'pending' ? 'bg-yellow-200' : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}>
                     <svg className={`w-3 h-3 ${statusFilter === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <span>Pending</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'pending' 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                  }`}>
                     {statusCounts.pending}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center group ${
                     statusFilter === 'approved'
                        ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
                  }`}
               >
                  <div className={`p-1 rounded-md mr-2 transition-colors ${
                     statusFilter === 'approved' ? 'bg-green-200' : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}>
                     <svg className={`w-3 h-3 ${statusFilter === 'approved' ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <span>Approved</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'approved' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                  }`}>
                     {statusCounts.approved}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('returned')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center group ${
                     statusFilter === 'returned'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
                  }`}
               >
                  <div className={`p-1 rounded-md mr-2 transition-colors ${
                     statusFilter === 'returned' ? 'bg-blue-200' : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}>
                     <svg className={`w-3 h-3 ${statusFilter === 'returned' ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                  </div>
                  <span>Returned for Revision</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'returned' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                  }`}>
                     {statusCounts.returned}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center group ${
                     statusFilter === 'rejected'
                        ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
                  }`}
               >
                  <div className={`p-1 rounded-md mr-2 transition-colors ${
                     statusFilter === 'rejected' ? 'bg-red-200' : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}>
                     <svg className={`w-3 h-3 ${statusFilter === 'rejected' ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </div>
                  <span>Rejected</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'rejected' 
                        ? 'bg-red-200 text-red-800' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                  }`}>
                     {statusCounts.rejected}
                  </span>
               </button>
            </div>
         </div>

         {/* Applications Content */}
         {viewMode === 'card' ? renderCardView() : renderListView()}
      </div>
   );
};

export default ApplicationsList;