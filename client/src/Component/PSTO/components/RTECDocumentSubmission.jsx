import React, { useState, useEffect } from 'react';
import { 
   Card, 
   Button, 
   Badge, 
   Modal, 
   Alert,
   StatusBadge,
   Input,
   Textarea
} from '../../UI';

const RTECDocumentSubmission = () => {
   const [rtecMeetings, setRtecMeetings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   const [showDocumentModal, setShowDocumentModal] = useState(false);
   const [selectedDocument, setSelectedDocument] = useState(null);
   const [uploading, setUploading] = useState(false);

   // Fetch PSTO RTEC meetings
   const fetchRTECMeetings = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch('http://localhost:4000/api/rtec/psto', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            throw new Error(`Failed to fetch RTEC meetings: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         if (result.success) {
            setRtecMeetings(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch RTEC meetings');
         }
      } catch (error) {
         console.error('Error fetching RTEC meetings:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   // Submit document
   const handleSubmitDocument = async (documentType, file, remarks = '') => {
      if (!selectedMeeting || !file) return;

      try {
         setUploading(true);
         const token = localStorage.getItem('authToken');
         
         const formData = new FormData();
         formData.append('file', file);
         formData.append('documentType', documentType);
         formData.append('remarks', remarks);

         const response = await fetch(`http://localhost:4000/api/rtec/${selectedMeeting._id}/submit-document`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: formData
         });

         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               setShowDocumentModal(false);
               setSelectedDocument(null);
               fetchRTECMeetings(); // Refresh data
               alert('Document submitted successfully!');
            } else {
               setError(result.message || 'Failed to submit document');
            }
         } else {
            throw new Error(`Failed to submit document: ${response.status} ${response.statusText}`);
         }
      } catch (error) {
         console.error('Error submitting document:', error);
         setError('Error submitting document: ' + error.message);
      } finally {
         setUploading(false);
      }
   };

   // Format date helper
   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
         return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch (error) {
         console.error('Error formatting date:', error, 'Input:', dateString);
         return 'Invalid Date';
      }
   };

   useEffect(() => {
      fetchRTECMeetings();
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-sm text-gray-500 mt-4">Loading RTEC meetings...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-xl font-bold text-gray-900">RTEC Document Submission</h1>
                  <p className="text-sm text-gray-600 mt-1">Submit required pre-meeting documents for RTEC scheduling</p>
               </div>
               <div className="flex items-center space-x-2">
                  <Button
                     onClick={fetchRTECMeetings}
                     variant="outline"
                     size="sm"
                     className="flex items-center space-x-2"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     <span>Refresh</span>
                  </Button>
                  <Badge variant="info" size="sm">
                     {rtecMeetings.length} Meeting{rtecMeetings.length !== 1 ? 's' : ''}
                  </Badge>
               </div>
            </div>
         </div>

         {/* Error Alert */}
         {error && (
            <Alert variant="error" onClose={() => setError('')}>
               {error}
            </Alert>
         )}

         {/* RTEC Meetings List */}
         <div className="space-y-4">
            {rtecMeetings.length === 0 ? (
               <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No RTEC Meetings</h3>
                  <p className="text-gray-600">No RTEC meetings requiring document submission found.</p>
               </div>
            ) : (
               rtecMeetings.map((meeting) => (
                  <Card key={meeting._id} className="p-4">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                           <h3 className="text-lg font-semibold text-gray-900">{meeting.meetingTitle}</h3>
                           <StatusBadge status={meeting.status} size="sm" />
                        </div>
                        <div className="text-sm text-gray-500">
                           Created: {formatDate(meeting.createdAt)}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Meeting Info */}
                        <div className="space-y-3">
                           <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Application</p>
                              <p className="text-sm text-gray-900">{meeting.applicationId?.applicationId || meeting.tnaId?.applicationId?.applicationId || 'N/A'}</p>
                           </div>
                           
                           <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Proponent</p>
                              <p className="text-sm text-gray-900">
                                 {meeting.proponentId?.firstName || meeting.tnaId?.proponentId?.firstName} {meeting.proponentId?.lastName || meeting.tnaId?.proponentId?.lastName}
                              </p>
                           </div>
                           
                           <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Enterprise</p>
                              <p className="text-sm text-gray-900">{meeting.applicationId?.enterpriseName || meeting.tnaId?.applicationId?.enterpriseName || 'N/A'}</p>
                           </div>
                        </div>

                        {/* Document Status */}
                        <div className="space-y-3">
                           <h4 className="text-sm font-semibold text-gray-900">Pre-Meeting Documents Status</h4>
                           <div className="space-y-2">
                              {meeting.preMeetingDocuments?.map((doc, index) => (
                                 <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                       <div className={`w-2 h-2 rounded-full ${
                                          doc.isSubmitted ? 'bg-green-500' : 'bg-orange-500'
                                       }`}></div>
                                       <span className="text-sm text-gray-700">{doc.documentName}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <Badge 
                                          variant={doc.isSubmitted ? 'success' : 'warning'} 
                                          size="sm"
                                       >
                                          {doc.isSubmitted ? 'Submitted' : 'Pending'}
                                       </Badge>
                                       {!doc.isSubmitted && (
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => {
                                                setSelectedMeeting(meeting);
                                                setSelectedDocument(doc);
                                                setShowDocumentModal(true);
                                             }}
                                             className="text-xs px-2 py-1"
                                          >
                                             Submit
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </Card>
               ))
            )}
         </div>

         {/* Document Submission Modal */}
         {showDocumentModal && selectedMeeting && selectedDocument && (
            <Modal
               isOpen={showDocumentModal}
               onClose={() => {
                  setShowDocumentModal(false);
                  setSelectedMeeting(null);
                  setSelectedDocument(null);
               }}
               title={`Submit ${selectedDocument.documentName}`}
            >
               <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                     <h4 className="text-sm font-semibold text-blue-900 mb-2">Document Requirements</h4>
                     <p className="text-xs text-blue-700">{selectedDocument.description}</p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Document
                     </label>
                     <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                           const file = e.target.files[0];
                           if (file) {
                              setSelectedDocument(prev => ({ ...prev, file }));
                           }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks (Optional)
                     </label>
                     <Textarea
                        placeholder="Add any remarks about this document..."
                        rows={3}
                        onChange={(e) => {
                           setSelectedDocument(prev => ({ ...prev, remarks: e.target.value }));
                        }}
                        className="w-full"
                     />
                  </div>

                  <div className="flex justify-end space-x-2">
                     <Button
                        variant="outline"
                        onClick={() => {
                           setShowDocumentModal(false);
                           setSelectedMeeting(null);
                           setSelectedDocument(null);
                        }}
                        disabled={uploading}
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleSubmitDocument(
                           selectedDocument.documentType, 
                           selectedDocument.file, 
                           selectedDocument.remarks
                        )}
                        disabled={!selectedDocument.file || uploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                     >
                        {uploading ? 'Submitting...' : 'Submit Document'}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}
      </div>
   );
};

export default RTECDocumentSubmission;
