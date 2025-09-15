import React from 'react';
import { Card, Input } from '../../../../Component/UI';

const PersonalInfoStep = ({ formData, handleChange, error }) => {
   return (
      <Card className="p-4">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
               label="Full Name *"
               value={formData.name}
               onChange={(e) => handleChange('name', e.target.value)}
               placeholder="Enter your full name"
               required
            />
            <Input
               label="Email Address *"
               type="email"
               value={formData.email}
               onChange={(e) => handleChange('email', e.target.value)}
               placeholder="Enter your email"
               required
            />
            <Input
               label="Phone Number"
               value={formData.phone}
               onChange={(e) => handleChange('phone', e.target.value)}
               placeholder="Enter your phone number"
            />
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
               </label>
               <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  required
               />
            </div>
         </div>
      </Card>
   );
};

export default PersonalInfoStep;
