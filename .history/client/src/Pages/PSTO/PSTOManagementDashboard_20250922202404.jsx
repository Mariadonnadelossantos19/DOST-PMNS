import React, { useState, useEffect } from 'react';
import { usePSTOData } from '../../hooks/usePSTOData';
import { 
   Card, 
   Button, 
   DataTable, 
   StatusBadge, 
   Modal, 
   TabNavigation
} from '../../Component/UI';
import TNASchedulerForm from '../../Component/PSTO/components/TNASchedulerForm';
import PendingActivations from '../../Component/PSTO/PendingActivations';
import PageLayout from '../../Component/Layouts/PageLayout';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';

/**
 * PSTO Management Dashboard
 * Comprehensive management interface for all PSTO workflows
 * Handles: Applications → Validation → TNA Scheduling → Monitoring
 */
const PSTOManagementDashboard = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [showTNAModal, setShowTNAModal] = useState(false);
   const [activeTab, setActiveTab] = useState('overview');
   
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
         key: 'programName',
         header: 'Program',
         render: (value, row) => (
            <div>
               <div className="font-medium text-gray-900">{value} Application</div>
               <div className="text-sm text-gray-500">Enterprise: {row.enterpriseName}</div>
            </div>
         )
      },
      {
         key: 'proponentId',
         header: 'Proponent',
         render: (value) => (
            <div>
               <div className="font-medium text-gray-900">{value?.firstName} {value?.lastName}</div>
               <div className="text-sm text-gray-500">{value?.email}</div>
               <div className="text-sm text-gray-500">{value?.province}</div>
            </div>
         )
      },
      {
         key: 'status',
         header: 'Status',
         render: (value) => <StatusBadge status={value} />
      },
      {
         key: 'createdAt',
         header: 'Submitted',
         render: (value) => new Date(value).toLocaleDateString()
      },
      {
         key: 'pstoStatus',
         header: 'PSTO Review',
         render: (value, application) => {
            // Show PSTO review status, but if main status is psto_approved, show that
            if (application.status === 'psto_approved') {
               return <StatusBadge status="approved" />;
            } else if (application.status === 'psto_rejected') {
               return <StatusBadge status="rejected" />;
            } else if (value === 'returned') {
               return <StatusBadge status="returned" />;
            } else if (value) {
               return <StatusBadge status={value} />;
            } else {
               return <span className="text-gray-400">Not Reviewed</span>;
            }
         }
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
         
         {application.status === 'psto_approved' && (
            <Button
               onClick={() => handleScheduleTNA(application)}
               variant="primary"
               size="sm"
            >
               Schedule TNA
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

   const handleScheduleTNA = (application) => {
      setSelectedApplication(application);
      setShowTNAModal(true);
   };

   const handleTNAScheduled = async (tnaData) => {
      try {
         setLoading(true);
         const response = await fetch('http://localhost:4000/api/tna/schedule', {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(tnaData)
         });

         if (response.ok) {
            alert('TNA scheduled successfully!');
            setShowTNAModal(false);
            setSelectedApplication(null);
            fetchApplications(); // Refresh the list
         } else {
            const errorData = await response.json();
            alert(`Failed to schedule TNA: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error scheduling TNA:', error);
         alert('Error scheduling TNA. Please try again.');
      } finally {
         setLoading(false);
      }
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
         subtitle="Manage applications and TNA activities"
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
            {['pending', 'approved', 'returned', 'rejected'].includes(activeTab) && (
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

         {/* TNA Scheduling Modal */}
         {showTNAModal && selectedApplication && (
            <Modal
               isOpen={showTNAModal}
               onClose={() => {
                  setShowTNAModal(false);
                  setSelectedApplication(null);
               }}
               title="Schedule TNA"
            >
               <TNASchedulerForm
                  application={selectedApplication}
                  onSchedule={handleTNAScheduled}
                  onCancel={() => {
                     setShowTNAModal(false);
                     setSelectedApplication(null);
                  }}
               />
            </Modal>
         )}

      </PageLayout>
   );
};

export default PSTOManagementDashboard;
