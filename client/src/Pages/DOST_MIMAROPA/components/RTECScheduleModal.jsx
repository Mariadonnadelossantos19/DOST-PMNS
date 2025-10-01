import React, { useState } from 'react';
import { Modal, Button, Textarea } from '../../../Component/UI';

const RTECScheduleModal = ({ isOpen, onClose, tna, onSchedule }) => {
   const [formData, setFormData] = useState({
      meetingTitle: '',
      meetingDate: '',
      meetingTime: '',
      meetingLocation: '',
      meetingType: 'physical',
      meetingLink: '',
      agenda: '',
      notes: ''
   });
   const [committeeMembers, setCommitteeMembers] = useState([
      { name: '', position: '', department: '', email: '', phone: '', role: 'member' }
   ]);
   const [contactPerson, setContactPerson] = useState({
      name: '',
      position: '',
      email: '',
      phone: ''
   });
   const [objectives, setObjectives] = useState([
      { description: '', priority: 'medium' }
   ]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Reset form when modal opens
   React.useEffect(() => {
      if (isOpen && tna) {
         setFormData({
            meetingTitle: `RTEC Meeting for ${tna.applicationId?.enterpriseName || 'Application'}`,
            meetingDate: '',
            meetingTime: '',
            meetingLocation: '',
            meetingType: 'physical',
            meetingLink: '',
            agenda: '',
            notes: ''
         });
         setCommitteeMembers([
            { name: '', position: '', department: '', email: '', phone: '', role: 'member' }
         ]);
         setContactPerson({
            name: '',
            position: '',
            email: '',
            phone: ''
         });
         setObjectives([
            { description: '', priority: 'medium' }
         ]);
         setError('');
      }
   }, [isOpen, tna]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleCommitteeMemberChange = (index, field, value) => {
      const updated = [...committeeMembers];
      updated[index][field] = value;
      setCommitteeMembers(updated);
   };

   const addCommitteeMember = () => {
      setCommitteeMembers([...committeeMembers, { name: '', position: '', department: '', email: '', phone: '', role: 'member' }]);
   };

   const removeCommitteeMember = (index) => {
      if (committeeMembers.length > 1) {
         const updated = committeeMembers.filter((_, i) => i !== index);
         setCommitteeMembers(updated);
      }
   };

   const handleContactPersonChange = (field, value) => {
      setContactPerson(prev => ({
         ...prev,
         [field]: value
      }));
   };

   const handleObjectiveChange = (index, field, value) => {
      const updated = [...objectives];
      updated[index][field] = value;
      setObjectives(updated);
   };

   const addObjective = () => {
      setObjectives([...objectives, { description: '', priority: 'medium' }]);
   };

   const removeObjective = (index) => {
      if (objectives.length > 1) {
         const updated = objectives.filter((_, i) => i !== index);
         setObjectives(updated);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            throw new Error('Please login first');
         }

         const requestData = {
            tnaId: tna._id,
            ...formData,
            committeeMembers: committeeMembers.filter(member => member.name.trim() !== ''),
            contactPerson,
            objectives: objectives.filter(obj => obj.description.trim() !== '')
         };

         console.log('Scheduling RTEC meeting:', requestData);

         const response = await fetch('http://localhost:4000/api/rtec/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            throw new Error(`Failed to schedule RTEC meeting: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         console.log('RTEC meeting scheduled:', result);

         if (result.success) {
            alert('RTEC meeting scheduled successfully!');
            onSchedule && onSchedule();
            onClose();
         } else {
            throw new Error(result.message || 'Failed to schedule RTEC meeting');
         }
      } catch (error) {
         console.error('Error scheduling RTEC meeting:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   if (!isOpen || !tna) return null;

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         size="xl"
         title="Schedule RTEC Meeting"
      >
         <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
               </div>
            )}

            {/* Meeting Details */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Title *
                     </label>
                     <input
                        type="text"
                        name="meetingTitle"
                        value={formData.meetingTitle}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Date *
                     </label>
                     <input
                        type="date"
                        name="meetingDate"
                        value={formData.meetingDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Time *
                     </label>
                     <input
                        type="time"
                        name="meetingTime"
                        value={formData.meetingTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Type *
                     </label>
                     <select
                        name="meetingType"
                        value={formData.meetingType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="physical">Physical</option>
                        <option value="virtual">Virtual</option>
                        <option value="hybrid">Hybrid</option>
                     </select>
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Location *
                     </label>
                     <input
                        type="text"
                        name="meetingLocation"
                        value={formData.meetingLocation}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter meeting location"
                     />
                  </div>

                  {formData.meetingType === 'virtual' && (
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Meeting Link
                        </label>
                        <input
                           type="url"
                           name="meetingLink"
                           value={formData.meetingLink}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="https://meet.google.com/..."
                        />
                     </div>
                  )}
               </div>
            </div>

            {/* Committee Members */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Committee Members</h3>
                  <Button
                     type="button"
                     onClick={addCommitteeMember}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                  >
                     Add Member
                  </Button>
               </div>

               {committeeMembers.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                     <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Member {index + 1}</h4>
                        {committeeMembers.length > 1 && (
                           <Button
                              type="button"
                              onClick={() => removeCommitteeMember(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                           >
                              Remove
                           </Button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                           </label>
                           <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleCommitteeMemberChange(index, 'name', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position *
                           </label>
                           <input
                              type="text"
                              value={member.position}
                              onChange={(e) => handleCommitteeMemberChange(index, 'position', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department *
                           </label>
                           <input
                              type="text"
                              value={member.department}
                              onChange={(e) => handleCommitteeMemberChange(index, 'department', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                           </label>
                           <input
                              type="email"
                              value={member.email}
                              onChange={(e) => handleCommitteeMemberChange(index, 'email', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                           </label>
                           <input
                              type="tel"
                              value={member.phone}
                              onChange={(e) => handleCommitteeMemberChange(index, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                           </label>
                           <select
                              value={member.role}
                              onChange={(e) => handleCommitteeMemberChange(index, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           >
                              <option value="member">Member</option>
                              <option value="chair">Chair</option>
                              <option value="secretary">Secretary</option>
                           </select>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Contact Person</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                     </label>
                     <input
                        type="text"
                        value={contactPerson.name}
                        onChange={(e) => handleContactPersonChange('name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position *
                     </label>
                     <input
                        type="text"
                        value={contactPerson.position}
                        onChange={(e) => handleContactPersonChange('position', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                     </label>
                     <input
                        type="email"
                        value={contactPerson.email}
                        onChange={(e) => handleContactPersonChange('email', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                     </label>
                     <input
                        type="tel"
                        value={contactPerson.phone}
                        onChange={(e) => handleContactPersonChange('phone', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
               </div>
            </div>

            {/* Meeting Agenda */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Meeting Agenda</h3>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Agenda
                  </label>
                  <Textarea
                     name="agenda"
                     value={formData.agenda}
                     onChange={handleInputChange}
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Enter meeting agenda..."
                  />
               </div>
            </div>

            {/* Meeting Objectives */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Meeting Objectives</h3>
                  <Button
                     type="button"
                     onClick={addObjective}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                  >
                     Add Objective
                  </Button>
               </div>

               {objectives.map((objective, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                     <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Objective {index + 1}</h4>
                        {objectives.length > 1 && (
                           <Button
                              type="button"
                              onClick={() => removeObjective(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                           >
                              Remove
                           </Button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description *
                           </label>
                           <input
                              type="text"
                              value={objective.description}
                              onChange={(e) => handleObjectiveChange(index, 'description', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                           </label>
                           <select
                              value={objective.priority}
                              onChange={(e) => handleObjectiveChange(index, 'priority', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                           </select>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Notes
                  </label>
                  <Textarea
                     name="notes"
                     value={formData.notes}
                     onChange={handleInputChange}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Enter any additional notes..."
                  />
               </div>
            </div>

            {/* TNA Information Display */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
               <h3 className="text-lg font-semibold text-blue-900 mb-3">TNA Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                     <p className="font-medium text-blue-800">Application ID</p>
                     <p className="text-blue-700">{tna.applicationId?.applicationId || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="font-medium text-blue-800">Proponent</p>
                     <p className="text-blue-700">{tna.proponentId?.firstName} {tna.proponentId?.lastName}</p>
                  </div>
                  <div>
                     <p className="font-medium text-blue-800">Enterprise</p>
                     <p className="text-blue-700">{tna.applicationId?.enterpriseName || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="font-medium text-blue-800">PSTO</p>
                     <p className="text-blue-700">{tna.scheduledBy?.firstName} {tna.scheduledBy?.lastName}</p>
                  </div>
               </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
               <Button
                  type="button"
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                  Cancel
               </Button>
               <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
               >
                  {loading ? (
                     <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                     </>
                  ) : (
                     'Schedule RTEC Meeting'
                  )}
               </Button>
            </div>
         </form>
      </Modal>
   );
};

export default RTECScheduleModal;
