import React from 'react';

const TNADetailsDisplay = ({ tnaData, formatDate }) => {
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
         {/* TNA Overview Cards - Clean Minimalist */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">TNA ID</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData._id?.slice(-8) || 'N/A'}
               </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">Status</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData.status?.replace('_', ' ').toUpperCase() || 'N/A'}
               </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">Program</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData.programName || 'SETUP'}
               </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">Scheduled Date</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData.scheduledDate ? formatDate(tnaData.scheduledDate).split(' at ')[0] : 'N/A'}
               </p>
               {tnaData.scheduledTime && (
                  <p className="text-base text-gray-700">{tnaData.scheduledTime}</p>
               )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">Location</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData.location || 'N/A'}
               </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <p className="text-base font-medium text-gray-600">Assessment Team</p>
               <p className="text-base font-medium text-gray-900 mt-1">
                  {tnaData.assessmentTeam?.length || 0} Members
               </p>
            </div>
         </div>

         {/* TNA Report File */}
         {tnaData.tnaReport?.originalName && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-base font-medium text-gray-900">TNA Report File</p>
                     <p className="text-base text-gray-600">{tnaData.tnaReport.originalName}</p>
                  </div>
                  <button
                     onClick={handleViewReport}
                     className="px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors"
                  >
                     View Report
                  </button>
               </div>
            </div>
         )}

         {/* Assessment Team */}
         {tnaData.assessmentTeam && tnaData.assessmentTeam.length > 0 && (
            <div>
               <h4 className="text-base font-medium text-gray-900 mb-3">Assessment Team</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tnaData.assessmentTeam.map((member, index) => (
                     <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-base font-medium text-gray-900">{member.name}</p>
                        <p className="text-base text-gray-600">{member.position}</p>
                        <p className="text-base text-gray-500">{member.department}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Report Content */}
         {tnaData.reportSummary && (
            <div>
               <h4 className="text-base font-medium text-gray-900 mb-3">Report Summary</h4>
               <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-700">{tnaData.reportSummary}</p>
               </div>
            </div>
         )}
         
         {tnaData.reportRecommendations && (
            <div>
               <h4 className="text-base font-medium text-gray-900 mb-3">Recommendations</h4>
               <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-700">{tnaData.reportRecommendations}</p>
               </div>
            </div>
         )}

         {/* Technology Analysis Section */}
         {((tnaData.technologyGaps && tnaData.technologyGaps.length > 0) || 
           (tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0)) && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
               <h3 className="text-base font-medium text-gray-900 mb-4">Technology Analysis</h3>
               
               <div className="space-y-4">
                  {/* Technology Gaps */}
                  {tnaData.technologyGaps && tnaData.technologyGaps.length > 0 && (
                     <div>
                        <h4 className="text-base font-medium text-gray-900 mb-3">Technology Gaps Identified</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {tnaData.technologyGaps.map((gap, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                 <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-base font-medium text-gray-900">{gap.category}</h5>
                                    <span className={`px-2 py-1 rounded text-base ${
                                       gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                                       gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-green-100 text-green-800'
                                    }`}>
                                       {gap.priority?.toUpperCase()}
                                    </span>
                                 </div>
                                 <p className="text-base text-gray-700">{gap.description}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Technology Recommendations */}
                  {tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0 && (
                     <div>
                        <h4 className="text-base font-medium text-gray-900 mb-3">Technology Recommendations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {tnaData.technologyRecommendations.map((rec, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                 <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-base font-medium text-gray-900">{rec.category}</h5>
                                    <span className={`px-2 py-1 rounded text-base ${
                                       rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                       rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-green-100 text-green-800'
                                    }`}>
                                       {rec.priority?.toUpperCase()}
                                    </span>
                                 </div>
                                 <p className="text-base text-gray-700">{rec.recommendation}</p>
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
            <div className="bg-white rounded-lg border border-gray-200 p-4">
               <h3 className="text-base font-medium text-gray-900 mb-4">Additional Information</h3>
               
               <div className="space-y-4">
                  {/* Application Details */}
                  {(tnaData.applicationId || tnaData.proponentId) && (
                     <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-medium text-gray-900 mb-3">Application Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-base font-medium text-gray-600">Application ID</p>
                              <p className="text-base font-medium text-gray-900">
                                 {tnaData.applicationId?.applicationId || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-base font-medium text-gray-600">Enterprise</p>
                              <p className="text-base font-medium text-gray-900">
                                 {tnaData.applicationId?.enterpriseName || 'N/A'}
                              </p>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-base font-medium text-gray-600">Proponent</p>
                              <p className="text-base font-medium text-gray-900">
                                 {tnaData.proponentId?.firstName} {tnaData.proponentId?.lastName}
                              </p>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-base font-medium text-gray-600">Province</p>
                              <p className="text-base font-medium text-gray-900">
                                 {tnaData.proponentId?.province || 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Additional Notes */}
                  {tnaData.notes && (
                     <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-base font-medium text-gray-900 mb-3">Additional Notes</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                           <p className="text-base text-gray-700">{tnaData.notes}</p>
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
