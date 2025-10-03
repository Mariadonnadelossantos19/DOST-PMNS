import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, DataTable, Toast, Input, Textarea } from '../../UI';
import api from '../../../config/api';

const RTECMeetingInterface = ({ currentUser }) => {
   const [myMeetings, setMyMeetings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showMeetingModal, setShowMeetingModal] = useState(false);
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState('success');
   const [autoRefreshing, setAutoRefreshing] = useState(false);

   // Fetch user's meetings
   const fetchMyMeetings = useCallback(async () => {
      try {
         console.log('🔍 PSTO: Fetching my meetings...');
         setLoading(true);
         const response = await api.get('/rtec-meetings/user/my-meetings');
         console.log('📡 PSTO: Meetings response:', response.data);
         if (response.data.success) {
            console.log('✅ PSTO: Meetings fetched successfully:', response.data.data.docs?.length || 0, 'meetings');
            setMyMeetings(response.data.data.docs || []);
            
            // Debug: Show participants for each meeting
            response.data.data.docs?.forEach((meeting, index) => {
               console.log(`🔍 PSTO: Meeting ${index + 1} participants:`, meeting.participants?.map(p => ({
                  userId: p.userId,
                  userId_id: p.userId?._id,
                  userId_string: p.userId?.toString(),
                  status: p.status
               })));
            });
         } else {
            console.log('❌ PSTO: Failed to fetch meetings:', response.data.message);
            displayToast('Failed to fetch meetings: ' + response.data.message, 'error');
         }
      } catch (error) {
         console.error('💥 PSTO: Error fetching my meetings:', error);
         console.error('💥 PSTO: Error response:', error.response?.data);
         console.error('💥 PSTO: Error status:', error.response?.status);
         displayToast('Failed to fetch meetings: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
         setLoading(false);
      }
   }, []);

   // PSTO users don't need accept/decline functionality as attendance is required

   // Display toast message
   const displayToast = (message, type = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
   };

   // Get status badge
   const getStatusBadge = (status) => {
      const statusConfig = {
         'scheduled': { color: 'blue', text: 'Scheduled' },
         'confirmed': { color: 'green', text: 'Confirmed' },
         'completed': { color: 'gray', text: 'Completed' },
         'cancelled': { color: 'red', text: 'Cancelled' }
      };
      const config = statusConfig[status] || { color: 'gray', text: status };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   // Get participant status badge
   const getParticipantStatusBadge = (status) => {
      const statusConfig = {
         'invited': { color: 'yellow', text: 'Invited' },
         'pending': { color: 'yellow', text: 'Pending' },
         'confirmed': { color: 'green', text: 'Confirmed' },
         'declined': { color: 'red', text: 'Declined' },
         'attended': { color: 'blue', text: 'Attended' },
         'absent': { color: 'red', text: 'Absent' }
      };
      const config = statusConfig[status] || { color: 'gray', text: status };
      return <Badge color={config.color}>{config.text}</Badge>;
   };

   // Table columns
   const meetingColumns = [
      {
         header: 'Meeting Title',
         accessor: 'meetingTitle',
         render: (value, item) => (
            <div>
               <div className="font-medium text-gray-900">{value}</div>
               <div className="text-sm text-gray-500">
                  {item?.applicationId?.enterpriseName || item?.applicationId?.companyName || 'N/A'}
               </div>
            </div>
         )
      },
      {
         header: 'Scheduled Date',
         accessor: 'scheduledDate',
         render: (value, item) => {
            const dateValue = value || item.scheduledDate;
            const date = new Date(dateValue);
            const isValidDate = !isNaN(date.getTime());
            
            return (
               <div>
                  <div className="font-medium">
                     {isValidDate ? date.toLocaleDateString() : 'Invalid Date'}
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
               <div className="text-sm text-gray-500">{item.meetingType}</div>
            </div>
         )
      },
      {
         header: 'Meeting Status',
         accessor: 'status',
         render: (value) => getStatusBadge(value)
      },
      {
         header: 'My Status',
         accessor: 'participants',
         render: (value, item) => {
            // Use item.participants instead of value since value is undefined
            const participants = item.participants || value;
            
            const myParticipant = participants?.find(p => {
               const userIdMatch = p.userId._id?.toString() === currentUser.id?.toString();
               const directUserIdMatch = p.userId?.toString() === currentUser.id?.toString();
               return userIdMatch || directUserIdMatch;
            });
            
            return myParticipant ? getParticipantStatusBadge(myParticipant.status) : <Badge color="gray">Not Invited</Badge>;
         }
      },
      {
         header: 'Actions',
         accessor: '_id',
         render: (value, item) => {
            const myParticipant = item.participants?.find(p => 
               p.userId._id?.toString() === currentUser.id?.toString() || 
               p.userId?.toString() === currentUser.id?.toString()
            );
            // PSTO users are automatically confirmed as part of their job responsibilities
            const isConfirmed = myParticipant?.status === 'confirmed' || myParticipant?.status === 'invited' || myParticipant?.status === 'pending';
            
            return (
               <div className="flex space-x-2">
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={() => {
                        setSelectedMeeting(item);
                        setShowMeetingModal(true);
                     }}
                  >
                     View Details
                  </Button>
                  <Badge color="blue">Required Attendance</Badge>
                  {isConfirmed && (
                     <Badge color="green">Confirmed</Badge>
                  )}
               </div>
            );
         }
      }
   ];

   useEffect(() => {
      fetchMyMeetings();
      
      // Set up automatic refresh every 30 seconds to catch resent invitations
      const refreshInterval = setInterval(() => {
         console.log('🔄 PSTO: Auto-refreshing meetings to check for updates...');
         setAutoRefreshing(true);
         fetchMyMeetings().finally(() => {
            setAutoRefreshing(false);
         });
      }, 30000); // Refresh every 30 seconds
      
      return () => {
         clearInterval(refreshInterval);
      };
   }, [fetchMyMeetings]);


   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">My RTEC Meetings</h1>
               <p className="text-gray-600">View your required RTEC meeting attendance</p>
            </div>
            <div className="flex items-center space-x-2">
               {autoRefreshing && (
                  <div className="flex items-center text-sm text-blue-600">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                     Auto-refreshing...
                  </div>
               )}
               <Button
                  variant="outline"
                  onClick={fetchMyMeetings}
                  disabled={loading}
               >
                  {loading ? 'Refreshing...' : 'Refresh'}
               </Button>
            </div>
         </div>

         {/* Statistics */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                     <p className="text-2xl font-semibold text-gray-900">{myMeetings.length}</p>
                  </div>
               </div>
            </Card>
            
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                     <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600">Pending</p>
                     <p className="text-2xl font-semibold text-gray-900">
                        {myMeetings.filter(m => {
                           const myParticipant = m.participants?.find(p => 
                              p.userId._id?.toString() === currentUser.id?.toString() || 
                              p.userId?.toString() === currentUser.id?.toString()
                           );
                           return myParticipant?.status === 'invited' || myParticipant?.status === 'pending';
                        }).length}
                     </p>
                  </div>
               </div>
            </Card>
            
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600">Accepted</p>
                     <p className="text-2xl font-semibold text-gray-900">
                        {myMeetings.filter(m => {
                           const myParticipant = m.participants?.find(p => 
                              p.userId._id?.toString() === currentUser.id?.toString() || 
                              p.userId?.toString() === currentUser.id?.toString()
                           );
                           return myParticipant?.status === 'confirmed';
                        }).length}
                     </p>
                  </div>
               </div>
            </Card>
            
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                     <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600">Completed</p>
                     <p className="text-2xl font-semibold text-gray-900">
                        {myMeetings.filter(m => m.status === 'completed').length}
                     </p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Meetings Table */}
         <Card>
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">My Meeting Invitations</h2>
                  <Button
                     variant="outline"
                     onClick={fetchMyMeetings}
                  >
                     Refresh
                  </Button>
               </div>
               
               {loading ? (
                  <div className="flex justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
               ) : (
                  <DataTable
                     data={myMeetings}
                     columns={meetingColumns}
                     searchable={true}
                     pagination={true}
                  />
               )}
            </div>
         </Card>

         {/* Meeting Details Modal */}
         <Modal
            isOpen={showMeetingModal}
            onClose={() => setShowMeetingModal(false)}
            title="Meeting Details"
            size="lg"
         >
            {selectedMeeting && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                        <p className="text-gray-900">{selectedMeeting.meetingTitle}</p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                        <p className="text-gray-900">
                           {new Date(selectedMeeting.scheduledDate).toLocaleDateString()} at {selectedMeeting.scheduledTime}
                        </p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-gray-900">{selectedMeeting.location}</p>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                        <p className="text-gray-900 capitalize">{selectedMeeting.meetingType}</p>
                     </div>
                  </div>
                  
                  {selectedMeeting.meetingDescription && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900">{selectedMeeting.meetingDescription}</p>
                     </div>
                  )}
                  
                  {selectedMeeting.virtualMeetingLink && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Virtual Meeting Link</label>
                        <p className="text-blue-600">{selectedMeeting.virtualMeetingLink}</p>
                     </div>
                  )}
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                     <div className="space-y-2">
                        {selectedMeeting.participants?.map((participant, index) => (
                           <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <p className="font-medium">
                                    {participant.userId?.firstName} {participant.userId?.lastName}
                                 </p>
                                 <p className="text-sm text-gray-500">{participant.userId?.email}</p>
                              </div>
                              {getParticipantStatusBadge(participant.status)}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
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

export default RTECMeetingInterface;
