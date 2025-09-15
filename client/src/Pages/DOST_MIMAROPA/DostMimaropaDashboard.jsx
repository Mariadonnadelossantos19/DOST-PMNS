import React, { useState } from 'react';
import { InteractiveDashboard } from '../../Component/Interactive';
import { useDarkMode } from '../../Component/Context';

const DostMimaropaDashboard = () => {
   const [activeTab, setActiveTab] = useState('tna-review');
   const { isDarkMode } = useDarkMode();
   
   // Mock user stats for interactive features
   const userStats = {
      totalEnrollments: 45,
      approvedApplications: 12,
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
                     onClick={() => setActiveTab('tna-review')}
                     className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'tna-review'
                           ? 'border-blue-500 text-blue-600'
                           : isDarkMode 
                              ? 'border-transparent text-gray-400 hover:text-gray-200'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     TNA Review
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
