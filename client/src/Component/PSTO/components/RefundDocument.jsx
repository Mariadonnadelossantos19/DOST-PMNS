import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Toast, Input, DataTable } from '../../UI';
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
   const [currentUser, setCurrentUser] = useState(null);

   // Get current user data to determine role
   useEffect(() => {
      const userData = localStorage.getItem('userData');
      if (userData) {
         try {
            const parsedData = JSON.parse(userData);
            const user = parsedData.user || parsedData;
            setCurrentUser(user);
         } catch (error) {
            console.error('Error parsing user data:', error);
         }
      }
   }, []);

   const fetchRefundDocuments = useCallback(async () => {
      try {
         setLoading(true);

         // For PSTO users, only fetch refund documents that have been requested by DOST
         // and belong to their province
         if (currentUser?.role === 'psto') {
            try {
               const response = await api.get('/refund-documents/psto/list');
               console.log('🔍 PSTO Refund Documents Response:', response.data);
               if (response.data.success) {
                  const docs = response.data.data.docs || response.data.data || [];
                  console.log('🔍 PSTO Refund Documents (All):', docs);
                  
                  // Filter to only show documents that have been requested (not ready_for_refund)
                  const requestedDocs = docs.filter(doc => doc.status === 'documents_requested');
                  console.log('🔍 Filtered Requested Documents:', requestedDocs);
                  console.log('🔍 PSTO User Province:', currentUser.province);
                  
                  setRefundDocuments(requestedDocs);
               } else {
                  console.log('🔍 PSTO API Response not successful:', response.data);
                  setRefundDocuments([]);
               }
            } catch (error) {
               console.error('🔍 PSTO API Error:', error);
               setRefundDocuments([]);
            }
         } 
         // For DOST users, fetch both existing requests and RTEC completed applications
         else if (currentUser?.role === 'dost_mimaropa') {
            let allDocuments = [];
            
            // First, try to get existing refund document requests
            try {
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
                  allDocuments = [...allDocuments, ...docs];
               }
            } catch (error) {
               console.log('No existing refund documents found, fetching RTEC completed applications...', error);
            }
            
            // Then, fetch RTEC completed applications that don't have refund documents yet
            try {
               const rtecResponse = await api.get('/tna/rtec-completed');
               if (rtecResponse.data.success) {
                  const rtecCompletedApps = rtecResponse.data.data || [];
                  console.log('🔍 RTEC Completed Applications:', rtecCompletedApps);
                  
                  // Filter out applications that already have refund documents
                  const existingTnaIds = allDocuments.map(doc => doc.tnaId?._id || doc.tnaId);
                  const newApps = rtecCompletedApps.filter(app => 
                     !existingTnaIds.includes(app._id)
                  );
                  
                  // Transform the data to match refund document structure
                  const transformedApps = newApps.map(app => ({
                     _id: `rtec-${app._id}`,
                     tnaId: app._id, // Store the actual TNA ID directly
                     applicationId: app.applicationId,
                     proponentId: app.proponentId,
                     programName: app.programName,
                     status: 'ready_for_refund',
                     requestedAt: new Date(),
                     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                     refundDocuments: [
                        { type: 'partial_budget_analysis', name: 'Partial Budget Analysis', description: 'Detailed budget analysis showing partial refund calculations and breakdown', documentStatus: 'pending' },
                        { type: 'rtec_report', name: 'RTEC Report', description: 'Regional Technical Evaluation Committee report for refund assessment', documentStatus: 'pending' },
                        { type: 'approval_letter', name: 'Approval Letter', description: 'Official approval letter for refund processing', documentStatus: 'pending' },
                        { type: 'bank_account', name: 'Bank Account Details', description: 'Bank account information for refund disbursement', documentStatus: 'pending' },
                        { type: 'moa', name: 'Memorandum of Agreement (MOA)', description: 'Memorandum of Agreement between parties for refund terms', documentStatus: 'pending' },
                        { type: 'promissory_notes', name: 'Promissory Notes', description: 'Promissory notes and payment agreements for refund terms', documentStatus: 'pending' },
                        { type: 'form_008', name: 'Form 008', description: 'Form 008 for refund processing', documentStatus: 'pending' },
                        { type: 'certification_from_the_dost_agency', name: 'Certification from the DOST Agency', description: 'Certification from the DOST Agency (for applicant with previous DOST Assistance)', documentStatus: 'pending' },
                        { type: 'acknowledgment_reciept', name: 'Acknowledgment Receipt', description: 'Acknowledgment Receipt (for PDC received by PSTO)', documentStatus: 'pending' },
                        { type: 'csf', name: 'CSF', description: 'Customer Satisfaction Form', documentStatus: 'pending' }
                     ]
                  }));
                  
                  allDocuments = [...allDocuments, ...transformedApps];
                  console.log('🔍 Combined Documents:', allDocuments);
               }
            } catch (error) {
               console.log('No RTEC completed applications found or error fetching them:', error);
            }
            
            setRefundDocuments(allDocuments);
         } else {
            setRefundDocuments([]);
         }
      } catch (error) {
         console.error('Error fetching refund documents:', error);
         showToast('Failed to fetch refund documents', 'error');
      } finally {
         setLoading(false);
      }
   }, [currentUser]);

   useEffect(() => {
      fetchRefundDocuments();
   }, [fetchRefundDocuments]);

   const requestRefundDocuments = async (application) => {
      try {
         setLoading(true);
         // Get the TNA ID - now it's stored directly as tnaId
         const tnaId = application.tnaId;
         console.log('Requesting refund documents for TNA ID:', tnaId);
         console.log('Application data:', application);
         
         const response = await api.post(`/refund-documents/request/${tnaId}`);
         if (response.data.success) {
            showToast('Refund document request created successfully', 'success');
            fetchRefundDocuments(); // Refresh the list
         }
      } catch (error) {
         console.error('Error requesting refund documents:', error);
         console.error('Error details:', error.response?.data);
         showToast(error.response?.data?.message || 'Failed to request refund documents', 'error');
      } finally {
         setLoading(false);
      }
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

         // Check if this is a ready_for_refund status (RTEC completed but no refund request yet)
         if (selectedDocument.status === 'ready_for_refund') {
            // First create a refund document request, then submit the document
            const requestResponse = await api.post(`/refund-documents/request/${selectedDocument.tnaId._id}`);
            if (!requestResponse.data.success) {
               throw new Error('Failed to create refund document request');
            }
         }

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




   const showToast = (message, type) => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
   };

   // Status badge functions
   const getStatusBadge = (status) => {
      const statusConfig = {
         'ready_for_refund': { color: 'bg-blue-100 text-blue-800', text: 'Ready for Refund' },
         'documents_requested': { color: 'bg-yellow-100 text-yellow-800', text: 'Requested' },
         'documents_submitted': { color: 'bg-green-100 text-green-800', text: 'Submitted' },
         'documents_under_review': { color: 'bg-purple-100 text-purple-800', text: 'Under Review' },
         'documents_approved': { color: 'bg-green-100 text-green-800', text: 'Approved' },
         'documents_rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected' },
         'refund_completed': { color: 'bg-green-100 text-green-800', text: 'Completed' }
      };
      
      const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
      return (
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.text}
         </span>
      );
   };

   // Table columns for DOST users
   const refundDocumentsColumns = [
      {
         key: 'enterpriseName',
         header: 'Enterprise',
         width: '200px',
         render: (value, item) => {
            const enterpriseName = item?.applicationId?.enterpriseName || item?.applicationId?.companyName || 'N/A';
            return (
               <div className="truncate" title={enterpriseName}>
                  {enterpriseName}
               </div>
            );
         }
      },
      {
         key: 'projectTitle',
         header: 'Project',
         width: '180px',
         render: (value, item) => {
            const projectName = item?.applicationId?.projectTitle || item?.applicationId?.programName || 'N/A';
            return (
               <div className="truncate" title={projectName}>
                  {projectName}
               </div>
            );
         }
      },
      {
         key: 'proponent',
         header: 'Proponent',
         width: '150px',
         render: (value, item) => {
            const fullName = `${item?.proponentId?.firstName || ''} ${item?.proponentId?.lastName || ''}`.trim();
            return (
               <div className="truncate" title={fullName || 'N/A'}>
                  {fullName || 'N/A'}
               </div>
            );
         }
      },
      {
         key: 'status',
         header: 'Status',
         width: '120px',
         render: (value, item) => {
            return getStatusBadge(item?.status);
         }
      },
      {
         key: 'requestedAt',
         header: 'Requested',
         width: '100px',
         render: (value, item) => {
            return item?.requestedAt ? new Date(item.requestedAt).toLocaleDateString() : 'N/A';
         }
      },
      {
         key: 'dueDate',
         header: 'Due Date',
         width: '100px',
         render: (value, item) => {
            return item?.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A';
         }
      },
      {
         key: 'actions',
         header: 'Actions',
         width: '120px',
         render: (value, item) => {
            const canRequestRefund = item?.status === 'ready_for_refund';
            
            return (
               <div className="flex justify-center space-x-1">
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={() => setSelectedDocument(item)}
                     className="text-xs px-2 py-1"
                  >
                     View
                  </Button>
                  {canRequestRefund && (
                     <Button
                        size="sm"
                        variant="primary"
                        onClick={() => requestRefundDocuments(item)}
                        disabled={loading}
                        className="text-xs px-2 py-1"
                        title="Request Refund Documents"
                     >
                        Request
                     </Button>
                  )}
               </div>
            );
         }
      }
   ];

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
            <h2 className="text-2xl font-bold text-gray-900">
               {currentUser?.role === 'dost_mimaropa' ? 'Refund Document Management' : 'Refund Document Submission'}
            </h2>
         </div>

         {refundDocuments.length === 0 ? (
            <Card>
               <div className="p-8 text-center">
                  <div className="mb-4">
                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                     {currentUser?.role === 'psto' 
                        ? 'No Refund Document Requests' 
                        : 'No Refund Document Requests'
                     }
                  </h3>
                  <p className="text-gray-500 mb-4">
                     {currentUser?.role === 'psto' 
                        ? 'No refund document requests from DOST have been made for applications in your province yet.' 
                        : 'No refund document requests found.'
                     }
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                     <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
                     <ul className="text-sm text-blue-800 space-y-1">
                        {currentUser?.role === 'psto' ? (
                           <>
                              <li>• DOST MIMAROPA reviews RTEC completed applications</li>
                              <li>• DOST requests refund documents for specific applications</li>
                              <li>• You will receive notifications when requests are made</li>
                              <li>• Then you can submit the required refund documents</li>
                           </>
                        ) : (
                           <>
                              <li>• Review RTEC completed applications</li>
                              <li>• Click "Request Documents" for applications that need refund processing</li>
                              <li>• PSTO will be notified to submit the required documents</li>
                           </>
                        )}
                     </ul>
                  </div>
               </div>
            </Card>
         ) : (
            // Show table for DOST users, cards for PSTO users
            currentUser?.role === 'dost_mimaropa' ? (
               <Card>
                  <DataTable
                     data={refundDocuments}
                     columns={refundDocumentsColumns}
                     loading={loading}
                     emptyMessage="No refund document requests found"
                  />
               </Card>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {refundDocuments.map((application, index) => (
                  <Card key={application._id || index} className="p-6">
                     {/* Application Header */}
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="text-xl font-semibold text-gray-900">
                              {application.applicationId?.enterpriseName ||
                               application.applicationId?.companyName ||
                               'Unknown Enterprise'}
                           </h3>
                           <div className="flex items-center space-x-4 mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                 {application.status === 'ready_for_refund' ? 'Ready for Refund' : 
                                  application.status === 'documents_requested' ? 'Requested' : 
                                  application.status}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                 Due in {application.dueDate ? Math.ceil((new Date(application.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A'} days
                              </span>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                           {application.status === 'ready_for_refund' && currentUser?.role === 'dost_mimaropa' && (
                              <Button
                                 variant="primary"
                                 onClick={() => requestRefundDocuments(application)}
                                 disabled={loading}
                                 className="flex items-center space-x-2"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                 </svg>
                                 <span>Request Documents</span>
                              </Button>
                           )}
                        </div>
                     </div>

                     {/* Application Details Card */}
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <span className="text-sm font-medium text-blue-600">Enterprise:</span>
                              <span className="ml-2 text-sm text-gray-900">
                                 {application.applicationId?.enterpriseName || 
                                  application.applicationId?.companyName || 'N/A'}
                              </span>
                           </div>
                           <div>
                              <span className="text-sm font-medium text-green-600">Project:</span>
                              <span className="ml-2 text-sm text-gray-900">
                                 {application.applicationId?.projectTitle || 'N/A'}
                              </span>
                           </div>
                           <div>
                              <span className="text-sm font-medium text-blue-600">Proponent:</span>
                              <span className="ml-2 text-sm text-gray-900">
                                 {application.proponentId?.firstName} {application.proponentId?.lastName}
                              </span>
                           </div>
                           <div>
                              <span className="text-sm font-medium text-green-600">Due:</span>
                              <span className="ml-2 text-sm text-gray-900">
                                 {application.dueDate ? new Date(application.dueDate).toLocaleDateString() : 'N/A'}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Documents Section */}
                     <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-purple-900 mb-4">Documents</h4>
                        <div className="space-y-3">
                           {application.refundDocuments?.map((doc, docIndex) => (
                              <div key={docIndex} className="flex items-center justify-between py-2">
                                 <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                 </div>
                                 <div className="flex items-center space-x-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                       {doc.filename ? 'Submitted' : 'Pending'}
                                    </span>
                                    {application.status === 'documents_requested' && currentUser?.role === 'psto' && !doc.filename && (
                                       <Button
                                          size="sm"
                                          variant="primary"
                                          onClick={() => {
                                             setSelectedDocument(application);
                                             setCurrentDocumentType(doc.type);
                                             setShowUploadModal(true);
                                          }}
                                          className="px-4 py-1 text-sm"
                                       >
                                          Upload
                                       </Button>
                                    )}
                                    {doc.filename && (
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                             const fileUrl = `http://localhost:4000/uploads/${doc.filename}`;
                                             window.open(fileUrl, '_blank');
                                          }}
                                          className="px-4 py-1 text-sm"
                                       >
                                          View
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>
                  ))}
               </div>
            )
         )}

         {/* Upload Modal */}
         {showUploadModal && selectedDocument && (
            <Modal
               isOpen={showUploadModal}
               onClose={() => setShowUploadModal(false)}
               title="Upload Refund Document"
               size="md"
            >
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                     </label>
                     <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
                        variant="primary"
                        onClick={submitDocument}
                        disabled={!uploadFile || uploading}
                     >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}

         {/* Toast */}
         {toast.show && (
            <Toast
               isVisible={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast({ show: false, message: '', type: '' })}
            />
         )}
      </div>
   );
};

export default RefundDocument;