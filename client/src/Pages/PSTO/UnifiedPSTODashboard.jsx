import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePSTOData } from '../../hooks/usePSTOData';
import { Card, Button, DataTable, StatusBadge } from '../../Component/UI';
import { TNAManagement, DocumentValidation, TNAReportUpload, RTECDocumentSubmission, RTECMeetingInterface } from '../../Component/PSTO/components';
import FundingDocument from '../../Component/PSTO/components/FundingDocument';
import ProponentManagement from '../../Component/PSTO/ProponentManagement';
import PSTOStats from '../../Component/PSTO/PSTOStats';
import PSTOManagementDashboard from './PSTOManagementDashboard';
import { PSTONotificationCenter } from '../../Component/Notifications';

/**
 * Unified PSTO Dashboard - Main Container Component
 * 
 * PURPOSE: Acts as the main router/container for all PSTO views
 * 
 * STRUCTURE:
 * - Overview: Dashboard stats + recent applications
 * - Applications/Management: Full PSTOManagementDashboard component
 * - TNA Management: TNA scheduling and management
 * - Document Validation: Document review interface
 * - TNA Reports: Report upload interface
 * - Proponents: Proponent listing and management
 * 
 * NAVIGATION: Uses sidebar navigation instead of internal tabs
 */
const UnifiedPSTODashboard = React.memo(({ currentUser, currentPage = 'dashboard' }) => {
   // Use the custom hook for data management
   const {
      proponents,
      pendingProponents,
      applications,
      loading: dataLoading,
      error: dataError
   } = usePSTOData(currentUser.province);

   // Memoized statistics to prevent unnecessary re-renders
   const stats = useMemo(() => ({
      totalProponents: proponents.length,
      activeProponents: proponents.filter(p => p.status === 'active').length,
      pendingActivations: pendingProponents.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'psto_approved').length
   }), [proponents, pendingProponents, applications]);


   // Memoized table columns for applications
   const applicationColumns = useMemo(() => [
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
   ], []);

   const getApplicationActions = useCallback((application) => (
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
   ), []);

   // Render overview content
   const renderOverview = useCallback(() => (
      <div className="space-y-6">
         {/* Statistics Cards */}
         <PSTOStats stats={stats} />

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
   ), [stats, applications, applicationColumns, getApplicationActions]);

   // Render applications content - Enhanced with full management functionality
   const renderApplications = useCallback(() => {
      return <PSTOManagementDashboard currentUser={currentUser} />;
   }, [currentUser]);

   // Render document validation content
   const renderDocumentValidation = useCallback(() => (
      <DocumentValidation currentUser={currentUser} />
   ), [currentUser]);

   // Render TNA management content
   const renderTNAManagement = useCallback(() => (
      <TNAManagement currentUser={currentUser} />
   ), [currentUser]);

   // Render TNA reports content
   const renderTNAReports = useCallback(() => (
      <TNAReportUpload currentUser={currentUser} />
   ), [currentUser]);

   // Render RTEC documents content
   const renderRTECDocuments = useCallback(() => (
      <RTECDocumentSubmission currentUser={currentUser} />
   ), [currentUser]);

   // Render RTEC meetings content
   const renderRTECMeetings = useCallback(() => (
      <RTECMeetingInterface currentUser={currentUser} />
   ), [currentUser]);


   // Render proponents content
   const renderProponents = useCallback(() => (
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
   ), [proponents]);

   // Render proponent management content
   const renderProponentManagement = useCallback(() => (
<ProponentManagement currentUser={currentUser} />
   ), [currentUser]);

   // Render notifications content
   const renderNotifications = useCallback(() => (
      <PSTONotificationCenter userId={currentUser.id} />
   ), [currentUser]);

   // Render refund documents content
   const renderFundingDocuments = useCallback(() => (
      <FundingDocument />
   ), []);

   // Get current view based on currentPage prop or URL hash
   const getCurrentView = useCallback(() => {
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
      if (currentPage === 'rtec-documents') {
         return 'rtec-documents';
      }
      if (currentPage === 'funding-documents') {
         return 'funding-documents';
      }
      if (currentPage === 'rtec-meetings') {
         return 'rtec-meetings';
      }
      if (currentPage === 'notifications') {
         return 'notifications';
      }
      if (currentPage === 'dashboard') {
         return 'overview';
      }
      
      // Fallback to URL hash
      const hash = window.location.hash.replace('#', '');
      return hash || 'overview';
   }, [currentPage]);

   const [currentView, setCurrentView] = useState(() => getCurrentView());

   // Listen for currentPage changes
   useEffect(() => {
      setCurrentView(getCurrentView());
   }, [getCurrentView]);

   // Listen for hash changes (only set up once)
   useEffect(() => {
      const handleRouteChange = () => {
         const newView = getCurrentView();
         setCurrentView(newView);
      };

      window.addEventListener('hashchange', handleRouteChange);
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
         window.removeEventListener('hashchange', handleRouteChange);
         window.removeEventListener('popstate', handleRouteChange);
      };
   }, [getCurrentView]); // Include getCurrentView dependency

   // Render management content - Same as applications for now
   const renderManagement = useCallback(() => {
      return <PSTOManagementDashboard currentUser={currentUser} />;
   }, [currentUser]);

   // Memoized view mapping to prevent object recreation
   const viewRenderers = useMemo(() => ({
      overview: renderOverview,
      applications: renderApplications,
      management: renderManagement,
      'tna-management': renderTNAManagement,
      'document-validation': renderDocumentValidation,
      'tna-reports': renderTNAReports,
      'rtec-documents': renderRTECDocuments,
      'funding-documents': renderFundingDocuments,
      'rtec-meetings': renderRTECMeetings,
      proponents: renderProponents,
      'proponent-management': renderProponentManagement,
      notifications: renderNotifications
   }), [renderOverview, renderApplications, renderManagement, renderTNAManagement, renderDocumentValidation, renderTNAReports, renderRTECDocuments, renderFundingDocuments, renderRTECMeetings, renderProponents, renderProponentManagement, renderNotifications]);

   const renderContent = useCallback(() => {
      const renderer = viewRenderers[currentView];
      if (renderer) {
         return renderer();
      }

      return (
         <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Not Found</h3>
            <p className="text-gray-600">The requested view is not available.</p>
            <p className="text-sm text-gray-500">Current view: {currentView}</p>
            <p className="text-xs text-gray-400 mt-1">Available views: {Object.keys(viewRenderers).join(', ')}</p>
         </div>
      );
   }, [currentView, viewRenderers]);

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
});

export default UnifiedPSTODashboard;
