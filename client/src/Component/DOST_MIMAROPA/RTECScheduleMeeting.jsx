import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, ConfirmationModal, Input, Textarea, StatsCard, Alert } from '../UI';
import api from '../../config/api';

const RTECScheduleMeeting = () => {
   const [approvedRTECDocuments, setApprovedRTECDocuments] = useState([]);
   const [rtecMeetings, setRtecMeetings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showParticipantsModal, setShowParticipantsModal] = useState(false);
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   const [selectedRTECDocument, setSelectedRTECDocument] = useState(null);
   const [availablePSTOUsers, setAvailablePSTOUsers] = useState([]);
   const [selectedPSTOUsers, setSelectedPSTOUsers] = useState([]);
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [confirmAction, setConfirmAction] = useState(null);

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

   // Fetch approved RTEC documents
   const fetchApprovedRTECDocuments = async () => {
      try {
         setLoading(true);
         const response = await api.get('/rtec-documents/list');
         console.log('RTEC Documents Response:', response.data);
         if (response.data.success) {
            // Filter for documents with 'documents_approved' status
            const allDocs = response.data.data.docs || [];
            console.log('All RTEC Documents:', allDocs);
            const approvedDocs = allDocs.filter(doc => doc.status === 'documents_approved');
            console.log('Approved RTEC Documents:', approvedDocs);
            
            // Debug each approved document
            approvedDocs.forEach((doc, index) => {
               console.log(`\n=== Approved Document ${index + 1} ===`);
               console.log('Full document:', doc);
               console.log('applicationId:', doc.applicationId);
               console.log('proponentId:', doc.proponentId);
               console.log('status:', doc.status);
            });
            
            setApprovedRTECDocuments(approvedDocs);
         }
      } catch (error) {
         console.error('Error fetching approved RTEC documents:', error);
         displayToast('Failed to fetch approved RTEC documents', 'error');
      } finally {
         setLoading(false);
      }
   };

   // Fetch RTEC meetings
   const fetchRTECMeetings = async () => {
      try {
         const response = await api.get('/rtec-meetings/list');
         if (response.data.success) {
            setRtecMeetings(response.data.data.docs || []);
         }
      } catch (error) {
         console.error('Error fetching RTEC meetings:', error);
         displayToast('Failed to fetch RTEC meetings', 'error');
      }
   };

   // Fetch available PSTO users
   const fetchAvailablePSTOUsers = async () => {
      try {
         const response = await api.get('/rtec-meetings/available-psto-users');
         if (response.data.success) {
            setAvailablePSTOUsers(response.data.data || []);
         }
      } catch (error) {
         console.error('Error fetching PSTO users:', error);
         displayToast('Failed to fetch PSTO users', 'error');
      }
   };

   useEffect(() => {
      fetchApprovedRTECDocuments();
      fetchRTECMeetings();
      fetchAvailablePSTOUsers();
      
      // Listen for document approval events
      const handleDocumentApproved = () => {
         console.log('Document approved, refreshing approved documents...');
         fetchApprovedRTECDocuments();
      };
      
      window.addEventListener('rtecDocumentApproved', handleDocumentApproved);
      
      return () => {
         window.removeEventListener('rtecDocumentApproved', handleDocumentApproved);
      };
   }, []);

   const displayToast = (message, type = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
   };

   const handleScheduleMeeting = (rtecDocument) => {
      setSelectedRTECDocument(rtecDocument);
      setFormData({
         tnaId: rtecDocument.tnaId._id,
         rtecDocumentsId: rtecDocument._id,
         applicationId: rtecDocument.applicationId._id,
         proponentId: rtecDocument.proponentId._id,
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
      setShowCreateModal(true);
   };

   const handleCreateMeeting = async () => {
      try {
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
         displayToast(error.response?.data?.message || 'Failed to create meeting', 'error');
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
         render: (value, item) => (
            <div>
               <div className="font-medium text-gray-900">
                  {value?.enterpriseName || 'N/A'}
               </div>
               <div className="text-sm text-gray-500">
                  {value?.projectTitle || 'N/A'}
               </div>
            </div>
         )
      },
      {
         header: 'Program',
         accessor: 'programName',
         render: (value) => (
            <Badge color="blue">{value || 'SETUP'}</Badge>
         )
      },
      {
         header: 'Proponent',
         accessor: 'proponentId',
         render: (value) => (
            <div>
               <div className="font-medium">
                  {value?.firstName} {value?.lastName}
               </div>
               <div className="text-sm text-gray-500">{value?.email}</div>
            </div>
         )
      },
      {
         header: 'Documents Status',
         accessor: 'status',
         render: (value, item) => {
            const statusConfig = {
               'documents_approved': { color: 'green', text: 'Documents Approved' },
               'documents_requested': { color: 'yellow', text: 'Documents Requested' },
               'documents_submitted': { color: 'blue', text: 'Documents Submitted' },
               'documents_under_review': { color: 'orange', text: 'Under Review' },
               'documents_rejected': { color: 'red', text: 'Documents Rejected' }
            };
            const config = statusConfig[value] || { color: 'gray', text: value };
            return <Badge color={config.color}>{config.text}</Badge>;
         }
      },
      {
         header: 'Meeting Status',
         accessor: '_id',
         render: (value, item) => {
            const hasMeeting = rtecMeetings.some(meeting => meeting.rtecDocumentsId === value);
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
            const hasMeeting = rtecMeetings.some(meeting => meeting.rtecDocumentsId === value);
            const isApproved = item.status === 'documents_approved';
            
            return (
               <div className="flex space-x-2">
                  {isApproved ? (
                     !hasMeeting ? (
                        <Button
                           size="sm"
                           variant="primary"
                           onClick={() => handleScheduleMeeting(item)}
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
         render: (value, item) => (
            <div>
               <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
               <div className="text-sm text-gray-500">{item.scheduledTime}</div>
            </div>
         )
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
                  onClick={() => {
                     setSelectedMeeting(item);
                     setShowInviteModal(true);
                  }}
               >
                  Invite
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
               <h1 className="text-2xl font-bold text-gray-900">RTEC Meeting Scheduling</h1>
               <p className="text-gray-600">Schedule meetings for approved RTEC documents</p>
            </div>
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

         {/* Approved RTEC Documents Table */}
         <Card>
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Approved RTEC Documents</h2>
                  <div className="flex space-x-2">
                     <Button
                        variant="outline"
                        onClick={fetchApprovedRTECDocuments}
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
                     data={approvedRTECDocuments}
                     columns={approvedDocumentsColumns}
                     searchable={true}
                     pagination={true}
                  />
               )}
            </div>
         </Card>

         {/* RTEC Meetings Table */}
         <Card>
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">RTEC Meetings</h2>
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

export default RTECScheduleMeeting;
