import React from 'react';
import { useDarkMode } from '../../Context';

const ContactInformation = ({ formData, errors, handleInputChange }) => {
   const { isDarkMode } = useDarkMode();
   
   return (
      <div className="space-y-4">
         <div className="text-center mb-4">
            <h2 className={`text-lg font-bold mb-1 transition-colors duration-300 ${
               isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Contact Information</h2>
            <p className={`text-sm transition-colors duration-300 ${
               isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Please provide your basic contact details</p>
         </div>
         
         <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Contact Person *
                  </label>
                  <input
                     type="text"
                     name="contactPerson"
                     value={formData.contactPerson}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact person name"
                  />
                  {errors.contactPerson && (
                     <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Contact Telephone *
                  </label>
                  <input
                     type="tel"
                     name="contactPersonTel"
                     value={formData.contactPersonTel}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.contactPersonTel ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact telephone"
                  />
                  {errors.contactPersonTel && (
                     <p className="text-red-500 text-xs mt-1">{errors.contactPersonTel}</p>
                  )}
               </div>
               
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Contact Email *
                  </label>
                  <input
                     type="email"
                     name="contactPersonEmail"
                     value={formData.contactPersonEmail}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.contactPersonEmail ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact email"
                  />
                  {errors.contactPersonEmail && (
                     <p className="text-red-500 text-xs mt-1">{errors.contactPersonEmail}</p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ContactInformation;
