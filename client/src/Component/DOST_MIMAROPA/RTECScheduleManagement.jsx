import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, ConfirmationModal, Input, Textarea, StatsCard, Alert } from '../UI';
import api from '../../config/api';

// Icon Components for better organization
const Icons = {
   // Calendar and Scheduling
   Calendar: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
   ),
   
   // Check and Confirm
   Check: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
   ),
   
   // Cross and Cancel
   Cross: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
   ),
   
   // View and Details
   Eye: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
   ),
   
   // Users and Participants
   Users: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
   ),
   
   // Email and Invitations
   Mail: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
   ),
   
   // Complete and Finish
   CheckCircle: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
   ),
   
   // RTEC Evaluation
   Clipboard: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
   ),
   
   // Star for RTEC Complete
   Star: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
   ),
   
   // Information and Info
   Info: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
   ),
   
   // Delete and Remove
   Trash: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
   )
};

const RTECScheduleManagement = () => {
   const [approvedRTECDocuments, setApprovedRTECDocuments] = useState([]);
   const [rtecMeetings, setRtecMeetings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showParticipantsModal, setShowParticipantsModal] = useState(false);
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   const [availablePSTOUsers, setAvailablePSTOUsers] = useState([]);
   const [selectedPSTOUsers, setSelectedPSTOUsers] = useState([]);
   const [showParticipantManagement, setShowParticipantManagement] = useState(false);
   const [activeInviteTab, setActiveInviteTab] = useState('invite'); // 'invite', 'manage', 'psto'
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [confirmAction, setConfirmAction] = useState(null);
   const [confirmMessage, setConfirmMessage] = useState('Are you sure you want to perform this action?');
   const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'meetings'
   const [showRTECEvaluationModal, setShowRTECEvaluationModal] = useState(false);
   const [availableDocuments, setAvailableDocuments] = useState([]);
   const [rtecEvaluationData, setRtecEvaluationData] = useState({
      meetingId: '',
      evaluationComment: '',
      recommendations: '',
      evaluationOutcome: '',
      nextSteps: '',
      documentsToRevise: []
   });

   // Form states for creating meeting
   const [formData, setFormData] = useState({
      tnaId: '',
      rtecDocumentsId: '',
      applicationId: '',
      proponentId: '',
      programName: '',
      meetingTitle: '',
      meetingDescription: '',
      scheduledDate: '',
      scheduledTime: '',
      location: '',
      meetingType: 'physical',
      virtualMeetingLink: '',
      virtualMeetingId: '',
      virtualMeetingPassword: '',
      notes: ''
   });

   const displayToast = useCallback((message, type = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
   }, []);

   // Fetch approved RTEC documents
   const fetchApprovedRTECDocuments = useCallback(async () => {
      try {
         setLoading(true);
         const response = await api.get('/rtec-documents/approved');
         
         if (response.data.success) {
            const approvedDocs = response.data.data.docs || [];
            console.log('📋 CLIENT: Received approved documents:', approvedDocs.length);
            console.log('📋 CLIENT: Document IDs:', approvedDocs.map(doc => doc._id));
            setApprovedRTECDocuments(approvedDocs);
         } else {
            setApprovedRTECDocuments([]);
         }
      } catch (error) {
         console.error('Error fetching approved RTEC documents:', error);
         displayToast('Failed to fetch approved RTEC documents', 'error');
         setApprovedRTECDocuments([]);
      } finally {
         setLoading(false);
      }
   }, [displayToast]);

   // Fetch RTEC meetings
   const fetchRTECMeetings = useCallback(async () => {
      try {
         const response = await api.get('/rtec-meetings/list');
         if (response.data.success) {
            const meetings = response.data.data.docs || [];
            console.log('📋 CLIENT: Received meetings:', meetings.length);
            console.log('📋 CLIENT: Meeting details:', meetings.map(meeting => ({
               id: meeting._id,
               rtecDocumentsId: meeting.rtecDocumentsId?._id || meeting.rtecDocumentsId,
               status: meeting.status,
               title: meeting.meetingTitle,
               applicationName: meeting.applicationId?.enterpriseName || meeting.applicationId?.companyName
            })));
            setRtecMeetings(meetings);
         }
      } catch (error) {
         console.error('Error fetching RTEC meetings:', error);
         displayToast('Failed to fetch RTEC meetings', 'error');
      }
   }, [displayToast]);

   // Fetch available PSTO users
   const fetchAvailablePSTOUsers = useCallback(async () => {
      try {
         const response = await api.get('/rtec-meetings/available-psto-users');
         if (response.data.success) {
            setAvailablePSTOUsers(response.data.data || []);
         } else {
            displayToast('Failed to fetch PSTO users: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('Error fetching PSTO users:', error);
         displayToast('Failed to fetch PSTO users: ' + (error.response?.data?.message || error.message), 'error');
      }
   }, [displayToast]);


   useEffect(() => {
      fetchApprovedRTECDocuments();
      fetchRTECMeetings();
      fetchAvailablePSTOUsers();
   }, [fetchApprovedRTECDocuments, fetchRTECMeetings, fetchAvailablePSTOUsers]);

   const handleScheduleMeeting = (rtecDocument) => {
      const newFormData = {
         tnaId: rtecDocument.tnaId?._id || rtecDocument.tnaId,
         rtecDocumentsId: rtecDocument._id,
         applicationId: rtecDocument.applicationId?._id || rtecDocument.applicationId,
         proponentId: rtecDocument.proponentId?._id || rtecDocument.proponentId,
         programName: rtecDocument.programName || 'SETUP',
         meetingTitle: `RTEC Meeting - ${rtecDocument.applicationId?.enterpriseName || 'Application'}`,
         meetingDescription: '',
         scheduledDate: '',
         scheduledTime: '',
         location: '',
         meetingType: 'physical',
         virtualMeetingLink: '',
         virtualMeetingId: '',
         virtualMeetingPassword: '',
         notes: ''
      };
      
      setFormData(newFormData);
      setShowCreateModal(true);
   };

   const handleCreateMeeting = async () => {
      try {
         // Validate required fields
         if (!formData.meetingTitle || !formData.scheduledDate || !formData.scheduledTime || !formData.location) {
            displayToast('Please fill in all required fields', 'error');
            return;
         }
         
         const response = await api.post('/rtec-meetings/create', formData);
         
         if (response.data.success) {
            displayToast('RTEC meeting scheduled successfully', 'success');
            setShowCreateModal(false);
            setFormData({
               tnaId: '',
               rtecDocumentsId: '',
               applicationId: '',
               proponentId: '',
               programName: '',
               meetingTitle: '',
               meetingDescription: '',
               scheduledDate: '',
               scheduledTime: '',
               location: '',
               meetingType: 'physical',
               virtualMeetingLink: '',
               virtualMeetingId: '',
               virtualMeetingPassword: '',
               notes: ''
            });
            fetchRTECMeetings();
            fetchApprovedRTECDocuments();
         }
      } catch (error) {
         console.error('Error creating meeting:', error);
         
         const errorMessage = error.response?.data?.message || error.message || 'Failed to create meeting';
         
         // Handle specific error cases
         if (errorMessage.includes('already scheduled')) {
            displayToast('A meeting has already been scheduled for this application. Please check the meetings list.', 'error');
         } else if (errorMessage.includes('future date')) {
            displayToast('Please select a future date for the meeting.', 'error');
         } else {
            displayToast(errorMessage, 'error');
         }
      }
   };

   const handleInviteProponent = async (meetingId) => {
      try {
         const response = await api.post(`/rtec-meetings/${meetingId}/invite-proponent`);
         if (response.data.success) {
            displayToast('Proponent invitation sent successfully', 'success');
            fetchRTECMeetings(); // Refresh meetings to show updated participants
         } else {
            displayToast('Failed to send proponent invitation: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('Error inviting proponent:', error);
         displayToast('Failed to send proponent invitation: ' + (error.response?.data?.message || error.message), 'error');
      }
   };


   const handleBulkInvitePSTO = async (meetingId) => {
      try {
         const response = await api.post(`/rtec-meetings/${meetingId}/invite-psto-bulk`, { 
            pstoIds: selectedPSTOUsers 
         });
         
         if (response.data.success) {
            displayToast(`Invitations sent to ${response.data.data.invitationsSent} PSTO users`, 'success');
            setShowInviteModal(false);
            setSelectedPSTOUsers([]);
            fetchRTECMeetings(); // Refresh meetings to show updated participants
         } else {
            displayToast('Failed to send invitations: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('Error bulk inviting PSTO:', error);
         displayToast('Failed to send bulk PSTO invitations: ' + (error.response?.data?.message || error.message), 'error');
      }
   };

   // Resend invitation to participant
   const handleResendInvitation = async (meetingId, participantId) => {
      try {
         const response = await api.post(`/rtec-meetings/${meetingId}/resend-invitation`, { 
            participantId 
         });
         if (response.data.success) {
            displayToast('Invitation resent successfully', 'success');
            fetchRTECMeetings();
         }
      } catch (error) {
         console.error('Error resending invitation:', error);
         const errorMessage = error.response?.data?.message || 'Failed to resend invitation';
         displayToast(errorMessage, 'error');
      }
   };

   // Remove participant from meeting
   const handleRemoveParticipant = async (meetingId, participantId) => {
      try {
         const response = await api.delete(`/rtec-meetings/${meetingId}/participants/${participantId}`);
         if (response.data.success) {
            displayToast('Participant removed successfully', 'success');
            fetchRTECMeetings();
         }
      } catch (error) {
         console.error('Error removing participant:', error);
         displayToast('Failed to remove participant', 'error');
      }
   };

   // Open participant management modal
   const handleManageParticipants = (meeting) => {
      setSelectedMeeting(meeting);
      setShowParticipantManagement(true);
      setActiveInviteTab('manage');
   };

   // Open PSTO invitation modal
   const handleInvitePSTOUsers = (meeting) => {
      setSelectedMeeting(meeting);
      setShowInviteModal(true);
      setActiveInviteTab('psto');
      fetchAvailablePSTOUsers();
   };

   const handleUpdateMeetingStatus = async (meetingId, status) => {
      try {
         const response = await api.patch(`/rtec-meetings/${meetingId}/status`, { status });
         if (response.data.success) {
            displayToast('Meeting status updated successfully', 'success');
            fetchRTECMeetings();
         }
      } catch (error) {
         console.error('Error updating meeting status:', error);
         displayToast('Failed to update meeting status', 'error');
      }
   };

   const handleDeleteMeeting = async (meetingId) => {
      try {
         const response = await api.delete(`/rtec-meetings/${meetingId}`);
         if (response.data.success) {
            displayToast('Meeting deleted successfully', 'success');
            fetchRTECMeetings();
         }
      } catch (error) {
         console.error('Error deleting meeting:', error);
         displayToast('Failed to delete meeting', 'error');
      }
   };

   // Handle RTEC completion with evaluation
   const handleCompleteRTEC = async (meetingId) => {
      try {
         // Find the meeting in our local state to check its current status
         const meeting = rtecMeetings.find(m => m._id === meetingId);
         if (meeting) {
            // Check if RTEC evaluation has been completed
            if (!meeting.evaluationOutcome) {
               displayToast('Please complete RTEC evaluation first before finalizing the RTEC process.', 'error');
               return;
            }
         }
         
         const response = await api.post(`/rtec-meetings/${meetingId}/complete-rtec`);
         
         if (response.data.success) {
            displayToast('RTEC completed successfully', 'success');
            fetchRTECMeetings();
            fetchApprovedRTECDocuments(); // Refresh documents to show updated status
         } else {
            displayToast('Failed to complete RTEC: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('Error completing RTEC:', error);
         displayToast('Failed to complete RTEC: ' + (error.response?.data?.message || error.message), 'error');
      }
   };

   // Open RTEC evaluation modal
   const handleOpenRTECEvaluation = async (meetingId) => {
      try {
         // Find the meeting to get the RTEC documents
         const meeting = rtecMeetings.find(m => m._id === meetingId);
         if (meeting && meeting.rtecDocumentsId) {
            // Extract the TNA ID properly - handle both string and object cases
            const tnaId = typeof meeting.tnaId === 'object' ? meeting.tnaId._id || meeting.tnaId : meeting.tnaId;
            
            if (tnaId) {
               // Fetch the RTEC documents to get available document types
               const response = await api.get(`/rtec-documents/tna/${tnaId}`);
               if (response.data.success && response.data.data) {
                  const rtecDoc = response.data.data;
                  const regularDocuments = rtecDoc.partialdocsrtec || [];
                  const additionalDocuments = rtecDoc.additionalDocumentsRequired || [];
                  
                  // Combine regular and additional documents
                  const allDocuments = [...regularDocuments, ...additionalDocuments];
                  setAvailableDocuments(allDocuments);
               }
            }
         }
         
         setRtecEvaluationData({
            meetingId: meetingId,
            evaluationComment: '',
            recommendations: '',
            evaluationOutcome: '',
            nextSteps: '',
            documentsToRevise: []
         });
         setShowRTECEvaluationModal(true);
      } catch (error) {
         console.error('Error fetching RTEC documents:', error);
         displayToast('Failed to fetch document information', 'error');
      }
   };

   // Submit RTEC evaluation
   const handleSubmitRTECEvaluation = async () => {
      let requestData;
      
      try {
         // Validate required fields
         if (!rtecEvaluationData.evaluationOutcome) {
            displayToast('Please select an evaluation outcome', 'error');
            return;
         }
         
         if (!rtecEvaluationData.evaluationComment) {
            displayToast('Please provide evaluation comments', 'error');
            return;
         }
         
         requestData = {
            evaluationData: {
               ...rtecEvaluationData,
               availableDocuments: availableDocuments
            }
         };
         
         console.log('Submitting RTEC evaluation with data:', requestData);
         
         const response = await api.post(`/rtec-meetings/${rtecEvaluationData.meetingId}/complete-rtec`, requestData);
         
         if (response.data.success) {
            if (rtecEvaluationData.evaluationOutcome === 'with revision') {
               displayToast('RTEC evaluation submitted. Document revision requirements sent to PSTO.', 'success');
               
               // Show additional message about next steps
               setTimeout(() => {
                  displayToast('PSTO will coordinate with the proponent for document resubmission and schedule a new meeting.', 'info');
               }, 2000);
            } else {
               displayToast('RTEC evaluation submitted successfully', 'success');
            }
            
            setShowRTECEvaluationModal(false);
            fetchRTECMeetings();
            fetchApprovedRTECDocuments();
         }
      } catch (error) {
         console.error('Error submitting RTEC evaluation:', error);
         console.error('Error response:', error.response?.data);
         console.error('Error status:', error.response?.status);
         console.error('Request data that failed:', requestData);
         
         const errorMessage = error.response?.data?.message || error.message || 'Failed to submit RTEC evaluation';
         displayToast(`RTEC evaluation failed: ${errorMessage}`, 'error');
      }
   };



   const approvedDocumentsColumns = [
      {
         header: 'Enterprise Name',
         key: 'applicationId',
         width: '200px',
         render: (value, item) => {
            const enterpriseName = value?.enterpriseName || item?.applicationId?.enterpriseName || 'N/A';
            const projectTitle = value?.projectTitle || item?.applicationId?.projectTitle || 'N/A';
            return (
               <div className="truncate" title={`${enterpriseName} - ${projectTitle}`}>
                  <div className="font-medium text-gray-900 truncate">
                     {enterpriseName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                     {projectTitle}
                  </div>
               </div>
            );
         }
      },
      {
         header: 'Program',
         key: 'programName',
         width: '120px',
         render: (value, item) => {
            const programName = item?.programName || value || 'SETUP';
            return <Badge color="blue">{programName}</Badge>;
         }
      },
      {
         header: 'Proponent',
         key: 'proponentId',
         width: '150px',
         render: (value, item) => {
            const proponent = item?.proponentId || value;
            const fullName = `${proponent?.firstName || ''} ${proponent?.lastName || ''}`.trim();
            const email = proponent?.email || 'N/A';
            return (
               <div className="truncate" title={`${fullName} - ${email}`}>
                  <div className="font-medium truncate">
                     {fullName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{email}</div>
               </div>
            );
         }
      },
      {
         header: 'Documents Status',
         key: 'status',
         width: '140px',
         render: (value, item) => {
            const statusConfig = {
               'documents_approved': { color: 'green', text: 'Documents Approved' },
               'documents_requested': { color: 'yellow', text: 'Documents Requested' },
               'documents_submitted': { color: 'blue', text: 'Documents Submitted' },
               'documents_under_review': { color: 'orange', text: 'Under Review' },
               'documents_rejected': { color: 'red', text: 'Documents Rejected' }
            };
            const statusValue = item?.status || value;
            const config = statusConfig[statusValue] || { color: 'gray', text: statusValue || 'Unknown' };
            return <Badge color={config.color}>{config.text}</Badge>;
         }
      },
      {
         header: 'Meeting Status',
         key: '_id',
         width: '120px',
         render: (value, item) => {
            const documentId = item._id || value;
            const hasMeeting = rtecMeetings.some(meeting => {
               return meeting.rtecDocumentsId?.toString() === documentId?.toString();
            });
            
            return hasMeeting ? (
               <Badge color="blue">Meeting Scheduled</Badge>
            ) : (
               <Badge color="yellow">No Meeting</Badge>
            );
         }
      },
      {
         header: 'Actions',
         key: '_id',
         width: '80px',
         render: (value, item) => {
            const documentId = item._id || value;
            const hasMeeting = rtecMeetings.some(meeting => {
               return meeting.rtecDocumentsId?.toString() === documentId?.toString();
            });
            
            const isApproved = item.status === 'documents_approved';
            
            return (
               <div className="flex justify-center">
                  {isApproved ? (
                     !hasMeeting ? (
                        <Button
                           size="sm"
                           variant="primary"
                           onClick={() => handleScheduleMeeting(item)}
                           className="text-xs px-2 py-1"
                           title="Schedule Meeting"
                        >
                           <Icons.Calendar />
                        </Button>
                     ) : (
                        <Button
                           size="sm"
                           variant="outline"
                           disabled
                           className="text-xs px-2 py-1"
                           title="Meeting Already Scheduled"
                        >
                           <Icons.Check />
                        </Button>
                     )
                  ) : (
                     <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="text-xs px-2 py-1"
                        title="Not Approved"
                     >
                        <Icons.Cross />
                     </Button>
                  )}
               </div>
            );
         }
      }
   ];

   const meetingsColumns = [
      {
         header: 'Meeting',
         key: 'meetingTitle',
         width: '250px',
         render: (value, item) => {
            const companyName = item.applicationId?.companyName || item.applicationId?.enterpriseName || 'N/A';
            return (
               <div className="truncate">
                  <div className="font-medium text-gray-900 truncate">{value}</div>
                  <div className="text-sm text-gray-500 truncate">{companyName}</div>
               </div>
            );
         }
      },
      {
         header: 'Date & Time',
         key: 'scheduledDate',
         width: '150px',
         render: (value, item) => {
            const dateValue = item.scheduledDate || value;
            const date = new Date(dateValue);
            const isValidDate = !isNaN(date.getTime());
            const time = item.scheduledTime || '';
            
            return (
               <div className="truncate">
                  <div className="font-medium text-gray-900">
                     {isValidDate ? date.toLocaleDateString() : 'Invalid Date'}
                  </div>
                  <div className="text-sm text-gray-500">{time}</div>
               </div>
            );
         }
      },
      {
         header: 'Location',
         key: 'location',
         width: '120px',
         render: (value, item) => (
            <div className="truncate">
               <div className="font-medium text-gray-900 truncate">{value}</div>
               <div className="text-sm text-gray-500">
                  {item.meetingType === 'virtual' ? 'Virtual' : 
                   item.meetingType === 'hybrid' ? 'Hybrid' : 'Physical'}
               </div>
            </div>
         )
      },
      {
         header: 'Status',
         key: 'status',
         width: '100px',
         render: (value, item) => {
            const statusConfig = {
               'scheduled': { color: 'blue', text: 'Scheduled' },
               'confirmed': { color: 'green', text: 'Confirmed' },
               'completed': { color: 'gray', text: 'Completed' },
               'rtec_completed': { color: 'purple', text: 'RTEC Completed' },
               'cancelled': { color: 'red', text: 'Cancelled' },
               'postponed': { color: 'yellow', text: 'Postponed' }
            };
            
            // Check if RTEC is completed
            const isRTECCompleted = item.rtecCompleted || item.status === 'rtec_completed' || (item.evaluationOutcome && item.evaluationOutcome !== '');
            const displayStatus = isRTECCompleted ? 'rtec_completed' : value;
            const config = statusConfig[displayStatus] || { color: 'gray', text: value };
            
            
            
            return <Badge color={config.color}>{config.text}</Badge>;
         }
      },
      {
         header: 'Participants',
         key: 'participants',
         width: '100px',
         render: (value) => {
            const participantCount = value?.length || 0;
            const confirmedCount = value?.filter(p => p.status === 'confirmed')?.length || 0;
            return (
               <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">{participantCount}</span>
                  <span className="text-xs text-gray-500">participants</span>
                  {confirmedCount > 0 && (
                     <div className="ml-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           {confirmedCount} confirmed
                        </span>
                     </div>
                  )}
               </div>
            );
         }
      },
      {
         header: 'Actions',
         key: '_id',
         width: '200px',
         render: (value, item) => {
            
            return (
            <div className="flex gap-1 flex-wrap">
               {/* 1. View Details - Eye Icon */}
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                     setSelectedMeeting(item);
                     setShowParticipantsModal(true);
                  }}
                  className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                  title="View Details"
               >
                  <Icons.Eye />
               </Button>
               
               {/* 2. Manage Participants - Users Icon */}
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManageParticipants(item)}
                  className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                  title="Manage Participants"
               >
                  <Icons.Users />
               </Button>
               
               {/* 3. Invite PSTO Users - Mail Icon */}
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitePSTOUsers(item)}
                  className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                  title="Invite PSTO Users"
               >
                  <Icons.Mail />
               </Button>
               
               {/* 4. Confirm Meeting - Blue Button with Check Icon */}
               {item.status === 'scheduled' && (
                  <Button
                     size="sm"
                     variant="primary"
                     onClick={() => {
                        setConfirmMessage('Are you sure you want to confirm this meeting?');
                        setConfirmAction(() => () => handleUpdateMeetingStatus(item._id, 'confirmed'));
                        setShowConfirmModal(true);
                     }}
                     className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                     title="Confirm Meeting"
                  >
                     <Icons.Check />
                  </Button>
               )}
               
               {/* 5. Complete Meeting - CheckCircle Icon */}
               {item.status === 'confirmed' && (
                  <Button
                     size="sm"
                     variant="primary"
                     onClick={() => {
                        setConfirmMessage('Are you sure you want to mark this meeting as completed?');
                        setConfirmAction(() => () => handleUpdateMeetingStatus(item._id, 'completed'));
                        setShowConfirmModal(true);
                     }}
                     className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                     title="Complete Meeting"
                  >
                     <Icons.CheckCircle />
                  </Button>
               )}
               
               {/* RTEC Evaluation Section - Show different buttons based on RTEC status */}
               {(() => {
                  const isRTECCompleted = item.rtecCompleted || item.status === 'rtec_completed' || (item.evaluationOutcome && item.evaluationOutcome !== '');
                  const canDoRTECEvaluation = (item.status === 'completed' || item.status === 'confirmed' || item.status === 'scheduled') && !isRTECCompleted;
                  
                  // Debug logging for RTEC completion status
                  console.log('🔍 RTEC Button Debug for meeting:', item.meetingTitle);
                  console.log('🔍 Meeting status:', item.status);
                  console.log('🔍 rtecCompleted:', item.rtecCompleted);
                  console.log('🔍 evaluationOutcome:', item.evaluationOutcome);
                  console.log('🔍 isRTECCompleted:', isRTECCompleted);
                  console.log('🔍 canDoRTECEvaluation:', canDoRTECEvaluation);
                  
                  if (isRTECCompleted) {
                     // Show "View RTEC Evaluation" for completed RTEC
                     return (
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleOpenRTECEvaluation(item._id)}
                           className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                           title="View RTEC Evaluation"
                        >
                           <Icons.Clipboard />
                        </Button>
                     );
                  } else if (canDoRTECEvaluation) {
                     // Show RTEC Evaluation and Complete RTEC buttons for incomplete RTEC
                     return (
                        <>
                           {/* RTEC Evaluation - Clipboard Icon */}
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRTECEvaluation(item._id)}
                              className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                              title="RTEC Evaluation"
                           >
                              <Icons.Clipboard />
                           </Button>
                           
                           {/* Complete RTEC - Star Icon (Blue when ready) */}
                           <Button
                              size="sm"
                              variant={item.evaluationOutcome ? "primary" : "outline"}
                              onClick={() => {
                                 // Check if RTEC evaluation has been completed
                                 if (!item.evaluationOutcome) {
                                    displayToast('Please complete RTEC evaluation first before finalizing the RTEC process.', 'error');
                                    return;
                                 }
                                 
                                 const message = item.status === 'confirmed' 
                                    ? 'Are you sure you want to complete the RTEC process for this meeting? This will automatically mark the meeting as completed and finalize the RTEC evaluation.'
                                    : 'Are you sure you want to complete the RTEC process for this meeting? This will finalize the RTEC evaluation.';
                                 setConfirmMessage(message);
                                 setConfirmAction(() => () => handleCompleteRTEC(item._id));
                                 setShowConfirmModal(true);
                              }}
                              className={`text-xs px-2 py-1 ${
                                 item.evaluationOutcome 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                                    : 'border-gray-300 hover:bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                              title={item.evaluationOutcome ? "Complete RTEC" : "Complete RTEC (Evaluation Required First)"}
                              disabled={!item.evaluationOutcome}
                           >
                              <Icons.Star />
                           </Button>
                        </>
                     );
                  }
                  return null;
               })()}
               
               {/* 8. Delete Meeting - Red Button with Trash Icon */}
               <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                     setConfirmMessage('Are you sure you want to delete this meeting? This action cannot be undone.');
                     setConfirmAction(() => () => handleDeleteMeeting(item._id));
                     setShowConfirmModal(true);
                  }}
                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                  title="Delete Meeting"
               >
                  <Icons.Trash />
               </Button>
            </div>
            );
         }
      }
   ];


   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-light text-gray-900">RTEC Management</h1>
               <p className="text-gray-500 mt-1">Schedule and evaluate RTEC meetings</p>
            </div>
            <Button
               onClick={() => setShowCreateModal(true)}
               className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium"
            >
               + New Meeting
            </Button>
         </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{rtecMeetings.filter(m => m.status !== 'rtec_revision_requested').length}</div>
                <div className="text-sm text-gray-500">Total Meetings</div>
             </div>
             <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{rtecMeetings.filter(m => m.status === 'scheduled').length}</div>
                <div className="text-sm text-gray-500">Scheduled</div>
             </div>
             <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{rtecMeetings.filter(m => m.status === 'confirmed').length}</div>
                <div className="text-sm text-gray-500">Confirmed</div>
             </div>
             <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{rtecMeetings.filter(m => m.rtecCompleted || m.status === 'rtec_completed').length}</div>
                <div className="text-sm text-gray-500">Completed</div>
             </div>
          </div>

         {/* Tab Navigation */}
         <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
                <button
                   onClick={() => setActiveTab('meetings')}
                   className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'meetings'
                         ? 'border-blue-500 text-blue-600'
                         : 'border-transparent text-gray-500 hover:text-gray-700'
                   }`}
                >
                   Meetings ({rtecMeetings.filter(m => m.status !== 'rtec_revision_requested').length})
                </button>
               <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'documents'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
               >
                  Documents ({approvedRTECDocuments.length})
               </button>
            </nav>
         </div>

         {/* Tab Content */}
         {activeTab === 'documents' && (
            <Card>
               <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <h2 className="text-lg font-semibold">Approved RTEC Documents</h2>
                        <p className="text-sm text-gray-600 mt-1">
                           Documents ready for meeting scheduling ({(() => {
                              const readyDocs = approvedRTECDocuments.filter(doc => {
                                 const documentMeetings = rtecMeetings.filter(meeting => {
                                    const meetingDocId = meeting.rtecDocumentsId?._id?.toString() || meeting.rtecDocumentsId?.toString();
                                    const docId = doc._id?.toString();
                                    return meetingDocId === docId;
                                 });
                                 
                                 if (documentMeetings.length === 0) return true;
                                 
                                 const hasActiveMeeting = documentMeetings.some(meeting => 
                                    ['scheduled', 'confirmed', 'completed'].includes(meeting.status) && !meeting.rtecCompleted
                                 );
                                 
                                 if (hasActiveMeeting) return false;
                                 
                                 const hasEndorsedMeeting = documentMeetings.some(meeting => 
                                    meeting.status === 'rtec_endorsed_for_approval'
                                 );
                                 
                                 if (hasEndorsedMeeting) return false;
                                 
                                 const hasRevisionRequestedMeeting = documentMeetings.some(meeting => 
                                    meeting.status === 'rtec_revision_requested'
                                 );
                                 
                                 return hasRevisionRequestedMeeting;
                              });
                              return readyDocs.length;
                           })()} ready)
                        </p>
                     </div>
                     <div className="flex space-x-2">
                        <Button
                           variant="outline" 
                           onClick={fetchApprovedRTECDocuments}
                        >
                           Refresh
                        </Button>
                     </div>
                  </div>
               
               {/* Info Alert */}
               {!loading && approvedRTECDocuments.length > 0 && (() => {
                  // Show documents that are ready for scheduling
                  const documentsNeedingScheduling = approvedRTECDocuments.filter(doc => {
                     const documentMeetings = rtecMeetings.filter(meeting => {
                        const meetingDocId = meeting.rtecDocumentsId?._id?.toString() || meeting.rtecDocumentsId?.toString();
                        const docId = doc._id?.toString();
                        return meetingDocId === docId;
                     });
                     
                     if (documentMeetings.length === 0) return true;
                     
                     const hasActiveMeeting = documentMeetings.some(meeting => 
                        ['scheduled', 'confirmed', 'completed'].includes(meeting.status) && !meeting.rtecCompleted
                     );
                     
                     if (hasActiveMeeting) return false;
                     
                     const hasEndorsedMeeting = documentMeetings.some(meeting => 
                        meeting.status === 'rtec_endorsed_for_approval'
                     );
                     
                     if (hasEndorsedMeeting) return false;
                     
                     const hasRevisionRequestedMeeting = documentMeetings.some(meeting => 
                        meeting.status === 'rtec_revision_requested'
                     );
                     
                     return hasRevisionRequestedMeeting;
                  });
                  
                  return documentsNeedingScheduling.length > 0 && (
                     <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                           <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                           </div>
                           <div className="ml-3">
                              <p className="text-sm text-green-800">
                                 <strong>{documentsNeedingScheduling.length} approved document(s)</strong> are ready for meeting scheduling. 
                                 Click "Schedule Meeting" to create a meeting for each approved application.
                              </p>
                           </div>
                        </div>
                     </div>
                  );
               })()}
               
               {!loading && approvedRTECDocuments.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="ml-3">
                           <p className="text-sm text-yellow-800">
                              <strong>No approved documents found.</strong> Documents must be approved before they can be scheduled for meetings.
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               
               {loading ? (
                  <div className="flex justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
               ) : (
                  (() => {
                     // Show only documents that don't have meetings yet
                     console.log('🔍 CLIENT FILTERING: Starting client-side filtering...');
                     console.log('🔍 CLIENT FILTERING: Total approved documents:', approvedRTECDocuments.length);
                     console.log('🔍 CLIENT FILTERING: Total meetings:', rtecMeetings.length);
                     
                     const filteredDocs = approvedRTECDocuments.filter(doc => {
                        // Check if this document has any meeting
                        const documentMeetings = rtecMeetings.filter(meeting => {
                           const meetingDocId = meeting.rtecDocumentsId?._id?.toString() || meeting.rtecDocumentsId?.toString();
                           const docId = doc._id?.toString();
                           return meetingDocId === docId;
                        });
                        
                        console.log('🔍 CLIENT FILTERING: Document', doc._id, 'meetings:', documentMeetings.length);
                        console.log('🔍 CLIENT FILTERING: Document meetings details:', documentMeetings.map(m => ({
                           id: m._id,
                           status: m.status,
                           rtecDocumentsId: m.rtecDocumentsId?._id || m.rtecDocumentsId
                        })));
                        
                        if (documentMeetings.length === 0) {
                           // No meeting yet - show for scheduling
                           console.log('🔍 CLIENT FILTERING: Document', doc._id, 'INCLUDED (no meeting)');
                           return true;
                        }
                        
                        // Check if any meeting is in revision_requested status (ready for rescheduling)
                        const hasRevisionRequestedMeeting = documentMeetings.some(meeting => 
                           meeting.status === 'rtec_revision_requested'
                        );
                        
                        // Check if any meeting is active (scheduled, confirmed, completed but not rtec_completed)
                        const hasActiveMeeting = documentMeetings.some(meeting => 
                           ['scheduled', 'confirmed', 'completed'].includes(meeting.status) && !meeting.rtecCompleted
                        );
                        
                        // Check if any meeting is endorsed for approval (proceeds directly to funding)
                        const hasEndorsedMeeting = documentMeetings.some(meeting => 
                           meeting.status === 'rtec_endorsed_for_approval'
                        );
                        
                        if (hasActiveMeeting) {
                           console.log('🔍 CLIENT FILTERING: Document', doc._id, 'FILTERED OUT (has active meeting)');
                           return false;
                        }
                        
                        if (hasEndorsedMeeting) {
                           console.log('🔍 CLIENT FILTERING: Document', doc._id, 'FILTERED OUT (endorsed for approval - proceeds to funding)');
                           return false;
                        }
                        
                        if (hasRevisionRequestedMeeting) {
                           console.log('🔍 CLIENT FILTERING: Document', doc._id, 'INCLUDED (revision requested - ready for rescheduling)');
                           return true;
                        }
                        
                        // All meetings are completed - don't show
                        console.log('🔍 CLIENT FILTERING: Document', doc._id, 'FILTERED OUT (all meetings completed)');
                        return false;
                     });
                     
                     console.log('🔍 CLIENT FILTERING: Filtered documents count:', filteredDocs.length);
                     console.log('🔍 CLIENT FILTERING: Filtered document IDs:', filteredDocs.map(doc => doc._id));
                     
                     return (
                        <DataTable
                           data={filteredDocs}
                           columns={approvedDocumentsColumns}
                           searchable={true}
                           pagination={true}
                        />
                     );
                  })()
               )}
               </div>
            </Card>
         )}

         {/* RTEC Meetings Tab */}
         {activeTab === 'meetings' && (
            <div className="bg-white rounded-lg border border-gray-200">
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-medium text-gray-900">Meetings</h2>
                     <Button
                        variant="outline"
                        onClick={fetchRTECMeetings}
                        className="text-sm"
                     >
                        Refresh
                     </Button>
                  </div>
               
                  {loading ? (
                     <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                     </div>
                   ) : (
                      <DataTable
                         data={rtecMeetings.filter(meeting => meeting.status !== 'rtec_revision_requested')}
                         columns={meetingsColumns}
                         searchable={true}
                         pagination={true}
                      />
                   )}
               </div>
            </div>
         )}

         {/* Create Meeting Modal */}
         <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Schedule RTEC Meeting"
            size="lg"
         >
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Meeting Title
                  </label>
                  <Input
                     value={formData.meetingTitle}
                     onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                     placeholder="Enter meeting title"
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Meeting Description
                  </label>
                  <Textarea
                     value={formData.meetingDescription}
                     onChange={(e) => setFormData({ ...formData, meetingDescription: e.target.value })}
                     placeholder="Enter meeting description"
                     rows={3}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Date
                     </label>
                     <Input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Time
                     </label>
                     <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        required
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Location
                  </label>
                  <Input
                     value={formData.location}
                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                     placeholder="Enter meeting location"
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Meeting Type
                  </label>
                  <select
                     value={formData.meetingType}
                     onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="physical">Physical</option>
                     <option value="virtual">Virtual</option>
                     <option value="hybrid">Hybrid</option>
                  </select>
               </div>

               {formData.meetingType === 'virtual' || formData.meetingType === 'hybrid' ? (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Virtual Meeting Link
                        </label>
                        <Input
                           value={formData.virtualMeetingLink}
                           onChange={(e) => setFormData({ ...formData, virtualMeetingLink: e.target.value })}
                           placeholder="Enter meeting link"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Meeting ID
                           </label>
                           <Input
                              value={formData.virtualMeetingId}
                              onChange={(e) => setFormData({ ...formData, virtualMeetingId: e.target.value })}
                              placeholder="Enter meeting ID"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password
                           </label>
                           <Input
                              value={formData.virtualMeetingPassword}
                              onChange={(e) => setFormData({ ...formData, virtualMeetingPassword: e.target.value })}
                              placeholder="Enter password"
                           />
                        </div>
                     </div>
                  </div>
               ) : null}

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Notes
                  </label>
                  <Textarea
                     value={formData.notes}
                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                     placeholder="Enter additional notes"
                     rows={3}
                  />
               </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
               <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
               >
                  Cancel
               </Button>
               <Button
                  onClick={() => {
                     setConfirmMessage('Are you sure you want to schedule this RTEC meeting?');
                     setConfirmAction(() => () => handleCreateMeeting());
                     setShowConfirmModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
               >
                  Schedule Meeting
               </Button>
            </div>
         </Modal>

         {/* Participants Modal */}
         <Modal
            isOpen={showParticipantsModal}
            onClose={() => setShowParticipantsModal(false)}
            title="Meeting Participants"
            size="lg"
         >
            {selectedMeeting && (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
                        <p className="text-sm text-gray-900">{selectedMeeting.meetingTitle}</p>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                        <p className="text-sm text-gray-900">
                           {new Date(selectedMeeting.scheduledDate).toLocaleDateString()} at {selectedMeeting.scheduledTime}
                        </p>
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Participants</label>
                     <div className="mt-2 space-y-2">
                        {selectedMeeting.participants?.map((participant, index) => (
                           <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <p className="font-medium">
                                    {participant.userId?.firstName} {participant.userId?.lastName}
                                 </p>
                                 <p className="text-sm text-gray-500">{participant.userId?.email}</p>
                              </div>
                              <Badge color={participant.status === 'confirmed' ? 'green' : 'yellow'}>
                                 {participant.status}
                              </Badge>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </Modal>

         {/* Enhanced Participant Management Modal */}
         <Modal
            isOpen={showInviteModal || showParticipantManagement}
            onClose={() => {
               setShowInviteModal(false);
               setShowParticipantManagement(false);
               setActiveInviteTab('invite');
               setSelectedPSTOUsers([]);
            }}
            title="Participant Management"
            size="xl"
         >
            <div className="space-y-6">
               {/* Tab Navigation */}
               <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                     <button
                        onClick={() => setActiveInviteTab('invite')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                           activeInviteTab === 'invite'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                     >
                        Invite Proponent
                     </button>
                     <button
                        onClick={() => setActiveInviteTab('manage')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                           activeInviteTab === 'manage'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                     >
                        Manage Participants
                     </button>
                     <button
                        onClick={() => setActiveInviteTab('psto')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                           activeInviteTab === 'psto'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                     >
                        Invite PSTO Users
                     </button>
                  </nav>
               </div>

               {/* Invite Proponent Tab */}
               {activeInviteTab === 'invite' && (
                  <div className="space-y-4">
                     <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900">Invite Proponent</h3>
                        <p className="text-sm text-blue-700 mt-1">
                           Send meeting invitation to the proponent of this application.
                        </p>
                     </div>
                     <div className="flex justify-end">
                        <Button
                           onClick={() => {
                              if (selectedMeeting) {
                                 setConfirmMessage('Are you sure you want to send an invitation to the proponent?');
                                 setConfirmAction(() => () => handleInviteProponent(selectedMeeting._id));
                                 setShowConfirmModal(true);
                              }
                           }}
                           className="bg-green-600 hover:bg-green-700"
                        >
                           Send Proponent Invitation
                        </Button>
                     </div>
                  </div>
               )}

               {/* Manage Participants Tab */}
               {activeInviteTab === 'manage' && selectedMeeting && (
                  <div className="space-y-4">
                     <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-medium text-yellow-900">Manage Existing Participants</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                           View, resend invitations, or remove participants from this meeting.
                        </p>
                     </div>
                     
                     <div className="space-y-3">
                        {selectedMeeting.participants?.map((participant, index) => (
                           <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-3">
                                    <div>
                                       <p className="font-medium text-gray-900">
                                          {participant.userId?.firstName} {participant.userId?.lastName}
                                       </p>
                                       <p className="text-sm text-gray-500">{participant.userId?.email}</p>
                                    </div>
                                    <Badge color={participant.status === 'confirmed' ? 'green' : participant.status === 'declined' ? 'red' : 'yellow'}>
                                       {participant.status}
                                    </Badge>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                       setConfirmMessage(`Are you sure you want to resend invitation to ${participant.userId?.firstName} ${participant.userId?.lastName}?`);
                                       setConfirmAction(() => () => handleResendInvitation(selectedMeeting._id, participant.userId._id));
                                       setShowConfirmModal(true);
                                    }}
                                    disabled={participant.status === 'confirmed'}
                                 >
                                    Resend
                                 </Button>
                                 <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
                                       setConfirmMessage(`Are you sure you want to remove ${participant.userId?.firstName} ${participant.userId?.lastName} from this meeting?`);
                                       setConfirmAction(() => () => handleRemoveParticipant(selectedMeeting._id, participant.userId._id));
                                       setShowConfirmModal(true);
                                    }}
                                 >
                                    Remove
                                 </Button>
                              </div>
                           </div>
                        ))}
                        {(!selectedMeeting.participants || selectedMeeting.participants.length === 0) && (
                           <div className="text-center py-8 text-gray-500">
                              No participants found. Invite participants using the other tabs.
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Invite PSTO Users Tab */}
               {activeInviteTab === 'psto' && (
                  <div className="space-y-4">
                     <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900">Invite PSTO Users</h3>
                        <p className="text-sm text-blue-700 mt-1">
                           Select PSTO users to invite to this meeting.
                        </p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Select PSTO Users to Invite
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                           {availablePSTOUsers.map((user) => (
                              <div key={user._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                 <input
                                    type="checkbox"
                                    id={`psto-${user._id}`}
                                    checked={selectedPSTOUsers.includes(user._id)}
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                          setSelectedPSTOUsers([...selectedPSTOUsers, user._id]);
                                       } else {
                                          setSelectedPSTOUsers(selectedPSTOUsers.filter(id => id !== user._id));
                                       }
                                    }}
                                    className="rounded border-gray-300"
                                 />
                                 <label htmlFor={`psto-${user._id}`} className="flex-1 cursor-pointer">
                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                 </label>
                              </div>
                           ))}
                           {availablePSTOUsers.length === 0 && (
                              <div className="text-center py-4 text-gray-500">
                                 No PSTO users available
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex justify-end space-x-3">
                        <Button
                           variant="outline"
                           onClick={() => {
                              setShowInviteModal(false);
                              setShowParticipantManagement(false);
                              setSelectedPSTOUsers([]);
                           }}
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={() => {
                              if (selectedMeeting && selectedPSTOUsers.length > 0) {
                                 setConfirmMessage(`Are you sure you want to send invitations to ${selectedPSTOUsers.length} PSTO users?`);
                                 setConfirmAction(() => () => handleBulkInvitePSTO(selectedMeeting._id));
                                 setShowConfirmModal(true);
                              }
                           }}
                           disabled={selectedPSTOUsers.length === 0}
                        >
                           Send Invitations ({selectedPSTOUsers.length})
                        </Button>
                     </div>
                  </div>
               )}
            </div>
         </Modal>

         {/* Confirmation Modal */}
         <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
               setShowConfirmModal(false);
               setConfirmMessage('Are you sure you want to perform this action?');
            }}
            onConfirm={() => {
               if (confirmAction) {
                  confirmAction();
               }
               setShowConfirmModal(false);
               setConfirmMessage('Are you sure you want to perform this action?');
            }}
            title="Confirm Action"
            message={confirmMessage}
         />

         {/* RTEC Evaluation Modal */}
         <Modal
            isOpen={showRTECEvaluationModal}
            onClose={() => setShowRTECEvaluationModal(false)}
            title={rtecEvaluationData.meetingId === 'test-meeting-id' ? "RTEC Evaluation Form" : "RTEC Evaluation Details"}
            size="lg"
         >
            <div className="space-y-4">
               <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">RTEC Evaluation</h3>
                  <p className="text-sm text-blue-700 mt-1">
                     Please provide your evaluation and recommendations for this RTEC meeting.
                  </p>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Evaluation Outcome <span className="text-red-500">*</span>
                  </label>
                  <select
                     value={rtecEvaluationData.evaluationOutcome}
                     onChange={(e) => {
                        const selectedOutcome = e.target.value;
                        let documentsToRevise = [];
                        
                        // Auto-select "Response to RTEC Comments" for endorsed outcomes
                        if (selectedOutcome === 'endorsed for approval (with comment)') {
                           documentsToRevise = ['response to rtec comments'];
                        }
                        
                        setRtecEvaluationData({
                           ...rtecEvaluationData,
                           evaluationOutcome: selectedOutcome,
                           documentsToRevise: documentsToRevise
                        });
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  >
                     <option value="">Select Outcome</option>
                     <option value="with revision">With Revision</option>
                     <option value="approved">Approved</option>
                     <option value="endorsed for approval (with comment)">Endorsed for Approval with Comment</option>
                  </select>
               </div>

               {/* Additional Document Requirements for "Endorsed for Approval (with Comment)" */}
               {rtecEvaluationData.evaluationOutcome === 'endorsed for approval (with comment)' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <div className="flex items-center mb-3">
                        <Icons.Info className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-blue-800">Additional Document Requirements</h4>
                     </div>
                     <p className="text-sm text-blue-700 mb-3">
                        For "Endorsed for Approval (with Comment)" outcome, the proponent will need to submit additional documents 
                        to address the specific comments before proceeding to funding.
                     </p>
                     <div className="text-xs text-blue-600">
                        <strong>Note:</strong> The selected documents above will be marked as requiring additional 
                        documentation or clarification from the proponent.
                     </div>
                  </div>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Evaluation Comment by the RTEC Committee <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                     value={rtecEvaluationData.evaluationComment}
                     onChange={(e) => setRtecEvaluationData({...rtecEvaluationData, evaluationComment: e.target.value})}
                     placeholder="Provide detailed evaluation comments..."
                     rows={4}
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Recommendations
                  </label>
                  <Textarea
                     value={rtecEvaluationData.recommendations}
                     onChange={(e) => setRtecEvaluationData({...rtecEvaluationData, recommendations: e.target.value})}
                     placeholder="Provide recommendations for improvement..."
                     rows={3}
                  />
               </div>

               {/* Document Selection - Show for both "with revision" and "endorsed for approval (with comment)" */}
               {(rtecEvaluationData.evaluationOutcome === 'with revision' || rtecEvaluationData.evaluationOutcome === 'endorsed for approval (with comment)') && (
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        {rtecEvaluationData.evaluationOutcome === 'with revision' 
                           ? 'Select Documents That Need Revision'
                           : 'Select Documents That Need Comments/Revisions'
                        }
                     </label>
                     <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {availableDocuments.map((doc, index) => (
                           <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <input
                                 type="checkbox"
                                 id={`doc-${index}`}
                                 checked={rtecEvaluationData.documentsToRevise.includes(doc.type)}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setRtecEvaluationData({
                                          ...rtecEvaluationData,
                                          documentsToRevise: [...rtecEvaluationData.documentsToRevise, doc.type]
                                       });
                                    } else {
                                       setRtecEvaluationData({
                                          ...rtecEvaluationData,
                                          documentsToRevise: rtecEvaluationData.documentsToRevise.filter(type => type !== doc.type)
                                       });
                                    }
                                 }}
                                 className="rounded border-gray-300"
                              />
                              <label htmlFor={`doc-${index}`} className="flex-1 cursor-pointer">
                                 <div className="flex items-center gap-2">
                                    <div className="font-medium">{doc.name}</div>
                                    {doc.documentStatus === 'pending' && doc.reason && (
                                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Additional Required
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-sm text-gray-500">{doc.description}</div>
                                 {doc.reason && (
                                    <div className="text-sm text-blue-600 mt-1">
                                       <strong>Reason:</strong> {doc.reason}
                                    </div>
                                 )}
                                 <div className="text-xs text-gray-400 mt-1">
                                    Status: <span className={`font-medium ${
                                       doc.documentStatus === 'approved' ? 'text-green-600' : 
                                       doc.documentStatus === 'rejected' ? 'text-red-600' : 
                                       doc.documentStatus === 'pending' ? 'text-blue-600' :
                                       'text-yellow-600'
                                    }`}>{doc.documentStatus}</span>
                                 </div>
                              </label>
                           </div>
                        ))}
                        {availableDocuments.length === 0 && (
                           <div className="text-center py-4 text-gray-500">
                              No documents available for selection
                           </div>
                        )}
                     </div>
                     <p className="text-xs text-gray-600 mt-2">
                        {rtecEvaluationData.evaluationOutcome === 'with revision' 
                           ? 'Select the specific documents that need to be revised and resubmitted.'
                           : 'Select the specific documents that need minor comments or revisions addressed.'
                        }
                     </p>
                  </div>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Next Steps
                  </label>
                  <Textarea
                     value={rtecEvaluationData.nextSteps}
                     onChange={(e) => setRtecEvaluationData({...rtecEvaluationData, nextSteps: e.target.value})}
                     placeholder="Outline the next steps for the proponent..."
                     rows={3}
                  />
               </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
               <Button
                  variant="outline"
                  onClick={() => setShowRTECEvaluationModal(false)}
               >
                  Cancel
               </Button>
               <Button
                  onClick={handleSubmitRTECEvaluation}
                  className="bg-blue-600 hover:bg-blue-700"
               >
                  Submit RTEC Evaluation
               </Button>
            </div>
         </Modal>

         {/* Toast */}
         <Toast
            isVisible={showToast}
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
         />
      </div>
   );
};

export default RTECScheduleManagement;
