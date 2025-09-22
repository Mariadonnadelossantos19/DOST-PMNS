import React, { useState, useEffect } from 'react';
import { 
   Card, 
   Button, 
   DataTable, 
   StatusBadge, 
   TabNavigation
} from '../../Component/UI';
import PageLayout from '../../Component/Layouts/PageLayout';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';

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
         setError(`Network error: ${error.message}`);
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
         <div className="bg-white rounded-lg border border-gray-200">
            {['all', 'pending', 'approved', 'returned', 'rejected'].includes(activeTab) && (
               <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-medium text-gray-900">
                        {tabs.find(tab => tab.id === activeTab)?.label} Applications
                     </h3>
                  </div>
                  <DataTable
                     data={getFilteredApplications()}
                     columns={applicationColumns}
                     actions={getApplicationActions}
                     emptyMessage={`No ${tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} applications found.`}
                  />
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