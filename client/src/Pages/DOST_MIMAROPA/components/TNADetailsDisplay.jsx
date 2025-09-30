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

   const handleViewReport = async () => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/${tnaData._id}/download-report`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               alert('Session expired. Please login again.');
               return;
            }
            throw new Error(`Failed to download report: ${response.status}`);
         }

         // Get the blob and create a download link
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = tnaData.tnaReport?.originalName || 'tna-report.pdf';
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (error) {
         console.error('Error downloading report:', error);
         alert('Error downloading report: ' + error.message);
      }
   };

   return (
      <div className="space-y-4">
         {/* TNA Overview Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
               <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA ID</p>
               <p className="text-lg font-bold text-blue-900 mt-1">
                  {tnaData._id?.slice(-8) || 'N/A'}
               </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
               <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Status</p>
               <p className="text-lg font-bold text-green-900 mt-1">
                  {tnaData.status?.replace('_', ' ').toUpperCase() || 'N/A'}
               </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
               <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Program</p>
               <p className="text-lg font-bold text-purple-900 mt-1">
                  {tnaData.programName || 'SETUP'}
               </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
               <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Scheduled Date</p>
               <p className="text-lg font-bold text-orange-900 mt-1">
                  {tnaData.scheduledDate ? formatDate(tnaData.scheduledDate).split(' at ')[0] : 'N/A'}
               </p>
               {tnaData.scheduledTime && (
                  <p className="text-sm text-orange-700">{tnaData.scheduledTime}</p>
               )}
            </div>

            <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
               <p className="text-xs font-medium text-teal-600 uppercase tracking-wide">Location</p>
               <p className="text-lg font-bold text-teal-900 mt-1">
                  {tnaData.location || 'N/A'}
               </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
               <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Assessment Team</p>
               <p className="text-lg font-bold text-indigo-900 mt-1">
                  {tnaData.assessmentTeam?.length || 0} Members
               </p>
            </div>
         </div>

         {/* TNA Report File */}
         {tnaData.tnaReport?.originalName && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-900">TNA Report File</p>
                        <p className="text-xs text-gray-600">{tnaData.tnaReport.originalName}</p>
                     </div>
                  </div>
                  <button
                     onClick={handleViewReport}
                     className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     View Report
                  </button>
               </div>
            </div>
         )}

         {/* Assessment Team */}
         {tnaData.assessmentTeam && tnaData.assessmentTeam.length > 0 && (
            <div>
               <h4 className="text-sm font-medium text-gray-900 mb-2">Assessment Team</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

         {/* Report Content */}
         {tnaData.reportSummary && (
            <div>
               <h4 className="text-sm font-medium text-gray-900 mb-2">Report Summary</h4>
               <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-gray-700 text-sm">{tnaData.reportSummary}</p>
               </div>
            </div>
         )}
         
         {tnaData.reportRecommendations && (
            <div>
               <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
               <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-gray-700 text-sm">{tnaData.reportRecommendations}</p>
               </div>
            </div>
         )}

         {/* Technology Analysis Section */}
         {((tnaData.technologyGaps && tnaData.technologyGaps.length > 0) || 
           (tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0)) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                     <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                     </svg>
                  </div>
                  Technology Analysis
               </h3>
               
               <div className="space-y-8">
                  {/* Technology Gaps */}
                  {tnaData.technologyGaps && tnaData.technologyGaps.length > 0 && (
                     <div>
                        <h4 className="text-md font-semibold text-red-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                           </svg>
                           Technology Gaps Identified
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {tnaData.technologyGaps.map((gap, index) => (
                              <div key={index} className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-200 shadow-sm">
                                 <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-semibold text-red-900">{gap.category}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                       gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                                       gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-green-100 text-green-800'
                                    }`}>
                                       {gap.priority?.toUpperCase()} PRIORITY
                                    </span>
                                 </div>
                                 <p className="text-sm text-red-700 leading-relaxed">{gap.description}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Technology Recommendations */}
                  {tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0 && (
                     <div>
                        <h4 className="text-md font-semibold text-green-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Technology Recommendations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {tnaData.technologyRecommendations.map((rec, index) => (
                              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                                 <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-semibold text-green-900">{rec.category}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                       rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                       rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-green-100 text-green-800'
                                    }`}>
                                       {rec.priority?.toUpperCase()} PRIORITY
                                    </span>
                                 </div>
                                 <p className="text-sm text-green-700 leading-relaxed">{rec.recommendation}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Additional Information */}
         {(tnaData.notes || tnaData.applicationId || tnaData.proponentId) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  Additional Information
               </h3>
               
               <div className="space-y-6">
                  {/* Application Details */}
                  {(tnaData.applicationId || tnaData.proponentId) && (
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
                           <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                           Application Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Application ID</p>
                              <p className="text-lg font-bold text-blue-900">
                                 {tnaData.applicationId?.applicationId || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Enterprise</p>
                              <p className="text-lg font-bold text-blue-900">
                                 {tnaData.applicationId?.enterpriseName || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Proponent</p>
                              <p className="text-lg font-bold text-blue-900">
                                 {tnaData.proponentId?.firstName} {tnaData.proponentId?.lastName}
                              </p>
                           </div>
                           <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Province</p>
                              <p className="text-lg font-bold text-blue-900">
                                 {tnaData.proponentId?.province || 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Additional Notes */}
                  {tnaData.notes && (
                     <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                           <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                           </svg>
                           Additional Notes
                        </h4>
                        <div className="bg-white bg-opacity-60 rounded-lg p-4">
                           <p className="text-gray-700 leading-relaxed">{tnaData.notes}</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default TNADetailsDisplay;
