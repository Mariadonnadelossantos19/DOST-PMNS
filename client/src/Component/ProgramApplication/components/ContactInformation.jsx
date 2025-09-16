import React from 'react';

const ContactInformation = ({ formData, errors, handleInputChange }) => {
   return (
      <div className="space-y-6">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
            <p className="text-gray-600">Please provide your basic contact details</p>
         </div>
         
         <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Person *
                  </label>
                  <input
                     type="text"
                     name="contactPerson"
                     value={formData.contactPerson}
                     onChange={handleInputChange}
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact person name"
                  />
                  {errors.contactPerson && (
                     <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Telephone *
                  </label>
                  <input
                     type="tel"
                     name="contactPersonTel"
                     value={formData.contactPersonTel}
                     onChange={handleInputChange}
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.contactPersonTel ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact telephone"
                  />
                  {errors.contactPersonTel && (
                     <p className="text-red-500 text-sm mt-1">{errors.contactPersonTel}</p>
                  )}
               </div>
               
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Email *
                  </label>
                  <input
                     type="email"
                     name="contactPersonEmail"
                     value={formData.contactPersonEmail}
                     onChange={handleInputChange}
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.contactPersonEmail ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter contact email"
                  />
                  {errors.contactPersonEmail && (
                     <p className="text-red-500 text-sm mt-1">{errors.contactPersonEmail}</p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ContactInformation;
