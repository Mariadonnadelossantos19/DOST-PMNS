import React, { useState, useEffect } from 'react';
import { InteractiveDashboard } from '../../Component/Interactive';
import { useDarkMode } from '../../Component/Context';
import { API_ENDPOINTS } from '../../config/api';
import ApplicationReviewModal from '../../Component/ProgramApplication/ApplicationReviewModal';
import PSTOApplicationsList from './components/PSTOApplicationsList';

const DostMimaropaDashboard = ({ currentPath = '/dashboard' }) => {
   const { isDarkMode } = useDarkMode();
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
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         console.log('Fetching DOST MIMAROPA applications...');
         console.log('API Endpoint:', API_ENDPOINTS.DOST_MIMAROPA_APPLICATIONS);

         const response = await fetch(API_ENDPOINTS.DOST_MIMAROPA_APPLICATIONS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         console.log('Response status:', response.status);
         console.log('Response ok:', response.ok);

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
         console.log('API Response:', result);
         
         if (result.success) {
            console.log('Applications fetched successfully:', result.data?.length || 0, 'applications');
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
      console.log('DOST MIMAROPA Dashboard mounted, fetching applications...');
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


   console.log('DOST MIMAROPA Dashboard rendering with currentPath:', currentPath);
   console.log('Applications state:', applications);
   console.log('Loading state:', loading);
   console.log('Error state:', error);

   return (
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Test content to verify component is rendering */}
         <div className="p-4 bg-red-100 border border-red-300 rounded-lg m-4">
            <h3 className="text-red-800 font-bold">DOST MIMAROPA Dashboard Test</h3>
            <p className="text-red-700">Current Path: {currentPath}</p>
            <p className="text-red-700">Applications Count: {applications.length}</p>
            <p className="text-red-700">Loading: {loading ? 'Yes' : 'No'}</p>
            <p className="text-red-700">Error: {error || 'None'}</p>
         </div>

         {/* Content based on current path */}
         {(currentPath === '/dashboard' || currentPath === 'dashboard') && (
            <div className="flex-1 overflow-y-auto p-6">
               <div className={`rounded-xl p-6 shadow-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
               }`}>
                  <InteractiveDashboard userStats={userStats} />
               </div>
            </div>
         )}

         {(currentPath === '/applications' || currentPath === 'applications' || currentPath === '/management' || currentPath === 'management') && (
            <div className="flex-1 overflow-y-auto p-6">
               {/* Debug Info */}
               <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Debug Information</h4>
                  <p className="text-sm text-yellow-700">
                     <strong>Total Applications:</strong> {applications.length}<br/>
                     <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
                     <strong>Error:</strong> {error || 'None'}<br/>
                     <strong>API Endpoint:</strong> {API_ENDPOINTS.DOST_MIMAROPA_APPLICATIONS}
                  </p>
                  <button
                     onClick={fetchApplications}
                     className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                     Refresh Data
                  </button>
               </div>
               
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

         {(currentPath === '/reports' || currentPath === 'reports') && (
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

         {(currentPath === '/monitoring' || currentPath === 'monitoring') && (
            <div className="flex-1 overflow-y-auto p-6">
               <div className="text-center py-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                     <svg className={`w-6 h-6 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                     }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19V18H9V19Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H16" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11H12" />
                     </svg>
                  </div>
                  <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Monitoring</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Monitor system activities and performance</p>
               </div>
            </div>
         )}

         {(currentPath === '/notifications' || currentPath === 'notifications') && (
            <div className="flex-1 overflow-y-auto p-6">
               <div className="text-center py-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                     <svg className={`w-6 h-6 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                     }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9965 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
                     </svg>
                  </div>
                  <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Notifications</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>View and manage notifications</p>
               </div>
            </div>
         )}

         {(currentPath === '/settings' || currentPath === 'settings') && (
            <div className="flex-1 overflow-y-auto p-6">
               <div className="text-center py-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                     <svg className={`w-6 h-6 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                     }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5053 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49372 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" />
                     </svg>
                  </div>
                  <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Settings</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Configure system settings</p>
               </div>
            </div>
         )}
      </div>
   );
};

export default DostMimaropaDashboard;
