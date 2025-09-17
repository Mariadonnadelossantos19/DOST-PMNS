import React, { useState } from 'react';
import { Badge } from '../UI';
import DOSTTNAFormGenerator from './components/DOSTTNAFormGenerator';

const ApplicationReviewModal = ({ 
   selectedApplication, 
   setSelectedApplication, 
   reviewStatus, 
   setReviewStatus, 
   reviewComments, 
   setReviewComments, 
   reviewApplication,
   getStatusColor,
   formatDate 
}) => {
   const [showTNAGenerator, setShowTNAGenerator] = useState(false);
   
   if (!selectedApplication) return null;

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
                           <p className="text-sm font-bold text-purple-900 mt-1 truncate">{selectedApplication.enterpriseName}</p>
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
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.enterpriseName}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Business Activity</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.businessActivity || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contact Person</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.contactPerson}</p>
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
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.proponentId?.province || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* General Agreement */}
                  {selectedApplication.generalAgreement && (
                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                        <div className="flex items-center mb-4">
                           <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                           <div>
                              <h4 className="text-lg font-bold text-gray-900">General Agreement & Digital Signature</h4>
                              <p className="text-sm text-green-600">Legal agreement and digital signature details</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Agreement Status</p>
                              <div className="flex items-center mt-1">
                                 <div className={`w-2 h-2 rounded-full mr-1 ${selectedApplication.generalAgreement.accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                 <p className="text-sm font-semibold text-gray-900">
                                    {selectedApplication.generalAgreement.accepted ? 'Accepted' : 'Not Accepted'}
                                 </p>
                              </div>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-gray-600">Signatory Name</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                 {selectedApplication.generalAgreement.signatoryName || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-gray-600">Position</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                 {selectedApplication.generalAgreement.position || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-gray-600">Signed Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                 {selectedApplication.generalAgreement.signedDate ? 
                                    new Date(selectedApplication.generalAgreement.signedDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-gray-600">Signature File</p>
                              <div className="mt-1">
                                 {selectedApplication.generalAgreement.signature ? (
                                    <a 
                                       href={`/uploads/${selectedApplication.generalAgreement.signature.filename}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-600 hover:text-blue-800 underline text-xs"
                                    >
                                       View Signature
                                    </a>
                                 ) : (
                                    <p className="text-sm font-semibold text-gray-500">No signature file</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

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

                  {/* Business Details */}
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Business Details</h4>
                           <p className="text-sm text-cyan-600">Company structure and business information</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Year Established</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.yearEstablished || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Initial Capital</p>
                           <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.initialCapital?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Organization Type</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.organizationType || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Profit Type</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.profitType || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Registration No</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.registrationNo || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Year Registered</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.yearRegistered || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Capital Classification</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.capitalClassification || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Employment Classification</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.employmentClassification || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Workforce Information */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Workforce Information</h4>
                           <p className="text-sm text-orange-600">Employee details and workforce composition</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-5 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Direct Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.directWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Production Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.productionWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Non-Production Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.nonProductionWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Contract Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.contractWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Total Workers</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.totalWorkers || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Product Information */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Product Information</h4>
                           <p className="text-sm text-teal-600">Products and services offered by the enterprise</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Specific Product</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.specificProduct || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Enterprise Background</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.enterpriseBackground || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Technology & Project Details */}
                  <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-5 border border-green-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Technology & Project Details</h4>
                           <p className="text-sm text-green-600">Technical requirements and project specifications</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <p className="text-xs font-medium text-gray-600">Technology Needs</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.technologyNeeds || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Current Technology Level</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.currentTechnologyLevel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Desired Technology Level</p>
                           <p className="text-sm font-semibold text-gray-900">{selectedApplication.desiredTechnologyLevel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-gray-600">Expected Outcomes</p>
                           <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.expectedOutcomes || 'N/A'}</p>
                        </div>
                        {selectedApplication.projectTitle && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Project Title</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.projectTitle}</p>
                           </div>
                        )}
                        {selectedApplication.projectDescription && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Project Description</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.projectDescription}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200 shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-gray-900">Financial Information</h4>
                           <p className="text-sm text-yellow-600">Project costs and funding requirements</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {selectedApplication.totalProjectCost && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Total Project Cost</p>
                              <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.totalProjectCost.toLocaleString()}</p>
                           </div>
                        )}
                        {selectedApplication.requestedAmount && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Requested Amount</p>
                              <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.requestedAmount.toLocaleString()}</p>
                           </div>
                        )}
                        {selectedApplication.counterpartFunding && (
                           <div>
                              <p className="text-xs font-medium text-gray-600">Counterpart Funding</p>
                              <p className="text-sm font-semibold text-gray-900">₱{selectedApplication.counterpartFunding.toLocaleString()}</p>
                           </div>
                        )}
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
                              <p className="text-xs font-medium text-gray-600">Assigned PSTO ID</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedApplication.assignedPSTO}</p>
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
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
