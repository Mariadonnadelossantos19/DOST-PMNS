import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Toast, Input, DataTable, Textarea } from '../../UI';
import api from '../../../config/api';

const FundingDocument = () => {
   const [fundingDocuments, setFundingDocuments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [currentDocumentType, setCurrentDocumentType] = useState('');
   const [uploadFile, setUploadFile] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [toast, setToast] = useState({ show: false, message: '', type: '' });
   const [currentUser, setCurrentUser] = useState(null);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [reviewAction, setReviewAction] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showViewModal, setShowViewModal] = useState(false);
   const [showDocumentReviewModal, setShowDocumentReviewModal] = useState(false);
   const [currentReviewDocument, setCurrentReviewDocument] = useState(null);

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

   // Refresh selected document when modal is opened
   useEffect(() => {
      if (selectedDocument && selectedDocument._id && currentUser?.role === 'dost_mimaropa') {
         refreshSelectedDocument(selectedDocument._id);
      }
   }, [selectedDocument, currentUser?.role]);

   const fetchFundingDocuments = useCallback(async () => {
      try {
         setLoading(true);
         console.log('🔍 Fetching funding documents for user role:', currentUser?.role);

         // For PSTO users, only fetch funding documents that have been requested by DOST
         // and belong to their province
         if (currentUser?.role === 'psto') {
            try {
               const response = await api.get('/funding-documents/psto/list');
               console.log('🔍 PSTO Funding Documents Response:', response.data);
               
               if (response.data.success) {
                  // Filter to show only documents with specific statuses for PSTO
                  const filteredDocs = response.data.data.docs.filter(doc => 
                     doc.status === 'documents_requested' || 
                     doc.status === 'documents_submitted' || 
                     doc.status === 'documents_under_review' || 
                     doc.status === 'documents_approved' || 
                     doc.status === 'documents_rejected' || 
                     doc.status === 'documents_revision_requested'
                  );
                  
                  console.log('🔍 Filtered PSTO Documents:', filteredDocs.length);
                  setFundingDocuments(filteredDocs);
               } else {
                  console.log('No funding documents found for PSTO');
                  setFundingDocuments([]);
               }
            } catch (error) {
               console.error('Error fetching PSTO funding documents:', error);
               setFundingDocuments([]);
               setToast({
                  show: true,
                  message: 'Error fetching funding documents. Please check if the server is running.',
                  type: 'error'
               });
            }
         } else {
            // For DOST users, fetch both existing funding requests and RTEC completed applications
            try {
               // First, try to get existing funding document requests
               const response = await api.get('/funding-documents/list');
               console.log('🔍 DOST Funding Documents Response:', response.data);
               
               if (response.data.success) {
                  const documents = response.data.data.docs || [];
                  
                  // Debug logging for each document
                  console.log('=== FUNDING DOCUMENTS DEBUG ===');
                  console.log('Total documents received:', documents.length);
                  documents.forEach((doc, index) => {
                     console.log(`\n--- Document ${index} ---`);
                     console.log('ID:', doc._id);
                     console.log('Status:', doc.status);
                     console.log('ApplicationId:', doc.applicationId);
                     console.log('ProponentId:', doc.proponentId);
                     console.log('TnaId:', doc.tnaId);
                     
                     // Check if proponent data is properly populated
                     if (doc.proponentId) {
                        console.log('Proponent firstName:', doc.proponentId.firstName);
                        console.log('Proponent lastName:', doc.proponentId.lastName);
                        console.log('Proponent email:', doc.proponentId.email);
                     } else {
                        console.log('❌ ProponentId is null/undefined');
                     }
                  });
                  
                  // Store the initial documents and fetch RTEC completed applications
                  setFundingDocuments(documents);
                  
                  // Fetch RTEC completed applications that can be converted to funding requests
                  try {
                     const rtecResponse = await api.get('/tna/rtec-completed');
                     console.log('🔍 RTEC Completed Applications Response:', rtecResponse.data);
                     
                     if (rtecResponse.data.success) {
                        const rtecApplications = rtecResponse.data.data.map(app => ({
                           ...app,
                           status: 'ready_for_funding',
                           _id: app._id,
                           applicationId: app.applicationId,
                           proponentId: app.proponentId,
                           tnaId: app._id
                        }));
                        
                        // Filter out applications that already have funding document requests
                        const existingTnaIds = documents.map(doc => {
                           const tnaId = doc.tnaId?._id || doc.tnaId;
                           return tnaId?.toString();
                        });
                        
                        const newApplications = rtecApplications.filter(app => {
                           const appTnaId = app._id?.toString();
                           const isDuplicate = existingTnaIds.includes(appTnaId);
                           console.log(`Checking TNA ${appTnaId}: ${isDuplicate ? 'DUPLICATE' : 'NEW'}`);
                           return !isDuplicate;
                        });
                        
                        console.log('🔍 Existing TNA IDs:', existingTnaIds);
                        console.log('🔍 RTEC Applications:', rtecApplications.length);
                        console.log('🔍 New Applications (after deduplication):', newApplications.length);
                        
                        // Update with both existing documents and new RTEC applications
                        setFundingDocuments(prev => [...prev, ...newApplications]);
                     }
                  } catch (rtecError) {
                     console.error('Error fetching RTEC completed applications:', rtecError);
                  }
               } else {
                  setFundingDocuments([]);
               }
            } catch (error) {
               console.error('Error fetching DOST funding documents:', error);
               setFundingDocuments([]);
               setToast({
                  show: true,
                  message: 'Error fetching funding documents. Please check if the server is running.',
                  type: 'error'
               });
            }

         }
      } catch (error) {
         console.error('Error fetching funding documents:', error);
         setToast({
            show: true,
            message: 'Error fetching funding documents',
            type: 'error'
         });
      } finally {
         setLoading(false);
      }
   }, [currentUser?.role]);

   useEffect(() => {
      if (currentUser) {
         fetchFundingDocuments();
      }
   }, [currentUser, fetchFundingDocuments]);

   const requestFundingDocuments = async (tnaId) => {
      try {
         const response = await api.post(`/funding-documents/request/${tnaId}`);
         if (response.data.success) {
            setToast({
               show: true,
               message: 'Funding documents requested successfully',
               type: 'success'
            });
            fetchFundingDocuments();
         }
      } catch (error) {
         console.error('Error requesting funding documents:', error);
         setToast({
            show: true,
            message: 'Error requesting funding documents',
            type: 'error'
         });
      }
   };

   const submitDocument = async (tnaId, documentType, file) => {
      try {
         setUploading(true);
         
         // Debug: Log the tnaId to ensure it's a string
         console.log('🔍 Submitting document with tnaId:', tnaId, 'Type:', typeof tnaId);
         
         // If this is a ready_for_funding application, first request the funding documents
         const selectedApp = fundingDocuments.find(doc => doc.tnaId === tnaId || doc._id === tnaId);
         if (selectedApp && selectedApp.status === 'ready_for_funding') {
            console.log('Requesting funding documents for RTEC completed application...');
            await requestFundingDocuments(tnaId);
         }

         const formData = new FormData();
         formData.append('document', file);
         formData.append('documentType', documentType);

         console.log('🔍 Making API call to:', `/funding-documents/submit/${tnaId}`);
         const response = await api.post(`/funding-documents/submit/${tnaId}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });

         if (response.data.success) {
            setToast({
               show: true,
               message: 'Document submitted successfully',
               type: 'success'
            });
            
            // Close modal and refresh data
            setShowUploadModal(false);
            setUploadFile(null);
            
            // Refresh the documents list to show the new document
            fetchFundingDocuments();
         }
      } catch (error) {
         console.error('Error uploading document:', error);
         setToast({
            show: true,
            message: 'Error uploading document',
            type: 'error'
         });
      } finally {
         setUploading(false);
      }
   };

   const handleReviewDocument = (document) => {
      setSelectedDocument(document);
      setShowReviewModal(true);
   };

   const handleViewDocument = (document) => {
      setSelectedDocument(document);
      setShowViewModal(true);
   };

   const handleDocumentReview = (document, action) => {
      setCurrentReviewDocument(document);
      setReviewAction(action);
      setReviewComments('');
      setShowDocumentReviewModal(true);
   };

   const submitDocumentReview = async (documentType, action, comments) => {
      try {
         // Prevent multiple submissions
         if (isSubmitting) {
            console.log('⚠️ Review already in progress, ignoring duplicate request');
            return;
         }
         
         setIsSubmitting(true);
         // Ensure tnaId is a string, not an object
         const tnaId = typeof selectedDocument.tnaId === 'object' ? selectedDocument.tnaId._id || selectedDocument.tnaId : selectedDocument.tnaId;
         console.log('🔍 Reviewing document with tnaId:', tnaId, 'Type:', typeof tnaId);
         
         const response = await api.post(`/funding-documents/review/${tnaId}`, {
            documentType,
            action,
            comments
         });

         if (response.data.success) {
            setToast({
               show: true,
               message: `Document ${action}ed successfully`,
               type: 'success'
            });
            
            // Update the selected document with fresh data
            setSelectedDocument(response.data.data);
            
            // Update the specific document in the list without full refresh
            setFundingDocuments(prev => 
               prev.map(doc => 
                  doc._id === selectedDocument._id ? response.data.data : doc
               )
            );
            
            setShowReviewModal(false);
            setReviewComments('');
         }
      } catch (error) {
         console.error('Error reviewing document:', error);
         setToast({
            show: true,
            message: 'Error reviewing document',
            type: 'error'
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   const refreshSelectedDocument = async (documentId) => {
      try {
         const response = await api.get(`/funding-documents/${documentId}`);
         if (response.data.success) {
            setSelectedDocument(response.data.data);
         }
      } catch (error) {
         console.error('Error refreshing document:', error);
      }
   };

   const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
         setUploadFile(file);
      }
   };

   const openUploadModal = (documentType, tnaId) => {
      setCurrentDocumentType(documentType);
      // Ensure tnaId is a string, not an object
      const actualTnaId = typeof tnaId === 'object' ? tnaId._id || tnaId : tnaId;
      setSelectedDocument({ tnaId: actualTnaId });
      setShowUploadModal(true);
   };

   const handleUpload = () => {
      if (uploadFile && selectedDocument) {
         submitDocument(selectedDocument.tnaId, currentDocumentType, uploadFile);
      }
   };

   const getStatusBadge = (status) => {
      const statusConfig = {
         'ready_for_funding': { text: 'Ready for Funding', className: 'bg-blue-100 text-blue-800' },
         'documents_requested': { text: 'Documents Requested', className: 'bg-yellow-100 text-yellow-800' },
         'documents_submitted': { text: 'Documents Submitted', className: 'bg-purple-100 text-purple-800' },
         'documents_under_review': { text: 'Under Review', className: 'bg-orange-100 text-orange-800' },
         'documents_approved': { text: 'Approved', className: 'bg-green-100 text-green-800' },
         'documents_rejected': { text: 'Rejected', className: 'bg-red-100 text-red-800' },
         'documents_revision_requested': { text: 'Revision Requested', className: 'bg-yellow-100 text-yellow-800' },
         'funding_completed': { text: 'Funding Completed', className: 'bg-green-100 text-green-800' }
      };

      const config = statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
      return <Badge className={config.className}>{config.text}</Badge>;
   };

   // Helper function to get document status badge properties
   const getDocumentStatusBadgeProps = (status) => {
      switch (status) {
         case 'approved':
            return { text: 'Approved', className: 'bg-green-100 text-green-800' };
         case 'rejected':
            return { text: 'Rejected', className: 'bg-red-100 text-red-800' };
         case 'needs_revision':
            return { text: 'Needs Revision', className: 'bg-yellow-100 text-yellow-800' };
         case 'submitted':
            return { text: 'Submitted', className: 'bg-blue-100 text-blue-800' };
         case 'pending':
         default:
            return { text: 'Pending', className: 'bg-gray-100 text-gray-800' };
      }
   };

   // Define columns for DOST table view
   const fundingDocumentsColumns = [
      {
         key: 'enterpriseName',
         header: 'Enterprise',
         render: (value, item) => {
            // Debug logging
            console.log('Enterprise debug for item:', item._id, {
               enterpriseName: item.enterpriseName,
               applicationId: item.applicationId,
               applicationEnterpriseName: item.applicationId?.enterpriseName
            });
            
            return item.enterpriseName || item.applicationId?.enterpriseName || 'N/A';
         }
      },
      {
         key: 'projectTitle',
         header: 'Project Title',
         render: (value, item) => {
            // Debug logging
            console.log('Project Title debug for item:', item._id, {
               projectTitle: item.projectTitle,
               applicationProjectTitle: item.applicationId?.projectTitle,
               applicationProgramName: item.applicationId?.programName
            });
            
            return item.projectTitle || item.applicationId?.projectTitle || item.applicationId?.programName || 'N/A';
         }
      },
      {
         key: 'amountRequested',
         header: 'Amount Requested',
         render: (value, item) => {
            // Debug logging
            console.log('Amount debug for item:', item._id, {
               amountRequested: item.amountRequested,
               applicationAmount: item.applicationId?.amountRequested
            });
            
            const amount = item.amountRequested || item.applicationId?.amountRequested;
            return amount ? `₱${amount.toLocaleString()}` : 'N/A';
         }
      },
      {
         key: 'proponentName',
         header: 'Proponent',
         render: (value, item) => {
            const proponent = item.proponentId;
            if (!proponent) return 'N/A';
            
            const firstName = proponent.firstName || '';
            const lastName = proponent.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Debug logging
            console.log('Funding Document Proponent debug:', {
               proponentId: proponent,
               firstName,
               lastName,
               fullName
            });
            
            return fullName || 'N/A';
         }
      },
      {
         key: 'psto',
         header: 'PSTO',
         width: '120px',
         render: (value, item) => {
            const proponent = item?.proponentId;
            if (!proponent || !proponent.province) {
               return (
                  <div className="truncate text-gray-500" title="No PSTO assigned">
                     N/A
                  </div>
               );
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
         render: (value, item) => getStatusBadge(item.status)
      },
      {
         key: 'requestedAt',
         header: 'Requested',
         render: (value, item) => {
            if (item.status === 'ready_for_funding') {
               return 'Not Requested';
            }
            
            const date = item.requestedAt;
            if (!date) return 'N/A';
            
            try {
               const parsedDate = new Date(date);
               if (isNaN(parsedDate.getTime())) {
                  console.log('Invalid date for requestedAt:', date);
                  return 'Invalid Date';
               }
               return parsedDate.toLocaleDateString();
            } catch (error) {
               console.log('Error parsing requestedAt date:', date, error);
               return 'Invalid Date';
            }
         }
      },
      {
         key: 'dueDate',
         header: 'Due Date',
         render: (value, item) => {
            if (item.status === 'ready_for_funding') {
               return 'N/A';
            }
            
            const date = item.dueDate;
            if (!date) return 'N/A';
            
            try {
               const parsedDate = new Date(date);
               if (isNaN(parsedDate.getTime())) {
                  console.log('Invalid date for dueDate:', date);
                  return 'Invalid Date';
               }
               return parsedDate.toLocaleDateString();
            } catch (error) {
               console.log('Error parsing dueDate date:', date, error);
               return 'Invalid Date';
            }
         }
      },
      {
         key: 'actions',
         header: 'Actions',
         width: '80px',
         render: (value, item) => {
            if (item.status === 'ready_for_funding') {
               return (
                  <div className="flex justify-center">
                     <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestFundingDocuments(item.tnaId || item._id)}
                        className="text-xs px-2 py-1"
                     >
                        Request
                     </Button>
                  </div>
               );
            } else if (item.status === 'documents_submitted') {
               return (
                  <div className="flex justify-center">
                     <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewDocument(item)}
                        className="text-xs px-2 py-1"
                     >
                        Review
                     </Button>
                  </div>
               );
            } else {
               return (
                  <div className="flex justify-center">
                     <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(item)}
                        className="text-xs px-2 py-1"
                     >
                        View
                     </Button>
                  </div>
               );
            }
         }
      }
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   // If there's an error or no data, show appropriate message
   if (!currentUser) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="text-center">
               <h3 className="text-lg font-medium text-gray-900 mb-2">Loading User Data...</h3>
               <p className="text-gray-600">Please wait while we load your information.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">
                  {currentUser?.role === 'dost_mimaropa' ? 'Funding Document Management' : 'Funding Document Submission'}
               </h1>
               <p className="text-gray-600 mt-1">
                  {currentUser?.role === 'dost_mimaropa' 
                     ? 'Manage and review funding document requests'
                     : 'Submit required funding documents for your applications'
                  }
               </p>
            </div>
         </div>

         {/* DOST Table View */}
         {currentUser?.role === 'dost_mimaropa' && (
            <Card className="p-6">
               <DataTable
                  data={fundingDocuments}
                  columns={fundingDocumentsColumns}
                  loading={loading}
                  emptyMessage="No funding documents found"
               />
            </Card>
         )}

         {/* PSTO Card View */}
         {currentUser?.role === 'psto' && (
            <>
               {fundingDocuments.length === 0 ? (
                  <Card className="p-8 text-center">
                     <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Funding Document Requests</h3>
                        <p className="text-gray-600 mb-4">
                           DOST-MIMAROPA has not yet requested funding documents for any applications in your province.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                           <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                           <ol className="text-sm text-blue-800 space-y-1">
                              <li>1. DOST-MIMAROPA reviews RTEC completed applications</li>
                              <li>2. They request funding documents for eligible applications</li>
                              <li>3. You'll receive notifications and see requests here</li>
                              <li>4. Submit the required documents for review</li>
                           </ol>
                        </div>
                     </div>
                  </Card>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {fundingDocuments.map((application, index) => (
                        <Card key={application._id || index} className="p-6">
                           {/* Application Header */}
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                 <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {application.applicationId?.enterpriseName || 'Unknown Enterprise'}
                                 </h3>
                                 <p className="text-sm text-gray-600 mb-2">
                                    {application.applicationId?.projectTitle || 'Unknown Project'}
                                 </p>
                                 <div className="flex items-center space-x-2">
                                    <Badge className="bg-blue-100 text-blue-800">
                                       {application.status === 'ready_for_funding' ? 'Ready for Funding' : 
                                        application.status === 'documents_requested' ? 'Documents Requested' :
                                        application.status === 'documents_submitted' ? 'Documents Submitted' :
                                        application.status === 'documents_under_review' ? 'Under Review' :
                                        application.status === 'documents_approved' ? 'Approved' :
                                        application.status === 'documents_rejected' ? 'Rejected' :
                                        application.status === 'documents_revision_requested' ? 'Revision Requested' :
                                        application.status}
                                    </Badge>
                                    {application.dueDate && (
                                       <Badge className="bg-orange-100 text-orange-800">
                                          Due: {new Date(application.dueDate).toLocaleDateString()}
                                       </Badge>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* Application Details Card */}
                           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div>
                                    <span className="text-gray-500">Proponent:</span>
                                    <p className="font-medium text-gray-900">
                                       {application.proponentId ? 
                                          `${application.proponentId.firstName} ${application.proponentId.lastName}` : 
                                          'Unknown'
                                       }
                                    </p>
                                 </div>
                                 <div>
                                    <span className="text-gray-500">Program:</span>
                                    <p className="font-medium text-gray-900">
                                       {application.programName || 'SETUP'}
                                    </p>
                                 </div>
                                 <div>
                                    <span className="text-gray-500">Requested:</span>
                                    <p className="font-medium text-gray-900">
                                       {application.requestedAt ? 
                                          new Date(application.requestedAt).toLocaleDateString() : 
                                          'Not Requested'
                                       }
                                    </p>
                                 </div>
                                 <div>
                                    <span className="text-gray-500">Submitted:</span>
                                    <p className="font-medium text-gray-900">
                                       {application.submittedAt ? 
                                          new Date(application.submittedAt).toLocaleDateString() : 
                                          'Not Submitted'
                                       }
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Documents Section */}
                           <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h4 className="text-lg font-medium text-purple-900 mb-4">Documents</h4>
                              <div className="space-y-2">
                                 {application.fundingDocuments?.map((doc, docIndex) => (
                                    <div key={docIndex} className="bg-white border border-gray-200 rounded-md p-2">
                                       <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                             <div className="flex items-center space-x-2">
                                                <h5 className="text-xs font-semibold text-gray-900">{doc.name}</h5>
                                                {(() => {
                                                   const { text, className } = getDocumentStatusBadgeProps(doc.documentStatus);
                                                   return (
                                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
                                                         {text}
                                                      </span>
                                                   );
                                                })()}
                                             </div>
                                             
                                             {doc.filename && (
                                                <div className="mt-1 bg-green-50 border border-green-200 rounded p-1 flex items-center space-x-1">
                                                   <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                   </svg>
                                                   <span className="text-xs text-green-800 font-medium truncate max-w-32">{doc.originalName || doc.filename}</span>
                                                </div>
                                             )}

                                             {/* Review Comments for PSTO */}
                                             {doc.reviewComments && (
                                                <div className="mt-1 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                                                   <p className="text-xs text-yellow-800">
                                                      <strong>Review Comments:</strong> {doc.reviewComments}
                                                   </p>
                                                   {doc.reviewedAt && (
                                                      <p className="text-xs text-yellow-600">
                                                         Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                                      </p>
                                                   )}
                                                </div>
                                             )}

                                             {/* Approved Status (as plain text, matching RTEC format) */}
                                             {doc.documentStatus === 'approved' && doc.reviewedAt && (
                                                <div className="mt-1">
                                                   <p className="text-xs text-gray-500">
                                                      Approved: {new Date(doc.reviewedAt).toLocaleDateString()}
                                                   </p>
                                                </div>
                                             )}
                                          </div>
                                          
                                          <div className="flex items-center space-x-1">
                                             {!doc.filename ? (
                                                <Button
                                                   size="sm"
                                                   variant="outline"
                                                   onClick={() => openUploadModal(doc.type, application.tnaId || application._id)}
                                                   className="text-xs px-2 py-1"
                                                >
                                                   Upload
                                                </Button>
                                             ) : (
                                                <>
                                                   <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                         console.log('🔍 Viewing file:', doc.filename);
                                                         // Ensure tnaId is a string, not an object
                                                         const tnaId = typeof application.tnaId === 'object' ? 
                                                            application.tnaId._id || application.tnaId : 
                                                            application.tnaId || application._id;
                                                         const fileUrl = `http://localhost:4000/api/funding-documents/file/${tnaId}/${doc.type}`;
                                                         console.log('🔍 File URL:', fileUrl, 'TNA ID:', tnaId, 'Type:', typeof tnaId);
                                                         
                                                         const newWindow = window.open(fileUrl, '_blank');
                                                         if (!newWindow) {
                                                            setToast({
                                                               show: true,
                                                               message: 'Unable to open file. Please check if pop-ups are blocked.',
                                                               type: 'error'
                                                            });
                                                         }
                                                      }}
                                                      className="text-xs px-2 py-1"
                                                   >
                                                      View
                                                   </Button>
                                                   <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => openUploadModal(doc.type, application.tnaId || application._id)}
                                                      className="text-xs px-2 py-1"
                                                   >
                                                      Replace
                                                   </Button>
                                                </>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               )}
            </>
         )}

         {/* Upload Modal */}
         <Modal
            isOpen={showUploadModal}
            onClose={() => {
               setShowUploadModal(false);
               setUploadFile(null);
            }}
            title={uploadFile ? 'Replace Document' : 'Upload Document'}
         >
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     {currentDocumentType}
                  </label>
                  <Input
                     type="file"
                     accept=".pdf,.doc,.docx"
                     onChange={handleFileUpload}
                     className="w-full"
                  />
               </div>
               
               {uploadFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                     <p className="text-sm text-blue-800">
                        Selected: {uploadFile.name}
                     </p>
                  </div>
               )}

               <div className="flex justify-end space-x-3">
                  <Button
                     variant="outline"
                     onClick={() => {
                        setShowUploadModal(false);
                        setUploadFile(null);
                     }}
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={handleUpload}
                     disabled={!uploadFile || uploading}
                     className="bg-blue-600 hover:bg-blue-700"
                  >
                     {uploading ? 'Uploading...' : (uploadFile ? 'Replace' : 'Upload')}
                  </Button>
               </div>
            </div>
         </Modal>

         {/* Document Review Modal for DOST */}
         {selectedDocument && currentUser?.role === 'dost_mimaropa' && (
            <Modal
               isOpen={showReviewModal}
               onClose={() => {
                  setShowReviewModal(false);
                  setSelectedDocument(null);
                  setReviewComments('');
               }}
               title="Review Funding Documents"
               size="lg"
            >
               <div className="space-y-6">
                  {/* Application Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedDocument.applicationId?.enterpriseName || 'Unknown Enterprise'}
                     </h3>
                     <p className="text-sm text-gray-600 mb-3">
                        {selectedDocument.applicationId?.projectTitle || 'Unknown Project'}
                     </p>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="text-gray-500">Proponent:</span>
                           <p className="font-medium text-gray-900">
                              {selectedDocument.proponentId ? 
                                 `${selectedDocument.proponentId.firstName} ${selectedDocument.proponentId.lastName}` : 
                                 'Unknown'
                              }
                           </p>
                        </div>
                        <div>
                           <span className="text-gray-500">Status:</span>
                           <p className="font-medium text-gray-900">
                              {getStatusBadge(selectedDocument.status)}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Submitted Documents */}
                  <div>
                     <h4 className="text-lg font-medium text-gray-900 mb-4">Submitted Documents</h4>
                     <div className="space-y-3">
                        {selectedDocument.fundingDocuments?.map((doc, index) => (
                           <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                 <h5 className="font-medium text-gray-900">{doc.name}</h5>
                                 <div className="flex items-center space-x-2">
                                    {getStatusBadge(doc.documentStatus)}
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => {
                                          console.log('🔍 Viewing file:', doc.filename);
                                          // Ensure tnaId is a string, not an object
                                          const tnaId = typeof selectedDocument.tnaId === 'object' ? 
                                             selectedDocument.tnaId._id || selectedDocument.tnaId : 
                                             selectedDocument.tnaId || selectedDocument._id;
                                          const fileUrl = `http://localhost:4000/api/funding-documents/file/${tnaId}/${doc.type}`;
                                          console.log('🔍 File URL:', fileUrl, 'TNA ID:', tnaId, 'Type:', typeof tnaId);
                                          
                                          const newWindow = window.open(fileUrl, '_blank');
                                          if (!newWindow) {
                                             setToast({
                                                show: true,
                                                message: 'Unable to open file. Please check if pop-ups are blocked.',
                                                type: 'error'
                                             });
                                          }
                                       }}
                                       className="text-xs"
                                    >
                                       View
                                    </Button>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => submitDocumentReview(doc.type, 'approve', reviewComments)}
                                       disabled={isSubmitting}
                                       className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    >
                                       Approve
                                    </Button>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => submitDocumentReview(doc.type, 'reject', reviewComments)}
                                       disabled={isSubmitting}
                                       className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                    >
                                       Reject
                                    </Button>
                                 </div>
                              </div>
                              
                              {doc.filename && (
                                 <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                                    <p className="text-sm text-green-800">
                                       <strong>File:</strong> {doc.originalName || doc.filename}
                                    </p>
                                    <p className="text-xs text-green-600">
                                       Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                 </div>
                              )}

                              {doc.reviewComments && (
                                 <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                    <p className="text-sm text-yellow-800">
                                       <strong>Review Comments:</strong> {doc.reviewComments}
                                    </p>
                                    {doc.reviewedAt && (
                                       <p className="text-xs text-yellow-600">
                                          Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                       </p>
                                    )}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Review Comments */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comments
                     </label>
                     <Textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder="Enter your review comments..."
                        rows={3}
                        className="w-full"
                     />
                  </div>
               </div>
            </Modal>
         )}

         {/* Toast */}
         {/* DOST View Modal */}
         {showViewModal && selectedDocument && (
            <Modal
               isOpen={showViewModal}
               onClose={() => {
                  setShowViewModal(false);
                  setSelectedDocument(null);
               }}
               title="View Funding Documents"
               size="lg"
            >
               <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h3 className="font-medium text-gray-900 mb-2">
                        {selectedDocument.applicationId?.enterpriseName || 'N/A'}
                     </h3>
                     <p className="text-sm text-gray-600">
                        {selectedDocument.applicationId?.projectTitle || 'N/A'}
                     </p>
                     <p className="text-sm text-gray-600">
                        Proponent: {selectedDocument.proponentId ? 
                           `${selectedDocument.proponentId.firstName} ${selectedDocument.proponentId.lastName}` : 'N/A'}
                     </p>
                  </div>

                  <div className="space-y-3">
                     <h4 className="font-medium text-gray-900">Documents</h4>
                     {selectedDocument.fundingDocuments?.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                           <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{doc.name}</h5>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                 doc.documentStatus === 'submitted' ? 'bg-green-100 text-green-800' :
                                 doc.documentStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                                 doc.documentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {doc.documentStatus === 'submitted' ? 'Submitted' :
                                  doc.documentStatus === 'approved' ? 'Approved' :
                                  doc.documentStatus === 'rejected' ? 'Rejected' : 'Pending'}
                              </span>
                           </div>
                           
                           {doc.filename && (
                              <div className="space-y-2">
                                 <div className="flex items-center space-x-2">
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => {
                                          // Ensure tnaId is a string, not an object
                                          const tnaId = typeof selectedDocument.tnaId === 'object' ? 
                                             selectedDocument.tnaId._id || selectedDocument.tnaId : 
                                             selectedDocument.tnaId || selectedDocument._id;
                                          const fileUrl = `http://localhost:4000/api/funding-documents/file/${tnaId}/${doc.type}`;
                                          console.log('🔍 Viewing file with tnaId:', tnaId, 'Type:', typeof tnaId);
                                          window.open(fileUrl, '_blank');
                                       }}
                                       className="text-xs"
                                    >
                                       View File
                                    </Button>
                                    <span className="text-xs text-gray-500">
                                       {doc.originalName || doc.filename}
                                    </span>
                                 </div>
                                 
                                 {/* Review Actions for DOST */}
                                 {currentUser?.role === 'dost_mimaropa' && doc.documentStatus === 'submitted' && (
                                    <div className="flex items-center space-x-2">
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDocumentReview(doc, 'approve')}
                                          disabled={isSubmitting}
                                          className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                       >
                                          Approve
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDocumentReview(doc, 'reject')}
                                          disabled={isSubmitting}
                                          className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                       >
                                          Reject
                                       </Button>
                                    </div>
                                 )}
                              </div>
                           )}

                           {doc.reviewComments && (
                              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                                 <p className="text-xs text-yellow-800">
                                    <strong>Review Comments:</strong> {doc.reviewComments}
                                 </p>
                                 {doc.reviewedAt && (
                                    <p className="text-xs text-yellow-600">
                                       Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                                    </p>
                                 )}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </Modal>
         )}

         {/* Document Review Modal */}
         {showDocumentReviewModal && currentReviewDocument && (
            <Modal
               isOpen={showDocumentReviewModal}
               onClose={() => {
                  setShowDocumentReviewModal(false);
                  setCurrentReviewDocument(null);
                  setReviewComments('');
               }}
               title={`${reviewAction === 'approve' ? 'Approve' : 'Reject'} Document`}
               size="md"
            >
               <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h3 className="font-medium text-gray-900 mb-2">
                        {currentReviewDocument.name}
                     </h3>
                     <p className="text-sm text-gray-600">
                        Document Type: {currentReviewDocument.type}
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        {reviewAction === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Comments (Required)'}
                     </label>
                     <Textarea
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder={reviewAction === 'approve' ? 
                           'Add any comments about the approval...' : 
                           'Please explain why this document is being rejected...'
                        }
                        rows={4}
                        className="w-full"
                        required={reviewAction === 'reject'}
                     />
                  </div>

                  <div className="flex justify-end space-x-3">
                     <Button
                        variant="outline"
                        onClick={() => {
                           setShowDocumentReviewModal(false);
                           setCurrentReviewDocument(null);
                           setReviewComments('');
                        }}
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => {
                           if (reviewAction === 'reject' && !reviewComments.trim()) {
                              setToast({
                                 show: true,
                                 message: 'Please provide rejection comments',
                                 type: 'error'
                              });
                              return;
                           }
                           submitDocumentReview(currentReviewDocument.type, reviewAction, reviewComments);
                           setShowDocumentReviewModal(false);
                           setCurrentReviewDocument(null);
                           setReviewComments('');
                        }}
                        disabled={isSubmitting}
                        className={reviewAction === 'approve' ? 
                           'bg-green-600 hover:bg-green-700' : 
                           'bg-red-600 hover:bg-red-700'
                        }
                     >
                        {isSubmitting ? 'Processing...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Document`}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}

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

export default FundingDocument;
