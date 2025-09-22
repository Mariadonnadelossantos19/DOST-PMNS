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
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
         <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">TNA Details</h2>
                        <p className="text-blue-100">Technology Needs Assessment Information</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setShowTNADetails(false)}
                     className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
               {/* Quick Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TNA ID</p>
                           <p className="text-lg font-bold text-blue-900 mt-1">
                              {selectedTNA._id?.slice(-8) || 'N/A'}
                           </p>
                        </div>
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Status</p>
                           <Badge 
                              status={selectedTNA.status} 
                              className="mt-1"
                           />
                        </div>
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Program</p>
                           <p className="text-sm font-bold text-purple-900 mt-1">
                              {selectedTNA.programName || selectedTNA.applicationId?.programName || 'SETUP Program'}
                           </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Application Details Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Application Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Application ID</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.applicationId?.applicationId || selectedTNA.applicationId?._id?.slice(-8) || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Program Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.applicationId?.programName || selectedTNA.programName || 'SETUP Program'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Enterprise Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.applicationId?.enterpriseName || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Business Activity</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.applicationId?.businessActivity || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Application Status</p>
                        <Badge status={selectedTNA.applicationId?.status || 'N/A'} />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.applicationId?.createdAt ? new Date(selectedTNA.applicationId.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Proponent Information Section */}
               <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     Proponent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.proponentId?.firstName} {selectedTNA.proponentId?.lastName}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.proponentId?.email || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Province</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.proponentId?.province || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.proponentId?.phone || 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TNA Contact Information */}
               <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     TNA Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.contactPerson || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Position</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.position || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.phone || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.email || 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TNA Assessment Details */}
               <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                     </svg>
                     Assessment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.scheduledDate ? new Date(selectedTNA.scheduledDate).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.location || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Assessment Team</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.assessmentTeam?.join(', ') || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-lg font-semibold text-gray-900">
                           {selectedTNA.createdAt ? new Date(selectedTNA.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TNA Results */}
               {selectedTNA.tnaReport && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        TNA Report
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <p className="text-sm font-medium text-gray-500">Report File</p>
                           <p className="text-lg font-semibold text-gray-900">
                              {selectedTNA.tnaReport.originalName || selectedTNA.tnaReport.filename || 'N/A'}
                           </p>
                        </div>
                        {selectedTNA.reportSummary && (
                           <div>
                              <p className="text-sm font-medium text-gray-500">Summary</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedTNA.reportSummary}
                              </p>
                           </div>
                        )}
                        {selectedTNA.reportRecommendations && (
                           <div>
                              <p className="text-sm font-medium text-gray-500">Recommendations</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedTNA.reportRecommendations}
                              </p>
                           </div>
                        )}
                        <div className="flex space-x-2">
                           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Download Report
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
