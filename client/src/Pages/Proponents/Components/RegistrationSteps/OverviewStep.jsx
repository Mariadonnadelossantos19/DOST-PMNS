import React from 'react';
import { Card } from '../../../../Component/UI';

const OverviewStep = ({ formData, getSelectedProgramLabel }) => {
   const provinces = [
      'Marinduque',
      'Occidental Mindoro', 
      'Oriental Mindoro',
      'Romblon',
      'Palawan'
   ];

   const programs = [
      { value: 'SETUP', label: 'Small Enterprise Technology Upgrading Program' },
      { value: 'GIA', label: 'Grants-in-Aid' },
      { value: 'CEST', label: 'Community Empowerment through Science and Technology' },
      { value: 'SSCP', label: 'Small and Medium Enterprise Development Program' }
   ];

   const organizationTypes = [
      'Individual',
      'SME', 
      'Corporation',
      'Cooperative',
      'Association'
   ];

   return (
      <div className="space-y-4">
         <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{formData.name || 'Not provided'}</p>
               </div>
               <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{formData.email || 'Not provided'}</p>
               </div>
               <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
               </div>
               <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{formData.address || 'Not provided'}</p>
               </div>
            </div>
         </Card>

         <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="font-medium text-gray-700">Business Name:</span>
                  <p className="text-gray-900">{formData.businessName || 'Not provided'}</p>
               </div>
               <div>
                  <span className="font-medium text-gray-700">Business Type:</span>
                  <p className="text-gray-900">{formData.businessType || 'Not provided'}</p>
               </div>
               <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Organization Type:</span>
                  <p className="text-gray-900">{formData.type || 'Not provided'}</p>
               </div>
            </div>
         </Card>

         <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="font-medium text-gray-700">Province:</span>
                  <p className="text-gray-900">{formData.province || 'Not provided'}</p>
               </div>
               <div>
                  <span className="font-medium text-gray-700">Program:</span>
                  <p className="text-gray-900">{getSelectedProgramLabel() || 'Not provided'}</p>
               </div>
               <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Reason for Request:</span>
                  <p className="text-gray-900">{formData.requestReason || 'Not provided'}</p>
               </div>
               <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Business Description:</span>
                  <p className="text-gray-900">{formData.businessDescription || 'Not provided'}</p>
               </div>
               {formData.expectedOutcomes && (
                  <div className="md:col-span-2">
                     <span className="font-medium text-gray-700">Expected Outcomes:</span>
                     <p className="text-gray-900">{formData.expectedOutcomes}</p>
                  </div>
               )}
            </div>
         </Card>

         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
               <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Review Your Information</h4>
                  <p className="text-sm text-blue-700">
                     Please review all the information above carefully. Once you submit this request, 
                     your local PSTO will review and approve your proponent account. You will receive 
                     an email notification once your account is approved.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OverviewStep;
