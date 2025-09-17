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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredApplications.map((application) => (
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
                  
                  {/* General Agreement Status */}
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${application.generalAgreement?.accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <p className="text-sm font-medium text-gray-900">
                              General Agreement {application.generalAgreement?.accepted ? 'Accepted' : 'Not Accepted'}
                           </p>
                        </div>
                        {application.generalAgreement?.signatoryName && (
                           <p className="text-xs text-gray-500">
                              Signed by: {application.generalAgreement.signatoryName} ({application.generalAgreement.position})
                           </p>
                        )}
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
   );

   const renderListView = () => (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application ID
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enterprise Name
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Province
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Activity
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agreement
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                     <tr key={application._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                 <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                 {application.applicationId}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{application.enterpriseName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{application.contactPerson}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{application.proponentId?.province || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{application.businessActivity || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${application.generalAgreement?.accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={`text-xs font-medium ${application.generalAgreement?.accepted ? 'text-green-700' : 'text-red-700'}`}>
                                 {application.generalAgreement?.accepted ? 'Accepted' : 'Not Accepted'}
                              </span>
                           </div>
                           {application.generalAgreement?.signatoryName && (
                              <div className="text-xs text-gray-500 mt-1">
                                 {application.generalAgreement.signatoryName}
                              </div>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(application.pstoStatus)}`}>
                              {application.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex space-x-2">
                              <Button
                                 onClick={() => setSelectedApplication(application)}
                                 className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors duration-200 flex items-center"
                              >
                                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                 </svg>
                                 Review
                              </Button>
                              
                              <Button
                                 onClick={() => window.open(`/api/programs/psto/applications/${application._id}/download/letterOfIntent`, '_blank')}
                                 variant="outline"
                                 className="px-3 py-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center"
                              >
                                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 Files
                              </Button>
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

         {/* Status Filter Tabs */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
               <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                     statusFilter === 'all'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  All Applications
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                     {statusCounts.all}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                     statusFilter === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                     {statusCounts.pending}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                     statusFilter === 'approved'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                     {statusCounts.approved}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('returned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                     statusFilter === 'returned'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Returned for Revision
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                     {statusCounts.returned}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                     statusFilter === 'rejected'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Rejected
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
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