import React from 'react';

const TNADetailsDisplay = ({ tnaData, formatDate, showReviewSection = false }) => {
   if (!tnaData) {
      return (
         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No TNA Data Available</h3>
            <p className="text-yellow-600">No Technology Needs Assessment has been scheduled or conducted for this application yet.</p>
         </div>
      );
   }

   const handleViewReport = () => {
      const token = localStorage.getItem('authToken');
      const downloadUrl = `http://localhost:4000/api/tna/${tnaData._id}/download-report`;
      window.open(downloadUrl + `?token=${token}`, '_blank');
   };

   return (
      <div className="space-y-6">
         {/* TNA Overview Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA ID</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData._id?.slice(-8) || 'N/A'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Status</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.status || 'N/A'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Program</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.programName || 'SETUP'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Scheduled Date</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.scheduledDate ? formatDate(tnaData.scheduledDate) : 'N/A'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Scheduled Time</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.scheduledTime || 'N/A'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Location</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.location || 'N/A'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Conducted Date</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.completedAt ? formatDate(tnaData.completedAt) : 'Not Completed'}
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Assessment Team</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.assessmentTeam?.length || 0} Members
               </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA Report File</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData.tnaReport?.originalName || 'No Report'}
               </p>
               {tnaData.tnaReport?.originalName && (
                  <button
                     onClick={handleViewReport}
                     className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     View Report
                  </button>
               )}
            </div>
         </div>

         {/* Assessment Team Section */}
         {tnaData.assessmentTeam && tnaData.assessmentTeam.length > 0 && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Assessment Team
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tnaData.assessmentTeam.map((member, index) => (
                     <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="font-medium text-green-900">{member.name}</p>
                        <p className="text-sm text-green-700">{member.position}</p>
                        <p className="text-xs text-green-600">{member.department}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Report Summary Section */}
         {tnaData.reportSummary && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Report Summary
               </h4>
               <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-gray-700">{tnaData.reportSummary}</p>
               </div>
            </div>
         )}
         
         {/* Recommendations Section */}
         {tnaData.reportRecommendations && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommendations
               </h4>
               <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-gray-700">{tnaData.reportRecommendations}</p>
               </div>
            </div>
         )}

         {/* Technology Gaps Section */}
         {tnaData.technologyGaps && tnaData.technologyGaps.length > 0 && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Technology Gaps Identified
               </h4>
               <div className="space-y-3">
                  {tnaData.technologyGaps.map((gap, index) => (
                     <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex justify-between items-start mb-2">
                           <h5 className="font-medium text-red-900">{gap.category}</h5>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                              gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                           }`}>
                              {gap.priority} priority
                           </span>
                        </div>
                        <p className="text-sm text-red-700">{gap.description}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Technology Recommendations Section */}
         {tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0 && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Technology Recommendations
               </h4>
               <div className="space-y-3">
                  {tnaData.technologyRecommendations.map((rec, index) => (
                     <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                           <h5 className="font-medium text-green-900">{rec.category}</h5>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                           }`}>
                              {rec.priority} priority
                           </span>
                        </div>
                        <p className="text-sm text-green-700">{rec.recommendation}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Additional Notes */}
         {tnaData.notes && (
            <div>
               <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Additional Notes
               </h4>
               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700">{tnaData.notes}</p>
               </div>
            </div>
         )}

         {/* Application Details */}
         {(tnaData.applicationId || tnaData.proponentId) && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <h4 className="text-md font-semibold text-blue-900 mb-3">Application Details</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm font-medium text-blue-700">Application ID</p>
                     <p className="text-lg font-bold text-blue-900">
                        {tnaData.applicationId?.applicationId || 'N/A'}
                     </p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-700">Enterprise</p>
                     <p className="text-lg font-bold text-blue-900">
                        {tnaData.applicationId?.enterpriseName || 'N/A'}
                     </p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-700">Proponent</p>
                     <p className="text-lg font-bold text-blue-900">
                        {tnaData.proponentId?.firstName} {tnaData.proponentId?.lastName}
                     </p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-700">Province</p>
                     <p className="text-lg font-bold text-blue-900">
                        {tnaData.proponentId?.province || 'N/A'}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TNADetailsDisplay;
