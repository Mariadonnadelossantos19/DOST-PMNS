import React from 'react';
import { Badge } from '../../../Component/UI';

const TNADetailsModal = ({ 
   selectedTNA, 
   setSelectedTNA, 
   showTNADetails, 
   setShowTNADetails 
}) => {
   if (!selectedTNA || !showTNADetails) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200">
            {/* Simple Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
               <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                     <h2 className="text-xl font-semibold">TNA Details</h2>
                     <p className="text-blue-100 text-sm">ID: {selectedTNA._id?.slice(-8) || 'N/A'}</p>
                  </div>
               </div>
               <button
                  onClick={() => setShowTNADetails(false)}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
               >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
               {/* Quick Stats */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                     <p className="text-xs font-medium text-blue-600 uppercase">Status</p>
                     <Badge status={selectedTNA.status} className="mt-1" />
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                     <p className="text-xs font-medium text-purple-600 uppercase">Program</p>
                     <p className="text-sm font-semibold text-purple-900 mt-1">
                        {selectedTNA.programName || selectedTNA.applicationId?.programName || 'SETUP Program'}
                     </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                     <p className="text-xs font-medium text-orange-600 uppercase">Location</p>
                     <p className="text-sm font-semibold text-orange-900 mt-1">
                        {selectedTNA.location || 'N/A'}
                     </p>
                  </div>
               </div>

               {/* Application Details Section */}
               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Application Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Application ID</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.applicationId?.applicationId || selectedTNA.applicationId?._id?.slice(-8) || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Enterprise Name</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.applicationId?.enterpriseName || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Business Activity</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.applicationId?.businessActivity || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.applicationId?.createdAt ? new Date(selectedTNA.applicationId.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Proponent Information Section */}
               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     Proponent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.proponentId?.firstName} {selectedTNA.proponentId?.lastName}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.proponentId?.email || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Province</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.proponentId?.province || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.proponentId?.phone || 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TNA Assessment Details */}
               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                     </svg>
                     Assessment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.scheduledDate ? new Date(selectedTNA.scheduledDate).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.contactPerson || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Assessment Team</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.assessmentTeam?.join(', ') || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-base font-semibold text-gray-900">
                           {selectedTNA.createdAt ? new Date(selectedTNA.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TNA Report */}
               {selectedTNA.tnaReport && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        TNA Report
                     </h3>
                     <div className="space-y-3">
                        <div>
                           <p className="text-sm font-medium text-gray-500">Report File</p>
                           <p className="text-base font-semibold text-gray-900">
                              {selectedTNA.tnaReport.originalName || selectedTNA.tnaReport.filename || 'N/A'}
                           </p>
                        </div>
                        {selectedTNA.reportSummary && (
                           <div>
                              <p className="text-sm font-medium text-gray-500">Summary</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                 {selectedTNA.reportSummary}
                              </p>
                           </div>
                        )}
                        {selectedTNA.reportRecommendations && (
                           <div>
                              <p className="text-sm font-medium text-gray-500">Recommendations</p>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                 {selectedTNA.reportRecommendations}
                              </p>
                           </div>
                        )}
                        <div className="flex space-x-3 pt-3 border-t border-gray-200">
                           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Download</span>
                           </button>
                           <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>View</span>
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default TNADetailsModal;
