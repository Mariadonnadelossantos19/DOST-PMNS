import React, { useState, useCallback } from 'react';
import { useDarkMode } from '../../../Component/Context';
import DostMimaropaReviewModal from './DostMimaropaReviewModal.jsx';

const PSTOApplicationsList = ({ 
   applications, 
   loading, 
   error, 
   onRetry, 
   selectedApplication, 
   setSelectedApplication,
   reviewStatus,
   setReviewStatus,
   reviewComments,
   setReviewComments,
   reviewApplication,
   formatDate
}) => {
   const { isDarkMode } = useDarkMode();
   const [searchTerm, setSearchTerm] = useState('');
   const [filterStatus, setFilterStatus] = useState('all');

   // Filter applications based on status and search term
   const filteredApplications = applications.filter(application => {
      const matchesStatus = filterStatus === 'all' || application.dostMimaropaStatus === filterStatus;
      const matchesSearch = searchTerm === '' || 
         application.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         application.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (application.contactPerson && application.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
   });


   // Get status badge color
   const getStatusColor = useCallback((status) => {
      switch (status) {
         case 'approved': return isDarkMode ? 'bg-green-900/90 text-green-200 border border-green-700/60' : 'bg-green-50 text-green-800 border border-green-200';
         case 'rejected': return isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700/60' : 'bg-red-50 text-red-800 border border-red-200';
         case 'returned': return isDarkMode ? 'bg-yellow-900/90 text-yellow-200 border border-yellow-700/60' : 'bg-yellow-50 text-yellow-800 border border-yellow-200';
         case 'pending': return isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200';
         default: return isDarkMode ? 'bg-gray-900/90 text-gray-200 border border-gray-700/60' : 'bg-gray-50 text-gray-800 border border-gray-200';
      }
   }, [isDarkMode]);

   return (
      <div className="space-y-4">
         {/* Applications Header */}
         <div className={`p-4 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
         }`}>
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                     PSTO Approved Applications
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                     {applications.length} total applications forwarded for review
                  </p>
               </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
               <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>
                  <input
                     type="text"
                     placeholder="Search applications..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                           : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                     }`}
                  />
               </div>
               <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                     isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
               >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="returned">Returned</option>
               </select>
            </div>
         </div>

         {/* Summary Statistics */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
               <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <div>
                     <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>Total Applications</p>
                     <p className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{applications.length}</p>
                  </div>
               </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
               <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mr-3">
                     <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div>
                     <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>Pending Review</p>
                     <p className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{applications.filter(app => app.dostMimaropaStatus === 'pending' || !app.dostMimaropaStatus).length}</p>
                  </div>
               </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
               <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                     <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div>
                     <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>Approved</p>
                     <p className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{applications.filter(app => app.dostMimaropaStatus === 'approved').length}</p>
                  </div>
               </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
               <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg mr-3">
                     <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </div>
                  <div>
                     <p className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>Rejected</p>
                     <p className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{applications.filter(app => app.dostMimaropaStatus === 'rejected').length}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Applications List */}
         <div className={`rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
         }`}>
            {loading ? (
               <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className={`ml-3 text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Loading applications...</span>
               </div>
            ) : error ? (
               <div className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors duration-300 ${
                     isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
                  }`}>
                     <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Error Loading Applications</h3>
                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{error}</p>
                  <button
                     onClick={onRetry}
                     className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     Try Again
                  </button>
               </div>
            ) : filteredApplications.length === 0 ? (
               <div className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors duration-300 ${
                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                     <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>No Applications Found</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                     {searchTerm || filterStatus !== 'all' 
                        ? 'No applications match your search criteria' 
                        : 'No applications have been forwarded for review yet'
                     }
                  </p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              Application ID
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              Enterprise
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              Contact Person
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              PSTO Status
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              DOST Status
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              Forwarded Date
                           </th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                           }`}>
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                        {filteredApplications.map((application) => (
                           <tr key={application._id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${
                                       application.dostMimaropaStatus === 'approved' ? 'bg-green-500' :
                                       application.dostMimaropaStatus === 'rejected' ? 'bg-red-500' :
                                       application.dostMimaropaStatus === 'returned' ? 'bg-yellow-500' :
                                       'bg-blue-500'
                                    }`}></div>
                                    <div className="text-sm font-medium">
                                       <span className={`transition-colors duration-300 ${
                                          isDarkMode ? 'text-white' : 'text-gray-900'
                                       }`}>
                                          {application.applicationId}
                                       </span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm">
                                    <div className={`font-medium transition-colors duration-300 ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                       {typeof application.enterpriseName === 'string' ? application.enterpriseName : 'N/A'}
                                    </div>
                                    <div className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                       {typeof application.proponentId === 'object' 
                                          ? application.proponentId?.province || 'N/A'
                                          : application.proponentId || 'N/A'
                                       }
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm">
                                    <div className={`transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                       {typeof application.contactPerson === 'string' ? application.contactPerson : 'N/A'}
                                    </div>
                                    <div className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                       {application.position || 'N/A'}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.pstoStatus)}`}>
                                    {application.pstoStatus?.toUpperCase() || 'PENDING'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.dostMimaropaStatus)}`}>
                                    {application.dostMimaropaStatus?.toUpperCase() || 'PENDING'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 <div className={`transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                 }`}>
                                    {application.forwardedToDostMimaropaAt ? formatDate(application.forwardedToDostMimaropaAt) : 'N/A'}
                                 </div>
                                 <div className={`text-xs transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                 }`}>
                                    {application.pstoReviewedAt ? `PSTO: ${formatDate(application.pstoReviewedAt)}` : ''}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                 <div className="flex items-center space-x-2">
                                    <button
                                       onClick={() => setSelectedApplication(application)}
                                       className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                       Review
                                    </button>
                                    {application.pstoComments && (
                                       <div className="group relative">
                                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                             </svg>
                                          </button>
                                          <div className="absolute right-0 mt-2 w-64 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                             <div className="text-xs text-gray-600 dark:text-gray-300">
                                                <strong>PSTO Comments:</strong><br />
                                                {application.pstoComments}
                                             </div>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* DOST MIMAROPA Review Modal */}
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

export default PSTOApplicationsList;
