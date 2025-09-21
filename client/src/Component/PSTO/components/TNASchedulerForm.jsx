import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '../../UI';

const TNASchedulerForm = ({ application, onSchedule, onCancel }) => {
   const [scheduleData, setScheduleData] = useState({
      scheduledDate: '',
      scheduledTime: '',
      location: '',
      contactPerson: '',
      contactPhone: '',
      notes: '',
      assessors: []
   });
   const [errors, setErrors] = useState({});

   useEffect(() => {
      if (application) {
         setScheduleData(prev => ({
            ...prev,
            contactPerson: application.contactPerson || '',
            contactPhone: application.contactPersonTel || ''
         }));
      }
   }, [application]);

   const handleInputChange = (field, value) => {
      setScheduleData(prev => ({
         ...prev,
         [field]: value
      }));
      
      // Clear error when user starts typing
      if (errors[field]) {
         setErrors(prev => ({
            ...prev,
            [field]: ''
         }));
      }
   };

   const addAssessor = () => {
      setScheduleData(prev => ({
         ...prev,
         assessors: [...prev.assessors, { name: '', email: '', phone: '' }]
      }));
   };

   const removeAssessor = (index) => {
      setScheduleData(prev => ({
         ...prev,
         assessors: prev.assessors.filter((_, i) => i !== index)
      }));
   };

   const updateAssessor = (index, field, value) => {
      setScheduleData(prev => ({
         ...prev,
         assessors: prev.assessors.map((assessor, i) => 
            i === index ? { ...assessor, [field]: value } : assessor
         )
      }));
   };

   const validateForm = () => {
      const newErrors = {};

      if (!scheduleData.scheduledDate) {
         newErrors.scheduledDate = 'Scheduled date is required';
      }

      if (!scheduleData.scheduledTime) {
         newErrors.scheduledTime = 'Scheduled time is required';
      }

      if (!scheduleData.location) {
         newErrors.location = 'Location is required';
      }

      if (!scheduleData.contactPerson) {
         newErrors.contactPerson = 'Contact person is required';
      }

      if (!scheduleData.contactPhone) {
         newErrors.contactPhone = 'Contact phone is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSchedule = () => {
      if (validateForm()) {
         const tnaData = {
            applicationId: application._id,
            proponentId: application.proponentId._id,
            scheduledDate: scheduleData.scheduledDate,
            scheduledTime: scheduleData.scheduledTime,
            location: scheduleData.location,
            contactPerson: scheduleData.contactPerson,
            contactPhone: scheduleData.contactPhone,
            notes: scheduleData.notes,
            assessors: scheduleData.assessors.filter(a => a.name.trim() !== ''),
            status: 'scheduled',
            scheduledBy: 'psto' // This will be set by the backend
         };

         onSchedule(tnaData);
      }
   };

   return (
      <div className="space-y-6">
         {/* Application Header */}
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <div>
                  <h3 className="text-lg font-bold text-blue-900">Application Details</h3>
                  <p className="text-sm text-blue-600">Technology Needs Assessment Scheduling</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proponent</p>
                  <p className="text-sm font-semibold text-gray-900">{application?.proponentId?.firstName} {application?.proponentId?.lastName}</p>
               </div>
               <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enterprise</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{application?.enterpriseName}</p>
               </div>
               <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Program</p>
                  <p className="text-sm font-semibold text-gray-900">{application?.programName}</p>
               </div>
            </div>
         </div>

         {/* Schedule Details Section */}
         <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
               <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <h4 className="text-lg font-semibold text-gray-900">Schedule Details</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     <span className="flex items-center">
                        <span className="text-red-500 mr-1">*</span>
                        Scheduled Date
                     </span>
                  </label>
                  <Input
                     type="date"
                     value={scheduleData.scheduledDate}
                     onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                     className={`w-full ${errors.scheduledDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {errors.scheduledDate && (
                     <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.scheduledDate}
                     </p>
                  )}
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     <span className="flex items-center">
                        <span className="text-red-500 mr-1">*</span>
                        Scheduled Time
                     </span>
                  </label>
                  <Input
                     type="time"
                     value={scheduleData.scheduledTime}
                     onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                     className={`w-full ${errors.scheduledTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {errors.scheduledTime && (
                     <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.scheduledTime}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Location & Contact Section */}
         <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
               <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
               </div>
               <h4 className="text-lg font-semibold text-gray-900">Location & Contact Information</h4>
            </div>
            
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     <span className="flex items-center">
                        <span className="text-red-500 mr-1">*</span>
                        Assessment Location
                     </span>
                  </label>
                  <Input
                     type="text"
                     value={scheduleData.location}
                     onChange={(e) => handleInputChange('location', e.target.value)}
                     placeholder="Enter the exact location where the assessment will take place"
                     className={`w-full ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {errors.location && (
                     <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.location}
                     </p>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center">
                           <span className="text-red-500 mr-1">*</span>
                           Contact Person
                        </span>
                     </label>
                     <Input
                        type="text"
                        value={scheduleData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder="Full name of contact person"
                        className={`w-full ${errors.contactPerson ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                     />
                     {errors.contactPerson && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                           {errors.contactPerson}
                        </p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center">
                           <span className="text-red-500 mr-1">*</span>
                           Contact Phone
                        </span>
                     </label>
                     <Input
                        type="tel"
                        value={scheduleData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="Phone number with area code"
                        className={`w-full ${errors.contactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                     />
                     {errors.contactPhone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                           {errors.contactPhone}
                        </p>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Notes Section */}
         <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
               <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
               </div>
               <h4 className="text-lg font-semibold text-gray-900">Additional Notes</h4>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Notes
               </label>
               <Textarea
                  value={scheduleData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any special instructions, requirements, or notes for the assessment team..."
                  rows={4}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
               />
               <p className="text-xs text-gray-500 mt-1">Optional: Add any specific requirements or instructions for the assessment team</p>
            </div>
         </div>

         {/* Assessors Section */}
         <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                  </div>
                  <div>
                     <h4 className="text-lg font-semibold text-gray-900">Assessment Team</h4>
                     <p className="text-sm text-gray-500">Add team members who will conduct the assessment</p>
                  </div>
               </div>
               <Button
                  type="button"
                  onClick={addAssessor}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Assessor</span>
               </Button>
            </div>
            
            {scheduleData.assessors.length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">No assessors added yet</p>
                  <p className="text-xs text-gray-400">Click "Add Assessor" to add team members</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {scheduleData.assessors.map((assessor, index) => (
                     <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                 <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">Assessor {index + 1}</span>
                           </div>
                           <Button
                              type="button"
                              onClick={() => removeAssessor(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                           </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <Input
                              type="text"
                              value={assessor.name}
                              onChange={(e) => updateAssessor(index, 'name', e.target.value)}
                              placeholder="Full name"
                              className="w-full"
                           />
                           <Input
                              type="email"
                              value={assessor.email}
                              onChange={(e) => updateAssessor(index, 'email', e.target.value)}
                              placeholder="Email address"
                              className="w-full"
                           />
                           <Input
                              type="tel"
                              value={assessor.phone}
                              onChange={(e) => updateAssessor(index, 'phone', e.target.value)}
                              placeholder="Phone number"
                              className="w-full"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Action Buttons */}
         <div className="bg-gray-50 border-t border-gray-200 rounded-b-xl p-6">
            <div className="flex justify-end space-x-3">
               <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="px-6 py-2"
               >
                  Cancel
               </Button>
               <Button
                  type="button"
                  onClick={handleSchedule}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 flex items-center space-x-2"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule TNA</span>
               </Button>
            </div>
         </div>
      </div>
   );
};

export default TNASchedulerForm;
