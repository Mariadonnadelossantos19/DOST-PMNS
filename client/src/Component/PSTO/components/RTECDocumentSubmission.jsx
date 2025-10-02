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
            <div className="space-y-6">
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

                        {/* Application Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                           <h4 className="text-md font-medium text-gray-900 mb-3">Application Details</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                 <p className="text-sm text-gray-900">{rtecDoc.applicationId?.companyName || 'N/A'}</p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                 <p className="text-sm text-gray-900">{rtecDoc.applicationId?.projectTitle || 'N/A'}</p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Business Activity</label>
                                 <p className="text-sm text-gray-900">{rtecDoc.applicationId?.businessActivity || 'N/A'}</p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Program</label>
                                 <p className="text-sm text-gray-900">{rtecDoc.programName || 'SETUP'}</p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Proponent</label>
                                 <p className="text-sm text-gray-900">
                                    {rtecDoc.proponentId?.firstName} {rtecDoc.proponentId?.lastName}
                                 </p>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700">Email</label>
                                 <p className="text-sm text-gray-900">{rtecDoc.proponentId?.email || 'N/A'}</p>
                              </div>
                           </div>
                        </div>

                        {/* Document Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                              <p className="text-sm text-gray-900">
                                 {new Date(rtecDoc.requestedAt).toLocaleDateString()}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Due Date</label>
                              <p className={`text-sm ${isOverdue(rtecDoc.dueDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                 {rtecDoc.dueDate ? new Date(rtecDoc.dueDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                        </div>

                        {/* Required Documents */}
                        <div>
                           <h4 className="text-md font-medium text-gray-900 mb-3">Required Documents</h4>
                           <div className="space-y-3">
                              {rtecDoc.partialdocsrtec?.map((doc, index) => (
                                 <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                       <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-1">
                                             <h5 className="font-medium text-gray-900">{doc.name}</h5>
                                             {getDocumentStatusBadge(doc.documentStatus)}
                                          </div>
                                          <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                          
                                          {doc.filename && (
                                             <div className="text-sm text-gray-600">
                                                <p><strong>Uploaded File:</strong> {doc.originalName}</p>
                                                <p><strong>Upload Date:</strong> {new Date(doc.uploadedAt).toLocaleString()}</p>
                                             </div>
                                          )}

                                          {doc.reviewComments && (
                                             <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="text-sm text-yellow-800">
                                                   <strong>Review Comments:</strong> {doc.reviewComments}
                                                </p>
                                             </div>
                                          )}
                                       </div>
                                       
                                       <div className="ml-4">
                                          {doc.documentStatus === 'pending' || doc.documentStatus === 'rejected' ? (
                                             <Button
                                                size="sm"
                                                onClick={() => handleFileUpload(doc.type, rtecDoc)}
                                             >
                                                {doc.documentStatus === 'rejected' ? 'Resubmit' : 'Upload'}
                                             </Button>
                                          ) : doc.documentStatus === 'submitted' ? (
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleFileUpload(doc.type, rtecDoc)}
                                             >
                                                Replace
                                             </Button>
                                          ) : doc.documentStatus === 'approved' ? (
                                             <Button
                                                size="sm"
                                                variant="success"
                                                disabled
                                             >
                                                Approved
                                             </Button>
                                          ) : null}
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
