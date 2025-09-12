import React, { useState } from 'react';
import { Modal, Button, Input } from '../UI';
import { useDarkMode } from '../Context';
import { serviceOptions } from './utils/enrollmentHelpers.jsx';

const EnrollmentFormModal = ({ 
   isOpen, 
   onClose, 
   selectedService, 
   onServiceSelect, 
   customerData, 
   onCustomerDataChange, 
   onSubmit, 
   loading 
}) => {
   const { isDarkMode } = useDarkMode();

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit();
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title="Enroll New Customer"
      >
         <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Selection */}
            <div>
               <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
               }`}>
                  Select Service *
               </label>
               <div className="grid grid-cols-2 gap-3">
                  {Object.entries(serviceOptions).map(([key, service]) => (
                     <button
                        key={key}
                        type="button"
                        onClick={() => onServiceSelect(key)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                           selectedService === key
                              ? 'border-blue-500 bg-blue-50'
                              : isDarkMode 
                                 ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                                 : 'border-gray-300 hover:border-gray-400'
                        }`}
                     >
                        <div className={`font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{key}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{service.name}</div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
               <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>Customer Information</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                     label="Full Name *"
                     value={customerData.name}
                     onChange={(e) => onCustomerDataChange('name', e.target.value)}
                     required
                  />
                  <Input
                     label="Email Address *"
                     type="email"
                     value={customerData.email}
                     onChange={(e) => onCustomerDataChange('email', e.target.value)}
                     required
                  />
                  <Input
                     label="Phone Number *"
                     value={customerData.phone}
                     onChange={(e) => onCustomerDataChange('phone', e.target.value)}
                     required
                  />
                  <Input
                     label="Business Name"
                     value={customerData.businessName}
                     onChange={(e) => onCustomerDataChange('businessName', e.target.value)}
                  />
                  <Input
                     label="Address"
                     value={customerData.address}
                     onChange={(e) => onCustomerDataChange('address', e.target.value)}
                  />
                  <Input
                     label="Province"
                     value={customerData.province}
                     onChange={(e) => onCustomerDataChange('province', e.target.value)}
                  />
               </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
               <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
               >
                  Cancel
               </Button>
               <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !selectedService}
               >
                  {loading ? 'Enrolling...' : 'Enroll Customer'}
               </Button>
            </div>
         </form>
      </Modal>
   );
};

export default EnrollmentFormModal;
