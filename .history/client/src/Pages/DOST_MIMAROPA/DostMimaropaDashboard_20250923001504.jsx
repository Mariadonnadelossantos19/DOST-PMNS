import React, { useState, useEffect } from 'react';
import { InteractiveDashboard } from '../../Component/Interactive';
import { useDarkMode } from '../../Component/Context';
import { API_ENDPOINTS } from '../../config/api';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';
import PSTOApplicationsList from './components/PSTOApplicationsList';
import DostMimaropaReviewModal from './components/DostMimaropaReviewModal';
import TNAManagement from '../../Component/PSTO/components/TNAManagement';

const DostMimaropaDashboard = ({ currentPath = '/dashboard' }) => {
   const { isDarkMode } = useDarkMode();
   const [applications, setApplications] = useState([]);
   const [tnaReports, setTnaReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');

   // Fetch applications for DOST MIMAROPA review
   const fetchApplications = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch(API_ENDPOINTS.DOST_MIMAROPA_APPLICATIONS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         
         if (result.success) {
            setApplications(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch applications');
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   // Fetch TNA reports for DOST MIMAROPA review
   const fetchTNAReports = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch('http://localhost:4000/api/tna/dost-mimaropa/reports', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch TNA reports: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         
         if (result.success) {
            setTnaReports(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch TNA reports');
         }
      } catch (error) {
         console.error('Error fetching TNA reports:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (currentPath === '/application-management') {
         fetchApplications();
      } else if (currentPath === '/tna-management') {
         fetchTNAReports();
      }
   }, [currentPath]);

   // Review application function
   const reviewApplication = async (applicationId) => {
      try {
         setLoading(true);
         const token = localStorage.getItem('authToken');
         
         const response = await fetch(`http://localhost:4000/api/tna/${applicationId}/dost-mimaropa/review`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: reviewStatus,
               comments: reviewComments
            })
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to review application');
         }

         alert('Application reviewed successfully!');
         setSelectedApplication(null);
         setReviewStatus('');
         setReviewComments('');
         
         // Refresh the appropriate list
         if (currentPath === '/application-management') {
            fetchApplications();
         } else if (currentPath === '/tna-management') {
            fetchTNAReports();
         }
      } catch (error) {
         console.error('Error reviewing application:', error);
         alert(`Error reviewing application: ${error.message}`);
      } finally {
         setLoading(false);
      }
   };

   // Helper functions
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

   // User statistics
   const userStats = {
      totalApplications: applications.length,
      pendingReview: applications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      totalTNAReports: tnaReports.length,
      pendingTNAReview: tnaReports.filter(tna => tna.status === 'forwarded_to_dost_mimaropa').length
   };

   // Render different sections based on currentPath
   const renderContent = () => {
      switch (currentPath) {
         case '/dashboard':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">DOST MIMAROPA Dashboard</h1>
                     <p className="text-blue-100">Welcome to the Regional Office Management System</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-600">Total Applications</p>
                              <p className="text-2xl font-bold text-gray-900">{userStats.totalApplications}</p>
                           </div>
                           <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-600">Pending Review</p>
                              <p className="text-2xl font-bold text-yellow-600">{userStats.pendingReview}</p>
                           </div>
                           <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-600">TNA Reports</p>
                              <p className="text-2xl font-bold text-purple-600">{userStats.totalTNAReports}</p>
                           </div>
                           <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-medium text-gray-600">Approved</p>
                              <p className="text-2xl font-bold text-green-600">{userStats.approved}</p>
                           </div>
                           <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            );

         case '/application-management':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Application Management</h1>
                     <p className="text-green-100">Review and manage submitted applications</p>
                  </div>
                  
                  <PSTOApplicationsList
                     applications={applications}
                     loading={loading}
                     error={error}
                     onRefresh={fetchApplications}
                     onViewDetails={(app) => {
                        setSelectedApplication(app);
                        setReviewStatus(app.status || '');
                        setReviewComments(app.comments || '');
                     }}
                  />
               </div>
            );

         case '/tna-management':
            return <TNAManagement currentUser={{ role: 'dost_mimaropa' }} />;

         case '/proponent-management':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Proponent Management</h1>
                     <p className="text-orange-100">Manage proponent accounts and information</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Proponent management features coming soon...</p>
                  </div>
               </div>
            );

         case '/reports':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Reports</h1>
                     <p className="text-teal-100">Generate and view system reports</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Reporting features coming soon...</p>
                  </div>
               </div>
            );

         case '/monitoring':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Monitoring</h1>
                     <p className="text-indigo-100">Monitor project progress and status</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Monitoring features coming soon...</p>
                  </div>
               </div>
            );

         case '/notifications':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                     <p className="text-pink-100">View and manage system notifications</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Notification features coming soon...</p>
                  </div>
               </div>
            );

         case '/settings':
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-600 to-slate-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">Settings</h1>
                     <p className="text-gray-100">Configure system settings and preferences</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Settings features coming soon...</p>
                  </div>
               </div>
            );

         default:
            return (
               <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                     <h1 className="text-3xl font-bold mb-2">DOST MIMAROPA Dashboard</h1>
                     <p className="text-blue-100">Welcome to the Regional Office Management System</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                     <p className="text-gray-600 text-center">Select a section from the navigation menu to get started.</p>
                  </div>
               </div>
            );
      }
   };

   return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
         </div>

         {/* Application Review Modal */}
         {selectedApplication && (
            <DostMimaropaReviewModal
               selectedApplication={selectedApplication}
               setSelectedApplication={setSelectedApplication}
               reviewStatus={reviewStatus}
               setReviewStatus={setReviewStatus}
               reviewComments={reviewComments}
               setReviewComments={setReviewComments}
               reviewApplication={reviewApplication}
               getStatusColor={getStatusColor}
               formatDate={formatDate}
            />
         )}
      </div>
   );
};

export default DostMimaropaDashboard;