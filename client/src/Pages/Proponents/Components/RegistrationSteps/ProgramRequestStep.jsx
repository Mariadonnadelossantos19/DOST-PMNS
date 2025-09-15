import React from 'react';
import { Card } from '../../../../Component/UI';

const ProgramRequestStep = ({ formData, handleChange, error }) => {
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

   return (
      <Card className="p-4">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Request</h3>
         <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Province *
                  </label>
                  <select
                     value={formData.province}
                     onChange={(e) => handleChange('province', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  >
                     <option value="">Select your province</option>
                     {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Program *
                  </label>
                  <select
                     value={formData.requestedProgram}
                     onChange={(e) => handleChange('requestedProgram', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  >
                     <option value="">Select a program</option>
                     {programs.map(program => (
                        <option key={program.value} value={program.value}>
                           {program.value} - {program.label}
                        </option>
                     ))}
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Request *
               </label>
               <textarea
                  value={formData.requestReason}
                  onChange={(e) => handleChange('requestReason', e.target.value)}
                  placeholder="Why do you need a proponent account?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description *
               </label>
               <textarea
                  value={formData.businessDescription}
                  onChange={(e) => handleChange('businessDescription', e.target.value)}
                  placeholder="Describe your business or project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Outcomes
               </label>
               <textarea
                  value={formData.expectedOutcomes}
                  onChange={(e) => handleChange('expectedOutcomes', e.target.value)}
                  placeholder="What do you hope to achieve with this program?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
               />
            </div>
         </div>
      </Card>
   );
};

export default ProgramRequestStep;
