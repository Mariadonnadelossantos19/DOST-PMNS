import React, { useState, useEffect } from 'react';
import { InteractiveDashboard } from '../../Component/Interactive';
import { useDarkMode } from '../../Component/Context';
import { API_ENDPOINTS } from '../../config/api';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';
import PSTOApplicationsList from './components/PSTOApplicationsList';

const DostMimaropaDashboard = () => {
   const { isDarkMode } = useDarkMode();
   const [currentPath] = useState('/dashboard');
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);
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
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Content based on current path */}
         {currentPath === '/dashboard' && (
            <div className="flex-1 overflow-y-auto p-6">
               <div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
               }`}>
                  <InteractiveDashboard userStats={userStats} />
               </div>
            </div>
         )}

         {currentPath === '/applications' && (
            <div className="flex-1 overflow-y-auto p-6">
               <PSTOApplicationsList
                  applications={applications}
                  loading={loading}
                  error={error}
                  onRetry={fetchApplications}
                  selectedApplication={selectedApplication}
                  setSelectedApplication={setSelectedApplication}
                  reviewStatus={reviewStatus}
                  setReviewStatus={setReviewStatus}
                  reviewComments={reviewComments}
                  setReviewComments={setReviewComments}
                  reviewApplication={reviewApplication}
                  formatDate={formatDate}
               />
            </div>
         )}

         {currentPath === '/reports' && (
            <div className="flex-1 overflow-y-auto p-6">
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
            </div>
         )}
      </div>
   );
};

export default DostMimaropaDashboard;
