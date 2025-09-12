import React from 'react';
import { Modal, Badge } from '../UI';
import { useDarkMode } from '../Context';
import { getStatusBadgeVariant, getStatusText, getStageStatus, getStageColor, canAccessStage } from './utils/enrollmentHelpers.jsx';

const CustomerDetailsModal = ({ 
   isOpen, 
   onClose, 
   enrollment 
}) => {
   const { isDarkMode } = useDarkMode();

   if (!enrollment) return null;

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title="Customer Details"
         size="lg"
      >
         <div className="space-y-6">
            {/* Customer Information */}
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
               <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>Customer Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Full Name</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.customer.name}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Business Name</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.customer.businessName || 'N/A'}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Email Address</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.customer.email}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Phone Number</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.customer.phone}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Province</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.customer.province}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Enrollment ID</label>
                     <p className={`mt-1 text-sm font-mono transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.enrollmentId}</p>
                  </div>
               </div>
            </div>

            {/* Service Information */}
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
               <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>Service Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Service Type</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.serviceData.name}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Service Description</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{enrollment.serviceData.description}</p>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Enrollment Status</label>
                     <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(enrollment.status, enrollment.tnaStatus)}>
                           {getStatusText(enrollment)}
                        </Badge>
                     </div>
                  </div>
                  <div>
                     <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                     }`}>Enrolled Date</label>
                     <p className={`mt-1 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>{new Date(enrollment.enrolledDate).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            {/* TNA Information */}
            {enrollment.tnaData && (
               <div className={`p-4 rounded-lg border transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
               }`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>TNA Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Affiliation</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.affiliation || 'N/A'}</p>
                     </div>
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Contact Person</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.contactPerson || 'N/A'}</p>
                     </div>
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Position</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.position || 'N/A'}</p>
                     </div>
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Office Address</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.officeAddress || 'N/A'}</p>
                     </div>
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Contact Number</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.contactNumber || 'N/A'}</p>
                     </div>
                     <div>
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Email Address</label>
                        <p className={`mt-1 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{enrollment.tnaData.emailAddress || 'N/A'}</p>
                     </div>
                  </div>
                  {enrollment.reviewNotes && (
                     <div className="mt-4">
                        <label className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Review Notes</label>
                        <p className={`mt-1 text-sm p-3 rounded border transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                        }`}>{enrollment.reviewNotes}</p>
                     </div>
                  )}
               </div>
            )}

            {/* Documents Section */}
            {enrollment.tnaInfo && (enrollment.tnaInfo.letterOfIntent || enrollment.tnaInfo.dostTnaForm || enrollment.tnaInfo.enterpriseProfile) && (
               <div className={`p-4 rounded-lg border transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
               }`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Uploaded Documents</h3>
                  <div className="space-y-3">
                     {enrollment.tnaInfo.letterOfIntent && (
                        <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                                 }`}>
                                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className={`text-sm font-medium transition-colors duration-300 ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>Letter of Intent</p>
                                    <p className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                       {enrollment.tnaInfo.letterOfIntent.originalName}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <button
                                    onClick={() => window.open(`http://localhost:4000/uploads/${enrollment.tnaInfo.letterOfIntent.filename}`, '_blank')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                    }`}
                                 >
                                    View
                                 </button>
                                 <button
                                    onClick={() => {
                                       const link = document.createElement('a');
                                       link.href = `http://localhost:4000/uploads/${enrollment.tnaInfo.letterOfIntent.filename}`;
                                       link.download = enrollment.tnaInfo.letterOfIntent.originalName;
                                       document.body.appendChild(link);
                                       link.click();
                                       document.body.removeChild(link);
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                 >
                                    Download
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {enrollment.tnaInfo.dostTnaForm && (
                        <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                                 }`}>
                                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className={`text-sm font-medium transition-colors duration-300 ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>DOST TNA Form 01</p>
                                    <p className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                       {enrollment.tnaInfo.dostTnaForm.originalName}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <button
                                    onClick={() => window.open(`http://localhost:4000/uploads/${enrollment.tnaInfo.dostTnaForm.filename}`, '_blank')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                    }`}
                                 >
                                    View
                                 </button>
                                 <button
                                    onClick={() => {
                                       const link = document.createElement('a');
                                       link.href = `http://localhost:4000/uploads/${enrollment.tnaInfo.dostTnaForm.filename}`;
                                       link.download = enrollment.tnaInfo.dostTnaForm.originalName;
                                       document.body.appendChild(link);
                                       link.click();
                                       document.body.removeChild(link);
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                 >
                                    Download
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {enrollment.tnaInfo.enterpriseProfile && (
                        <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                           isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                                 }`}>
                                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className={`text-sm font-medium transition-colors duration-300 ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>Enterprise Profile</p>
                                    <p className={`text-xs transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                       {enrollment.tnaInfo.enterpriseProfile.originalName}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <button
                                    onClick={() => window.open(`http://localhost:4000/uploads/${enrollment.tnaInfo.enterpriseProfile.filename}`, '_blank')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                    }`}
                                 >
                                    View
                                 </button>
                                 <button
                                    onClick={() => {
                                       const link = document.createElement('a');
                                       link.href = `http://localhost:4000/uploads/${enrollment.tnaInfo.enterpriseProfile.filename}`;
                                       link.download = enrollment.tnaInfo.enterpriseProfile.originalName;
                                       document.body.appendChild(link);
                                       link.click();
                                       document.body.removeChild(link);
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-300 ${
                                       isDarkMode 
                                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                 >
                                    Download
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* Service Progress */}
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${
               isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
               <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>Service Progress</h3>
               <div className="space-y-3">
                  {enrollment.stages.map((stage) => {
                     const status = getStageStatus(stage, enrollment);
                     const canAccess = canAccessStage(enrollment, stage.id);
                     const isDisabled = !canAccess && status !== 'completed';
                     
                     return (
                        <div key={stage.id} className="flex items-center space-x-3">
                           <div className={`w-6 h-6 rounded-full ${getStageColor(status)} flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}>
                              {status === 'completed' && (
                                 <span className="text-white text-xs">✓</span>
                              )}
                              {isDisabled && status !== 'completed' && (
                                 <span className="text-gray-400 text-xs">🔒</span>
                              )}
                           </div>
                           <div className="flex-1">
                              <p className={`text-sm ${status === 'current' ? 'font-medium text-blue-600' : isDisabled ? 'text-gray-400' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                 {stage.name}
                                 {isDisabled && stage.id !== 'tna' && (
                                    <span className="text-xs text-gray-400 ml-2">(TNA approval required)</span>
                                 )}
                              </p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </Modal>
   );
};

export default CustomerDetailsModal;
