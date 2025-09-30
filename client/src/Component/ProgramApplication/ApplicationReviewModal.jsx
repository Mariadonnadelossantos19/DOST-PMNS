import React, { useState } from 'react';
import { Badge } from '../UI';
import DOSTTNAFormGenerator from './components/DOSTTNAFormGenerator';
import { API_ENDPOINTS } from '../../config/api';

const ApplicationReviewModal = ({ 
   selectedApplication, 
   setSelectedApplication, 
   reviewStatus, 
   setReviewStatus, 
   reviewComments, 
   setReviewComments, 
   reviewApplication,
   getStatusColor,
   formatDate,
   handleForwardToDostMimaropa
}) => {
   const [showTNAGenerator, setShowTNAGenerator] = useState(false);

   // Handle file viewing with proper authentication
   const handleViewFile = async (fileType) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please log in to view files');
            return;
         }

         const response = await fetch(`/api/programs/setup/${selectedApplication._id}/view/${fileType}`, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to view file: ${response.status} ${response.statusText}`);
         }

         // Get the file blob
         const blob = await response.blob();
         
         // Create a URL for the blob
         const fileUrl = window.URL.createObjectURL(blob);
         
         // Open in new tab
         window.open(fileUrl, '_blank');
         
         // Clean up the URL after a delay
         setTimeout(() => {
            window.URL.revokeObjectURL(fileUrl);
         }, 1000);
      } catch (error) {
         console.error('Error viewing file:', error);
         alert(`Failed to view file: ${error.message}`);
      }
   };

   // Handle schedule TNA for approved applications
   const handleScheduleTNA = () => {
      if (window.confirm('This application has been approved. You can now schedule a Technology Needs Assessment (TNA). Would you like to proceed to TNA scheduling?')) {
         // Close the modal and trigger TNA scheduling
         setSelectedApplication(null);
         // This would typically navigate to TNA scheduling or open TNA modal
         alert('Please use the TNA Management section to schedule the assessment.');
      }
   };
   
   if (!selectedApplication) return null;

   // Debug: Log the selected application data to identify object rendering issues
   console.log('ApplicationReviewModal - selectedApplication:', selectedApplication);
   console.log('assignedPSTO type:', typeof selectedApplication.assignedPSTO, selectedApplication.assignedPSTO);
   console.log('proponentId type:', typeof selectedApplication.proponentId, selectedApplication.proponentId);

   return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
         <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[98vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl">
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold">Application Review</h3>
                        <p className="text-purple-100 text-sm">Review and process application details</p>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                     <button
                        onClick={() => setShowTNAGenerator(true)}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30"
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate TNA Form
                     </button>
                     <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(98vh-120px)]">

               {/* Quick Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Application ID</p>
                           <p className="text-lg font-bold text-blue-900 mt-1">{selectedApplication.applicationId}</p>
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
                           <p className="text-xs font-medium text-green-600 uppercase tracking-wide">PSTO Status</p>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(selectedApplication.pstoStatus)}`}>
                              {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
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
                           <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Enterprise</p>
                           <p className="text-sm font-bold text-purple-900 mt-1 truncate">
                              {typeof selectedApplication.enterpriseName === 'string' 
                                 ? selectedApplication.enterpriseName 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Submitted</p>
                           <p className="text-sm font-bold text-orange-900 mt-1">{formatDate(selectedApplication.createdAt)}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Main Content Sections */}
               <div className="space-y-4 mb-6">

                  {/* Enterprise Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Enterprise Information</h4>
                           <p className="text-sm text-blue-600">Company details and business information</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Enterprise Name</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">
                              {typeof selectedApplication.enterpriseName === 'string' 
                                 ? selectedApplication.enterpriseName 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Program</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">SETUP</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {typeof selectedApplication.contactPerson === 'string' 
                                 ? selectedApplication.contactPerson 
                                 : 'N/A'
                              }
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Position</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.position || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Office Address</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.officeAddress || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Factory Address</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.factoryAddress || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Website</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {selectedApplication.website ? (
                                 <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs">
                                    {selectedApplication.website.length > 20 ? selectedApplication.website.substring(0, 20) + '...' : selectedApplication.website}
                                 </a>
                              ) : 'N/A'}
                           </p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Province</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {typeof selectedApplication.proponentId === 'object' 
                                 ? selectedApplication.proponentId?.province || 'N/A'
                                 : selectedApplication.proponentId || 'N/A'
                              }
                           </p>
                        </div>
                     </div>
                  </div>


                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Contact Information</h4>
                           <p className="text-sm text-indigo-600">Communication details and contact methods</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person Email</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.contactPersonEmail || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person Tel</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.contactPersonTel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Factory Email</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.factoryEmail || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Factory Tel</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.factoryTel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person Fax</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.contactPersonFax || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Factory Fax</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.factoryFax || 'N/A'}</p>
                        </div>
                     </div>
                  </div>






                  {/* Application Status & Processing */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5 border border-red-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Application Status & Processing</h4>
                           <p className="text-sm text-red-600">Current status and processing workflow</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Current Stage</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.currentStage || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Status</p>
                           <Badge className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.status)}`}>
                              {selectedApplication.status?.toUpperCase() || 'N/A'}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">PSTO Status</p>
                           <Badge className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.pstoStatus)}`}>
                              {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Forwarded to PSTO</p>
                           <p className="text-sm font-semibold text-gray-900">
                              {selectedApplication.forwardedToPSTO ? (
                                 <span className="text-green-600 font-bold">Yes</span>
                              ) : (
                                 <span className="text-red-600 font-bold">No</span>
                              )}
                           </p>
                        </div>
                        {selectedApplication.forwardedAt && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Forwarded Date</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApplication.forwardedAt)}</p>
                           </div>
                        )}
                        {selectedApplication.assignedPSTO && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Assigned PSTO</p>
                              <p className="text-sm font-semibold text-gray-900">
                                 {typeof selectedApplication.assignedPSTO === 'string' 
                                    ? selectedApplication.assignedPSTO 
                                    : selectedApplication.assignedPSTO?.name || selectedApplication.assignedPSTO?.fullOfficeName || 'N/A'
                                 }
                              </p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Timeline Information</h4>
                           <p className="text-sm text-purple-600">Important dates and project timeline</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Submitted Date</p>
                           <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                        </div>
                        {selectedApplication.updatedAt && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Last Updated</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApplication.updatedAt)}</p>
                           </div>
                        )}
                        {selectedApplication.expectedStartDate && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Expected Start Date</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApplication.expectedStartDate)}</p>
                           </div>
                        )}
                        {selectedApplication.expectedEndDate && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Expected End Date</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(selectedApplication.expectedEndDate)}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Attached Documents */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Attached Documents</h4>
                           <p className="text-sm text-indigo-600">Required document for SETUP program application</p>
                        </div>
                     </div>
                     <div className="space-y-3">
                        {/* Letter of Intent */}
                        {selectedApplication.letterOfIntent?.filename ? (
                           <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center">
                                 <div className="p-2 bg-red-100 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className="text-sm font-semibold text-gray-900">Letter of Intent</p>
                                    <p className="text-xs text-gray-500">{selectedApplication.letterOfIntent.originalName || selectedApplication.letterOfIntent.filename}</p>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <button
                                    onClick={() => handleViewFile('letterOfIntent')}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    title="View Document"
                                 >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                 </button>
                                 <button
                                    onClick={() => window.open(`/api/programs/setup/${selectedApplication._id}/download/letterOfIntent`, '_blank')}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                    title="Download Document"
                                 >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
                              <div className="flex items-center">
                                 <div className="p-2 bg-gray-200 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className="text-sm font-semibold text-gray-500">Letter of Intent</p>
                                    <p className="text-xs text-gray-400">No document uploaded</p>
                                 </div>
                              </div>
                           </div>
                        )}

                     </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Additional Information</h4>
                           <p className="text-sm text-gray-600">Notes, comments, and supplementary details</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-3">
                        {selectedApplication.remarks && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Remarks</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.remarks}</p>
                           </div>
                        )}
                        {selectedApplication.notes && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Notes</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.notes}</p>
                           </div>
                        )}
                        {selectedApplication.pstoComments && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">PSTO Comments</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.pstoComments}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Review Form */}
               <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                     <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900">Review & Decision</h4>
                        <p className="text-sm text-gray-600">Make your review decision and provide feedback</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Review Decision
                        </label>
                        <select
                           value={reviewStatus}
                           onChange={(e) => setReviewStatus(e.target.value)}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                           <option value="">Select decision</option>
                           <option value="approved">✅ Approve Application</option>
                           <option value="returned">🔄 Return for Revision</option>
                           <option value="rejected">❌ Reject Application</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Priority Level
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200">
                           <option value="">Select priority</option>
                           <option value="high">🔴 High Priority</option>
                           <option value="medium">🟡 Medium Priority</option>
                           <option value="low">🟢 Low Priority</option>
                        </select>
                     </div>
                  </div>

                  <div className="mt-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comments
                     </label>
                     <textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Provide detailed feedback about your review decision..."
                     />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                     {/* Left side - Forward button (only for approved applications) */}
                     <div>
                        {selectedApplication.pstoStatus === 'approved' && 
                         selectedApplication.tnaConducted && 
                         selectedApplication.tnaReportSubmitted && (
                           <button
                              onClick={handleForwardToDostMimaropa}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                           >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span>
                                 {selectedApplication.forwardedToDostMimaropa ? 'Re-forward to DOST MIMAROPA' : 'Forward to DOST MIMAROPA'}
                              </span>
                           </button>
                        )}
                        
                        {/* Show workflow status message when TNA is not ready */}
                        {selectedApplication.pstoStatus === 'approved' && 
                         (!selectedApplication.tnaConducted || !selectedApplication.tnaReportSubmitted) && (
                           <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                 <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                 </svg>
                                 <div className="text-sm text-yellow-800">
                                    <strong>Next Step:</strong> {
                                       !selectedApplication.tnaConducted 
                                          ? 'Schedule and conduct TNA assessment'
                                          : 'Upload TNA report to forward to DOST MIMAROPA'
                                    }
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Right side - Cancel and Submit buttons */}
                     <div className="flex space-x-3">
                        <button
                           onClick={() => setSelectedApplication(null)}
                           className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={() => reviewApplication(selectedApplication._id)}
                           disabled={!reviewStatus}
                           className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                        >
                           Submit Review
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* DOST TNA Form Generator Modal */}
         <DOSTTNAFormGenerator
            application={selectedApplication}
            isOpen={showTNAGenerator}
            onClose={() => setShowTNAGenerator(false)}
            onGenerate={(formData) => {
               console.log('Generated TNA Form Data:', formData);
               // Here you can add logic to save the generated form or send it to backend
               setShowTNAGenerator(false);
            }}
            pstoOffice="PSTO"
         />
      </div>
   );
};

export default ApplicationReviewModal;
