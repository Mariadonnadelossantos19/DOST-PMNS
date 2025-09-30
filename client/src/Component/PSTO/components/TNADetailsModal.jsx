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
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
         <div className="bg-white rounded-3xl shadow-2xl max-w-8xl w-full max-h-[96vh] overflow-hidden border border-gray-100 transform animate-slideUp">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 relative overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                     <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                           <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                     </defs>
                     <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
               </div>
               
               <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center space-x-6">
                     <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-lg shadow-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold mb-2">TNA Comprehensive Report</h2>
                        <p className="text-lg text-indigo-100 font-medium">
                           Technology Needs Assessment - Detailed Analysis
                        </p>
                        <div className="flex items-center mt-3 space-x-4">
                           <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 backdrop-blur-sm">
                              <span className="text-sm font-semibold">ID: {selectedTNA._id?.slice(-8) || 'N/A'}</span>
                           </div>
                           <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 backdrop-blur-sm">
                              <span className="text-sm font-semibold">
                                 {new Date(selectedTNA.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                 })}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <button
                     onClick={() => setShowTNADetails(false)}
                     className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(96vh-180px)] bg-gradient-to-b from-gray-50 to-white">
               {/* Enhanced Quick Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                     <div className="flex items-center justify-between">
                        <div className="flex-1">
                           <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">TNA ID</p>
                           <p className="text-2xl font-bold text-blue-900">
                              {selectedTNA._id?.slice(-8) || 'N/A'}
                           </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                     <div className="flex items-center justify-between">
                        <div className="flex-1">
                           <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Status</p>
                           <div className="mt-2">
                              <Badge 
                                 status={selectedTNA.status} 
                                 className="px-3 py-1 text-sm font-semibold"
                              />
                           </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                     <div className="flex items-center justify-between">
                        <div className="flex-1">
                           <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Program</p>
                           <p className="text-lg font-bold text-purple-900 leading-tight">
                              {selectedTNA.programName || selectedTNA.applicationId?.programName || 'SETUP Program'}
                           </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                     <div className="flex items-center justify-between">
                        <div className="flex-1">
                           <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Location</p>
                           <p className="text-lg font-bold text-orange-900 leading-tight truncate">
                              {selectedTNA.location || 'N/A'}
                           </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Application Details Section */}
               <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        Application Details
                     </h3>
                     <div className="bg-blue-50 rounded-xl px-4 py-2">
                        <span className="text-sm font-semibold text-blue-700">Primary Information</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Application ID</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                           <p className="text-lg font-bold text-gray-900 font-mono">
                              {selectedTNA.applicationId?.applicationId || selectedTNA.applicationId?._id?.slice(-8) || 'N/A'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Program Name</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-purple-500">
                           <p className="text-lg font-bold text-gray-900">
                              {selectedTNA.applicationId?.programName || selectedTNA.programName || 'SETUP Program'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Enterprise Name</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500">
                           <p className="text-lg font-bold text-gray-900">
                              {selectedTNA.applicationId?.enterpriseName || 'N/A'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Business Activity</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-500">
                           <p className="text-lg font-bold text-gray-900">
                              {selectedTNA.applicationId?.businessActivity || 'N/A'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Application Status</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-indigo-500">
                           <Badge status={selectedTNA.applicationId?.status || 'N/A'} className="text-base px-4 py-2" />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Created At</p>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-pink-500">
                           <p className="text-lg font-bold text-gray-900">
                              {selectedTNA.applicationId?.createdAt ? new Date(selectedTNA.applicationId.createdAt).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'long', 
                                 day: 'numeric'
                              }) : 'N/A'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Proponent Information Section */}
               <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                        </div>
                        Proponent Information
                     </h3>
                     <div className="bg-green-50 rounded-xl px-4 py-2">
                        <span className="text-sm font-semibold text-green-700">Contact Details</span>
                     </div>
                  </div>
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
                        <div className="flex space-x-4 pt-4 border-t border-gray-200">
                           <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-semibold">Download Report</span>
                           </button>
                           <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="font-semibold">View Report</span>
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
