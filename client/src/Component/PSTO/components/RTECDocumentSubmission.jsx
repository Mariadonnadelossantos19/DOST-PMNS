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

                        {/* Application Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-blue-900">Application Details</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Company Name</label>
                                 <p className="text-sm text-gray-900 font-medium">{rtecDoc.applicationId?.companyName || 'N/A'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Project Title</label>
                                 <p className="text-sm text-gray-900 font-medium">{rtecDoc.applicationId?.projectTitle || 'N/A'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Business Activity</label>
                                 <p className="text-sm text-gray-900 font-medium">{rtecDoc.applicationId?.businessActivity || 'N/A'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Program</label>
                                 <div className="flex items-center">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                       {rtecDoc.programName || 'SETUP'}
                                    </span>
                                 </div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Proponent</label>
                                 <div className="flex items-center">
                                    <div className="bg-gray-100 rounded-full p-1 mr-2">
                                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                       </svg>
                                    </div>
                                    <p className="text-sm text-gray-900 font-medium">
                                       {rtecDoc.proponentId?.firstName} {rtecDoc.proponentId?.lastName}
                                    </p>
                                 </div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                 <label className="block text-sm font-semibold text-blue-700 mb-1">Email</label>
                                 <div className="flex items-center">
                                    <div className="bg-gray-100 rounded-full p-1 mr-2">
                                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                       </svg>
                                    </div>
                                    <p className="text-sm text-gray-900 font-medium">{rtecDoc.proponentId?.email || 'N/A'}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Document Information */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
                           <div className="flex items-center mb-4">
                              <div className="bg-green-100 p-2 rounded-lg mr-3">
                                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-green-900">Request Information</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-lg p-4 border border-green-100">
                                 <div className="flex items-center mb-2">
                                    <div className="bg-blue-100 rounded-full p-1 mr-2">
                                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                    </div>
                                    <label className="block text-sm font-semibold text-green-700">Requested Date</label>
                                 </div>
                                 <p className="text-sm text-gray-900 font-medium ml-6">
                                    {new Date(rtecDoc.requestedAt).toLocaleDateString()}
                                 </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-green-100">
                                 <div className="flex items-center mb-2">
                                    <div className={`rounded-full p-1 mr-2 ${isOverdue(rtecDoc.dueDate) ? 'bg-red-100' : 'bg-orange-100'}`}>
                                       <svg className={`w-4 h-4 ${isOverdue(rtecDoc.dueDate) ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                       </svg>
                                    </div>
                                    <label className="block text-sm font-semibold text-green-700">Due Date</label>
                                 </div>
                                 <p className={`text-sm font-medium ml-6 ${isOverdue(rtecDoc.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                                    {rtecDoc.dueDate ? new Date(rtecDoc.dueDate).toLocaleDateString() : 'N/A'}
                                    {isOverdue(rtecDoc.dueDate) && (
                                       <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                                          OVERDUE
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Required Documents */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                           <div className="flex items-center mb-6">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                 <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-purple-900">Required Documents</h4>
                           </div>
                           <div className="space-y-4">
                              {rtecDoc.partialdocsrtec?.map((doc, index) => (
                                 <div key={index} className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start">
                                       <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-3">
                                             <div className="bg-indigo-100 p-2 rounded-lg">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                             </div>
                                             <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900 text-base">{doc.name}</h5>
                                                {getDocumentStatusBadge(doc.documentStatus)}
                                             </div>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                          
                                          {doc.filename && (
                                             <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                                <div className="flex items-center mb-2">
                                                   <div className="bg-green-100 p-1 rounded-full mr-2">
                                                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                      </svg>
                                                   </div>
                                                   <span className="text-sm font-medium text-green-800">File Uploaded</span>
                                                </div>
                                                <p className="text-sm text-green-700"><strong>File:</strong> {doc.originalName}</p>
                                                <p className="text-sm text-green-700"><strong>Date:</strong> {new Date(doc.uploadedAt).toLocaleString()}</p>
                                             </div>
                                          )}

                                          {doc.reviewComments && (
                                             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <div className="flex items-center mb-2">
                                                   <div className="bg-yellow-100 p-1 rounded-full mr-2">
                                                      <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                      </svg>
                                                   </div>
                                                   <span className="text-sm font-medium text-yellow-800">Review Comments</span>
                                                </div>
                                                <p className="text-sm text-yellow-700">{doc.reviewComments}</p>
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
