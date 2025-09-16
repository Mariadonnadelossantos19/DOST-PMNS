import React from 'react';
import { FormSection, FormInput, FormTextarea, FormSelect, FormFileUpload } from '../components';

const SETUPFormSteps = ({ formData, errors, handleInputChange, currentStep }) => {
   // Step 2: Enterprise Information
   if (currentStep === 2) {
      return (
         <FormSection 
            title="Enterprise Information" 
            description="Provide details about your enterprise"
         >
            <div className="space-y-6">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

               {/* Enterprise Details */}
               <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Enterprise Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormInput
                        label="Year Established"
                        name="yearEstablished"
                        type="number"
                        value={formData.yearEstablished}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        error={errors.yearEstablished}
                        required
                     />
                     
                     <FormInput
                        label="Initial Capital (PHP)"
                        name="initialCapital"
                        type="number"
                        value={formData.initialCapital}
                        onChange={handleInputChange}
                        placeholder="e.g., 1000000"
                     />
                     
                     <FormSelect
                        label="Organization Type"
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        error={errors.organizationType}
                        required
                        options={[
                           { value: 'Single proprietorship', label: 'Single proprietorship' },
                           { value: 'Cooperative', label: 'Cooperative' },
                           { value: 'Partnership', label: 'Partnership' },
                           { value: 'Corporation', label: 'Corporation' }
                        ]}
                     />
                     
                     <FormSelect
                        label="Profit Type"
                        name="profitType"
                        value={formData.profitType}
                        onChange={handleInputChange}
                        error={errors.profitType}
                        required
                        options={[
                           { value: 'Profit', label: 'Profit' },
                           { value: 'Non-profit', label: 'Non-profit' }
                        ]}
                     />
                     
                     <FormInput
                        label="Registration Number"
                        name="registrationNo"
                        value={formData.registrationNo}
                        onChange={handleInputChange}
                        placeholder="e.g., SEC-123456789"
                        error={errors.registrationNo}
                        required
                     />
                     
                     <FormInput
                        label="Year Registered"
                        name="yearRegistered"
                        type="number"
                        value={formData.yearRegistered}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        error={errors.yearRegistered}
                        required
                     />
                     
                     <FormSelect
                        label="Capital Classification"
                        name="capitalClassification"
                        value={formData.capitalClassification}
                        onChange={handleInputChange}
                        error={errors.capitalClassification}
                        required
                        options={[
                           { value: 'Micro', label: 'Micro' },
                           { value: 'Small', label: 'Small' },
                           { value: 'Medium', label: 'Medium' }
                        ]}
                     />
                     
                     <FormSelect
                        label="Employment Classification"
                        name="employmentClassification"
                        value={formData.employmentClassification}
                        onChange={handleInputChange}
                        error={errors.employmentClassification}
                        required
                        options={[
                           { value: 'Micro', label: 'Micro' },
                           { value: 'Small', label: 'Small' },
                           { value: 'Medium', label: 'Medium' }
                        ]}
                     />
                  </div>
               </div>
            </div>
         </FormSection>
      );
   }

   // Step 3: Business Activity
   if (currentStep === 3) {
      return (
         <FormSection 
            title="Business Activity" 
            description="Describe your business operations and background"
         >
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                     Business Activity *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {[
                        'Food Processing', 'Furniture', 'Natural Fibers, Gifts, Toys and Housewares',
                        'Metals and Engineering', 'Metalcasting', 'Machining',
                        'Welding and Fabrication', 'Electroplating', 'Forging',
                        'Tool, Die and Mould Fabrication', 'Aquaculture and Marine Resources',
                        'Horticulture', 'Others'
                     ].map((activity) => (
                        <label key={activity} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                           <input
                              type="radio"
                              name="businessActivity"
                              value={activity}
                              checked={formData.businessActivity === activity}
                              onChange={handleInputChange}
                              className="mr-3"
                           />
                           <span className="text-sm text-gray-700">{activity}</span>
                        </label>
                     ))}
                  </div>
                  {errors.businessActivity && (
                     <p className="text-red-500 text-sm mt-1">{errors.businessActivity}</p>
                  )}
               </div>

               <FormTextarea
                  label="Specific product or service the enterprise offers its customers"
                  name="specificProduct"
                  value={formData.specificProduct}
                  onChange={handleInputChange}
                  placeholder="Describe your specific products or services"
                  error={errors.specificProduct}
                  required
                  rows={4}
               />

               <FormTextarea
                  label="Brief Enterprise Background/Profile"
                  name="enterpriseBackground"
                  value={formData.enterpriseBackground}
                  onChange={handleInputChange}
                  placeholder="Provide a brief background of your enterprise"
                  error={errors.enterpriseBackground}
                  required
                  rows={4}
               />
            </div>
         </FormSection>
      );
   }

   // Step 4: Technology Assessment
   if (currentStep === 4) {
      return (
         <FormSection 
            title="Technology Needs Assessment" 
            description="Describe your technology needs and expected outcomes"
         >
            <div className="space-y-6">
               <FormTextarea
                  label="Technology Needs"
                  name="technologyNeeds"
                  value={formData.technologyNeeds}
                  onChange={handleInputChange}
                  placeholder="Describe your current technology needs and challenges"
                  error={errors.technologyNeeds}
                  required
                  rows={4}
               />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                     label="Current Technology Level"
                     name="currentTechnologyLevel"
                     value={formData.currentTechnologyLevel}
                     onChange={handleInputChange}
                     error={errors.currentTechnologyLevel}
                     required
                     options={[
                        { value: 'Basic', label: 'Basic' },
                        { value: 'Intermediate', label: 'Intermediate' },
                        { value: 'Advanced', label: 'Advanced' }
                     ]}
                  />
                  
                  <FormSelect
                     label="Desired Technology Level"
                     name="desiredTechnologyLevel"
                     value={formData.desiredTechnologyLevel}
                     onChange={handleInputChange}
                     error={errors.desiredTechnologyLevel}
                     required
                     options={[
                        { value: 'Basic', label: 'Basic' },
                        { value: 'Intermediate', label: 'Intermediate' },
                        { value: 'Advanced', label: 'Advanced' }
                     ]}
                  />
               </div>
               
               <FormTextarea
                  label="Expected Outcomes"
                  name="expectedOutcomes"
                  value={formData.expectedOutcomes}
                  onChange={handleInputChange}
                  placeholder="Describe the expected outcomes from technology upgrading"
                  error={errors.expectedOutcomes}
                  required
                  rows={4}
               />
            </div>
         </FormSection>
      );
   }

   // Step 5: Documents
   if (currentStep === 5) {
      return (
         <FormSection 
            title="Required Documents" 
            description="Upload the necessary documents for your application"
         >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormFileUpload
                  label="Letter of Intent"
                  name="letterOfIntent"
                  onChange={handleInputChange}
                  error={errors.letterOfIntent}
                  required
                  accept=".pdf,.doc,.docx"
                  helpText="PDF, DOC, or DOCX files only (max 10MB)"
               />

               <FormFileUpload
                  label="Enterprise Profile"
                  name="enterpriseProfile"
                  onChange={handleInputChange}
                  error={errors.enterpriseProfile}
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
