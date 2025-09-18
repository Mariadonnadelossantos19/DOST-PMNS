import React, { useState, useEffect } from 'react';
import { InteractiveDashboard } from '../../Component/Interactive';
import { useDarkMode } from '../../Component/Context';
import { API_ENDPOINTS } from '../../config/api';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';

const DostMimaropaDashboard = () => {
   const [activeTab, setActiveTab] = useState('applications');
   const { isDarkMode } = useDarkMode();
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [filterStatus, setFilterStatus] = useState('all');
   const [searchTerm, setSearchTerm] = useState('');
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');

   // Fetch applications for DOST MIMAROPA review
   const fetchApplications = async () => {
      try {
         setLoading(true);
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

   useEffect(() => {
      fetchApplications();
   }, []);

   // Filter applications based on status and search term
   const filteredApplications = applications.filter(application => {
      const matchesStatus = filterStatus === 'all' || application.dostMimaropaStatus === filterStatus;
      const matchesSearch = searchTerm === '' || 
         application.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         application.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         application.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
   });

   // Get status badge color
   const getStatusColor = (status) => {
      switch (status) {
         case 'approved': return isDarkMode ? 'bg-green-900/90 text-green-200 border border-green-700/60' : 'bg-green-50 text-green-800 border border-green-200';
         case 'rejected': return isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700/60' : 'bg-red-50 text-red-800 border border-red-200';
         case 'returned': return isDarkMode ? 'bg-yellow-900/90 text-yellow-200 border border-yellow-700/60' : 'bg-yellow-50 text-yellow-800 border border-yellow-200';
         case 'pending': return isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200';
         default: return isDarkMode ? 'bg-gray-900/90 text-gray-200 border border-gray-700/60' : 'bg-gray-50 text-gray-800 border border-gray-200';
      }
   };

   // Format date
   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   // Review application
   const reviewApplication = async (applicationId) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`/api/programs/dost-mimaropa/applications/${applicationId}/review`, {
            method: 'PUT',
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
            throw new Error('Failed to review application');
         }

         const result = await response.json();
         
         if (result.success) {
            alert('Application reviewed successfully!');
            setSelectedApplication(null);
            setReviewStatus('');
            setReviewComments('');
            fetchApplications();
         } else {
            throw new Error(result.message || 'Failed to review application');
         }
      } catch (error) {
         console.error('Error reviewing application:', error);
         alert('Error reviewing application: ' + error.message);
      }
   };
   
   // Mock user stats for interactive features
   const userStats = {
      totalEnrollments: applications.length,
      approvedApplications: applications.filter(app => app.dostMimaropaStatus === 'approved').length,
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

   return (
      <div className={`min-h-screen transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
         <div className="px-4 py-4">
            {/* Compact Header */}
            <div className="mb-4">
               <h1 className={`text-xl font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>DOST MIMAROPA</h1>
               <p className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>Review TNA applications</p>
            </div>

            {/* Compact Tab Navigation */}
            <div className="mb-4">
               <div className={`flex space-x-1 border-b transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
               }`}>
                  <button
                     onClick={() => setActiveTab('dashboard')}
                     className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'dashboard'
                           ? 'border-blue-500 text-blue-600'
                           : isDarkMode 
                              ? 'border-transparent text-gray-400 hover:text-gray-200'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     Dashboard
                  </button>
                  <button
                     onClick={() => setActiveTab('applications')}
                     className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'applications'
                           ? 'border-blue-500 text-blue-600'
                           : isDarkMode 
                              ? 'border-transparent text-gray-400 hover:text-gray-200'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     Applications
                  </button>
                  <button
                     onClick={() => setActiveTab('enrollments')}
                     className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'enrollments'
                           ? 'border-blue-500 text-blue-600'
                           : isDarkMode 
                              ? 'border-transparent text-gray-400 hover:text-gray-200'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     📊 Enrollments
                  </button>
                  <button
                     onClick={() => setActiveTab('reports')}
                     className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'reports'
                           ? 'border-blue-500 text-blue-600'
                           : isDarkMode 
                              ? 'border-transparent text-gray-400 hover:text-gray-200'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     📈 Reports
                  </button>
               </div>
            </div>

            {/* Tab Content */}
            <div>
               {activeTab === 'dashboard' && <InteractiveDashboard userStats={userStats} />}
               {activeTab === 'tna-review' && (
                  <div className="p-6 text-center">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">TNA Review Panel</h3>
                     <p className="text-gray-600">TNA review functionality will be implemented with the new flow.</p>
                  </div>
               )}
               
               {activeTab === 'enrollments' && (
                  <div className="text-center py-8">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                     }`}>
                        <svg className={`w-6 h-6 transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>All Enrollments</h3>
                     <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                     }`}>View all enrollments from PSTO offices</p>
                  </div>
               )}
               
               {activeTab === 'reports' && (
                  <div className="text-center py-8">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                     }`}>
                        <svg className={`w-6 h-6 transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                     </div>
                     <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>Reports</h3>
                     <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                     }`}>Generate reports and analytics</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default DostMimaropaDashboard;
