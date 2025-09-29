import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Badge, Modal } from '../UI';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../UI/ToastProvider';

const ApplicationsList = ({ 
   applications, 
   applicationsLoading, 
   setSelectedApplication, 
   getStatusColor, 
   formatDate 
}) => {
   const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
   const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'returned', 'rejected'
   const [searchTerm, setSearchTerm] = useState('');
   const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [applicationToDelete, setApplicationToDelete] = useState(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [isForwarding, setIsForwarding] = useState(false);
   
   const { showToast } = useToast();

   // Memoized filtered, searched, and sorted applications
   const processedApplications = useMemo(() => {
      let filtered = applications;
      
      // Filter by status
      if (statusFilter !== 'all') {
         switch (statusFilter) {
            case 'pending':
               filtered = applications.filter(app => app.status === 'pending' || app.status === 'under_review');
               break;
            case 'psto_approved':
               filtered = applications.filter(app => app.status === 'psto_approved');
               break;
            case 'tna_scheduled':
               filtered = applications.filter(app => app.status === 'tna_scheduled');
               break;
            case 'tna_conducted':
               filtered = applications.filter(app => app.status === 'tna_conducted');
               break;
            case 'tna_report_submitted':
               filtered = applications.filter(app => app.status === 'tna_report_submitted');
               break;
            case 'dost_approved':
               filtered = applications.filter(app => app.status === 'dost_mimaropa_approved');
               break;
            case 'returned':
               filtered = applications.filter(app => app.pstoStatus === 'returned');
               break;
            case 'rejected':
               filtered = applications.filter(app => app.status === 'psto_rejected' || app.status === 'dost_mimaropa_rejected');
               break;
            default:
               filtered = applications;
         }
      }
      
      // Filter by search term
      if (searchTerm) {
         const searchLower = searchTerm.toLowerCase();
         filtered = filtered.filter(app => 
            app.enterpriseName?.toLowerCase().includes(searchLower) ||
            app.applicationId?.toLowerCase().includes(searchLower) ||
            app.contactPerson?.toLowerCase().includes(searchLower) ||
            app.businessActivity?.toLowerCase().includes(searchLower) ||
            app.proponentId?.province?.toLowerCase().includes(searchLower)
         );
      }
      
      // Sort applications
      return filtered.sort((a, b) => {
         const aValue = a[sortConfig.key];
         const bValue = b[sortConfig.key];
         
         if (sortConfig.key === 'createdAt') {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return sortConfig.direction === 'desc' ? bDate - aDate : aDate - bDate;
         }
         
         if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'desc' 
               ? bValue.localeCompare(aValue)
               : aValue.localeCompare(bValue);
         }
         
         return 0;
      });
   }, [applications, statusFilter, searchTerm, sortConfig]);

   // Memoized status counts for better performance
   const statusCounts = useMemo(() => ({
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
      psto_approved: applications.filter(app => app.status === 'psto_approved').length,
      tna_scheduled: applications.filter(app => app.status === 'tna_scheduled').length,
      tna_conducted: applications.filter(app => app.status === 'tna_conducted').length,
      tna_report_submitted: applications.filter(app => app.status === 'tna_report_submitted').length,
      dost_approved: applications.filter(app => app.status === 'dost_mimaropa_approved').length,
      returned: applications.filter(app => app.pstoStatus === 'returned').length,
      rejected: applications.filter(app => app.status === 'psto_rejected' || app.status === 'dost_mimaropa_rejected').length,
   }), [applications]);


   // Handle delete application with improved UX
   const handleDeleteApplication = useCallback(async (applicationId) => {
      setApplicationToDelete(applicationId);
      setShowDeleteModal(true);
   }, []);
   
   const confirmDelete = useCallback(async () => {
      if (!applicationToDelete) return;
      
      try {
         setIsDeleting(true);
         const token = localStorage.getItem('authToken');
         const response = await fetch(`/api/programs/psto/applications/${applicationToDelete}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || 'Failed to delete application');
         }

         showToast('Application deleted successfully', 'success');
         // Refresh the page or update the applications list
         window.location.reload();
      } catch (error) {
         console.error('Error deleting application:', error);
         showToast(`Error deleting application: ${error.message}`, 'error');
      } finally {
         setIsDeleting(false);
         setShowDeleteModal(false);
         setApplicationToDelete(null);
      }
   }, [applicationToDelete, showToast]);

   // Handle forward to DOST MIMAROPA with better UX
   const handleForwardToDostMimaropa = useCallback(async (applicationId) => {
      if (!window.confirm('Are you sure you want to forward this application to DOST MIMAROPA for approval?')) {
         return;
      }
      
      try {
         setIsForwarding(true);
         const token = localStorage.getItem('authToken');
         const response = await fetch(API_ENDPOINTS.FORWARD_TO_DOST_MIMAROPA(applicationId), {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || 'Failed to forward application');
         }

         const result = await response.json();
         
         if (result.success) {
            showToast('Application forwarded to DOST MIMAROPA successfully!', 'success');
            // Refresh the page or update the applications list
            window.location.reload();
         } else {
            throw new Error(result.message || 'Failed to forward application');
         }
      } catch (error) {
         console.error('Error forwarding application:', error);
         showToast(`Error forwarding application: ${error.message}`, 'error');
      } finally {
         setIsForwarding(false);
      }
   }, [showToast]);

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

   if (processedApplications.length === 0) {
      return (
         <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Search applications..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                     <select
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={(e) => {
                           const [key, direction] = e.target.value.split('-');
                           setSortConfig({ key, direction });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="enterpriseName-asc">Enterprise A-Z</option>
                        <option value="enterpriseName-desc">Enterprise Z-A</option>
                     </select>
                  </div>
               </div>
            </div>
            
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? `No applications found matching "${searchTerm}"` : `No ${statusFilter} applications`}
               </h3>
               <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No applications found with the selected status filter.'}
               </p>
            </div>
         </div>
      );
   }

   const renderCardView = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {processedApplications.map((application) => (
            <Card key={application._id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:scale-[1.02] bg-white">
               <div className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                           <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 truncate">
                                 {application.applicationId}
                              </h3>
                              <p className="text-xs text-gray-500">SETUP Application</p>
                           </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 truncate mb-1">
                           {application.enterpriseName}
                        </h4>
                     </div>
                     <Badge 
                        className={`ml-4 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.pstoStatus)}`}
                     >
                        {application.pstoStatus?.toUpperCase() || 'PENDING'}
                     </Badge>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-4">
                     {/* Contact Person */}
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{application.contactPerson}</p>
                           <p className="text-xs text-gray-500">Contact Person</p>
                        </div>
                     </div>
                     
                     {/* Province */}
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{application.proponentId?.province || 'N/A'}</p>
                           <p className="text-xs text-gray-500">Province</p>
                        </div>
                     </div>

                     {/* Agreement Status */}
                     <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                           application.generalAgreement?.accepted ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                           <svg className={`w-5 h-5 ${
                              application.generalAgreement?.accepted ? 'text-green-600' : 'text-red-600'
                           }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                 d={application.generalAgreement?.accepted ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M6 18L18 6M6 6l12 12"} />
                           </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className={`text-sm font-medium truncate ${
                              application.generalAgreement?.accepted ? 'text-green-700' : 'text-red-700'
                           }`}>
                              {application.generalAgreement?.accepted ? 'Agreement Accepted' : 'Agreement Pending'}
                           </p>
                           <p className="text-xs text-gray-500">General Agreement</p>
                        </div>
                     </div>

                     {/* Submitted Date */}
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{formatDate(application.createdAt)}</p>
                           <p className="text-xs text-gray-500">Date Submitted</p>
                        </div>
                     </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                     <div className="flex space-x-3">
                        <Button
                           onClick={() => setSelectedApplication(application)}
                           className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                           Review
                        </Button>
                        
                        {application.pstoStatus === 'approved' && !application.forwardedToDostMimaropa && (
                           <Button
                              onClick={() => handleForwardToDostMimaropa(application._id)}
                              disabled={isForwarding}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isForwarding ? 'Forwarding...' : 'Forward'}
                           </Button>
                        )}
                     </div>
                     
                     <button
                        onClick={() => handleDeleteApplication(application._id)}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Delete Application"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                     </button>
                  </div>
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
                  {processedApplications.map((application, index) => (
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


                              {application.pstoStatus === 'approved' && !application.forwardedToDostMimaropa && (
                                 <button
                                    onClick={() => handleForwardToDostMimaropa(application._id)}
                                    className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                                    title="Forward to DOST MIMAROPA"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                 </button>
                              )}

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
         {/* Header */}
         <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <div>
                     <h1 className="text-3xl font-bold">SETUP Applications</h1>
                     <p className="text-purple-100 mt-1">
                        Review and manage applications from proponents in your province
                     </p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-purple-100 text-sm">Total Applications</p>
               </div>
            </div>
         </div>

         {/* Search and Controls */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4">
               
               {/* Search and Controls Row */}
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Search applications..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                     {/* Results Count */}
                     <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{processedApplications.length}</p>
                        <p className="text-xs text-gray-500">
                           {statusFilter === 'all' ? 'Total Applications' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`}
                           {searchTerm && ` matching "${searchTerm}"`}
                        </p>
                     </div>
                     
                     {/* Sort Dropdown */}
                     <select
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={(e) => {
                           const [key, direction] = e.target.value.split('-');
                           setSortConfig({ key, direction });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                     >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="enterpriseName-asc">Enterprise A-Z</option>
                        <option value="enterpriseName-desc">Enterprise Z-A</option>
                     </select>
                     
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
                           Card
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
                           List
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Status Filter Tabs */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap gap-3">
               <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                     statusFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
               >
                  <span>All Applications</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'all' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {statusCounts.all}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                     statusFilter === 'pending'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
               >
                  <span>Pending</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'pending' 
                        ? 'bg-yellow-400 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {statusCounts.pending}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                     statusFilter === 'approved'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
               >
                  <span>Approved</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'approved' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {statusCounts.approved}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('returned')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                     statusFilter === 'returned'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
               >
                  <span>Returned</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'returned' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {statusCounts.returned}
                  </span>
               </button>
               
               <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                     statusFilter === 'rejected'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
               >
                  <span>Rejected</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                     statusFilter === 'rejected' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {statusCounts.rejected}
                  </span>
               </button>
            </div>
         </div>

         {/* Applications Content */}
         {viewMode === 'card' ? renderCardView() : renderListView()}
         
         {/* Delete Confirmation Modal */}
         <Modal
            isOpen={showDeleteModal}
            onClose={() => {
               setShowDeleteModal(false);
               setApplicationToDelete(null);
            }}
            title="Confirm Deletion"
            size="md"
         >
            <div className="space-y-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                     <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
                     <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
               </div>
               
               <p className="text-gray-700">
                  Are you sure you want to delete this application? All associated data will be permanently removed.
               </p>
               
               <div className="flex justify-end space-x-3 pt-4">
                  <Button
                     variant="outline"
                     onClick={() => {
                        setShowDeleteModal(false);
                        setApplicationToDelete(null);
                     }}
                     disabled={isDeleting}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="danger"
                     onClick={confirmDelete}
                     disabled={isDeleting}
                  >
                     {isDeleting ? (
                        <div className="flex items-center space-x-2">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                           <span>Deleting...</span>
                        </div>
                     ) : (
                        'Delete Application'
                     )}
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default ApplicationsList;