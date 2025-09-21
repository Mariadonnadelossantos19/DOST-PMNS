import React, { useState } from 'react';
import { usePSTOData } from '../../hooks/usePSTOData';
import { InteractiveDashboard } from '../Interactive';
import PSTOHeader from './PSTOHeader';
import PSTONavigation from './PSTONavigation';
import PSTOStats from './PSTOStats';
import PendingActivations from './PendingActivations';
import { TNAManagement, DocumentValidation, TNAReportUpload } from './components';
import { Card, Button, Badge } from '../UI';

/**
 * Base PSTO Dashboard Template
 * Provides common structure and functionality for all PSTO dashboards
 */
const BasePSTODashboard = ({ 
   province, 
   currentUser, 
   provinceData = {},
   customViews = {} 
}) => {
   const [view, setView] = useState('overview');
   
   // Use the custom hook for data management
   const {
      proponents,
      pendingProponents,
      applications,
      loading,
      pendingLoading,
      applicationsLoading,
      error,
      activateProponent,
      reviewApplication
   } = usePSTOData(province);

   // Calculate statistics
   const stats = {
      totalProjects: provinceData.projects?.length || 0,
      activeProjects: provinceData.projects?.filter(p => p.status === 'active' || p.status === 'in progress').length || 0,
      completedProjects: provinceData.projects?.filter(p => p.status === 'completed').length || 0,
      totalTasks: provinceData.tasks?.length || 0,
      completedTasks: provinceData.tasks?.filter(t => t.status === 'completed').length || 0,
      totalBeneficiaries: provinceData.projects?.reduce((sum, p) => sum + (p.beneficiaries || 0), 0) || 0,
      totalProponents: proponents.length,
      activeProponents: proponents.filter(p => p.status === 'active').length,
      pendingActivations: pendingProponents.length
   };

   // Interactive user stats
   const userStats = {
      totalEnrollments: stats.totalProjects + stats.totalTasks,
      approvedApplications: stats.completedProjects,
      avgProcessingTime: 14,
      todayProcessed: stats.activeProjects,
      accuracyRate: 91,
      communitiesHelped: stats.totalBeneficiaries,
      timeSaved: stats.completedTasks * 2.8,
      completedTna: stats.completedProjects,
      perfectStreak: stats.completedProjects,
      helpfulActions: stats.totalTasks,
      dailyProcessed: stats.activeProjects
   };

   // Default view renderers
   const renderOverview = () => (
      <div className="space-y-6">
         <PSTOStats stats={stats} province={province} />
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">{province} Projects</h3>
               <div className="space-y-3">
                  {(provinceData.projects || []).slice(0, 3).map(project => (
                     <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-medium text-gray-900">{project.title}</p>
                           <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                        <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                           {project.status}
                        </Badge>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
               <div className="space-y-3">
                  {(provinceData.tasks || []).slice(0, 3).map(task => (
                     <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-medium text-gray-900">{task.title}</p>
                           <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'success' : 'warning'}>
                           {task.status}
                        </Badge>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Proponents</h3>
               {loading ? (
                  <div className="text-center py-4">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                     <p className="text-sm text-gray-500 mt-2">Loading proponents...</p>
                  </div>
               ) : error ? (
                  <div className="text-center py-4">
                     <p className="text-sm text-red-500">{error}</p>
                  </div>
               ) : proponents.length === 0 ? (
                  <div className="text-center py-4">
                     <p className="text-sm text-gray-500">No proponents yet</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {proponents.slice(0, 3).map(proponent => (
                        <div key={proponent._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div>
                              <p className="font-medium text-gray-900">
                                 {proponent.firstName} {proponent.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{proponent.email}</p>
                           </div>
                           <Badge variant={proponent.status === 'active' ? 'success' : 'warning'}>
                              {proponent.status}
                           </Badge>
                        </div>
                     ))}
                  </div>
               )}
            </Card>
         </div>
      </div>
   );

   const renderProponents = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{province} Proponents</h2>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
         </div>

         {loading ? (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
               <p className="text-gray-500 mt-4">Loading proponents...</p>
            </div>
         ) : error ? (
            <div className="text-center py-8">
               <p className="text-red-500">{error}</p>
            </div>
         ) : proponents.length === 0 ? (
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">No proponents</h3>
               <p className="mt-1 text-sm text-gray-500">No proponents have registered yet.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {proponents.map((proponent) => (
                  <Card key={proponent._id} className="p-6">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                           <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {proponent.firstName} {proponent.lastName}
                           </h3>
                           <p className="text-sm text-gray-600">{proponent.email}</p>
                        </div>
                        <Badge variant={proponent.status === 'active' ? 'success' : 'warning'}>
                           {proponent.status}
                        </Badge>
                     </div>

                     <div className="space-y-2 mb-4">
                        {proponent.proponentInfo?.businessName && (
                           <div>
                              <span className="text-sm font-medium text-gray-500">Business:</span>
                              <p className="text-sm text-gray-900">{proponent.proponentInfo.businessName}</p>
                           </div>
                        )}
                        <div>
                           <span className="text-sm font-medium text-gray-500">Type:</span>
                           <p className="text-sm text-gray-900">{proponent.proponentInfo?.organizationType || 'N/A'}</p>
                        </div>
                        <div>
                           <span className="text-sm font-medium text-gray-500">Joined:</span>
                           <p className="text-sm text-gray-900">
                              {new Date(proponent.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                           View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                           Contact
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );

   // View mapping
   const viewRenderers = {
      overview: renderOverview,
      interactive: () => <InteractiveDashboard userStats={userStats} />,
      proponents: renderProponents,
      'pending-activations': () => <PendingActivations currentUser={currentUser} />,
      'document-validation': () => <DocumentValidation currentUser={currentUser} />,
      'tna-management': () => <TNAManagement currentUser={currentUser} />,
      'tna-reports': () => <TNAReportUpload currentUser={currentUser} />,
      ...customViews // Allow custom views to be passed in
   };

   return (
      <div className="space-y-6">
         <PSTOHeader province={province} currentUser={currentUser} />
         <PSTONavigation currentView={view} onViewChange={setView} province={province} />
         
         {/* Content */}
         {viewRenderers[view] ? viewRenderers[view]() : (
            <div className="p-6 text-center">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">View Not Found</h3>
               <p className="text-gray-600">The requested view is not available.</p>
            </div>
         )}
      </div>
   );
};

export default BasePSTODashboard;
