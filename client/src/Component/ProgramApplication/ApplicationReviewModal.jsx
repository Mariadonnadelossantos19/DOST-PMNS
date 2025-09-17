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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Review Application</h3>
                  <div className="flex items-center space-x-3">
                     <button
                        onClick={() => setShowTNAGenerator(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors duration-200"
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate TNA Form
                     </button>
                     <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-gray-500 hover:text-gray-700"
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  </div>
               </div>

               <div className="space-y-6 mb-6">
                  {/* Application Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Application Overview
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Application ID</p>
                           <p className="text-lg font-bold text-gray-900">{selectedApplication.applicationId}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Status</p>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.pstoStatus)}`}>
                              {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  {/* Enterprise Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Enterprise Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Enterprise Name</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.enterpriseName}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Business Activity</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.businessActivity || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Person</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.contactPerson}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Position</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.position || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Office Address</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.officeAddress || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Factory Address</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.factoryAddress || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Website</p>
                           <p className="text-lg font-semibold text-gray-900">
                              {selectedApplication.website ? (
                                 <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                    {selectedApplication.website}
                                 </a>
                              ) : 'N/A'}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Province</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.proponentId?.province || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* General Agreement */}
                  {selectedApplication.generalAgreement && (
                     <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                           <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           General Agreement & Digital Signature
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <p className="text-sm font-medium text-gray-600">Agreement Status</p>
                              <div className="flex items-center mt-1">
                                 <div className={`w-3 h-3 rounded-full mr-2 ${selectedApplication.generalAgreement.accepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                 <p className="text-lg font-semibold text-gray-900">
                                    {selectedApplication.generalAgreement.accepted ? 'Accepted' : 'Not Accepted'}
                                 </p>
                              </div>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-600">Accepted Date</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.generalAgreement.acceptedAt ? 
                                    new Date(selectedApplication.generalAgreement.acceptedAt).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-600">Signatory Name</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.generalAgreement.signatoryName || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-600">Position</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.generalAgreement.position || 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-600">Signed Date</p>
                              <p className="text-lg font-semibold text-gray-900">
                                 {selectedApplication.generalAgreement.signedDate ? 
                                    new Date(selectedApplication.generalAgreement.signedDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-600">Signature File</p>
                              <div className="mt-1">
                                 {selectedApplication.generalAgreement.signature ? (
                                    <div className="flex items-center space-x-2">
                                       <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                       <a 
                                          href={`/uploads/${selectedApplication.generalAgreement.signature.filename}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                                       >
                                          View Signature ({selectedApplication.generalAgreement.signature.originalName})
                                       </a>
                                    </div>
                                 ) : (
                                    <p className="text-lg font-semibold text-gray-500">No signature file</p>
                                 )}
                              </div>
                           </div>
                        </div>
                        
                        {/* Audit Trail */}
                        <div className="mt-4 pt-4 border-t border-green-200">
                           <h5 className="text-sm font-medium text-gray-700 mb-2">Audit Trail</h5>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                              <div>
                                 <p><span className="font-medium">IP Address:</span> {selectedApplication.generalAgreement.ipAddress || 'N/A'}</p>
                              </div>
                              <div>
                                 <p><span className="font-medium">User Agent:</span> {selectedApplication.generalAgreement.userAgent ? 
                                    selectedApplication.generalAgreement.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Contact Information */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Contact Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Person Email</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.contactPersonEmail || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Person Tel</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.contactPersonTel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Factory Email</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.factoryEmail || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Factory Tel</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.factoryTel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Person Fax</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.contactPersonFax || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Factory Fax</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.factoryFax || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Business Details */}
                  <div className="bg-cyan-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Business Details
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Year Established</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.yearEstablished || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Initial Capital</p>
                           <p className="text-lg font-semibold text-gray-900">₱{selectedApplication.initialCapital?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Organization Type</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.organizationType || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Profit Type</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.profitType || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Registration No</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.registrationNo || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Year Registered</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.yearRegistered || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Capital Classification</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.capitalClassification || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Employment Classification</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.employmentClassification || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Workforce Information */}
                  <div className="bg-orange-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Workforce Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Direct Workers</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.directWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Production Workers</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.productionWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Non-Production Workers</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.nonProductionWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contract Workers</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.contractWorkers || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Total Workers</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.totalWorkers || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Product Information */}
                  <div className="bg-teal-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Product Information
                     </h4>
                     <div className="space-y-3">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Specific Product</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.specificProduct || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Enterprise Background</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.enterpriseBackground || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Technology & Project Details */}
                  <div className="bg-green-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Technology & Project Details
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Technology Needs</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.technologyNeeds || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Current Technology Level</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.currentTechnologyLevel || 'N/A'}</p>
                        </div>
                        <div>s
                           <p className="text-sm font-medium text-gray-600">Desired Technology Level</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.desiredTechnologyLevel || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Expected Outcomes</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.expectedOutcomes || 'N/A'}</p>
                        </div>
                        {selectedApplication.projectTitle && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Project Title</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.projectTitle}</p>
                           </div>
                        )}
                        {selectedApplication.projectDescription && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Project Description</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.projectDescription}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Financial Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.totalProjectCost && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Total Project Cost</p>
                              <p className="text-lg font-semibold text-gray-900">₱{selectedApplication.totalProjectCost.toLocaleString()}</p>
                           </div>
                        )}
                        {selectedApplication.requestedAmount && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Requested Amount</p>
                              <p className="text-lg font-semibold text-gray-900">₱{selectedApplication.requestedAmount.toLocaleString()}</p>
                           </div>
                        )}
                        {selectedApplication.counterpartFunding && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Counterpart Funding</p>
                              <p className="text-lg font-semibold text-gray-900">₱{selectedApplication.counterpartFunding.toLocaleString()}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Application Status & Processing */}
                  <div className="bg-red-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Application Status & Processing
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Current Stage</p>
                           <p className="text-lg font-semibold text-gray-900">{selectedApplication.currentStage || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Status</p>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.status)}`}>
                              {selectedApplication.status?.toUpperCase() || 'N/A'}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">PSTO Status</p>
                           <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedApplication.pstoStatus)}`}>
                              {selectedApplication.pstoStatus?.toUpperCase() || 'PENDING'}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Forwarded to PSTO</p>
                           <p className="text-lg font-semibold text-gray-900">
                              {selectedApplication.forwardedToPSTO ? (
                                 <span className="text-green-600 font-bold">Yes</span>
                              ) : (
                                 <span className="text-red-600 font-bold">No</span>
                              )}
                           </p>
                        </div>
                        {selectedApplication.forwardedAt && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Forwarded Date</p>
                              <p className="text-lg font-semibold text-gray-900">{formatDate(selectedApplication.forwardedAt)}</p>
                           </div>
                        )}
                        {selectedApplication.assignedPSTO && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Assigned PSTO ID</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.assignedPSTO}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="bg-purple-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timeline Information
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                           <p className="text-lg font-semibold text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                        </div>
                        {selectedApplication.updatedAt && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Last Updated</p>
                              <p className="text-lg font-semibold text-gray-900">{formatDate(selectedApplication.updatedAt)}</p>
                           </div>
                        )}
                        {selectedApplication.expectedStartDate && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Expected Start Date</p>
                              <p className="text-lg font-semibold text-gray-900">{formatDate(selectedApplication.expectedStartDate)}</p>
                           </div>
                        )}
                        {selectedApplication.expectedEndDate && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Expected End Date</p>
                              <p className="text-lg font-semibold text-gray-900">{formatDate(selectedApplication.expectedEndDate)}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Additional Information
                     </h4>
                     <div className="space-y-3">
                        {selectedApplication.remarks && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Remarks</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.remarks}</p>
                           </div>
                        )}
                        {selectedApplication.notes && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">Notes</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.notes}</p>
                           </div>
                        )}
                        {selectedApplication.pstoComments && (
                           <div>
                              <p className="text-sm font-medium text-gray-600">PSTO Comments</p>
                              <p className="text-lg font-semibold text-gray-900">{selectedApplication.pstoComments}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Review Form */}
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Decision
                     </label>
                     <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     >
                        <option value="">Select decision</option>
                        <option value="approved">Approve</option>
                        <option value="returned">Return for Revision</option>
                        <option value="rejected">Reject</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                     </label>
                     <textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your review comments..."
                     />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-3">
                  <button
                     onClick={() => setSelectedApplication(null)}
                     className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={() => reviewApplication(selectedApplication._id)}
                     disabled={!reviewStatus}
                     className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Submit Review
                  </button>
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
