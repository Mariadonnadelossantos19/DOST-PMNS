import React, { useState, useEffect } from 'react';
import { Button, Badge } from '../UI';

const EditApplicationModal = ({ 
   selectedApplication, 
   onClose, 
   onSave
}) => {
   const [currentStep, setCurrentStep] = useState(1);
   const [formData, setFormData] = useState({});
   const [uploadedFiles, setUploadedFiles] = useState({});
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [errors, setErrors] = useState({});

   const totalSteps = 6;

   useEffect(() => {
      if (selectedApplication) {
         setFormData({
            enterpriseName: selectedApplication.enterpriseName || '',
            contactPerson: selectedApplication.contactPerson || '',
            officeAddress: selectedApplication.officeAddress || '',
            factoryAddress: selectedApplication.factoryAddress || '',
            website: selectedApplication.website || '',
            position: selectedApplication.position || '',
            contactPersonTel: selectedApplication.contactPersonTel || '',
            factoryTel: selectedApplication.factoryTel || '',
            contactPersonFax: selectedApplication.contactPersonFax || '',
            factoryFax: selectedApplication.factoryFax || '',
            contactPersonEmail: selectedApplication.contactPersonEmail || '',
            factoryEmail: selectedApplication.factoryEmail || '',
            yearEstablished: selectedApplication.yearEstablished || '',
            initialCapital: selectedApplication.initialCapital || '',
            organizationType: selectedApplication.organizationType || '',
            profitType: selectedApplication.profitType || '',
            registrationNo: selectedApplication.registrationNo || '',
            yearRegistered: selectedApplication.yearRegistered || '',
            capitalClassification: selectedApplication.capitalClassification || '',
            employmentClassification: selectedApplication.employmentClassification || '',
            directWorkers: selectedApplication.directWorkers || '',
            productionWorkers: selectedApplication.productionWorkers || '',
            nonProductionWorkers: selectedApplication.nonProductionWorkers || '',
            contractWorkers: selectedApplication.contractWorkers || '',
            totalWorkers: selectedApplication.totalWorkers || '',
            businessActivity: selectedApplication.businessActivity || '',
            specificProduct: selectedApplication.specificProduct || '',
            enterpriseBackground: selectedApplication.enterpriseBackground || '',
            technologyNeeds: selectedApplication.technologyNeeds || '',
            currentTechnologyLevel: selectedApplication.currentTechnologyLevel || '',
            desiredTechnologyLevel: selectedApplication.desiredTechnologyLevel || '',
            expectedOutcomes: selectedApplication.expectedOutcomes || '',
            projectTitle: selectedApplication.projectTitle || '',
            projectDescription: selectedApplication.projectDescription || '',
            totalProjectCost: selectedApplication.totalProjectCost || '',
            requestedAmount: selectedApplication.requestedAmount || '',
            counterpartFunding: selectedApplication.counterpartFunding || '',
            expectedStartDate: selectedApplication.expectedStartDate || '',
            expectedEndDate: selectedApplication.expectedEndDate || '',
            remarks: selectedApplication.remarks || '',
            notes: selectedApplication.notes || '',
         });
      }
   }, [selectedApplication]);

   const handleInputChange = (field, value) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));
      // Clear error when user starts typing
      if (errors[field]) {
         setErrors(prev => ({
            ...prev,
            [field]: ''
         }));
      }
   };

   const handleFileUpload = (field, file) => {
      setUploadedFiles(prev => ({
         ...prev,
         [field]: file
      }));
   };

   const validateStep = (step) => {
      const newErrors = {};
      
      switch (step) {
         case 1: // Enterprise Information
            if (!formData.enterpriseName.trim()) newErrors.enterpriseName = 'Enterprise name is required';
            if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
            if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = 'Contact email is required';
            break;
         case 2: // Business Details
            if (!formData.yearEstablished) newErrors.yearEstablished = 'Year established is required';
            if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
            if (!formData.businessActivity.trim()) newErrors.businessActivity = 'Business activity is required';
            break;
         case 3: // Workforce Information
            if (!formData.directWorkers) newErrors.directWorkers = 'Direct workers count is required';
            if (!formData.totalWorkers) newErrors.totalWorkers = 'Total workers count is required';
            break;
         case 4: // Technology & Project Details
            if (!formData.technologyNeeds.trim()) newErrors.technologyNeeds = 'Technology needs is required';
            if (!formData.currentTechnologyLevel) newErrors.currentTechnologyLevel = 'Current technology level is required';
            if (!formData.desiredTechnologyLevel) newErrors.desiredTechnologyLevel = 'Desired technology level is required';
            break;
         case 5: // Financial Information
            if (!formData.totalProjectCost) newErrors.totalProjectCost = 'Total project cost is required';
            if (!formData.requestedAmount) newErrors.requestedAmount = 'Requested amount is required';
            break;
         case 6: // Additional Information
            // No required fields in this step
            break;
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNext = () => {
      if (validateStep(currentStep)) {
         setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
   };

   const handlePrevious = () => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
   };

   const handleSubmit = async () => {
      if (validateStep(currentStep)) {
         setIsSubmitting(true);
         try {
            await onSave(formData, uploadedFiles);
            onClose();
         } catch (error) {
            console.error('Error saving application:', error);
         } finally {
            setIsSubmitting(false);
         }
      }
   };

   const renderStepContent = () => {
      switch (currentStep) {
         case 1:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Enterprise Name *
                        </label>
                        <input
                           type="text"
                           value={formData.enterpriseName}
                           onChange={(e) => handleInputChange('enterpriseName', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.enterpriseName ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.enterpriseName && <p className="text-red-500 text-sm mt-1">{errors.enterpriseName}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Contact Person *
                        </label>
                        <input
                           type="text"
                           value={formData.contactPerson}
                           onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Position
                        </label>
                        <input
                           type="text"
                           value={formData.position}
                           onChange={(e) => handleInputChange('position', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Contact Email *
                        </label>
                        <input
                           type="email"
                           value={formData.contactPersonEmail}
                           onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.contactPersonEmail ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.contactPersonEmail && <p className="text-red-500 text-sm mt-1">{errors.contactPersonEmail}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Contact Phone
                        </label>
                        <input
                           type="tel"
                           value={formData.contactPersonTel}
                           onChange={(e) => handleInputChange('contactPersonTel', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Website
                        </label>
                        <input
                           type="url"
                           value={formData.website}
                           onChange={(e) => handleInputChange('website', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Address
                     </label>
                     <textarea
                        value={formData.officeAddress}
                        onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Factory Address
                     </label>
                     <textarea
                        value={formData.factoryAddress}
                        onChange={(e) => handleInputChange('factoryAddress', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                  </div>
               </div>
            );

         case 2:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Year Established *
                        </label>
                        <input
                           type="number"
                           value={formData.yearEstablished}
                           onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.yearEstablished ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.yearEstablished && <p className="text-red-500 text-sm mt-1">{errors.yearEstablished}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Initial Capital (₱)
                        </label>
                        <input
                           type="number"
                           value={formData.initialCapital}
                           onChange={(e) => handleInputChange('initialCapital', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Organization Type *
                        </label>
                        <select
                           value={formData.organizationType}
                           onChange={(e) => handleInputChange('organizationType', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.organizationType ? 'border-red-500' : 'border-gray-300'
                           }`}
                        >
                           <option value="">Select organization type</option>
                           <option value="Single proprietorship">Single proprietorship</option>
                           <option value="Partnership">Partnership</option>
                           <option value="Corporation">Corporation</option>
                           <option value="Cooperative">Cooperative</option>
                           <option value="Other">Other</option>
                        </select>
                        {errors.organizationType && <p className="text-red-500 text-sm mt-1">{errors.organizationType}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Profit Type
                        </label>
                        <select
                           value={formData.profitType}
                           onChange={(e) => handleInputChange('profitType', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                           <option value="">Select profit type</option>
                           <option value="Profit">Profit</option>
                           <option value="Non-profit">Non-profit</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Registration Number
                        </label>
                        <input
                           type="text"
                           value={formData.registrationNo}
                           onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Year Registered
                        </label>
                        <input
                           type="number"
                           value={formData.yearRegistered}
                           onChange={(e) => handleInputChange('yearRegistered', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Capital Classification
                        </label>
                        <select
                           value={formData.capitalClassification}
                           onChange={(e) => handleInputChange('capitalClassification', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                           <option value="">Select classification</option>
                           <option value="Micro">Micro</option>
                           <option value="Small">Small</option>
                           <option value="Medium">Medium</option>
                           <option value="Large">Large</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Employment Classification
                        </label>
                        <select
                           value={formData.employmentClassification}
                           onChange={(e) => handleInputChange('employmentClassification', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                           <option value="">Select classification</option>
                           <option value="Micro">Micro</option>
                           <option value="Small">Small</option>
                           <option value="Medium">Medium</option>
                           <option value="Large">Large</option>
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Activity *
                    </label>
                    <input
                       type="text"
                       value={formData.businessActivity}
                       onChange={(e) => handleInputChange('businessActivity', e.target.value)}
                       className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.businessActivity ? 'border-red-500' : 'border-gray-300'
                       }`}
                    />
                    {errors.businessActivity && <p className="text-red-500 text-sm mt-1">{errors.businessActivity}</p>}
                  </div>
               </div>
            );

         case 3:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workforce Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Direct Workers *
                        </label>
                        <input
                           type="number"
                           value={formData.directWorkers}
                           onChange={(e) => handleInputChange('directWorkers', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.directWorkers ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.directWorkers && <p className="text-red-500 text-sm mt-1">{errors.directWorkers}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Production Workers
                        </label>
                        <input
                           type="number"
                           value={formData.productionWorkers}
                           onChange={(e) => handleInputChange('productionWorkers', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Non-Production Workers
                        </label>
                        <input
                           type="number"
                           value={formData.nonProductionWorkers}
                           onChange={(e) => handleInputChange('nonProductionWorkers', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Contract Workers
                        </label>
                        <input
                           type="number"
                           value={formData.contractWorkers}
                           onChange={(e) => handleInputChange('contractWorkers', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Total Workers *
                        </label>
                        <input
                           type="number"
                           value={formData.totalWorkers}
                           onChange={(e) => handleInputChange('totalWorkers', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.totalWorkers ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.totalWorkers && <p className="text-red-500 text-sm mt-1">{errors.totalWorkers}</p>}
                     </div>
                  </div>
               </div>
            );

         case 4:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology & Project Details</h3>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technology Needs *
                    </label>
                    <textarea
                       value={formData.technologyNeeds}
                       onChange={(e) => handleInputChange('technologyNeeds', e.target.value)}
                       rows={4}
                       className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.technologyNeeds ? 'border-red-500' : 'border-gray-300'
                       }`}
                    />
                    {errors.technologyNeeds && <p className="text-red-500 text-sm mt-1">{errors.technologyNeeds}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Current Technology Level *
                        </label>
                        <select
                           value={formData.currentTechnologyLevel}
                           onChange={(e) => handleInputChange('currentTechnologyLevel', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.currentTechnologyLevel ? 'border-red-500' : 'border-gray-300'
                           }`}
                        >
                           <option value="">Select level</option>
                           <option value="Basic">Basic</option>
                           <option value="Intermediate">Intermediate</option>
                           <option value="Advanced">Advanced</option>
                        </select>
                        {errors.currentTechnologyLevel && <p className="text-red-500 text-sm mt-1">{errors.currentTechnologyLevel}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Desired Technology Level *
                        </label>
                        <select
                           value={formData.desiredTechnologyLevel}
                           onChange={(e) => handleInputChange('desiredTechnologyLevel', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.desiredTechnologyLevel ? 'border-red-500' : 'border-gray-300'
                           }`}
                        >
                           <option value="">Select level</option>
                           <option value="Basic">Basic</option>
                           <option value="Intermediate">Intermediate</option>
                           <option value="Advanced">Advanced</option>
                        </select>
                        {errors.desiredTechnologyLevel && <p className="text-red-500 text-sm mt-1">{errors.desiredTechnologyLevel}</p>}
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Outcomes
                    </label>
                    <textarea
                       value={formData.expectedOutcomes}
                       onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title
                    </label>
                    <input
                       type="text"
                       value={formData.projectTitle}
                       onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Description
                    </label>
                    <textarea
                       value={formData.projectDescription}
                       onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
               </div>
            );

         case 5:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Total Project Cost (₱) *
                        </label>
                        <input
                           type="number"
                           value={formData.totalProjectCost}
                           onChange={(e) => handleInputChange('totalProjectCost', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.totalProjectCost ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.totalProjectCost && <p className="text-red-500 text-sm mt-1">{errors.totalProjectCost}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Requested Amount (₱) *
                        </label>
                        <input
                           type="number"
                           value={formData.requestedAmount}
                           onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors.requestedAmount ? 'border-red-500' : 'border-gray-300'
                           }`}
                        />
                        {errors.requestedAmount && <p className="text-red-500 text-sm mt-1">{errors.requestedAmount}</p>}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Counterpart Funding (₱)
                        </label>
                        <input
                           type="number"
                           value={formData.counterpartFunding}
                           onChange={(e) => handleInputChange('counterpartFunding', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Expected Start Date
                        </label>
                        <input
                           type="date"
                           value={formData.expectedStartDate}
                           onChange={(e) => handleInputChange('expectedStartDate', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Expected End Date
                        </label>
                        <input
                           type="date"
                           value={formData.expectedEndDate}
                           onChange={(e) => handleInputChange('expectedEndDate', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                     </div>
                  </div>
               </div>
            );

         case 6:
            return (
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information & Documents</h3>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                    </label>
                    <textarea
                       value={formData.remarks}
                       onChange={(e) => handleInputChange('remarks', e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <textarea
                       value={formData.notes}
                       onChange={(e) => handleInputChange('notes', e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Document Upload Section */}
                  <div className="border-t pt-6">
                     <h4 className="text-md font-semibold text-gray-900 mb-4">Upload Additional Documents</h4>
                     <p className="text-sm text-gray-600 mb-4">
                        Upload any additional documents that were requested during the review process.
                     </p>
                     
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Business Documents
                           </label>
                           <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload('additionalBusinessDocs', e.target.files[0])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           />
                           {uploadedFiles.additionalBusinessDocs && (
                              <p className="text-sm text-green-600 mt-1">
                                 Selected: {uploadedFiles.additionalBusinessDocs.name}
                              </p>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Financial Documents
                           </label>
                           <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload('financialDocs', e.target.files[0])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           />
                           {uploadedFiles.financialDocs && (
                              <p className="text-sm text-green-600 mt-1">
                                 Selected: {uploadedFiles.financialDocs.name}
                              </p>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Technical Documents
                           </label>
                           <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload('technicalDocs', e.target.files[0])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           />
                           {uploadedFiles.technicalDocs && (
                              <p className="text-sm text-green-600 mt-1">
                                 Selected: {uploadedFiles.technicalDocs.name}
                              </p>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Other Supporting Documents
                           </label>
                           <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload('otherDocs', e.target.files[0])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           />
                           {uploadedFiles.otherDocs && (
                              <p className="text-sm text-green-600 mt-1">
                                 Selected: {uploadedFiles.otherDocs.name}
                              </p>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            );

         default:
            return null;
      }
   };

   if (!selectedApplication) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
               {/* Header */}
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-xl font-bold text-gray-900">Edit Application</h3>
                     <p className="text-sm text-gray-600 mt-1">
                        Application ID: {selectedApplication.applicationId}
                     </p>
                  </div>
                  <button
                     onClick={onClose}
                     className="text-gray-500 hover:text-gray-700"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>

               {/* Progress Bar */}
               <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                     <span>Step {currentStep} of {totalSteps}</span>
                     <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                     ></div>
                  </div>
               </div>

               {/* Step Content */}
               <div className="mb-6">
                  {renderStepContent()}
               </div>

               {/* Navigation Buttons */}
               <div className="flex justify-between">
                  <Button
                     onClick={handlePrevious}
                     disabled={currentStep === 1}
                     variant="outline"
                     className="px-6 py-2"
                  >
                     Previous
                  </Button>

                  <div className="flex space-x-3">
                     <Button
                        onClick={onClose}
                        variant="outline"
                        className="px-6 py-2"
                     >
                        Cancel
                     </Button>
                     
                     {currentStep === totalSteps ? (
                        <Button
                           onClick={handleSubmit}
                           disabled={isSubmitting}
                           className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                           {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                     ) : (
                        <Button
                           onClick={handleNext}
                           className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                           Next
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default EditApplicationModal;
