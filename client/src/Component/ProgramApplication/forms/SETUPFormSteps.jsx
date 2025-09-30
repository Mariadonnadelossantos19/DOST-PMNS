import React from 'react';
import { FormSection, FormInput, FormTextarea, FormSelect, FormFileUpload } from '../components';

const SETUPFormSteps = ({ formData, errors, handleInputChange, currentStep }) => {
   // Step 2: Basic Enterprise Information
   if (currentStep === 2) {
      return (
         <FormSection 
            title="Basic Enterprise Information" 
            description="Provide basic details about your enterprise"
         >
            <div className="space-y-4">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                     label="Name of Enterprise"
                     name="enterpriseName"
                     value={formData.enterpriseName}
                     onChange={handleInputChange}
                     placeholder="Enter enterprise name"
                     error={errors.enterpriseName}
                     required
                  />
                  
                  <FormInput
                     label="Contact Person"
                     name="contactPerson"
                     value={formData.contactPerson}
                     onChange={handleInputChange}
                     placeholder="Enter contact person name"
                     error={errors.contactPerson}
                     required
                  />
                  
                  <FormInput
                     label="Contact Person Telephone"
                     name="contactPersonTel"
                     value={formData.contactPersonTel}
                     onChange={handleInputChange}
                     placeholder="Enter phone number"
                     error={errors.contactPersonTel}
                     required
                  />
                  
                  <FormInput
                     label="Contact Person Email"
                     name="contactPersonEmail"
                     type="email"
                     value={formData.contactPersonEmail}
                     onChange={handleInputChange}
                     placeholder="Enter email address"
                     error={errors.contactPersonEmail}
                     required
                  />
                  
                  <div className="md:col-span-2">
                     <FormTextarea
                        label="Office Address"
                        name="officeAddress"
                        value={formData.officeAddress}
                        onChange={handleInputChange}
                        placeholder="Enter complete office address"
                        error={errors.officeAddress}
                        required
                        rows={3}
                     />
                  </div>
                  
                  <FormTextarea
                     label="Factory Address"
                     name="factoryAddress"
                     value={formData.factoryAddress}
                     onChange={handleInputChange}
                     placeholder="Enter factory address"
                     rows={3}
                  />
                  
                  <FormInput
                     label="Website"
                     name="website"
                     type="url"
                     value={formData.website}
                     onChange={handleInputChange}
                     placeholder="https://example.com"
                  />
                  
                  <FormSelect
                     label="Position in the Enterprise"
                     name="position"
                     value={formData.position}
                     onChange={handleInputChange}
                     error={errors.position}
                     required
                     options={[
                        { value: 'Owner', label: 'Owner' },
                        { value: 'Manager', label: 'Manager' },
                        { value: 'Director', label: 'Director' },
                        { value: 'President', label: 'President' },
                        { value: 'Other', label: 'Other' }
                     ]}
                  />
               </div>
            </div>
         </FormSection>
      );
   }

   // Step 3: Documents (simplified flow)
   if (currentStep === 3) {
      return (
         <FormSection 
            title="Required Documents" 
            description="Upload the necessary documents for your application"
         >
            <div className="grid grid-cols-1 gap-6">
               <FormFileUpload
                  label="Letter of Intent"
                  name="letterOfIntent"
                  onChange={handleInputChange}
                  error={errors.letterOfIntent}
                  required
                  accept=".pdf,.doc,.docx"
                  helpText="PDF, DOC, or DOCX files only (max 10MB)"
               />
            </div>
         </FormSection>
      );
   }

   return null;
};

export default SETUPFormSteps;