import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Toast, Input } from '../../UI';
import api from '../../../config/api';

const RefundDocument = () => {
   const [refundDocuments, setRefundDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [currentDocumentType, setCurrentDocumentType] = useState('');
   const [uploadFile, setUploadFile] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [toast, setToast] = useState({ show: false, message: '', type: '' });

   const fetchRefundDocuments = useCallback(async () => {
      try {
         setLoading(true);
         const response = await api.get('/refund-documents/list');
         console.log('🔍 Refund Documents Response:', response.data);
         if (response.data.success) {
            const docs = response.data.data.docs || [];
            console.log('🔍 Refund Documents:', docs);
            docs.forEach((doc, index) => {
               console.log(`🔍 Document ${index + 1}:`, {
                  id: doc._id,
                  status: doc.status,
                  documentsToRevise: doc.documentsToRevise,
                  revisionComments: doc.revisionComments
               });
            });
            setRefundDocuments(docs);
         }
      } catch (error) {
         console.error('Error fetching refund documents:', error);
         showToast('Failed to fetch refund documents', 'error');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchRefundDocuments();
   }, [fetchRefundDocuments]);

   const handleFileUpload = (documentType, refundDoc) => {
      setSelectedDocument(refundDoc);
      setCurrentDocumentType(documentType);
      setUploadFile(null);
      setShowUploadModal(true);
   };

   const submitDocument = async () => {
      if (!uploadFile) {
         showToast('Please select a file to upload', 'error');
         return;
      }

      try {
         setUploading(true);
         const formData = new FormData();
         formData.append('document', uploadFile);
         formData.append('documentType', currentDocumentType);

         const response = await api.post(
            `/refund-documents/submit/${selectedDocument.tnaId._id}`,
            formData,
            {
               headers: {
                  'Content-Type': 'multipart/form-data'
               }  
            }
         );

         if (response.data.success) {
            showToast('Document uploaded successfully', 'success');
            setShowUploadModal(false);
            fetchRefundDocuments();
         }
      } catch (error) {
         console.error('Error uploading document:', error);
         showToast(error.response?.data?.message || 'Failed to upload document', 'error');
      } finally {
         setUploading(false);
      }
   };

   const getStatusBadge = (status) => {
      const statusConfig = {
         'documents_requested': { color: 'blue', text: 'Requested' },
         'documents_submitted': { color: 'yellow', text: 'Submitted' },
         'documents_under_review': { color: 'purple', text: 'Under Review' },
         'documents_approved': { color: 'green', text: 'Approved' },
         'documents_rejected': { color: 'red', text: 'Rejected' },
         'refund_completed': { color: 'green', text: 'Refund Completed' },
         'additional_documents_required': { color: 'purple', text: 'Additional Documents Required' },
         'documents_revision_requested': { color: 'orange', text: 'Revision Required' }
      };
      
      const config = statusConfig[status] || { color: 'gray', text: status };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   const getDocumentStatusBadge = (documentStatus) => {
      const statusConfig = {
         'pending': { color: 'gray', text: 'Pending' },
         'submitted': { color: 'blue', text: 'Submitted' },
         'approved': { color: 'green', text: 'Approved' },
         'rejected': { color: 'red', text: 'Rejected' },
         'needs_revision': { color: 'yellow', text: 'Needs Revision' }
      };
      
      const config = statusConfig[documentStatus] || { color: 'gray', text: documentStatus };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   const showToast = (message, type) => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
   };

   const isOverdue = (dueDate) => {
      return dueDate && new Date(dueDate) < new Date();
   };

   const getDaysUntilDue = (dueDate) => {
      if (!dueDate) return null;
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Refund Document Submission</h2>
         </div>

         {refundDocuments.length === 0 ? (
            <Card>
               <div className="p-8 text-center">
                  <p className="text-gray-500">No refund document requests found.</p>
               </div>
            </Card>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {refundDocuments.map((refundDoc) => (
                  <Card key={refundDoc._id}>
                     <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                 {refundDoc.applicationId?.enterpriseName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                 {refundDoc.applicationId?.projectTitle}
                              </p>
                           </div>
                           <div className="flex items-center space-x-3">
                              {getStatusBadge(refundDoc.status)}
                              {refundDoc.dueDate && (
                                 <div className={`text-sm ${isOverdue(refundDoc.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isOverdue(refundDoc.dueDate) ? (
                                       <span className="font-medium">Overdue</span>
                                    ) : (
                                       <span>
                                          Due in {getDaysUntilDue(refundDoc.dueDate)} days
                                       </span>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Combined Application & Request Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 mb-3 shadow-sm">
                           <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                 <span className="font-semibold text-blue-700">Enterprise:</span>
                                 <p className="text-gray-900 truncate">{refundDoc.applicationId?.enterpriseName || 'N/A'}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-blue-700">Project:</span>
                                 <p className="text-gray-900 truncate">{refundDoc.applicationId?.projectTitle || 'N/A'}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-blue-700">Proponent:</span>
                                 <p className="text-gray-900 truncate">{refundDoc.proponentId?.firstName} {refundDoc.proponentId?.lastName}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-green-700">Due:</span>
                                 <p className={`font-medium truncate ${isOverdue(refundDoc.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                                    {refundDoc.dueDate ? new Date(refundDoc.dueDate).toLocaleDateString() : 'N/A'}
                                    {isOverdue(refundDoc.dueDate) && (
                                       <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                          OVERDUE
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Additional Documents Required */}
                        {refundDoc.status === 'additional_documents_required' && refundDoc.additionalDocumentsRequired && refundDoc.additionalDocumentsRequired.length > 0 && (
                           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-3 shadow-sm">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Additional Documents Required</h4>
                              <div className="space-y-2">
                                 {refundDoc.additionalDocumentsRequired
                                    .filter((doc, index, self) => 
                                       // Remove duplicates based on document type
                                       index === self.findIndex(d => d.type === doc.type)
                                    )
                                    .map((doc, index) => (
                                    <div key={index} className="bg-white border border-blue-100 rounded p-2 flex justify-between items-center">
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                             <h5 className="font-medium text-gray-900 text-xs truncate">{doc.name}</h5>
                                             {getDocumentStatusBadge(doc.documentStatus)}
                                          </div>
                                          
                                          <p className="text-xs text-gray-600 mb-1">{doc.description}</p>
                                          
                                          {doc.reason && (
                                             <div className="bg-yellow-50 rounded p-1 mb-1">
                                                <p className="text-xs text-yellow-700">💬 {doc.reason}</p>
                                             </div>
                                          )}
                                          
                                          {doc.filename && (
                                             <div className="bg-green-50 rounded p-1 mb-1">
                                                <p className="text-xs text-green-700 truncate">✓ {doc.originalName}</p>
                                             </div>
                                          )}
                                       </div>
                                       
                                       <div className="ml-2 flex-shrink-0">
                                          {doc.documentStatus === 'pending' ? (
                                             <Button
                                                size="sm"
                                                onClick={() => handleFileUpload(doc.type, refundDoc)}
                                                className="text-xs px-2 py-1"
                                                variant="primary"
                                             >
                                                Upload
                                             </Button>
                                          ) : doc.documentStatus === 'submitted' ? (
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleFileUpload(doc.type, refundDoc)}
                                                className="text-xs px-2 py-1"
                                             >
                                                Replace
                                             </Button>
                                          ) : (
                                             <span className="text-xs font-medium">
                                                {doc.documentStatus === 'approved' ? '✅' : '⏳'}
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Required Refund Documents */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 shadow-sm">
                           <h4 className="text-sm font-semibold text-purple-900 mb-2">Refund Documents</h4>
                           <div className="space-y-2">
                              {refundDoc.refundDocuments?.map((doc, index) => (
                                 <div key={index} className="bg-white border border-purple-100 rounded p-2 flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between mb-1">
                                          <h5 className="font-medium text-gray-900 text-xs truncate">{doc.name}</h5>
                                          {getDocumentStatusBadge(doc.documentStatus)}
                                       </div>
                                       
                                       {doc.filename && (
                                          <div className="bg-green-50 rounded p-1 mb-1">
                                             <p className="text-xs text-green-700 truncate">✓ {doc.originalName}</p>
                                          </div>
                                       )}

                                       {doc.reviewComments && (
                                          <div className="bg-yellow-50 rounded p-1">
                                             <p className="text-xs text-yellow-700 truncate">💬 {doc.reviewComments}</p>
                                          </div>
                                       )}
                                    </div>
                                    
                                    <div className="ml-2 flex-shrink-0">
                                       {doc.documentStatus === 'pending' || doc.documentStatus === 'rejected' || 
                                        (refundDoc.status === 'documents_revision_requested' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type)) ||
                                        (refundDoc.status === 'additional_documents_required' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type)) ? (
                                          <Button
                                             size="sm"
                                             onClick={() => handleFileUpload(doc.type, refundDoc)}
                                             className="text-xs px-2 py-1"
                                             variant={refundDoc.status === 'documents_revision_requested' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type) ? 'warning' : 
                                                     refundDoc.status === 'additional_documents_required' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type) ? 'primary' : 'primary'}
                                          >
                                             {doc.documentStatus === 'rejected' ? 'Resubmit' : 
                                              (refundDoc.status === 'documents_revision_requested' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type)) ? 'Revise' : 
                                              (refundDoc.status === 'additional_documents_required' && refundDoc.documentsToRevise?.some(revDoc => revDoc.type === doc.type)) ? 'Revise' : 'Upload'}
                                          </Button>
                                       ) : doc.documentStatus === 'submitted' ? (
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleFileUpload(doc.type, refundDoc)}
                                             className="text-xs px-2 py-1"
                                          >
                                             Replace
                                          </Button>
                                       ) : (
                                          <span className="text-xs font-medium">
                                             {doc.documentStatus === 'approved' ? '✅' : '⏳'}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Additional Documents Submitted */}
                        {refundDoc.additionalDocumentsRequired && refundDoc.additionalDocumentsRequired.length > 0 && (
                           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3 shadow-sm">
                              <h4 className="text-sm font-semibold text-green-900 mb-2">Additional Documents Submitted</h4>
                              <div className="space-y-2">
                                 {refundDoc.additionalDocumentsRequired
                                    .filter((doc, index, self) => 
                                       // Remove duplicates based on document type
                                       index === self.findIndex(d => d.type === doc.type)
                                    )
                                    .map((doc, index) => (
                                    <div key={index} className="bg-white border border-green-100 rounded p-2 flex justify-between items-center">
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                             <h5 className="font-medium text-gray-900 text-xs truncate">{doc.name}</h5>
                                             {getDocumentStatusBadge(doc.documentStatus)}
                                          </div>
                                          
                                          {doc.filename && (
                                             <div className="bg-green-50 rounded p-1 mb-1">
                                                <p className="text-xs text-green-700 truncate">✓ {doc.originalName}</p>
                                             </div>
                                          )}
                                          
                                          {doc.reason && (
                                             <div className="bg-yellow-50 rounded p-1">
                                                <p className="text-xs text-yellow-700">💬 {doc.reason}</p>
                                             </div>
                                          )}
                                       </div>
                                       
                                       <div className="ml-2 flex-shrink-0">
                                          {doc.documentStatus === 'submitted' ? (
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleFileUpload(doc.type, refundDoc)}
                                                className="text-xs px-2 py-1"
                                             >
                                                Replace
                                             </Button>
                                          ) : doc.documentStatus === 'approved' ? (
                                             <span className="text-xs font-medium text-green-600">✅ Approved</span>
                                          ) : (
                                             <span className="text-xs font-medium text-gray-500">⏳ Pending</span>
                                          )}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Overall Status Message */}
                        {refundDoc.status === 'documents_submitted' && (
                           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm text-blue-800">
                                 All refund documents have been submitted and are under review by DOST-MIMAROPA.
                              </p>
                           </div>
                        )}

                        {refundDoc.status === 'documents_approved' && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                 All refund documents have been approved by DOST-MIMAROPA.
                              </p>
                           </div>
                        )}

                        {refundDoc.status === 'refund_completed' && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                 Refund process has been completed successfully.
                              </p>
                           </div>
                        )}

                        {refundDoc.status === 'documents_rejected' && (
                           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                 Some documents have been rejected. Please review the comments and resubmit.
                              </p>
                           </div>
                        )}

                        {refundDoc.status === 'documents_revision_requested' && (
                           <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                              <div className="flex items-start">
                                 <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                 </div>
                                 <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                       Document Revision Required
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700">
                                       <p>DOST-MIMAROPA has requested revision of specific documents. Please coordinate with the proponent to resubmit the following documents:</p>
                                       {refundDoc.documentsToRevise && refundDoc.documentsToRevise.length > 0 && (
                                          <ul className="mt-2 list-disc list-inside">
                                             {refundDoc.documentsToRevise.map((doc, index) => (
                                                <li key={index} className="font-medium">{doc.name}</li>
                                             ))}
                                          </ul>
                                       )}
                                       {refundDoc.revisionComments && (
                                          <div className="mt-2 p-2 bg-orange-100 rounded">
                                             <p className="text-xs font-medium text-orange-800">Revision Comments:</p>
                                             <p className="text-xs text-orange-700">{refundDoc.revisionComments}</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {refundDoc.status === 'additional_documents_required' && (
                           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-start">
                                 <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                 </div>
                                 <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                       Additional Documents Required
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                       <p>DOST-MIMAROPA has requested additional documents for this refund application. Please coordinate with the proponent to submit the required documents:</p>
                                       {refundDoc.additionalDocumentsRequired && refundDoc.additionalDocumentsRequired.length > 0 && (
                                          <ul className="mt-2 list-disc list-inside">
                                             {refundDoc.additionalDocumentsRequired.map((doc, index) => (
                                                <li key={index} className="font-medium">{doc.name}</li>
                                             ))}
                                          </ul>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </Card>
               ))}
            </div>
         )}

         {/* Upload Modal */}
         <Modal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            title="Upload Refund Document"
         >
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Document Type
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                     {selectedDocument?.refundDocuments?.find(doc => doc.type === currentDocumentType)?.name}
                  </p>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Description
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                     {selectedDocument?.refundDocuments?.find(doc => doc.type === currentDocumentType)?.description}
                  </p>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Select File
                  </label>
                  <input
                     type="file"
                     accept=".pdf,.doc,.docx"
                     onChange={(e) => setUploadFile(e.target.files[0])}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                     Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
                  </p>
               </div>

               <div className="flex justify-end space-x-3">
                  <Button
                     variant="outline"
                     onClick={() => setShowUploadModal(false)}
                     disabled={uploading}
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={submitDocument}
                     disabled={!uploadFile || uploading}
                  >
                     {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Toast */}
         {toast.show && (
            <Toast
               message={toast.message}
               type={toast.type}
               onClose={() => setToast({ show: false, message: '', type: '' })}
            />
         )}
      </div>
   );
};

export default RefundDocument;
