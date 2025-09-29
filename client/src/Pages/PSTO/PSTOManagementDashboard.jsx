import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
   Card, 
   Button, 
   DataTable, 
   StatusBadge, 
   TabNavigation,
   Toast
} from '../../Component/UI';
import PageLayout from '../../Component/Layouts/PageLayout';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';
import { useToast } from '../../Component/UI/ToastProvider';

/**
 * PSTO Management Dashboard - Application Management Component
 * 
 * PURPOSE: Dedicated component for managing applications with full CRUD operations
 * 
 * FEATURES:
 * - Tabbed interface for filtering applications (All, Pending, Approved, etc.)
 * - Application review modal with document validation
 * - TNA scheduling and forwarding to DOST MIMAROPA
 * - Statistics dashboard
 * 
 * USAGE: Embedded within UnifiedPSTODashboard for 'applications' and 'management' views
 */
const PSTOManagementDashboard = React.memo(({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [activeTab, setActiveTab] = useState('all');
   const [searchTerm, setSearchTerm] = useState('');
   const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
   
   // ApplicationReviewModal states
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   
   const { showToast } = useToast();

   // Fetch applications for PSTO management with improved error handling
   const fetchApplications = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
         
         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            signal: controller.signal
         });
         
         clearTimeout(timeoutId);

         if (response.ok) {
            const data = await response.json();
            setApplications(data.data || []);
            // showToast('Applications loaded successfully', 'success'); // Commented out to reduce noise
         } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            const errorMessage = `Failed to fetch applications: ${errorData.message}`;
            setError(errorMessage);
            showToast(errorMessage, 'error');
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         const errorMessage = error.name === 'AbortError' 
            ? 'Request timed out. Please try again.' 
            : `Network error: ${error.message}`;
         setError(errorMessage);
         showToast(errorMessage, 'error');
      } finally {
         setLoading(false);
      }
   }, [showToast]);

   useEffect(() => {
      fetchApplications();
   }, [fetchApplications]);

   // Define table columns for applications
   const applicationColumns = [
      {
         key: 'applicationId',
         header: 'Application ID',
         render: (value, row) => (
            <div className="font-mono text-sm">
               <div className="font-semibold text-gray-900">{value || row._id?.slice(-8)}</div>
               <div className="text-xs text-gray-500">{row.programName} Application</div>
            </div>
         )
      },
      {
         key: 'enterpriseName',
         header: 'Enterprise Name',
         render: (value) => (
            <div className="font-medium text-gray-900">{value}</div>
         )
      },
      {
         key: 'proponentId',
         header: 'Contact Person',
         render: (value) => (
            <div>
               <div className="font-medium text-gray-900">{value?.firstName} {value?.lastName}</div>
               <div className="text-sm text-gray-500">{value?.email}</div>
               <div className="text-sm text-gray-500">{value?.province}</div>
            </div>
         )
      },
      {
         key: 'businessActivity',
         header: 'Business Activity',
         render: (value) => (
            <div className="max-w-xs">
               <div className="text-sm text-gray-900 truncate" title={value}>
                  {value || 'Not specified'}
               </div>
            </div>
         )
      },
      {
         key: 'createdAt',
         header: 'Submitted',
         render: (value) => (
            <div className="text-sm">
               <div className="font-medium text-gray-900">{new Date(value).toLocaleDateString()}</div>
               <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</div>
            </div>
         )
      },
      {
         key: 'status',
         header: 'Status',
         render: (value) => <StatusBadge status={value} />
      }
   ];

   const getApplicationActions = (application) => (
      <div className="flex space-x-2">
         <Button
            onClick={() => handleViewDetails(application)}
            variant="outline"
            size="sm"
         >
            View
         </Button>

         {(application.status === 'pending' || application.status === 'under_review') && !application.pstoStatus && (
            <Button
               onClick={() => handleValidateApplication(application)}
               variant="primary"
               size="sm"
            >
               Review
            </Button>
         )}

         {application.pstoStatus === 'returned' && (
            <Button
               onClick={() => handleValidateApplication(application)}
               variant="outline"
               size="sm"
            >
               Re-review
            </Button>
         )}
      </div>
   );

   const handleValidateApplication = (application) => {
      setSelectedApplication(application);
      setReviewStatus(application.pstoStatus || '');
      setReviewComments(application.pstoComments || '');
   };

   const handleViewDetails = (application) => {
      setSelectedApplication(application);
      setReviewStatus(application.pstoStatus || '');
      setReviewComments(application.pstoComments || '');
   };

   const handleForwardToDostMimaropa = async (application) => {
      try {
         setLoading(true);

         // First, check if TNA exists and is completed
         const tnaResponse = await fetch(`http://localhost:4000/api/tna/list?applicationId=${application._id}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            } 
         });

         if (tnaResponse.ok) {
            const tnaData = await tnaResponse.json();
            const tna = tnaData.data?.find(t => t.applicationId === application._id);

            if (!tna) {
               alert('TNA must be scheduled and completed before forwarding to DOST MIMAROPA');
               return;
            }

            if (tna.status !== 'completed') {
               alert('TNA must be completed before forwarding to DOST MIMAROPA');
               return;
            }

            if (!tna.tnaReport || !tna.tnaReport.filename) {
               alert('TNA report must be uploaded before forwarding to DOST MIMAROPA');
               return;
            }
         }

         // Forward to DOST MIMAROPA
         const response = await fetch(`http://localhost:4000/api/tna/${application._id}/submit-to-dost`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            alert('Application successfully forwarded to DOST MIMAROPA!');
            setSelectedApplication(null);
            fetchApplications(); // Refresh the list
         } else {
            const errorData = await response.json();
            alert(`Failed to forward to DOST MIMAROPA: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error forwarding to DOST MIMAROPA:', error);
         alert('Error forwarding to DOST MIMAROPA. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   // Helper functions for ApplicationReviewModal
   const getStatusColor = (status) => {
      switch (status) {
         case 'approved': return 'bg-green-100 text-green-800';
         case 'returned': return 'bg-yellow-100 text-yellow-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         case 'pending': return 'bg-blue-100 text-blue-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
   };

   const reviewApplication = useCallback(async (applicationId) => {
      if (!reviewStatus || !reviewComments.trim()) {
         showToast('Please provide both status and comments', 'error');
         return;
      }
      
      try {
         setLoading(true);
         const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${applicationId}/validate`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: reviewStatus,
               comments: reviewComments.trim(),
               validatedBy: currentUser.id,
               validatedAt: new Date().toISOString()
            })
         });

         if (response.ok) {
            const successMessage = `Application ${reviewStatus === 'approved' ? 'approved' : 'returned for revision'} successfully!`;
            showToast(successMessage, 'success');
            setSelectedApplication(null);
            setReviewStatus('');
            setReviewComments('');
            await fetchApplications(); // Refresh the list
         } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            showToast(`Failed to review application: ${errorData.message}`, 'error');
         }
      } catch (error) {
         console.error('Error reviewing application:', error);
         showToast('Error reviewing application. Please try again.', 'error');
      } finally {
         setLoading(false);
      }
   }, [reviewStatus, reviewComments, currentUser.id, showToast, fetchApplications]);

   // Document download function (currently unused but kept for future use)
   // const downloadDocument = useCallback(async (applicationId, fileType) => {
   //    try {
   //       const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${applicationId}/download/${fileType}`, {
   //          headers: {
   //             'Authorization': `Bearer ${localStorage.getItem('authToken')}`
   //          }
   //       });
   //
   //       if (response.ok) {
   //          const blob = await response.blob();
   //          const url = window.URL.createObjectURL(blob);
   //          const a = document.createElement('a');
   //          a.href = url;
   //          a.download = `${fileType}_${applicationId}.pdf`;
   //          document.body.appendChild(a);
   //          a.click();
   //          window.URL.revokeObjectURL(url);
   //          document.body.removeChild(a);
   //          showToast('Document downloaded successfully', 'success');
   //       } else {
   //          showToast('Error downloading document', 'error');
   //       }
   //    } catch (error) {
   //       console.error('Error downloading document:', error);
   //       showToast('Error downloading document', 'error');
   //    }
   // }, [showToast]);

   // Memoized statistics calculation for better performance
   const stats = useMemo(() => ({
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'psto_approved').length,
      returned: applications.filter(app => app.status === 'pending' && app.pstoStatus === 'returned').length,
      rejected: applications.filter(app => app.status === 'psto_rejected').length
   }), [applications]);

   // Minimalist tab configuration - Simplified
   const tabs = [
      {
         id: 'all',
         label: 'All',
         count: stats.total
      },
      {
         id: 'pending',
         label: 'Pending',
         count: stats.pending
      },
      {
         id: 'approved',
         label: 'Approved',
         count: stats.approved
      },
      {
         id: 'returned',
         label: 'Returned',
         count: stats.returned
      },
      {
         id: 'rejected',
         label: 'Rejected',
         count: stats.rejected
      }
   ];

   // Memoized filtered and sorted applications
   const filteredAndSortedApplications = useMemo(() => {
      let filtered = applications;
      
      // Filter by tab
      switch (activeTab) {
         case 'pending':
            filtered = applications.filter(app => app.status === 'pending' || app.status === 'under_review');
            break;
         case 'approved':
            filtered = applications.filter(app => app.status === 'psto_approved');
            break;
         case 'returned':
            filtered = applications.filter(app => app.status === 'pending' && app.pstoStatus === 'returned');
            break;
         case 'rejected':
            filtered = applications.filter(app => app.status === 'psto_rejected');
            break;
         default:
            filtered = applications;
      }
      
      // Filter by search term
      if (searchTerm) {
         const searchLower = searchTerm.toLowerCase();
         filtered = filtered.filter(app => 
            app.enterpriseName?.toLowerCase().includes(searchLower) ||
            app.applicationId?.toLowerCase().includes(searchLower) ||
            app.proponentId?.firstName?.toLowerCase().includes(searchLower) ||
            app.proponentId?.lastName?.toLowerCase().includes(searchLower) ||
            app.proponentId?.email?.toLowerCase().includes(searchLower) ||
            app.businessActivity?.toLowerCase().includes(searchLower)
         );
      }
      
      // Sort applications
      return filtered.sort((a, b) => {
         const aValue = a[sortConfig.key];
         const bValue = b[sortConfig.key];
         
         if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
         }
         if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
         }
         return 0;
      });
   }, [applications, activeTab, searchTerm, sortConfig]);

   return (
      <PageLayout
         title="Application Management"
         subtitle="Manage applications that submitted by the proponents"
         actions={
            <Button
               variant="outline"
               onClick={fetchApplications}
               size="sm"
            >
               Refresh
            </Button>
         }
         loading={loading}
         error={error}
      >
         {/* Enhanced Statistics Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                     <div className="text-sm text-gray-500">Total Applications</div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
               </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                     <div className="text-sm text-gray-500">Pending Review</div>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                     <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
               </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                     <div className="text-sm text-gray-500">Approved</div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
               </div>
            </Card>
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                     <div className="text-sm text-gray-500">Rejected</div>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                     <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </div>
               </div>
            </Card>
         </div>

         {/* Search and Filter Controls */}
         <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="flex-1 max-w-md">
                  <div className="relative">
                     <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                     <option value="createdAt-desc">Newest First</option>
                     <option value="createdAt-asc">Oldest First</option>
                     <option value="enterpriseName-asc">Enterprise A-Z</option>
                     <option value="enterpriseName-desc">Enterprise Z-A</option>
                  </select>
               </div>
            </div>
         </Card>

         {/* Tab Navigation */}
         <Card className="mb-6">
            <TabNavigation
               tabs={tabs}
               activeTab={activeTab}
               onTabChange={setActiveTab}
            />
         </Card>

         {/* Applications Table */}
         <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
               <div className="flex justify-between items-center">
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                        {tabs.find(tab => tab.id === activeTab)?.label} Applications
                     </h3>
                     <p className="text-sm text-gray-500 mt-1">
                        {filteredAndSortedApplications.length} of {applications.length} applications
                        {searchTerm && ` matching "${searchTerm}"`}
                     </p>
                  </div>
                  <Button
                     onClick={fetchApplications}
                     variant="outline"
                     size="sm"
                     disabled={loading}
                  >
                     {loading ? (
                        <div className="flex items-center space-x-2">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                           <span>Refreshing...</span>
                        </div>
                     ) : (
                        <div className="flex items-center space-x-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           <span>Refresh</span>
                        </div>
                     )}
                  </Button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <DataTable
                  data={filteredAndSortedApplications}
                  columns={applicationColumns}
                  actions={getApplicationActions}
                  emptyMessage={searchTerm 
                     ? `No applications found matching "${searchTerm}"` 
                     : `No ${tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} applications found.`
                  }
               />
            </div>
         </Card>

         {/* Application Review Modal */}
         {selectedApplication && (
            <ApplicationReviewModal
               selectedApplication={selectedApplication}
               setSelectedApplication={setSelectedApplication}
               reviewStatus={reviewStatus}
               setReviewStatus={setReviewStatus}
               reviewComments={reviewComments}
               setReviewComments={setReviewComments}
               reviewApplication={reviewApplication}
               getStatusColor={getStatusColor}
               formatDate={formatDate}
               handleForwardToDostMimaropa={handleForwardToDostMimaropa}
            />
         )}
      </PageLayout>
   );
});

export default PSTOManagementDashboard;