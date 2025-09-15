import React from 'react';
import { Card, Input } from '../../../../Component/UI';

const BusinessInfoStep = ({ formData, handleChange, error }) => {
   const organizationTypes = [
      'Individual',
      'SME', 
      'Corporation',
      'Cooperative',
      'Association'
   ];

   return (
      <Card className="p-4">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
               label="Business Name"
               value={formData.businessName}
               onChange={(e) => handleChange('businessName', e.target.value)}
               placeholder="Enter your business name (if applicable)"
            />
            <Input
               label="Business Type"
               value={formData.businessType}
               onChange={(e) => handleChange('businessType', e.target.value)}
               placeholder="e.g., Agriculture, Technology, Manufacturing"
            />
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Type *
               </label>
               <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
               >
                  <option value="">Select organization type</option>
                  {organizationTypes.map(type => (
                     <option key={type} value={type}>{type}</option>
                  ))}
               </select>
            </div>
         </div>
      </Card>
   );
};

export default BusinessInfoStep;
