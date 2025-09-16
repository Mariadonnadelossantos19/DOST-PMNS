import React from 'react';
import { FormSection, FormInput, FormTextarea, FormSelect, FormFileUpload } from '../components';

const GIAFormSteps = ({ formData, errors, handleInputChange, currentStep }) => {
   // Step 2: Project Information
   if (currentStep === 2) {
      return (
         <FormSection 
            title="Research Project Information" 
            description="Provide details about your research project"
         >
            <div className="space-y-6">
               <FormInput
                  label="Project Title"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="Enter research project title"
                  error={errors.projectTitle}
                  required
               />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                     label="Project Duration (months)"
                     name="projectDuration"
                     type="number"
                     value={formData.projectDuration}
                     onChange={handleInputChange}
                     placeholder="Enter duration in months"
                     error={errors.projectDuration}
                     required
                     min="1"
                     max="60"
                  />
                  
                  <FormInput
                     label="Requested Amount (PHP)"
                     name="requestedAmount"
                     type="number"
                     value={formData.requestedAmount}
                     onChange={handleInputChange}
                     placeholder="Enter requested amount"
                     error={errors.requestedAmount}
                     required
                     min="0"
                  />
               </div>
               
               <FormTextarea
                  label="Project Description"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your research project"
                  error={errors.projectDescription}
                  required
                  rows={4}
               />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                     label="Research Area"
                     name="researchArea"
                     value={formData.researchArea}
                     onChange={handleInputChange}
                     error={errors.researchArea}
                     required
                     options={[
                        { value: 'Agriculture', label: 'Agriculture' },
                        { value: 'Health', label: 'Health' },
                        { value: 'Environment', label: 'Environment' },
                        { value: 'Energy', label: 'Energy' },
                        { value: 'Information Technology', label: 'Information Technology' },
                        { value: 'Manufacturing', label: 'Manufacturing' },
                        { value: 'Other', label: 'Other' }
                     ]}
                  />
                  
                  <FormInput
                     label="Sub-Research Area"
                     name="subResearchArea"
                     value={formData.subResearchArea}
                     onChange={handleInputChange}
                     placeholder="Enter sub-research area"
                     error={errors.subResearchArea}
                     required
                  />
               </div>
               
               <FormTextarea
                  label="Research Methodology"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleInputChange}
                  placeholder="Describe your research methodology"
                  error={errors.methodology}
                  required
                  rows={4}
               />
            </div>
         </FormSection>
      );
   }

   // Step 3: Principal Investigator
   if (currentStep === 3) {
      return (
         <FormSection 
            title="Principal Investigator" 
            description="Information about the lead researcher"
         >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormInput
                  label="Full Name"
                  name="principalInvestigator.name"
                  value={formData.principalInvestigator?.name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
               />
               
               <FormInput
                  label="Position"
                  name="principalInvestigator.position"
                  value={formData.principalInvestigator?.position || ''}
                  onChange={handleInputChange}
                  placeholder="Enter position"
               />
               
               <div className="md:col-span-2">
                  <FormTextarea
                     label="Qualifications"
                     name="principalInvestigator.qualifications"
                     value={formData.principalInvestigator?.qualifications || ''}
                     onChange={handleInputChange}
                     placeholder="Enter qualifications and credentials"
                     rows={3}
                  />
               </div>
               
               <div className="md:col-span-2">
                  <FormTextarea
                     label="Research Experience"
                     name="principalInvestigator.experience"
                     value={formData.principalInvestigator?.experience || ''}
                     onChange={handleInputChange}
                     placeholder="Describe relevant research experience"
                     rows={3}
                  />
               </div>
            </div>
         </FormSection>
      );
   }

   // Step 4: Budget Breakdown
   if (currentStep === 4) {
      return (
         <FormSection 
            title="Budget Breakdown" 
            description="Detailed financial breakdown of your project"
         >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormInput
                  label="Personnel (PHP)"
                  name="budgetBreakdown.personnel"
                  type="number"
                  value={formData.budgetBreakdown?.personnel || ''}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
               />
               
               <FormInput
                  label="Equipment (PHP)"
                  name="budgetBreakdown.equipment"
                  type="number"
                  value={formData.budgetBreakdown?.equipment || ''}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
               />
               
               <FormInput
                  label="Supplies (PHP)"
                  name="budgetBreakdown.supplies"
                  type="number"
                  value={formData.budgetBreakdown?.supplies || ''}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
               />
               
               <FormInput
                  label="Travel (PHP)"
                  name="budgetBreakdown.travel"
                  type="number"
                  value={formData.budgetBreakdown?.travel || ''}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
               />
               
               <FormInput
                  label="Other (PHP)"
                  name="budgetBreakdown.other"
                  type="number"
                  value={formData.budgetBreakdown?.other || ''}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
               />
               
               <FormInput
                  label="Total (PHP)"
                  name="budgetBreakdown.total"
                  type="number"
                  value={formData.budgetBreakdown?.total || ''}
                  onChange={handleInputChange}
                  placeholder="Enter total amount"
                  min="0"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormFileUpload
                  label="Research Proposal"
                  name="researchProposal"
                  onChange={handleInputChange}
                  error={errors.researchProposal}
                  required
                  accept=".pdf,.doc,.docx"
                  helpText="PDF, DOC, or DOCX (max 10MB)"
               />
               
               <FormFileUpload
                  label="Curriculum Vitae"
                  name="curriculumVitae"
                  onChange={handleInputChange}
                  error={errors.curriculumVitae}
                  required
                  accept=".pdf,.doc,.docx"
                  helpText="PDF, DOC, or DOCX (max 10MB)"
               />
               
               <FormFileUpload
                  label="Endorsement Letter"
                  name="endorsementLetter"
                  onChange={handleInputChange}
                  error={errors.endorsementLetter}
                  required
                  accept=".pdf,.doc,.docx"
                  helpText="PDF, DOC, or DOCX (max 10MB)"
               />
            </div>
         </FormSection>
      );
   }

   return null;
};

export default GIAFormSteps;
