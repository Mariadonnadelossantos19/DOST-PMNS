import React, { useState, useEffect } from 'react';
import { usePSTOData } from '../../hooks/usePSTOData';
import { InteractiveDashboard } from '../../Component/Interactive';
import { Card, Button, DataTable, StatusBadge } from '../../Component/UI';
import { TNAManagement, DocumentValidation, TNAReportUpload } from '../../Component/PSTO/components';
import ProponentManagement from '../../Component/PSTO/ProponentManagement';
import PSTOStats from '../../Component/PSTO/PSTOStats';
import PSTOManagementDashboard from './PSTOManagementDashboard';

/**
 * Unified PSTO Dashboard
 * Uses sidebar navigation instead of internal tabs
 * Eliminates redundancy with global navigation
 */
const UnifiedPSTODashboard = ({ currentUser, currentPage = 'dashboard' }) => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Use the custom hook for data management
   const {
      proponents,
      pendingProponents,
      applications,
      loading: dataLoading,
      pendingLoading,
      applicationsLoading,
      error: dataError,
      activateProponent,
      reviewApplication
   } = usePSTOData(currentUser.province);

   // Calculate statistics
   const stats = {
      totalProponents: proponents.length,
      activeProponents: proponents.filter(p => p.status === 'active').length,
      pendingActivations: pendingProponents.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'psto_approved').length
   };

   // Interactive user stats
   const userStats = {
      totalEnrollments: stats.totalProponents,
      approvedApplications: stats.approvedApplications,
      avgProcessingTime: 15,
      todayProcessed: 8,
      accuracyRate: 94,
      communitiesHelped: 23,
      timeSaved: 67,
      completedTna: 7,
      perfectStreak: 15,
      helpfulActions: 3,
      dailyProcessed: 8
   };

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
      }
   ];

   const getApplicationActions = (application) => (
      <div className="flex space-x-2">
         <Button
            onClick={() => {
               // Navigate to document validation
               window.location.hash = '#document-validation';
            }}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
         >
            Review
         </Button>
         {application.status === 'psto_approved' && (
            <Button
               variant="outline"
               size="sm"
               onClick={() => {
                  // Redirect to applications tab for TNA scheduling
                  window.location.hash = '#applications';
               }}
            >
               Schedule TNA
            </Button>
         )}
      </div>
   );

   // Render overview content
   const renderOverview = () => (
      <div className="space-y-6">
         {/* Statistics Cards */}
         <PSTOStats stats={stats} />

         {/* Interactive Dashboard */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Dashboard</h3>
            <InteractiveDashboard userStats={userStats} />
         </Card>

         {/* Recent Applications */}
         <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
               <Button
                  variant="outline"
                  onClick={() => {
                     window.location.hash = '#applications';
                  }}
               >
                  View All
               </Button>
            </div>
            <DataTable
               data={applications.slice(0, 5)}
               columns={applicationColumns}
               actions={getApplicationActions}
               emptyMessage="No applications found"
            />
         </Card>
      </div>
   );

   // Render applications content
   const renderApplications = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
               <p className="text-gray-600">Manage and review submitted applications</p>
            </div>
            <Button
               onClick={() => {
                  window.location.hash = '#document-validation';
               }}
            >
               Document Validation
            </Button>
         </div>

         <DataTable
            data={applications}
            columns={applicationColumns}
            actions={getApplicationActions}
            emptyMessage="No applications found"
         />
      </div>
   );

   // Render document validation content
   const renderDocumentValidation = () => (
      <DocumentValidation currentUser={currentUser} />
   );

   // Render TNA management content - Redirect to applications with approved filter
   const renderTNAManagement = () => {
      // Redirect to applications tab with approved filter
      setCurrentView('applications');
      return null;
   };

   // Render TNA reports content
   const renderTNAReports = () => (
      <TNAReportUpload currentUser={currentUser} />
   );

   // Render proponents content
   const renderProponents = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Proponents</h2>
               <p className="text-gray-600">Manage proponent accounts and activations</p>
            </div>
            <Button
               onClick={() => {
                  window.location.hash = '#pending-activations';
               }}
            >
               Pending Activations
            </Button>
         </div>

         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Proponents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {proponents.map((proponent) => (
                  <div key={proponent._id} className="border border-gray-200 rounded-lg p-4">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                           {proponent.firstName} {proponent.lastName}
                        </h4>
                        <StatusBadge status={proponent.status} />
                     </div>
                     <p className="text-sm text-gray-600">{proponent.email}</p>
                     <p className="text-sm text-gray-500">{proponent.province}</p>
                  </div>
               ))}
            </div>
         </Card>
      </div>
   );

   // Render proponent management content
   const renderProponentManagement = () => (
      <ProponentManagement currentUser={currentUser} />
   );

   // Get current view based on currentPage prop or URL hash
   const getCurrentView = () => {
      // Use currentPage prop first (from sidebar navigation)
      if (currentPage === 'management') {
         return 'management';
      }
      if (currentPage === 'applications') {
         return 'applications';
      }
      if (currentPage === 'proponent-management') {
         return 'proponent-management';
      }
      if (currentPage === 'tna-management') {
         return 'tna-management';
      }
      if (currentPage === 'dashboard') {
         return 'overview';
      }
      
      // Fallback to URL hash
      const hash = window.location.hash.replace('#', '');
      return hash || 'overview';
   };

   const [currentView, setCurrentView] = useState(getCurrentView);

   // Listen for currentPage changes and hash changes
   useEffect(() => {
      setCurrentView(getCurrentView());
   }, [currentPage]);

   useEffect(() => {
      const handleRouteChange = () => {
         setCurrentView(getCurrentView());
      };

      window.addEventListener('hashchange', handleRouteChange);
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
         window.removeEventListener('hashchange', handleRouteChange);
         window.removeEventListener('popstate', handleRouteChange);
      };
   }, [currentPage]);

   // Render management content
   const renderManagement = () => {
      console.log('Rendering management view');
      return <PSTOManagementDashboard currentUser={currentUser} />;
   };

   // View mapping
   const viewRenderers = {
      overview: renderOverview,
      applications: renderApplications,
      management: renderManagement,
      'document-validation': renderDocumentValidation,
      'tna-reports': renderTNAReports,
      proponents: renderProponents,
      'proponent-management': renderProponentManagement
   };

   const renderContent = () => {
      console.log('UnifiedPSTODashboard - currentPage:', currentPage);
      console.log('UnifiedPSTODashboard - currentView:', currentView);
      console.log('UnifiedPSTODashboard - available views:', Object.keys(viewRenderers));
      
      const renderer = viewRenderers[currentView];
      if (renderer) {
         console.log('Rendering view:', currentView);
         return renderer();
      }

      console.log('View not found:', currentView);
      return (
         <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Not Found</h3>
            <p className="text-gray-600">The requested view is not available.</p>
            <p className="text-sm text-gray-500">Current view: {currentView}</p>
            <p className="text-xs text-gray-400 mt-1">Available views: {Object.keys(viewRenderers).join(', ')}</p>
         </div>
      );
   };

   if (dataLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-sm text-gray-500 mt-4">Loading dashboard...</p>
            </div>
         </div>
      );
   }

   if (dataError) {
      return (
         <div className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{dataError}</p>
         </div>
      );
   }

   return (
      <div className="p-6">
         {renderContent()}
      </div>
   );
};

export default UnifiedPSTODashboard;
