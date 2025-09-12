import React, { useState } from 'react';
import { Modal } from '../UI';
import DocumentViewer from './DocumentViewer';

const TnaReviewModal = ({ 
   isOpen, 
   onClose, 
   selectedEnrollment, 
   reviewAction, 
   reviewNotes, 
   setReviewNotes, 
   onSubmitReview, 
   loading 
}) => {
   const getStatusText = (tnaStatus) => {
      switch (tnaStatus) {
         case 'under_review': return 'Under Review';
         case 'approved': return 'Approved';
         case 'rejected': return 'Rejected';
         default: return tnaStatus;
      }
   };

   if (!selectedEnrollment) return null;

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title={`${reviewAction === 'view' ? 'View' : reviewAction === 'approve' ? 'Approve' : 'Reject'} Application`}
      >
         <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Enrollment ID and Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
               <h4 className="font-medium text-gray-900 mb-3">Enrollment Information</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="text-gray-600 font-medium">Enrollment ID:</span>
                     <div className="text-gray-900 font-mono">{selectedEnrollment.enrollmentId || selectedEnrollment._id}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Status:</span>
                     <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           selectedEnrollment.tnaStatus === 'under_review' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : selectedEnrollment.tnaStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                           {getStatusText(selectedEnrollment.tnaStatus)}
                        </span>
                     </div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Service Type:</span>
                     <div className="text-gray-900">{selectedEnrollment.service}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Service Name:</span>
                     <div className="text-gray-900">{selectedEnrollment.serviceData.name}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Province:</span>
                     <div className="text-gray-900">{selectedEnrollment.province}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Submitted:</span>
                     <div className="text-gray-900">
                        {selectedEnrollment.submittedAt ? new Date(selectedEnrollment.submittedAt).toLocaleDateString() : 'N/A'}
                     </div>
                  </div>
               </div>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
               <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="text-gray-600 font-medium">Customer Name:</span>
                     <div className="text-gray-900">{selectedEnrollment.customer.name}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Business Name:</span>
                     <div className="text-gray-900">{selectedEnrollment.customer.businessName || 'N/A'}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Email:</span>
                     <div className="text-gray-900">{selectedEnrollment.customer.email}</div>
                  </div>
                  <div>
                     <span className="text-gray-600 font-medium">Phone:</span>
                     <div className="text-gray-900">{selectedEnrollment.customer.phone || 'N/A'}</div>
                  </div>
               </div>
            </div>

            {/* TNA Information */}
            {selectedEnrollment.tnaInfo && (
               <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">TNA Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div>
                        <span className="text-gray-600 font-medium">Affiliation:</span>
                        <div className="text-gray-900">
                           {selectedEnrollment.tnaInfo.affiliation}
                           {selectedEnrollment.tnaInfo.otherAffiliation && ` (${selectedEnrollment.tnaInfo.otherAffiliation})`}
                        </div>
                     </div>
                     <div>
                        <span className="text-gray-600 font-medium">Contact Person:</span>
                        <div className="text-gray-900">{selectedEnrollment.tnaInfo.contactPerson}</div>
                     </div>
                     <div>
                        <span className="text-gray-600 font-medium">Position:</span>
                        <div className="text-gray-900">{selectedEnrollment.tnaInfo.position}</div>
                     </div>
                     <div>
                        <span className="text-gray-600 font-medium">Contact Number:</span>
                        <div className="text-gray-900">{selectedEnrollment.tnaInfo.contactNumber}</div>
                     </div>
                     <div className="md:col-span-2">
                        <span className="text-gray-600 font-medium">Office Address:</span>
                        <div className="text-gray-900">{selectedEnrollment.tnaInfo.officeAddress}</div>
                     </div>
                     <div>
                        <span className="text-gray-600 font-medium">Email Address:</span>
                        <div className="text-gray-900">{selectedEnrollment.tnaInfo.emailAddress}</div>
                     </div>
                  </div>
               </div>
            )}

            {/* Uploaded Documents */}
            {selectedEnrollment.tnaInfo && (
               <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="space-y-3">
                     <DocumentViewer
                        document={selectedEnrollment.tnaInfo.letterOfIntent}
                        documentType="letterOfIntent"
                        documentName="Letter of Intent"
                     />
                     <DocumentViewer
                        document={selectedEnrollment.tnaInfo.dostTnaForm}
                        documentType="dostTnaForm"
                        documentName="DOST TNA Form 01"
                     />
                     <DocumentViewer
                        document={selectedEnrollment.tnaInfo.enterpriseProfile}
                        documentType="enterpriseProfile"
                        documentName="Enterprise Profile"
                     />
                  </div>
               </div>
            )}

            {/* Review Notes (if any) */}
            {selectedEnrollment.reviewNotes && (
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Previous Review Notes</h4>
                  <p className="text-yellow-700 text-sm">{selectedEnrollment.reviewNotes}</p>
               </div>
            )}

            {/* Review Notes Input */}
            {reviewAction !== 'view' && (
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Review Notes {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                     value={reviewNotes}
                     onChange={(e) => setReviewNotes(e.target.value)}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder={reviewAction === 'reject' ? 'Please provide reason for rejection...' : 'Add review notes (optional)...'}
                     required={reviewAction === 'reject'}
                  />
               </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
               <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
               >
                  Cancel
               </button>
               {reviewAction !== 'view' && (
                  <button
                     onClick={onSubmitReview}
                     disabled={loading || (reviewAction === 'reject' && !reviewNotes.trim())}
                     className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                        reviewAction === 'approve'
                           ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                           : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                     }`}
                  >
                     {loading ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
                  </button>
               )}
            </div>
         </div>
      </Modal>
   );
};

export default TnaReviewModal;
