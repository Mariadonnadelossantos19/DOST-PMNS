import React, { useState, useEffect } from 'react';
import { Modal, Button, StatusBadge } from '../../../Component/UI';

const RTECMeetingDetailsModal = ({ isOpen, onClose, meeting, onAction }) => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Format date
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
         return 'Invalid Date';
      }
   };

   // Send meeting invitation
   const handleSendInvitation = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch(`http://localhost:4000/api/rtec/${meeting._id}/send-invitation`, {
            method: 'POST',
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
            throw new Error(`Failed to send invitation: ${response.status}`);
         }

         const result = await response.json();
         if (result.success) {
            alert('Meeting invitation sent successfully!');
            onAction && onAction();
         } else {
            throw new Error(result.message || 'Failed to send invitation');
         }
      } catch (error) {
         console.error('Error sending invitation:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   // Request proposal submission
   const handleRequestProposal = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         const response = await fetch(`http://localhost:4000/api/rtec/${meeting._id}/request-proposal`, {
            method: 'POST',
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
            throw new Error(`Failed to request proposal: ${response.status}`);
         }

         const result = await response.json();
         if (result.success) {
            alert('Proposal submission requested successfully!');
            onAction && onAction();
         } else {
            throw new Error(result.message || 'Failed to request proposal');
         }
      } catch (error) {
         console.error('Error requesting proposal:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen || !meeting) return null;

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         size="xl"
         title="RTEC Meeting Details"
      >
         <div className="space-y-6">
            {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
               </div>
            )}

            {/* Meeting Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
               <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Overview</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm font-medium text-gray-600">Meeting Title</p>
                     <p className="text-sm text-gray-900">{meeting.meetingTitle}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-600">Status</p>
                     <StatusBadge status={meeting.status} size="sm" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-600">Meeting Date</p>
                     <p className="text-sm text-gray-900">{formatDate(meeting.meetingDate)}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-600">Meeting Time</p>
                     <p className="text-sm text-gray-900">{meeting.meetingTime}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-600">Location</p>
                     <p className="text-sm text-gray-900">{meeting.meetingLocation}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-gray-600">Meeting Type</p>
                     <p className="text-sm text-gray-900 capitalize">{meeting.meetingType}</p>
                  </div>
                  {meeting.meetingLink && (
                     <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Meeting Link</p>
                        <a 
                           href={meeting.meetingLink} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-sm text-blue-600 hover:text-blue-800"
                        >
                           {meeting.meetingLink}
                        </a>
                     </div>
                  )}
               </div>
            </div>

            {/* Application Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm font-medium text-blue-800">Application ID</p>
                     <p className="text-sm text-blue-700">{meeting.tnaId?.applicationId?.applicationId || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-800">Proponent</p>
                     <p className="text-sm text-blue-700">{meeting.tnaId?.proponentId?.firstName} {meeting.tnaId?.proponentId?.lastName}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-800">Enterprise</p>
                     <p className="text-sm text-blue-700">{meeting.tnaId?.applicationId?.enterpriseName || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-blue-800">PSTO</p>
                     <p className="text-sm text-blue-700">{meeting.pstoId?.firstName} {meeting.pstoId?.lastName}</p>
                  </div>
               </div>
            </div>

            {/* Committee Members */}
            {meeting.committeeMembers && meeting.committeeMembers.length > 0 && (
               <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Committee Members</h3>
                  <div className="space-y-3">
                     {meeting.committeeMembers.map((member, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                           <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                 member.role === 'chair' ? 'bg-red-100 text-red-800' :
                                 member.role === 'secretary' ? 'bg-blue-100 text-blue-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {member.role}
                              </span>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                 <p className="text-gray-600">Position: {member.position}</p>
                                 <p className="text-gray-600">Department: {member.department}</p>
                              </div>
                              <div>
                                 <p className="text-gray-600">Email: {member.email}</p>
                                 {member.phone && <p className="text-gray-600">Phone: {member.phone}</p>}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Contact Person */}
            {meeting.contactPerson && (
               <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Person</h3>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                           <p className="text-gray-600"><strong>Name:</strong> {meeting.contactPerson.name}</p>
                           <p className="text-gray-600"><strong>Position:</strong> {meeting.contactPerson.position}</p>
                        </div>
                        <div>
                           <p className="text-gray-600"><strong>Email:</strong> {meeting.contactPerson.email}</p>
                           <p className="text-gray-600"><strong>Phone:</strong> {meeting.contactPerson.phone}</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Meeting Agenda */}
            {meeting.agenda && (
               <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Agenda</h3>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                     <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.agenda}</p>
                  </div>
               </div>
            )}

            {/* Meeting Objectives */}
            {meeting.objectives && meeting.objectives.length > 0 && (
               <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Objectives</h3>
                  <div className="space-y-2">
                     {meeting.objectives.map((objective, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                           <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900">{objective.description}</p>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                 objective.priority === 'high' ? 'bg-red-100 text-red-800' :
                                 objective.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-green-100 text-green-800'
                              }`}>
                                 {objective.priority} priority
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Additional Notes */}
            {meeting.notes && (
               <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                     <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
                  </div>
               </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
               <Button
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                  Close
               </Button>
               
               {meeting.status === 'scheduled' && (
                  <Button
                     onClick={handleSendInvitation}
                     disabled={loading}
                     className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                     {loading ? 'Sending...' : 'Send Invitation'}
                  </Button>
               )}
               
               {meeting.status === 'meeting_sent' && (
                  <Button
                     onClick={handleRequestProposal}
                     disabled={loading}
                     className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                  >
                     {loading ? 'Requesting...' : 'Request Proposal'}
                  </Button>
               )}
            </div>
         </div>
      </Modal>
   );
};

export default RTECMeetingDetailsModal;
