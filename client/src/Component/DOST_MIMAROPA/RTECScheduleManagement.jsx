import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, ConfirmationModal, Input, Textarea, StatsCard, Alert } from '../UI';
import api from '../../config/api';

const RTECScheduleManagement = () => {
   const [approvedRTECDocuments, setApprovedRTECDocuments] = useState([]);
   const [rtecMeetings, setRtecMeetings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showParticipantsModal, setShowParticipantsModal] = useState(false);
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   // const [selectedRTECDocument, setSelectedRTECDocument] = useState(null);
   const [availablePSTOUsers, setAvailablePSTOUsers] = useState([]);
   const [selectedPSTOUsers, setSelectedPSTOUsers] = useState([]);
   const [showParticipantManagement, setShowParticipantManagement] = useState(false);
   const [activeInviteTab, setActiveInviteTab] = useState('invite'); // 'invite', 'manage', 'psto'
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [confirmAction, setConfirmAction] = useState(null);
   const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'meetings'

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
         console.log('=== FETCHING APPROVED RTEC DOCUMENTS ===');
         setLoading(true);
         const response = await api.get('/rtec-documents/approved');
         console.log('Approved RTEC Documents Response:', response.data);
         if (response.data.success) {
            const approvedDocs = response.data.data.docs || [];
            console.log('Approved RTEC Documents:', approvedDocs);
            console.log('Setting approved documents to state...');
            
            // Debug each approved document
            approvedDocs.forEach((doc, index) => {
               console.log(`\n=== Approved Document ${index + 1} ===`);
               console.log('Full document:', doc);
               console.log('applicationId:', doc.applicationId);
               console.log('proponentId:', doc.proponentId);
               console.log('status:', doc.status);
               console.log('programName:', doc.programName);
               
               if (doc.applicationId) {
                  console.log('applicationId.enterpriseName:', doc.applicationId.enterpriseName);
                  console.log('applicationId.projectTitle:', doc.applicationId.projectTitle);
                  console.log('applicationId keys:', Object.keys(doc.applicationId));
               } else {
                  console.log('❌ applicationId is null/undefined');
               }
               
               if (doc.proponentId) {
                  console.log('proponentId.firstName:', doc.proponentId.firstName);
                  console.log('proponentId.lastName:', doc.proponentId.lastName);
                  console.log('proponentId.email:', doc.proponentId.email);
                  console.log('proponentId keys:', Object.keys(doc.proponentId));
               } else {
                  console.log('❌ proponentId is null/undefined');
               }
            });
            
            setApprovedRTECDocuments(approvedDocs);
            console.log('State updated with approved documents');
         }
      } catch (error) {
         console.error('Error fetching approved RTEC documents:', error);
         displayToast('Failed to fetch approved RTEC documents', 'error');
      } finally {
         setLoading(false);
      }
   }, [displayToast]);

   // Fetch RTEC meetings
   const fetchRTECMeetings = useCallback(async () => {
      try {
         const response = await api.get('/rtec-meetings/list');
         console.log('=== FETCH RTEC MEETINGS RESPONSE ===');
         console.log('Full response:', response.data);
         console.log('Meetings data:', response.data.data.docs);
         
         if (response.data.success) {
            const meetings = response.data.data.docs || [];
            console.log('Number of meetings:', meetings.length);
            meetings.forEach((meeting, index) => {
               console.log(`Meeting ${index + 1}:`, {
                  id: meeting._id,
                  title: meeting.meetingTitle,
                  rtecDocumentsId: meeting.rtecDocumentsId,
                  scheduledDate: meeting.scheduledDate,
                  scheduledTime: meeting.scheduledTime,
                  location: meeting.location
               });
            });
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
         console.log('🔍 Fetching available PSTO users...');
         const response = await api.get('/rtec-meetings/available-psto-users');
         console.log('📡 PSTO users response:', response.data);
         if (response.data.success) {
            console.log('✅ PSTO users fetched successfully:', response.data.data);
            setAvailablePSTOUsers(response.data.data || []);
         } else {
            console.log('❌ PSTO users fetch failed:', response.data.message);
            displayToast('Failed to fetch PSTO users: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('💥 Error fetching PSTO users:', error);
         console.error('💥 Error response:', error.response?.data);
         console.error('💥 Error status:', error.response?.status);
         displayToast('Failed to fetch PSTO users: ' + (error.response?.data?.message || error.message), 'error');
      }
   }, [displayToast]);

   // Fetch meeting participants
   // const fetchMeetingParticipants = async (meetingId) => {
   //    try {
   //       const response = await api.get(`/rtec-meetings/${meetingId}/participants`);
   //       if (response.data.success) {
   //          return response.data.data;
   //       }
   //    } catch (error) {
   //       console.error('Error fetching participants:', error);
   //       displayToast('Failed to fetch participants', 'error');
   //    }
   //    return [];
   // };

   useEffect(() => {
      console.log('=== COMPONENT MOUNTED - FETCHING DATA ===');
      fetchApprovedRTECDocuments();
      fetchRTECMeetings();
      fetchAvailablePSTOUsers();
   }, [fetchApprovedRTECDocuments, fetchRTECMeetings, fetchAvailablePSTOUsers]);

   const handleScheduleMeeting = (rtecDocument) => {
      console.log('=== HANDLE SCHEDULE MEETING ===');
      console.log('RTEC Document:', rtecDocument);
      console.log('TNA ID:', rtecDocument.tnaId?._id || rtecDocument.tnaId);
      console.log('Application ID:', rtecDocument.applicationId?._id || rtecDocument.applicationId);
      console.log('Proponent ID:', rtecDocument.proponentId?._id || rtecDocument.proponentId);
      console.log('Current showCreateModal state:', showCreateModal);
      
      // setSelectedRTECDocument(rtecDocument);
      setFormData({
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
      });
      console.log('Setting showCreateModal to true');
      setShowCreateModal(true);
      console.log('showCreateModal should now be true');
   };

   const handleCreateMeeting = async () => {
      try {
         console.log('=== CREATE MEETING DEBUG ===');
         console.log('Form Data:', formData);
         console.log('TNA ID being sent:', formData.tnaId);
         console.log('Meeting Title:', formData.meetingTitle);
         console.log('Scheduled Date:', formData.scheduledDate);
         console.log('Scheduled Time:', formData.scheduledTime);
         console.log('Location:', formData.location);
         console.log('Date type:', typeof formData.scheduledDate);
         
         // Validate required fields
         if (!formData.meetingTitle || !formData.scheduledDate || !formData.scheduledTime || !formData.location) {
            displayToast('Please fill in all required fields', 'error');
            return;
         }
         
         const response = await api.post('/rtec-meetings/create', formData);
         console.log('Create meeting response:', response.data);
         
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
         console.error('Error response:', error.response?.data);
         console.error('Error status:', error.response?.status);
         
         const errorMessage = error.response?.data?.message || 'Failed to create meeting';
         
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
         }
      } catch (error) {
         console.error('Error inviting proponent:', error);
         displayToast('Failed to send proponent invitation', 'error');
      }
   };

   // const handleInvitePSTO = async (meetingId, pstoId) => {
   //    try {
   //       const response = await api.post(`/rtec-meetings/${meetingId}/invite-psto`, { pstoId });
   //       if (response.data.success) {
   //          displayToast('PSTO invitation sent successfully', 'success');
   //       }
   //    } catch (error) {
   //       console.error('Error inviting PSTO:', error);
   //       displayToast('Failed to send PSTO invitation', 'error');
   //    }
   // };

   const handleBulkInvitePSTO = async (meetingId) => {
      try {
         console.log('🔍 Sending bulk PSTO invitations...');
         console.log('🔍 Meeting ID:', meetingId);
         console.log('🔍 Selected PSTO users:', selectedPSTOUsers);
         
         const response = await api.post(`/rtec-meetings/${meetingId}/invite-psto-bulk`, { 
            pstoIds: selectedPSTOUsers 
         });
         console.log('📡 Bulk invite response:', response.data);
         
         if (response.data.success) {
            displayToast(`Invitations sent to ${response.data.data.invitationsSent} PSTO users`, 'success');
            setShowInviteModal(false);
            setSelectedPSTOUsers([]);
            fetchRTECMeetings(); // Refresh meetings to show updated participants
         } else {
            console.log('❌ Bulk invite failed:', response.data.message);
            displayToast('Failed to send invitations: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('💥 Error bulk inviting PSTO:', error);
         console.error('💥 Error response:', error.response?.data);
         console.error('💥 Error status:', error.response?.status);
         displayToast('Failed to send bulk PSTO invitations: ' + (error.response?.data?.message || error.message), 'error');
      }
   };

   // Resend invitation to participant
   const handleResendInvitation = async (meetingId, participantId) => {
      try {
         console.log('🔍 Resending invitation for meeting:', meetingId, 'participant:', participantId);
         const response = await api.post(`/rtec-meetings/${meetingId}/resend-invitation`, { 
            participantId 
         });
         console.log('📡 Resend response:', response.data);
         if (response.data.success) {
            displayToast('Invitation resent successfully', 'success');
            fetchRTECMeetings();
         }
      } catch (error) {
         console.error('💥 Error resending invitation:', error);
         console.error('💥 Error response:', error.response?.data);
         console.error('💥 Error status:', error.response?.status);
         
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

   const getStatusBadge = (status) => {
      const statusConfig = {
         'scheduled': { color: 'blue', text: 'Scheduled' },
         'confirmed': { color: 'green', text: 'Confirmed' },
         'completed': { color: 'gray', text: 'Completed' },
         'cancelled': { color: 'red', text: 'Cancelled' },
         'postponed': { color: 'yellow', text: 'Postponed' }
      };
      
      const config = statusConfig[status] || { color: 'gray', text: status };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   const getMeetingTypeBadge = (type) => {
      const typeConfig = {
         'physical': { color: 'blue', text: 'Physical' },
         'virtual': { color: 'green', text: 'Virtual' },
         'hybrid': { color: 'purple', text: 'Hybrid' }
      };
      
      const config = typeConfig[type] || { color: 'gray', text: type };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   const approvedDocumentsColumns = [
      {
         header: 'Enterprise Name',
         accessor: 'applicationId',
         render: (value, item) => {
            console.log('Enterprise Name render - value:', value, 'item:', item);
            console.log('Full item structure:', JSON.stringify(item, null, 2));
            return (
               <div>
                  <div className="font-medium text-gray-900">
                     {value?.enterpriseName || item?.applicationId?.enterpriseName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                     {value?.projectTitle || item?.applicationId?.projectTitle || 'N/A'}
                  </div>
               </div>
            );
         }
      },
      {
         header: 'Program',
         accessor: 'programName',
         render: (value, item) => {
            const programName = item?.programName || value || 'SETUP';
            return <Badge color="blue">{programName}</Badge>;
         }
      },
      {
         header: 'Proponent',
         accessor: 'proponentId',
         render: (value, item) => {
            const proponent = item?.proponentId || value;
            return (
               <div>
                  <div className="font-medium">
                     {proponent?.firstName || ''} {proponent?.lastName || ''}
                  </div>
                  <div className="text-sm text-gray-500">{proponent?.email || 'N/A'}</div>
               </div>
            );
         }
      },
      {
         header: 'Documents Status',
         accessor: 'status',
         render: (value, item) => {
            console.log('Documents Status render - value:', value, 'item:', item);
            console.log('item.status:', item?.status);
            const statusConfig = {
               'documents_approved': { color: 'green', text: 'Documents Approved' },
               'documents_requested': { color: 'yellow', text: 'Documents Requested' },
               'documents_submitted': { color: 'blue', text: 'Documents Submitted' },
               'documents_under_review': { color: 'orange', text: 'Under Review' },
               'documents_rejected': { color: 'red', text: 'Documents Rejected' }
            };
            const statusValue = item?.status || value;
            console.log('Final statusValue:', statusValue);
            const config = statusConfig[statusValue] || { color: 'gray', text: statusValue || 'Unknown' };
            return <Badge color={config.color}>{config.text}</Badge>;
         }
      },
      {
         header: 'Meeting Status',
         accessor: '_id',
         render: (value, item) => {
            // Use item._id since accessor is not working
            const documentId = item._id || value;
            const hasMeeting = rtecMeetings.some(meeting => {
               // Convert both to strings for comparison
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
         accessor: '_id',
         render: (value, item) => {
            // Use item._id since accessor is not working
            const documentId = item._id || value;
            const hasMeeting = rtecMeetings.some(meeting => {
               // Convert both to strings for comparison
               return meeting.rtecDocumentsId?.toString() === documentId?.toString();
            });
            
            const isApproved = item.status === 'documents_approved';
            
            return (
               <div className="flex space-x-2">
                  {isApproved ? (
                     !hasMeeting ? (
                        <Button
                           size="sm"
                           variant="primary"
                           onClick={() => {
                              console.log('=== SCHEDULE MEETING BUTTON CLICKED ===');
                              console.log('Item clicked:', item);
                              handleScheduleMeeting(item);
                           }}
                        >
                           Schedule Meeting
                        </Button>
                     ) : (
                        <Button
                           size="sm"
                           variant="outline"
                           disabled
                        >
                           Meeting Scheduled
                        </Button>
                     )
                  ) : (
                     <Button
                        size="sm"
                        variant="outline"
                        disabled
                     >
                        Not Approved
                     </Button>
                  )}
               </div>
            );
         }
      }
   ];

   const meetingsColumns = [
      {
         header: 'Meeting Title',
         accessor: 'meetingTitle',
         render: (value, item) => (
            <div>
               <div className="font-medium text-gray-900">{value}</div>
               <div className="text-sm text-gray-500">
                  {item.applicationId?.companyName || item.applicationId?.enterpriseName || 'N/A'}
               </div>
            </div>
         )
      },
      {
         header: 'Scheduled Date',
         accessor: 'scheduledDate',
         render: (value, item) => {
            // Use item.scheduledDate directly since accessor is not working
            const dateValue = item.scheduledDate || value;
            const date = new Date(dateValue);
            const isValidDate = !isNaN(date.getTime());
            
            return (
               <div>
                  <div className="font-medium">
                     {isValidDate ? date.toLocaleDateString() : `Invalid Date (${dateValue})`}
                  </div>
                  <div className="text-sm text-gray-500">{item.scheduledTime}</div>
               </div>
            );
         }
      },
      {
         header: 'Location',
         accessor: 'location',
         render: (value, item) => (
            <div>
               <div className="font-medium">{value}</div>
               <div className="text-sm text-gray-500">{getMeetingTypeBadge(item.meetingType)}</div>
            </div>
         )
      },
      {
         header: 'Status',
         accessor: 'status',
         render: (value) => getStatusBadge(value)
      },
      {
         header: 'Participants',
         accessor: 'participants',
         render: (value) => (
            <div className="flex items-center space-x-1">
               <span className="text-sm font-medium">{value?.length || 0}</span>
               <span className="text-xs text-gray-500">participants</span>
            </div>
         )
      },
      {
         header: 'Actions',
         accessor: '_id',
         render: (value, item) => (
            <div className="flex space-x-2">
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                     setSelectedMeeting(item);
                     setShowParticipantsModal(true);
                  }}
               >
                  View
               </Button>
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManageParticipants(item)}
               >
                  Manage
               </Button>
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitePSTOUsers(item)}
               >
                  Invite PSTO
               </Button>
               {item.status === 'scheduled' && (
                  <Button
                     size="sm"
                     variant="success"
                     onClick={() => handleUpdateMeetingStatus(item._id, 'confirmed')}
                  >
                     Confirm
                  </Button>
               )}
               {item.status === 'confirmed' && (
                  <Button
                     size="sm"
                     variant="primary"
                     onClick={() => handleUpdateMeetingStatus(item._id, 'completed')}
                  >
                     Complete
                  </Button>
               )}
               <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                     setConfirmAction(() => () => handleDeleteMeeting(item._id));
                     setShowConfirmModal(true);
                  }}
               >
                  Delete
               </Button>
            </div>
         )
      }
   ];

   const stats = [
      {
         title: 'Approved Documents',
         value: approvedRTECDocuments.length,
         color: 'green'
      },
      {
         title: 'Total Meetings',
         value: rtecMeetings.length,
         color: 'blue'
      },
      {
         title: 'Scheduled',
         value: rtecMeetings.filter(m => m.status === 'scheduled').length,
         color: 'blue'
      },
      {
         title: 'Confirmed',
         value: rtecMeetings.filter(m => m.status === 'confirmed').length,
         color: 'green'
      },
      {
         title: 'Completed',
         value: rtecMeetings.filter(m => m.status === 'completed').length,
         color: 'gray'
      }
   ];

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">RTEC Scheduling Management</h1>
               <p className="text-gray-600">Schedule and manage RTEC meetings for approved applications</p>
            </div>
            <Button
               onClick={() => setShowCreateModal(true)}
               className="bg-blue-600 hover:bg-blue-700"
            >
               Schedule New Meeting
            </Button>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
               <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
               />
            ))}
         </div>

         {/* Tab Navigation */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'documents'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  Approved RTEC Documents ({approvedRTECDocuments.filter(doc => {
                     const hasMeeting = rtecMeetings.some(meeting => 
                        meeting.rtecDocumentsId?._id?.toString() === doc._id?.toString()
                     );
                     return !hasMeeting;
                  }).length})
               </button>
               <button
                  onClick={() => setActiveTab('meetings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'meetings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  RTEC Meetings ({rtecMeetings.length})
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
                           Documents ready for meeting scheduling ({approvedRTECDocuments.filter(doc => {
                              const hasMeeting = rtecMeetings.some(meeting => 
                                 meeting.rtecDocumentsId?._id?.toString() === doc._id?.toString()
                              );
                              return !hasMeeting;
                           }).length} ready)
                        </p>
                     </div>
                     <div className="flex space-x-2">
                        <Button
                           variant="outline"
                           onClick={() => {
                              console.log('Manual refresh triggered');
                              fetchApprovedRTECDocuments();
                           }}
                        >
                           Refresh
                        </Button>
                     </div>
                  </div>
               
               {/* Info Alert */}
               {!loading && approvedRTECDocuments.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                        </div>
                        <div className="ml-3">
                           <p className="text-sm text-green-800">
                              <strong>{approvedRTECDocuments.length} approved document(s)</strong> are ready for meeting scheduling. 
                              Click "Schedule Meeting" to create a meeting for each approved application.
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               
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
                     console.log('=== RENDERING DOCUMENTS TAB ===');
                     console.log('Approved RTEC Documents:', approvedRTECDocuments.length);
                     console.log('RTEC Meetings:', rtecMeetings.length);
                     
                     const filteredDocs = approvedRTECDocuments.filter(doc => {
                        console.log('=== FILTERING DOCUMENT ===');
                        console.log('Document ID:', doc._id);
                        console.log('Document title:', doc.applicationId?.enterpriseName);
                        
                        const hasMeeting = rtecMeetings.some(meeting => {
                           console.log('Checking meeting:', meeting.meetingTitle);
                           console.log('Meeting rtecDocumentsId:', meeting.rtecDocumentsId);
                           console.log('Meeting rtecDocumentsId._id:', meeting.rtecDocumentsId?._id);
                           console.log('Comparing:', meeting.rtecDocumentsId?._id?.toString(), '===', doc._id?.toString());
                           const match = meeting.rtecDocumentsId?._id?.toString() === doc._id?.toString();
                           console.log('Match result:', match);
                           return match;
                        });
                        
                        console.log('Document has meeting:', hasMeeting);
                        console.log('Will show document:', !hasMeeting);
                        return !hasMeeting;
                     });
                     
                     console.log('Filtered documents count:', filteredDocs.length);
                     
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
            <Card>
               <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <h2 className="text-lg font-semibold">RTEC Meetings</h2>
                        <p className="text-sm text-gray-600 mt-1">
                           Manage scheduled RTEC meetings ({rtecMeetings.length} meetings)
                        </p>
                     </div>
                     <div className="flex space-x-2">
                        <Button
                           variant="outline"
                           onClick={fetchRTECMeetings}
                        >
                           Refresh
                        </Button>
                     </div>
                  </div>
               
               {loading ? (
                  <div className="flex justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
               ) : (
                  <DataTable
                     data={rtecMeetings}
                     columns={meetingsColumns}
                     searchable={true}
                     pagination={true}
                  />
               )}
               </div>
            </Card>
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
                  onClick={handleCreateMeeting}
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
                           onClick={() => selectedMeeting && handleInviteProponent(selectedMeeting._id)}
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
                                    onClick={() => handleResendInvitation(selectedMeeting._id, participant.userId._id)}
                                    disabled={participant.status === 'confirmed'}
                                 >
                                    Resend
                                 </Button>
                                 <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
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
                        <div className="mt-2 text-xs text-gray-600">
                           Debug: Available PSTO users: {availablePSTOUsers.length}, Selected: {selectedPSTOUsers.length}
                        </div>
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
                           onClick={() => selectedMeeting && handleBulkInvitePSTO(selectedMeeting._id)}
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
            onClose={() => setShowConfirmModal(false)}
            onConfirm={() => {
               if (confirmAction) {
                  confirmAction();
               }
               setShowConfirmModal(false);
            }}
            title="Confirm Action"
            message="Are you sure you want to perform this action?"
         />

         {/* Toast */}
         {showToast && (
            <Toast
               message={toastMessage}
               type={toastType}
               onClose={() => setShowToast(false)}
            />
         )}
      </div>
   );
};

export default RTECScheduleManagement;
