import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { API_ENDPOINTS } from '../../../../config/api';
import { useDarkMode } from '../../../../Component/Context';

const MarinduqueDashboard = ({ currentUser }) => {
   const { isDarkMode } = useDarkMode();
   const [view, setView] = useState('overview');
   const [loading, setLoading] = useState(false);
   const [dashboardData, setDashboardData] = useState({
      applications: [],
      statistics: {
         totalApplications: 0,
         pendingApplications: 0,
         approvedApplications: 0,
         rejectedApplications: 0,
         returnedApplications: 0,
         totalProponents: 0,
         activeProponents: 0,
         monthlyApplications: [],
         programBreakdown: {},
         processingTime: 0,
         successRate: 0
      },
      recentActivity: [],
      topProponents: [],
      monthlyTrends: []
   });
   // Fetch comprehensive dashboard data
   const fetchDashboardData = useCallback(async () => {
      try {
         setLoading(true);
         
         const [applicationsRes, statsRes, proponentsRes] = await Promise.all([
            fetch(`${API_ENDPOINTS.PSTO_APPLICATIONS}?limit=50`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            }),
            fetch(`${API_ENDPOINTS.ENROLLMENT_STATS}`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            }),
            fetch(`${API_ENDPOINTS.PSTO_PROPONENTS('Marinduque')}`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            })
         ]);

         const [applicationsData, , proponentsData] = await Promise.all([
            applicationsRes.json(),
            statsRes.json(),
            proponentsRes.json()
         ]);

         if (applicationsData.success) {
            const applications = applicationsData.data || [];
            const programBreakdown = applications.reduce((acc, app) => {
               const program = app.programCode || 'SETUP';
               acc[program] = (acc[program] || 0) + 1;
               return acc;
            }, {});

            const monthlyData = generateMonthlyTrends(applications);
            const recentActivity = generateRecentActivity(applications);
            const topProponents = generateTopProponents(applications);

            setDashboardData({
               applications,
               statistics: {
                  totalApplications: applications.length,
                  pendingApplications: applications.filter(app => app.pstoStatus === 'pending').length,
                  approvedApplications: applications.filter(app => app.pstoStatus === 'approved').length,
                  rejectedApplications: applications.filter(app => app.pstoStatus === 'rejected').length,
                  returnedApplications: applications.filter(app => app.pstoStatus === 'returned').length,
                  totalProponents: proponentsData.data?.length || 0,
                  activeProponents: proponentsData.data?.filter(p => p.status === 'active').length || 0,
                  monthlyApplications: monthlyData,
                  programBreakdown,
                  processingTime: calculateAverageProcessingTime(applications),
                  successRate: calculateSuccessRate(applications)
               },
               recentActivity,
               topProponents,
               monthlyTrends: monthlyData
            });
         }
      } catch (err) {
         console.error('Dashboard data error:', err);
      } finally {
         setLoading(false);
      }
   }, []);

   // Generate monthly trends from applications
   const generateMonthlyTrends = (applications) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const trends = months.map((month, index) => {
         const monthApplications = applications.filter(app => {
            const appDate = new Date(app.createdAt);
            return appDate.getFullYear() === currentYear && appDate.getMonth() === index;
         });
         return {
            month,
            applications: monthApplications.length,
            approved: monthApplications.filter(app => app.pstoStatus === 'approved').length,
            pending: monthApplications.filter(app => app.pstoStatus === 'pending').length
         };
      });
      return trends;
   };

   // Generate recent activity
   const generateRecentActivity = (applications) => {
      return applications
         .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
         .slice(0, 10)
         .map(app => ({
            id: app._id,
            type: 'application',
            title: `${app.programCode} Application`,
            description: `Application from ${app.proponentId?.firstName} ${app.proponentId?.lastName}`,
            status: app.pstoStatus,
            timestamp: app.updatedAt,
            user: app.proponentId?.firstName + ' ' + app.proponentId?.lastName
         }));
   };

   // Generate top proponents
   const generateTopProponents = (applications) => {
      const proponentCounts = applications.reduce((acc, app) => {
         const proponentId = app.proponentId?._id;
         if (proponentId) {
            acc[proponentId] = {
               ...app.proponentId,
               applicationCount: (acc[proponentId]?.applicationCount || 0) + 1,
               approvedCount: (acc[proponentId]?.approvedCount || 0) + (app.pstoStatus === 'approved' ? 1 : 0)
            };
         }
         return acc;
      }, {});

      return Object.values(proponentCounts)
         .sort((a, b) => b.applicationCount - a.applicationCount)
         .slice(0, 5);
   };

   // Calculate average processing time
   const calculateAverageProcessingTime = (applications) => {
      const processedApps = applications.filter(app => app.pstoStatus === 'approved' || app.pstoStatus === 'rejected');
      if (processedApps.length === 0) return 0;
      
      const totalDays = processedApps.reduce((sum, app) => {
         const created = new Date(app.createdAt);
         const updated = new Date(app.updatedAt);
         return sum + Math.ceil((updated - created) / (1000 * 60 * 60 * 24));
      }, 0);
      
      return Math.round(totalDays / processedApps.length);
   };

   // Calculate success rate
   const calculateSuccessRate = (applications) => {
      const processedApps = applications.filter(app => app.pstoStatus === 'approved' || app.pstoStatus === 'rejected');
      if (processedApps.length === 0) return 0;
      
      const approvedApps = applications.filter(app => app.pstoStatus === 'approved').length;
      return Math.round((approvedApps / processedApps.length) * 100);
   };

   // Forward application to DOST MIMAROPA
   const forwardToDostMimaropa = async (applicationId) => {
      try {
         setLoading(true);
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`${API_ENDPOINTS.FORWARD_TO_DOST_MIMAROPA}/${applicationId}`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            throw new Error('Failed to forward application');
         }

         const result = await response.json();
         
         if (result.success) {
            alert('Application forwarded to DOST MIMAROPA successfully!');
            fetchDashboardData(); // Refresh the dashboard data
         } else {
            throw new Error(result.message || 'Failed to forward application');
         }
      } catch (error) {
         console.error('Error forwarding application:', error);
         alert('Error forwarding application: ' + error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDashboardData();
   }, [fetchDashboardData]);

   // Professional KPI Cards
   const renderKPICards = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     {dashboardData.statistics.totalApplications}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     Total Applications
                  </div>
               </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
               <span>+12.5% from last month</span>
            </div>
         </div>

         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-50'}`}>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     {dashboardData.statistics.approvedApplications}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     Approved
                  </div>
               </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
               <span>{dashboardData.statistics.successRate}% success rate</span>
            </div>
         </div>

         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     {dashboardData.statistics.pendingApplications}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     Pending Review
                  </div>
               </div>
            </div>
            <div className="flex items-center text-sm text-yellow-600">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span>Awaiting review</span>
            </div>
         </div>

         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-50'}`}>
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     {dashboardData.statistics.activeProponents}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     Active Proponents
                  </div>
               </div>
            </div>
            <div className="flex items-center text-sm text-purple-600">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
               <span>In Marinduque</span>
            </div>
         </div>
      </div>
   );

   // Clean Chart Section
   const renderChartSection = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
               <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Application Trends
               </h3>
               <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center text-green-600">
                     <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                     Approved
                  </div>
                  <div className="flex items-center text-yellow-600">
                     <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                     Pending
                  </div>
               </div>
            </div>
            <div className="h-64 flex items-end space-x-2">
               {dashboardData.monthlyTrends.slice(-7).map((month, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                     <div className="w-full flex flex-col space-y-1 mb-2">
                        <div 
                           className="bg-green-500 rounded-t"
                           style={{ height: `${(month.approved / Math.max(...dashboardData.monthlyTrends.map(m => m.approved), 1)) * 200}px` }}
                           title={`Approved: ${month.approved}`}
                        ></div>
                        <div 
                           className="bg-yellow-500 rounded-b"
                           style={{ height: `${(month.pending / Math.max(...dashboardData.monthlyTrends.map(m => m.pending), 1)) * 200}px` }}
                           title={`Pending: ${month.pending}`}
                        ></div>
                     </div>
                     <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {month.month}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               Program Distribution
            </h3>
            <div className="space-y-4">
               {Object.entries(dashboardData.statistics.programBreakdown).map(([program, count], index) => {
                  const percentage = dashboardData.statistics.totalApplications > 0 ? (count / dashboardData.statistics.totalApplications) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                  
                  return (
                     <div key={program} className="flex items-center justify-between">
                        <div className="flex items-center">
                           <div className={`w-4 h-4 rounded-full mr-3 ${colors[index % colors.length]}`}></div>
                           <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {program}
                           </span>
                        </div>
                        <div className="flex items-center space-x-3">
                           <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                 className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                 style={{ width: `${percentage}%` }}
                              ></div>
                           </div>
                           <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {count}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );

   // Recent Applications Table
   const renderRecentApplications = () => (
      <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
         <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               Recent Applications
            </h3>
            <button className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
               View All
            </button>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                     <th className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Application
                     </th>
                     <th className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Proponent
                     </th>
                     <th className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Program
                     </th>
                     <th className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Date
                     </th>
                     <th className={`text-left py-3 px-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Status
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {dashboardData.applications.slice(0, 5).map((application) => (
                     <tr key={application._id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                        <td className="py-3 px-4">
                           <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {application.applicationId}
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {application.proponentId?.firstName} {application.proponentId?.lastName}
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {application.programCode}
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {new Date(application.createdAt).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              application.pstoStatus === 'approved' 
                                 ? 'bg-green-100 text-green-800' 
                                 : application.pstoStatus === 'pending'
                                 ? 'bg-yellow-100 text-yellow-800'
                                 : application.pstoStatus === 'rejected'
                                 ? 'bg-red-100 text-red-800'
                                 : 'bg-blue-100 text-blue-800'
                           }`}>
                              {application.pstoStatus}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );

   // Top Proponents List
   const renderTopProponents = () => (
      <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
         <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Proponents
         </h3>
         <div className="space-y-4">
            {dashboardData.topProponents.map((proponent, index) => (
               <div key={proponent._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                     }`}>
                        {index + 1}
                     </div>
                     <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                           {proponent.firstName} {proponent.lastName}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                           {proponent.email}
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {proponent.applicationCount}
                     </p>
                     <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        applications
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );

   const renderOverview = () => (
      <div className="space-y-8">
         {renderKPICards()}
         {renderChartSection()}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderRecentApplications()}
            {renderTopProponents()}
         </div>
      </div>
   );

   const renderApplications = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               Applications Management
            </h2>
            <Button onClick={fetchDashboardData} disabled={loading}>
               {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
         </div>

         {loading ? (
            <div className="text-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading applications...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {dashboardData.applications.map(application => (
                  <Card key={application._id} className={`p-6 transition-all duration-300 hover:shadow-lg ${
                     isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  }`}>
                     <div className="flex items-start justify-between mb-4">
                        <div>
                           <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {application.programCode} Application
                           </h3>
                           <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {application.proponentId?.firstName} {application.proponentId?.lastName}
                           </p>
                        </div>
                        <Badge variant={
                           application.pstoStatus === 'approved' ? 'success' :
                           application.pstoStatus === 'pending' ? 'warning' :
                           application.pstoStatus === 'rejected' ? 'danger' : 'info'
                        }>
                           {application.pstoStatus}
                        </Badge>
                     </div>
                     
                     <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                           <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Application ID:</span>
                           <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{application.applicationId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Submitted:</span>
                           <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                              {new Date(application.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Last Updated:</span>
                           <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                              {new Date(application.updatedAt).toLocaleDateString()}
                           </span>
                        </div>
                     </div>

                     <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                           View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                           Review
                        </Button>
                        {application.pstoStatus === 'approved' && !application.forwardedToDostMimaropa && (
                           <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => forwardToDostMimaropa(application._id)}
                              disabled={loading}
                           >
                              Forward to DOST
                           </Button>
                        )}
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );

   return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
         {/* Clean Header */}
         <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Marinduque PSTO Dashboard
                     </h1>
                     <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Welcome back, {currentUser?.name || 'User'}! Here's what's happening with your applications today.
                     </p>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className={`text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="text-xs">Last Updated</div>
                        <div className="text-sm font-medium">
                           {new Date().toLocaleTimeString()}
                        </div>
                     </div>
                     <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDarkMode
                                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                 : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                     >
                        {loading ? 'Refreshing...' : 'Refresh'}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Clean Navigation */}
         <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="p-4">
               <nav className="flex space-x-6">
                  {[
                     { key: 'overview', label: 'Overview' },
                     { key: 'applications', label: 'Applications' },
                     { key: 'analytics', label: 'Analytics' },
                     { key: 'reports', label: 'Reports' }
                  ].map((tab) => (
                     <button
                        key={tab.key}
                        onClick={() => setView(tab.key)}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                           view === tab.key
                              ? isDarkMode
                                 ? 'bg-blue-600 text-white'
                                 : 'bg-blue-600 text-white'
                              : isDarkMode
                                 ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                     >
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         {/* Content */}
         {view === 'overview' && renderOverview()}
         {view === 'applications' && renderApplications()}
         {view === 'analytics' && (
            <div className="text-center py-12">
               <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Advanced Analytics
               </h3>
               <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Advanced analytics features coming soon...
               </p>
            </div>
         )}
         {view === 'reports' && (
            <div className="text-center py-12">
               <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Reports & Export
               </h3>
               <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Report generation features coming soon...
               </p>
            </div>
         )}
      </div>
   );
};

export default MarinduqueDashboard;