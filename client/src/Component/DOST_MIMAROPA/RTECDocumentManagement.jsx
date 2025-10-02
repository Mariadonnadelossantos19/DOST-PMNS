import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, ConfirmationModal } from '../UI';
import api from '../../config/api';

const RTECDocumentManagement = () => {
   const [rtecDocuments, setRtecDocuments] = useState([]);
   const [approvedTNAs, setApprovedTNAs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [loadingTNAs, setLoadingTNAs] = useState(false);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [showRequestModal, setShowRequestModal] = useState(false);
   const [selectedTNA, setSelectedTNA] = useState(null);
   const [reviewAction, setReviewAction] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [currentDocumentType, setCurrentDocumentType] = useState('');
   const [toast, setToast] = useState({ show: false, message: '', type: '' });
   const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'approved-tnas'
   const [filters, setFilters] = useState({
      status: '',
      search: ''
   });

   useEffect(() => {
      if (activeTab === 'requests') {
         fetchRTECDocuments();
      } else if (activeTab === 'approved-tnas') {
         fetchApprovedTNAs();
      }
   }, [filters, activeTab]);

   const fetchRTECDocuments = async () => {
      try {
         setLoading(true);
         console.log('Starting to fetch RTEC documents...');
         console.log('Auth token exists:', !!localStorage.getItem('authToken'));
         
         const params = new URLSearchParams();
         if (filters.status) params.append('status', filters.status);
         
         console.log('Making API call to:', `/rtec-documents/list?${params}`);
         const response = await api.get(`/rtec-documents/list?${params}`);
         console.log('RTEC Documents Response:', response.data);
         
         if (response.data.success) {
            const documents = response.data.data?.docs || response.data.data || [];
            console.log('RTEC Documents Data:', documents);
            console.log('Number of documents:', documents.length);
            
            // Log each document for debugging
            documents.forEach((doc, index) => {
               console.log(`Document ${index + 1}:`, {
                  id: doc._id,
                  status: doc.status,
                  companyName: doc.applicationId?.enterpriseName || doc.applicationId?.companyName,
                  projectTitle: doc.applicationId?.projectTitle || doc.applicationId?.programName,
                  proponent: `${doc.proponentId?.firstName || ''} ${doc.proponentId?.lastName || ''}`.trim(),
                  requestedAt: doc.requestedAt,
                  dueDate: doc.dueDate
               });
            });
            
            setRtecDocuments(documents);
         } else {
            console.log('API call unsuccessful:', response.data);
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
   };

   const fetchApprovedTNAs = async () => {
      try {
         setLoadingTNAs(true);
         console.log('Fetching approved TNAs...');
         
         // Fetch TNAs that are signed by RD
         const response = await api.get('/tna/dost-mimaropa/approved');
         console.log('TNA Response:', response.data);
         
         if (response.data.success) {
            // Show all TNAs with status 'signed_by_rd'
            const allTNAs = response.data.data || [];
            console.log('All TNAs:', allTNAs);
            
            const signedTNAs = allTNAs.filter(tna => tna && tna.status === 'signed_by_rd');
            console.log('Signed TNAs:', signedTNAs);
            
            // Get existing RTEC requests to show status in the table
            try {
               const existingRequests = await api.get('/rtec-documents/list');
               const existingTNAIds = existingRequests.data.success 
                  ? existingRequests.data.data.docs?.map(doc => doc.tnaId?._id || doc.tnaId) || []
                  : [];
               
               console.log('Existing RTEC request TNA IDs:', existingTNAIds);
               
               // Add RTEC request status to each TNA
               const tnaWithRTECStatus = signedTNAs.map(tna => ({
                  ...tna,
                  hasRTECRequest: existingTNAIds.includes(tna._id)
               }));
               
               console.log('TNAs with RTEC status:', tnaWithRTECStatus);
               setApprovedTNAs(tnaWithRTECStatus);
            } catch (rtecError) {
               console.warn('Error fetching existing RTEC requests, showing TNAs without RTEC status:', rtecError);
               // Add hasRTECRequest: false to all TNAs if we can't fetch RTEC requests
               const tnaWithRTECStatus = signedTNAs.map(tna => ({
                  ...tna,
                  hasRTECRequest: false
               }));
               setApprovedTNAs(tnaWithRTECStatus);
            }
         } else {
            console.log('TNA API response not successful:', response.data);
            setApprovedTNAs([]);
         }
      } catch (error) {
         console.error('Error fetching approved TNAs:', error);
         showToast('Failed to fetch approved TNAs', 'error');
         setApprovedTNAs([]);
      } finally {
         setLoadingTNAs(false);
      }
   };

   const handleRequestDocuments = async (tnaId) => {
      try {
         const response = await api.post(`/rtec-documents/request/${tnaId}`);
         if (response.data.success) {
            showToast('RTEC documents requested successfully', 'success');
            setShowRequestModal(false);
            fetchRTECDocuments();
            fetchApprovedTNAs(); // Refresh the list
         }
      } catch (error) {
         console.error('Error requesting RTEC documents:', error);
         showToast(error.response?.data?.message || 'Failed to request documents', 'error');
      }
   };

   const openRequestModal = (tna) => {
      setSelectedTNA(tna);
      setShowRequestModal(true);
   };

   const handleReviewDocument = (rtecDoc, documentType, action) => {
      setSelectedDocument(rtecDoc);
      setCurrentDocumentType(documentType);
      setReviewAction(action);
      setReviewComments('');
      setShowReviewModal(true);
   };

   const submitReview = async () => {
      try {
         const tnaId = selectedDocument.tnaId?._id || selectedDocument.tnaId;
         console.log('Submitting review:', {
            tnaId,
            documentType: currentDocumentType,
            action: reviewAction,
            comments: reviewComments
         });
         
         const response = await api.post(
            `/rtec-documents/review/${tnaId}/${encodeURIComponent(currentDocumentType)}`,
            {
               action: reviewAction,
               comments: reviewComments
            }
         );

         if (response.data.success) {
            showToast(`Document ${reviewAction}d successfully`, 'success');
            setShowReviewModal(false);
            fetchRTECDocuments();
         }
      } catch (error) {
         console.error('Error reviewing document:', error);
         console.error('Error details:', error.response?.data);
         showToast(error.response?.data?.message || 'Failed to review document', 'error');
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

   const rtecDocumentsColumns = [
      {
         key: 'companyName',
         label: 'Enterprise Name',
         render: (item) => {
            console.log('Rendering company for item:', item);
            return item?.applicationId?.enterpriseName || item?.applicationId?.companyName || 'N/A';
         }
      },
      {
         key: 'projectTitle',
         label: 'Project',
         render: (item) => {
            console.log('Rendering project for item:', item);
            return item?.applicationId?.projectTitle || item?.applicationId?.programName || 'N/A';
         }
      },
      {
         key: 'proponent',
         label: 'Proponent',
         render: (item) => {
            console.log('Rendering proponent for item:', item);
            const fullName = `${item?.proponentId?.firstName || ''} ${item?.proponentId?.lastName || ''}`.trim();
            return fullName || 'N/A';
         }
      },
      {
         key: 'status',
         label: 'Status',
         render: (item) => {
            console.log('Rendering status for item:', item);
            return getStatusBadge(item?.status);
         }
      },
      {
         key: 'requestedAt',
         label: 'Requested',
         render: (item) => {
            console.log('Rendering requestedAt for item:', item);
            return item?.requestedAt ? new Date(item.requestedAt).toLocaleDateString() : 'N/A';
         }
      },
      {
         key: 'dueDate',
         label: 'Due Date',
         render: (item) => {
            console.log('Rendering dueDate for item:', item);
            return item?.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A';
         }
      },
      {
         key: 'actions',
         label: 'Actions',
         render: (item) => (
            <div className="flex space-x-2">
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDocument(item)}
               >
                  View Details
               </Button>
            </div>
         )
      }
   ];

   const approvedTNAsColumns = [
      {
         key: 'companyName',
         label: 'Company',
         render: (item) => {
            if (!item) return 'N/A';
            return item.applicationId?.enterpriseName || 
                   item.applicationId?.companyName || 
                   item.enterpriseName || 
                   item.companyName || 
                   'N/A';
         }
      },
      {
         key: 'projectTitle',
         label: 'Project',
         render: (item) => {
            if (!item) return 'N/A';
            return item.applicationId?.projectTitle || 
                   item.applicationId?.programName || 
                   item.projectTitle || 
                   item.programName || 
                   'N/A';
         }
      },
      {
         key: 'proponent',
         label: 'Proponent',
         render: (item) => {
            if (!item || !item.proponentId) return 'N/A';
            const firstName = item.proponentId.firstName || '';
            const lastName = item.proponentId.lastName || '';
            return `${firstName} ${lastName}`.trim() || 'N/A';
         }
      },
      {
         key: 'scheduledDate',
         label: 'TNA Date',
         render: (item) => {
            if (!item || !item.scheduledDate) return 'N/A';
            try {
               return new Date(item.scheduledDate).toLocaleDateString();
            } catch (error) {
               return 'Invalid Date';
            }
         }
      },
      {
         key: 'rdSignedAt',
         label: 'RD Signed',
         render: (item) => {
            if (!item || !item.rdSignedAt) return 'N/A';
            try {
               return new Date(item.rdSignedAt).toLocaleDateString();
            } catch (error) {
               return 'Invalid Date';
            }
         }
      },
      {
         key: 'rtecStatus',
         label: 'RTEC Status',
         render: (item) => {
            if (!item) return 'N/A';
            if (item.hasRTECRequest) {
               return <Badge color="blue">Documents Requested</Badge>;
            } else {
               return <Badge color="gray">Ready for Request</Badge>;
            }
         }
      },
      {
         key: 'actions',
         label: 'Actions',
         render: (item) => {
            if (!item) return null;
            return (
               <div className="flex space-x-2">
                  {item.hasRTECRequest ? (
                     <Button
                        size="sm"
                        variant="outline"
                        disabled
                     >
                        Already Requested
                     </Button>
                  ) : (
                     <Button
                        size="sm"
                        onClick={() => openRequestModal(item)}
                     >
                        Request Documents
                     </Button>
                  )}
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

         {/* Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'requests'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Document Requests
               </button>
               <button
                  onClick={() => setActiveTab('approved-tnas')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'approved-tnas'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Approved TNAs
               </button>
            </nav>
         </div>

         {/* Filters */}
         <Card>
            <div className="p-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeTab === 'requests' && (
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
                  )}
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

         {/* Content based on active tab */}
         {activeTab === 'requests' ? (
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
         ) : (
            <Card>
               <DataTable
                  columns={approvedTNAsColumns}
                  data={approvedTNAs}
                  loading={loadingTNAs}
                  emptyMessage="No approved TNAs available for RTEC document request"
               />
            </Card>
         )}

         {/* Document Details Modal */}
         {selectedDocument && (
            <Modal
               isOpen={!!selectedDocument}
               onClose={() => setSelectedDocument(null)}
               title="RTEC Document Details"
               size="lg"
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
                           {selectedDocument.applicationId?.projectTitle || 
                            selectedDocument.applicationId?.programName || 'N/A'}
                        </p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                           {selectedDocument.dueDate ? new Date(selectedDocument.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                     </div>
                  </div>

                  {/* Documents */}
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

                              {doc.documentStatus === 'submitted' && (
                                 <div className="mt-3 flex space-x-2">
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
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
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
                  >
                     Cancel
                  </Button>
                  <Button
                     variant={reviewAction === 'approve' ? 'success' : 'danger'}
                     onClick={submitReview}
                     disabled={reviewAction === 'reject' && !reviewComments.trim()}
                  >
                     {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Request Documents Modal */}
         <Modal
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
            title="Request RTEC Documents"
         >
            <div className="space-y-4">
               {selectedTNA && (
                  <>
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">TNA Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <span className="font-medium text-blue-800">Company:</span>
                              <p className="text-blue-700">
                                 {selectedTNA.applicationId?.enterpriseName || 
                                  selectedTNA.applicationId?.companyName || 
                                  selectedTNA.enterpriseName || 
                                  selectedTNA.companyName || 
                                  'N/A'}
                              </p>
                           </div>
                           <div>
                              <span className="font-medium text-blue-800">Project:</span>
                              <p className="text-blue-700">
                                 {selectedTNA.applicationId?.projectTitle || 
                                  selectedTNA.applicationId?.programName || 
                                  selectedTNA.projectTitle || 
                                  selectedTNA.programName || 
                                  'N/A'}
                              </p>
                           </div>
                           <div>
                              <span className="font-medium text-blue-800">TNA Date:</span>
                              <p className="text-blue-700">
                                 {selectedTNA.scheduledDate ? new Date(selectedTNA.scheduledDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                           <div>
                              <span className="font-medium text-blue-800">RD Signed:</span>
                              <p className="text-blue-700">
                                 {selectedTNA.rdSignedAt ? new Date(selectedTNA.rdSignedAt).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Documents to be Requested</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                           <li>• Approved TNA Report with Signature</li>
                           <li>• Risk Management Plan</li>
                           <li>• Financial Statements (3 years for SME, 1 year for micro-enterprises)</li>
                        </ul>
                        <p className="text-sm text-yellow-700 mt-2">
                           The PSTO will have 14 days to submit all required documents.
                        </p>
                     </div>

                     <p className="text-sm text-gray-600">
                        Are you sure you want to request RTEC documents for this TNA? 
                        This will notify the PSTO to submit the required documents.
                     </p>
                  </>
               )}

               <div className="flex justify-end space-x-3">
                  <Button
                     variant="outline"
                     onClick={() => setShowRequestModal(false)}
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={() => handleRequestDocuments(selectedTNA?._id)}
                  >
                     Request Documents
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

export default RTECDocumentManagement;
