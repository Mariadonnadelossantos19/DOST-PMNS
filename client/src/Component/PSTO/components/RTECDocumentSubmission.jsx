import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Toast, Input } from '../../UI';
import api from '../../../config/api';

const RTECDocumentSubmission = () => {
   const [rtecDocuments, setRtecDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [currentDocumentType, setCurrentDocumentType] = useState('');
   const [uploadFile, setUploadFile] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [toast, setToast] = useState({ show: false, message: '', type: '' });

   useEffect(() => {
      fetchRTECDocuments();
   }, []);

   const fetchRTECDocuments = async () => {
      try {
         setLoading(true);
         const response = await api.get('/rtec-documents/psto/list');
         if (response.data.success) {
            setRtecDocuments(response.data.data.docs || []);
         }
      } catch (error) {
         console.error('Error fetching RTEC documents:', error);
         showToast('Failed to fetch RTEC documents', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleFileUpload = (documentType, rtecDoc) => {
      setSelectedDocument(rtecDoc);
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

         const response = await api.post(
            `/rtec-documents/submit/${selectedDocument.tnaId._id}/${currentDocumentType}`,
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
            fetchRTECDocuments();
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
         'documents_rejected': { color: 'red', text: 'Rejected' }
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
            <h2 className="text-2xl font-bold text-gray-900">RTEC Document Submission</h2>
         </div>

         {rtecDocuments.length === 0 ? (
            <Card>
               <div className="p-8 text-center">
                  <p className="text-gray-500">No RTEC document requests found.</p>
               </div>
            </Card>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {rtecDocuments.map((rtecDoc) => (
                  <Card key={rtecDoc._id}>
                     <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                 {rtecDoc.applicationId?.companyName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                 {rtecDoc.applicationId?.projectTitle}
                              </p>
                           </div>
                           <div className="flex items-center space-x-3">
                              {getStatusBadge(rtecDoc.status)}
                              {rtecDoc.dueDate && (
                                 <div className={`text-sm ${isOverdue(rtecDoc.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isOverdue(rtecDoc.dueDate) ? (
                                       <span className="font-medium">Overdue</span>
                                    ) : (
                                       <span>
                                          Due in {getDaysUntilDue(rtecDoc.dueDate)} days
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
                                 <span className="font-semibold text-blue-700">Company:</span>
                                 <p className="text-gray-900 truncate">{rtecDoc.applicationId?.companyName || 'N/A'}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-blue-700">Project:</span>
                                 <p className="text-gray-900 truncate">{rtecDoc.applicationId?.projectTitle || 'N/A'}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-blue-700">Proponent:</span>
                                 <p className="text-gray-900 truncate">{rtecDoc.proponentId?.firstName} {rtecDoc.proponentId?.lastName}</p>
                              </div>
                              <div>
                                 <span className="font-semibold text-green-700">Due:</span>
                                 <p className={`font-medium truncate ${isOverdue(rtecDoc.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                                    {rtecDoc.dueDate ? new Date(rtecDoc.dueDate).toLocaleDateString() : 'N/A'}
                                    {isOverdue(rtecDoc.dueDate) && (
                                       <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                          OVERDUE
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Required Documents */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 shadow-sm">
                           <h4 className="text-sm font-semibold text-purple-900 mb-2">Documents</h4>
                           <div className="space-y-2">
                              {rtecDoc.partialdocsrtec?.map((doc, index) => (
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
                                       {doc.documentStatus === 'pending' || doc.documentStatus === 'rejected' ? (
                                          <Button
                                             size="sm"
                                             onClick={() => handleFileUpload(doc.type, rtecDoc)}
                                             className="text-xs px-2 py-1"
                                          >
                                             {doc.documentStatus === 'rejected' ? 'Resubmit' : 'Upload'}
                                          </Button>
                                       ) : doc.documentStatus === 'submitted' ? (
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleFileUpload(doc.type, rtecDoc)}
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
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Overall Status Message */}
                        {rtecDoc.status === 'documents_submitted' && (
                           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm text-blue-800">
                                 All documents have been submitted and are under review by DOST-MIMAROPA.
                              </p>
                           </div>
                        )}

                        {rtecDoc.status === 'documents_approved' && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                 All documents have been approved by DOST-MIMAROPA.
                              </p>
                           </div>
                        )}

                        {rtecDoc.status === 'documents_rejected' && (
                           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                 Some documents have been rejected. Please review the comments and resubmit.
                              </p>
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
            title="Upload Document"
         >
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Document Type
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                     {selectedDocument?.partialdocsrtec?.find(doc => doc.type === currentDocumentType)?.name}
                  </p>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Description
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                     {selectedDocument?.partialdocsrtec?.find(doc => doc.type === currentDocumentType)?.description}
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

export default RTECDocumentSubmission;
