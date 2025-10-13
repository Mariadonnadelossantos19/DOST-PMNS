import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, ConfirmationModal } from '../UI';
import api from '../../config/api';

const RTECDocumentManagement = () => {
   const [rtecDocuments, setRtecDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [reviewAction, setReviewAction] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [currentDocumentType, setCurrentDocumentType] = useState('');
   const [toast, setToast] = useState({ show: false, message: '', type: '' });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [filters, setFilters] = useState({
      status: '',
      search: ''
   });

   const fetchRTECDocuments = useCallback(async () => {
      try {
         setLoading(true);
         const params = new URLSearchParams();
         if (filters.status) params.append('status', filters.status);
         
         const response = await api.get(`/rtec-documents/list?${params}`);
         
         if (response.data.success) {
            const documents = response.data.data?.docs || response.data.data || [];
            setRtecDocuments(documents);
         } else {
            setRtecDocuments([]);
         }
      } catch (error) {
         console.error('Error fetching RTEC documents:', error);
         console.error('Error response:', error.response?.data);
         console.error('Error status:', error.response?.status);
         console.error('Network error:', error.code === 'ERR_NETWORK');
         setRtecDocuments([]);
         showToast(`Failed to fetch RTEC documents: ${error.response?.data?.message || error.message}`, 'error');
      } finally {
         setLoading(false);
      }
   }, [filters]);

   useEffect(() => {
      fetchRTECDocuments();
   }, [fetchRTECDocuments]);

   const handleReviewDocument = (rtecDoc, documentType, action) => {
      setSelectedDocument(rtecDoc);
      setCurrentDocumentType(documentType);
      setReviewAction(action);
      setReviewComments('');
      setShowReviewModal(true);
   };

   const submitReview = async () => {
      if (isSubmitting) return; // Prevent multiple submissions
      
      try {
         setIsSubmitting(true);
         const tnaId = selectedDocument.tnaId?._id || selectedDocument.tnaId;
         console.log('Submitting review:', {
            tnaId,
            documentType: currentDocumentType,
            action: reviewAction,
            comments: reviewComments
         });
         
         const response = await api.post(
            `/rtec-documents/review/${tnaId}`,
            {
               documentType: currentDocumentType,
               action: reviewAction,
               comments: reviewComments
            }
         );

         if (response.data.success) {
            showToast(`Document ${reviewAction}d successfully`, 'success');
            setShowReviewModal(false);
            
            // Update the selected document in place instead of refreshing everything
            if (selectedDocument && selectedDocument.partialdocsrtec) {
               const updatedDocument = { ...selectedDocument };
               const docIndex = updatedDocument.partialdocsrtec.findIndex(doc => doc.type === currentDocumentType);
               
               if (docIndex !== -1) {
                  updatedDocument.partialdocsrtec[docIndex] = {
                     ...updatedDocument.partialdocsrtec[docIndex],
                     documentStatus: reviewAction === 'approve' ? 'approved' : 'rejected',
                     reviewedAt: new Date().toISOString(),
                     reviewComments: reviewComments
                  };
                  
                  // Update the document in the list
                  setRtecDocuments(prevDocs => 
                     prevDocs.map(doc => 
                        doc._id === selectedDocument._id ? updatedDocument : doc
                     )
                  );
                  
                  // Update the selected document
                  setSelectedDocument(updatedDocument);
               }
            }
         }
      } catch (error) {
         console.error('Error reviewing document:', error);
         console.error('Error details:', error.response?.data);
         showToast(error.response?.data?.message || 'Failed to review document', 'error');
      } finally {
         setIsSubmitting(false);
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

   const getTNAStatusBadge = (status) => {
      const statusConfig = {
         'rtec_completed': { color: 'green', text: 'RTEC Completed' },
         'ready_for_funding': { color: 'emerald', text: 'Ready for Funding' },
         'rtec_documents_approved': { color: 'blue', text: 'Documents Approved' },
         'rtec_revision_requested': { color: 'orange', text: 'Revision Requested' },
         'rtec_endorsed_for_approval': { color: 'purple', text: 'Endorsed for Approval' },
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

   const rtecDocumentsColumns = [
      {
         key: 'companyName',
         header: 'Enterprise Name',
         width: '200px',
         render: (value, item) => {
            const companyName = item?.applicationId?.enterpriseName || item?.applicationId?.companyName || 'N/A';
            return (
               <div className="truncate" title={companyName}>
                  {companyName}
               </div>
            );
         }
      },
      {
         key: 'projectTitle',
         header: 'Project',
         width: '180px',
         render: (value, item) => {
            const projectName = item?.projectTitle || item?.applicationId?.projectTitle || item?.applicationId?.programName || 'N/A';
            return (
               <div className="truncate" title={projectName}>
                  {projectName}
               </div>
            );
         }
      },
      {
         key: 'amountRequested',
         header: 'Amount Requested',
         width: '120px',
         render: (value, item) => {
            const amount = item?.amountRequested || item?.applicationId?.amountRequested;
            if (!amount) return <div className="text-gray-500">N/A</div>;
            return (
               <div className="truncate font-medium" title={`₱${amount.toLocaleString()}`}>
                  ₱{amount.toLocaleString()}
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
         key: 'psto',
         header: 'PSTO',
         width: '120px',
         render: (value, item) => {
            // Get PSTO information from the proponent's province
            const proponent = item?.proponentId;
            if (!proponent || !proponent.province) {
               return (
                  <div className="truncate text-gray-500" title="No PSTO assigned">
                     N/A
                  </div>
               );
            }
            
            // Map province to PSTO name
            const provinceToPSTO = {
               'marinduque': 'PSTO Marinduque',
               'romblon': 'PSTO Romblon',
               'palawan': 'PSTO Palawan',
               'mindoro_oriental': 'PSTO Oriental Mindoro',
               'mindoro_occidental': 'PSTO Occidental Mindoro'
            };
            
            const pstoName = provinceToPSTO[proponent.province] || `PSTO ${proponent.province}`;
            return (
               <div className="truncate" title={pstoName}>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                     {pstoName}
                  </span>
               </div>
            );
         }
      },
      {
         key: 'status',
         header: 'Status',
         width: '120px',
         render: (value, item) => {
            // Show TNA status instead of RTEC documents status
            const tnaStatus = item?.tnaId?.status || item?.status;
            return getTNAStatusBadge(tnaStatus);
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
         width: '80px',
         render: (value, item) => {
            return (
               <div className="flex justify-center">
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={() => setSelectedDocument(item)}
                     className="text-xs px-2 py-1"
                  >
                     View
                  </Button>
               </div>
            );
         }
      }
   ];


   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">RTEC Document Management</h2>
         </div>


         {/* Filters */}
         <Card>
            <div className="p-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                     </label>
                     <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                        <option value="">All Statuses</option>
                        <option value="documents_requested">Requested (Pending PSTO Submission)</option>
                        <option value="documents_submitted">Submitted (Ready for Review)</option>
                        <option value="documents_under_review">Under Review</option>
                        <option value="documents_approved">Approved</option>
                        <option value="documents_rejected">Rejected</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                     </label>
                     <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search by company or project..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
               </div>
            </div>
         </Card>

         {/* Document Requests */}
         <Card>
            <div className="p-4 bg-blue-50 border-b border-blue-200">
               <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div>
                     <p className="text-sm text-blue-800">
                        <strong>Documents submitted by PSTO</strong> will appear here with status "Submitted (Ready for Review)". 
                        Click "View Details" to review and approve/reject individual documents.
                     </p>
                  </div>
               </div>
            </div>
            <DataTable
               columns={rtecDocumentsColumns}
               data={rtecDocuments}
               loading={loading}
               emptyMessage="No RTEC document requests found"
            />
         </Card>

         {/* Document Details Modal */}
         {selectedDocument && (
            <Modal
               isOpen={!!selectedDocument}
               onClose={() => setSelectedDocument(null)}
               title="RTEC Document Details"
               size="lg"
               closeOnOverlayClick={false}
            >
               <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Enterprise Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                           {selectedDocument.applicationId?.enterpriseName || 
                            selectedDocument.applicationId?.companyName || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Project</label>
                        <p className="mt-1 text-sm text-gray-900">
                           {selectedDocument.projectTitle || 
                            selectedDocument.applicationId?.projectTitle || 
                            selectedDocument.applicationId?.programName || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Amount Requested</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                           {selectedDocument.amountRequested ? 
                              `₱${selectedDocument.amountRequested.toLocaleString()}` : 
                              selectedDocument.applicationId?.amountRequested ? 
                                 `₱${selectedDocument.applicationId.amountRequested.toLocaleString()}` : 
                                 'N/A'}
                        </p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">PSTO</label>
                        <div className="mt-1">
                           {(() => {
                              const proponent = selectedDocument?.proponentId;
                              if (!proponent || !proponent.province) {
                                 return <span className="text-gray-500">N/A</span>;
                              }
                              
                              const provinceToPSTO = {
                                 'marinduque': 'PSTO Marinduque',
                                 'romblon': 'PSTO Romblon',
                                 'palawan': 'PSTO Palawan',
                                 'mindoro_oriental': 'PSTO Oriental Mindoro',
                                 'mindoro_occidental': 'PSTO Occidental Mindoro'
                              };
                              
                              const pstoName = provinceToPSTO[proponent.province] || `PSTO ${proponent.province}`;
                              return (
                                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {pstoName}
                                 </span>
                              );
                           })()}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                           {selectedDocument.dueDate ? new Date(selectedDocument.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>

                  {/* Regular Documents */}
                  <div>
                     <h4 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h4>
                     <div className="space-y-4">
                        {selectedDocument.partialdocsrtec?.map((doc, index) => (
                           <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h5 className="font-medium text-gray-900">{doc.name}</h5>
                                    <p className="text-sm text-gray-600">{doc.description}</p>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    {getDocumentStatusBadge(doc.documentStatus)}
                                 </div>
                              </div>
                              
                              {/* Display text content for text input fields */}
                              {(doc.type === 'project title' || doc.type === 'project description' || doc.type === 'amount requested') ? (
                                 doc.filename && (
                                    <div className="mt-2">
                                       <p className="text-sm text-gray-600">
                                          <strong>Content:</strong> {doc.textContent || doc.originalName?.replace('.txt', '') || 'N/A'}
                                       </p>
                                       <p className="text-sm text-gray-600">
                                          <strong>Submitted:</strong> {new Date(doc.uploadedAt).toLocaleString()}
                                       </p>
                                    </div>
                                 )
                              ) : (
                                 /* Display file information for regular documents */
                                 doc.filename && (
                                    <div className="mt-2">
                                       <p className="text-sm text-gray-600">
                                          <strong>File:</strong> {doc.originalName}
                                       </p>
                                       <p className="text-sm text-gray-600">
                                          <strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleString()}
                                       </p>
                                    </div>
                                 )
                              )}

                              {doc.reviewComments && (
                                 <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                       <strong>Review Comments:</strong> {doc.reviewComments}
                                    </p>
                                 </div>
                              )}

                              <div className="mt-3 flex space-x-2">
                                 {/* View and Download buttons - only for regular documents, not text input fields */}
                                 {!(doc.type === 'project title' || doc.type === 'project description' || doc.type === 'amount requested') && (
                                    <>
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                             const fileUrl = `http://localhost:4000/uploads/${doc.filename}`;
                                             console.log('Opening file:', fileUrl);
                                             const newWindow = window.open(fileUrl, '_blank');
                                             if (!newWindow) {
                                                showToast('Please allow popups to view documents', 'error');
                                             }
                                          }}
                                          className="flex items-center space-x-1"
                                          title={`View ${doc.originalName || doc.filename}`}
                                       >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          <span>View</span>
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                             const fileUrl = `http://localhost:4000/uploads/${doc.filename}`;
                                             const link = document.createElement('a');
                                             link.href = fileUrl;
                                             link.download = doc.originalName || doc.filename;
                                             document.body.appendChild(link);
                                             link.click();
                                             document.body.removeChild(link);
                                          }}
                                          className="flex items-center space-x-1"
                                          title={`Download ${doc.originalName || doc.filename}`}
                                       >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h3.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <span>Download</span>
                                       </Button>
                                    </>
                                 )}
                                 
                                 {/* Review buttons - only show for submitted documents */}
                                 {doc.documentStatus === 'submitted' && (
                                    <>
                                       <Button
                                          size="sm"
                                          variant="success"
                                          onClick={() => handleReviewDocument(selectedDocument, doc.type, 'approve')}
                                       >
                                          Approve
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() => handleReviewDocument(selectedDocument, doc.type, 'reject')}
                                       >
                                          Reject
                                       </Button>
                                    </>
                                 )}
                                 
                                 {/* Debug info for document status */}
                                 {console.log('🔍 Document status debug:', {
                                    type: doc.type,
                                    status: doc.documentStatus,
                                    shouldShowButtons: doc.documentStatus === 'submitted'
                                 })}
                                 
                                 {/* Show review status for already reviewed documents */}
                                 {doc.documentStatus === 'approved' && (
                                    <div className="flex items-center space-x-2">
                                       <Badge color="green">Approved</Badge>
                                       {doc.reviewedAt && (
                                          <span className="text-sm text-gray-500">
                                             Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                          </span>
                                       )}
                                    </div>
                                 )}
                                 
                                 {doc.documentStatus === 'rejected' && (
                                    <div className="flex items-center space-x-2">
                                       <Badge color="red">Rejected</Badge>
                                       {doc.reviewedAt && (
                                          <span className="text-sm text-gray-500">
                                             Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                          </span>
                                       )}
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Additional Documents (Response to RTEC Comments) */}
                  {selectedDocument.additionalDocumentsRequired && selectedDocument.additionalDocumentsRequired.length > 0 && (
                     <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Documents Required</h4>
                        <div className="space-y-4">
                           {selectedDocument.additionalDocumentsRequired.map((doc, index) => (
                              <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                 <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <h5 className="font-medium text-gray-900">{doc.name}</h5>
                                       <p className="text-sm text-gray-600">{doc.description}</p>
                                       {doc.reason && (
                                          <p className="text-sm text-blue-600 mt-1">
                                             <strong>Reason:</strong> {doc.reason}
                                          </p>
                                       )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       {getDocumentStatusBadge(doc.documentStatus)}
                                    </div>
                                 </div>
                                 
                                 {doc.filename && (
                                    <div className="mt-2">
                                       <p className="text-sm text-gray-600">
                                          <strong>File:</strong> {doc.originalName}
                                       </p>
                                       <p className="text-sm text-gray-600">
                                          <strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleString()}
                                       </p>
                                    </div>
                                 )}

                                 {doc.reviewComments && (
                                    <div className="mt-2">
                                       <p className="text-sm text-gray-600">
                                          <strong>Review Comments:</strong> {doc.reviewComments}
                                       </p>
                                    </div>
                                 )}

                                 <div className="mt-3 flex space-x-2">
                                    {/* View and Download buttons - always available */}
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => {
                                          const fileUrl = `http://localhost:4000/uploads/${doc.filename}`;
                                          console.log('Opening file:', fileUrl);
                                          const newWindow = window.open(fileUrl, '_blank');
                                          if (!newWindow) {
                                             showToast('Please allow popups to view documents', 'error');
                                          }
                                       }}
                                       className="flex items-center space-x-1"
                                       title={`View ${doc.originalName || doc.filename}`}
                                    >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                       </svg>
                                       <span>View</span>
                                    </Button>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => {
                                          const fileUrl = `http://localhost:4000/uploads/${doc.filename}`;
                                          const link = document.createElement('a');
                                          link.href = fileUrl;
                                          link.download = doc.originalName || doc.filename;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                       }}
                                       className="flex items-center space-x-1"
                                       title={`Download ${doc.originalName || doc.filename}`}
                                    >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                       </svg>
                                       <span>Download</span>
                                    </Button>

                                    {/* Review buttons - only show for submitted documents */}
                                    {doc.documentStatus === 'submitted' && (
                                       <>
                                          <Button
                                             size="sm"
                                             onClick={() => handleReviewDocument(selectedDocument, doc.type, 'approve')}
                                             className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                             Approve
                                          </Button>
                                          <Button
                                             size="sm"
                                             onClick={() => handleReviewDocument(selectedDocument, doc.type, 'reject')}
                                             className="bg-red-600 hover:bg-red-700 text-white"
                                          >
                                             Reject
                                          </Button>
                                       </>
                                    )}

                                    {/* Status indicators */}
                                    {doc.documentStatus === 'approved' && (
                                       <div className="flex items-center space-x-2">
                                          <Badge color="green">Approved</Badge>
                                          {doc.reviewedAt && (
                                             <span className="text-sm text-gray-500">
                                                Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                             </span>
                                          )}
                                       </div>
                                    )}
                                    {doc.documentStatus === 'rejected' && (
                                       <div className="flex items-center space-x-2">
                                          <Badge color="red">Rejected</Badge>
                                          {doc.reviewedAt && (
                                             <span className="text-sm text-gray-500">
                                                Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                             </span>
                                          )}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </Modal>
         )}

         {/* Review Modal */}
         <Modal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            title={`${reviewAction === 'approve' ? 'Approve' : 'Reject'} Document`}
         >
            <div className="space-y-4">
               <p className="text-sm text-gray-600">
                  Are you sure you want to {reviewAction} this document?
               </p>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Comments {reviewAction === 'reject' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                     value={reviewComments}
                     onChange={(e) => setReviewComments(e.target.value)}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Enter your comments..."
                  />
               </div>

               <div className="flex justify-end space-x-3">
                  <Button
                     variant="outline"
                     onClick={() => setShowReviewModal(false)}
                     disabled={isSubmitting}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant={reviewAction === 'approve' ? 'success' : 'danger'}
                     onClick={submitReview}
                     disabled={isSubmitting || (reviewAction === 'reject' && !reviewComments.trim())}
                  >
                     {isSubmitting ? 'Processing...' : (reviewAction === 'approve' ? 'Approve' : 'Reject')}
                  </Button>
               </div>
            </div>
         </Modal>


         {/* Toast */}
         <Toast
            isVisible={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: '' })}
         />
      </div>
   );
};

export default RTECDocumentManagement;
