import React, { useState, useEffect } from 'react';
import { usePSTOData } from '../../hooks/usePSTOData';
import { 
   Card, 
   Button, 
   DataTable, 
   StatusBadge, 
   TabNavigation
} from '../../Component/UI';
import PageLayout from '../../Component/Layouts/PageLayout';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';

/**
 * PSTO Management Dashboard
 * Comprehensive management interface for all PSTO workflows
 * Handles: Applications → Validation → Monitoring
 */
const PSTOManagementDashboard = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [activeTab, setActiveTab] = useState('all');
   
   // ApplicationReviewModal states
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');

   // Fetch applications for PSTO management
   const fetchApplications = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setApplications(data.data || []);
         } else {
            const errorData = await response.json();
            setError(`Failed to fetch applications: ${errorData.message || 'Unknown error'}`);
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         setError('Failed to fetch applications. Please check your connection and try again.');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchApplications();
   }, []);

   // Define table columns for applications
   const applicationColumns = [
      {
         key: 'applicationId',
         header: 'Application ID',
         render: (value, row) => (
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
               <span className="font-mono text-sm font-bold text-gray-900">
                  {value || row._id?.slice(-8)}
               </span>
            </div>
         )
      },
      {
         key: 'enterpriseName',
         header: 'Enterprise Name',
         render: (value) => (
            <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
               </div>
               <span className="font-semibold text-gray-900 text-sm truncate max-w-40" title={value}>
                  {value}
               </span>
            </div>
         )
      },
      {
         key: 'proponentId',
         header: 'Contact Person',
         render: (value) => (
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                     {value?.firstName?.charAt(0)}{value?.lastName?.charAt(0)}
                  </span>
               </div>
               <div>
                  <div className="font-semibold text-gray-900 text-sm">
                     {value?.firstName} {value?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{value?.province}</div>
               </div>
            </div>
         )
      },
      {
         key: 'businessActivity',
         header: 'Business Activity',
         render: (value) => (
            <div className="flex items-center space-x-2">
               <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
               </div>
               <span className="text-sm text-gray-700 font-medium truncate max-w-32" title={value}>
                  {value || 'Not specified'}
               </span>
            </div>
         )
      },
      {
         key: 'createdAt',
         header: 'Submitted',
         render: (value) => (
            <div className="flex items-center space-x-2">
               <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <div className="text-sm">
                  <div className="font-semibold text-gray-900">
                     {new Date(value).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                     {new Date(value).toLocaleTimeString()}
                  </div>
               </div>
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
            className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-300"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
         </Button>
         
         {(application.status === 'pending' || application.status === 'under_review') && !application.pstoStatus && (
            <Button
               onClick={() => handleValidateApplication(application)}
               variant="primary"
               size="sm"
               className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span>Review</span>
            </Button>
         )}
         
         {application.pstoStatus === 'returned' && (
            <Button
               onClick={() => handleValidateApplication(application)}
               variant="outline"
               size="sm"
               className="flex items-center space-x-1 hover:bg-yellow-50 hover:border-yellow-300"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               <span>Re-review</span>
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

   const reviewApplication = async (applicationId) => {
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
               comments: reviewComments,
               validatedBy: currentUser.id,
               validatedAt: new Date().toISOString()
            })
         });

         if (response.ok) {
            alert(`Application ${reviewStatus === 'approved' ? 'approved' : 'returned for revision'} successfully!`);
            setSelectedApplication(null);
            fetchApplications(); // Refresh the list
         } else {
            const errorData = await response.json();
            alert(`Failed to review application: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error reviewing application:', error);
         alert('Error reviewing application. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const downloadDocument = async (applicationId, fileType) => {
      try {
         const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${applicationId}/download/${fileType}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileType}_${applicationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
         } else {
            alert('Error downloading document');
         }
      } catch (error) {
         console.error('Error downloading document:', error);
         alert('Error downloading document');
      }
   };


   // Calculate statistics
   const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'psto_approved').length,
      returned: applications.filter(app => app.status === 'pending' && app.pstoStatus === 'returned').length,
      rejected: applications.filter(app => app.status === 'psto_rejected').length
   };

   // Tab configuration with All tab
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

   // Filter applications based on active tab
   const getFilteredApplications = () => {
      switch (activeTab) {
         case 'all':
            return applications;
         case 'pending':
            return applications.filter(app => app.status === 'pending' || app.status === 'under_review');
         case 'approved':
            return applications.filter(app => app.status === 'psto_approved');
         case 'returned':
            return applications.filter(app => app.status === 'pending' && app.pstoStatus === 'returned');
         case 'rejected':
            return applications.filter(app => app.status === 'psto_rejected');
         default:
            return applications;
      }
   };

   return (
      <PageLayout
         title="PSTO Management Dashboard"
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
         {/* Minimalist Statistics */}
         <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
               <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
               <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
               <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
               <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
               <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
               <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
               <div className="text-2xl font-semibold text-red-600">{stats.rejected}</div>
               <div className="text-sm text-gray-500">Rejected</div>
            </div>
         </div>

         {/* Tab Navigation */}
         <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <TabNavigation
               tabs={tabs}
               activeTab={activeTab}
               onTabChange={setActiveTab}
            />
         </div>

         {/* Tab Content */}
         <div className="bg-black rounded-lg border border-gray-200 overflow-hidden">
            {['all', 'pending', 'approved', 'returned', 'rejected'].includes(activeTab) && (
               <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-medium text-white">
                        {tabs.find(tab => tab.id === activeTab)?.label} Applications
                     </h3>
                  </div>

                  <div className="overflow-x-auto">
                     <div className="min-w-full">
                        <DataTable
                           data={getFilteredApplications()}
                           columns={applicationColumns}
                           actions={getApplicationActions}
                           emptyMessage={`No ${tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} applications found.`}
                        />
                     </div>
                  </div>
               </div>
            )}
         </div>

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
};

export default PSTOManagementDashboard;
