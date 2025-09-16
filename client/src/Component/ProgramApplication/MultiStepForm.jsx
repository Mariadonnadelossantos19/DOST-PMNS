import React, { useState } from 'react';
import SETUPFormSteps from './forms/SETUPFormSteps';
import GIAFormSteps from './forms/GIAFormSteps';
import CESTForm from './forms/CESTForm';
import SSCPForm from './forms/SSCPForm';
import { ContactInformation } from './components';
import { API_ENDPOINTS } from '../../config/api';

const MultiStepForm = ({ selectedProgram, onBack, onSubmit }) => {
   const [currentStep, setCurrentStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState('');
   const [formData, setFormData] = useState({
      programCode: selectedProgram?.code || '',
      contactPerson: '',
      contactPersonTel: '',
      contactPersonEmail: '',
      
      // SETUP fields
      enterpriseName: '',
      officeAddress: '',
      factoryAddress: '',
      website: '',
      position: '',
      factoryTel: '',
      contactPersonFax: '',
      factoryFax: '',
      factoryEmail: '',
      yearEstablished: '',
      initialCapital: '',
      organizationType: '',
      profitType: '',
      registrationNo: '',
      yearRegistered: '',
      capitalClassification: '',
      employmentClassification: '',
      directWorkers: '',
      productionWorkers: '',
      nonProductionWorkers: '',
      contractWorkers: '',
      totalWorkers: '',
      businessActivity: '',
      specificProduct: '',
      enterpriseBackground: '',
      technologyNeeds: '',
      currentTechnologyLevel: '',
      desiredTechnologyLevel: '',
      expectedOutcomes: '',
      
      // GIA fields
      projectTitle: '',
      projectDuration: '',
      requestedAmount: '',
      projectDescription: '',
      methodology: '',
      researchArea: '',
      subResearchArea: '',
      principalInvestigator: {
         name: '',
         position: '',
         qualifications: '',
         experience: ''
      },
      budgetBreakdown: {
         personnel: '',
         equipment: '',
         supplies: '',
         travel: '',
         other: '',
         total: ''
      },
      
      // CEST fields
      communityName: '',
      communityLocation: '',
      communityPopulation: '',
      communityLeader: {
         name: '',
         position: '',
         contact: ''
      },
      proposedSolution: '',
      expectedImpact: '',
      technologyArea: '',
      specificTechnology: '',
      communityParticipation: '',
      totalBudget: '',
      communityContribution: '',
      
      // SSCP fields
      enterpriseType: '',
      yearsInOperation: '',
      innovationTitle: '',
      innovationDescription: '',
      technologyReadinessLevel: '',
      marketPotential: '',
      competitiveAdvantage: '',
      targetMarket: '',
      businessModel: '',
      marketStrategy: '',
      totalProjectCost: '',
      equityContribution: '',
      otherFunding: '',
      projectLeader: {
         name: '',
         position: '',
         qualifications: '',
         experience: ''
      },
      
      // File uploads
      letterOfIntent: null,
      enterpriseProfile: null,
      businessPlan: null,
      researchProposal: null,
      curriculumVitae: null,
      endorsementLetter: null,
      communityProfile: null,
      projectProposal: null,
      communityResolution: null,
      technicalDocumentation: null,
      marketStudy: null,
      financialProjections: null
   });

   const [errors, setErrors] = useState({});

   // Define steps based on program type
   const getSteps = () => {
      const programCode = formData.programCode;
      
      if (programCode === 'SETUP') {
         return [
            { id: 1, title: 'Contact Information', description: 'Basic contact details' },
            { id: 2, title: 'Enterprise Information', description: 'Company details and structure' },
            { id: 3, title: 'Business Activity', description: 'Business operations and background' },
            { id: 4, title: 'Technology Assessment', description: 'Technology needs and outcomes' },
            { id: 5, title: 'Documents', description: 'Required file uploads' }
         ];
      } else if (programCode === 'GIA') {
         return [
            { id: 1, title: 'Contact Information', description: 'Basic contact details' },
            { id: 2, title: 'Project Information', description: 'Research project details' },
            { id: 3, title: 'Principal Investigator', description: 'Lead researcher information' },
            { id: 4, title: 'Budget Breakdown', description: 'Project financial details' },
            { id: 5, title: 'Documents', description: 'Required file uploads' }
         ];
      } else if (programCode === 'CEST') {
         return [
            { id: 1, title: 'Contact Information', description: 'Basic contact details' },
            { id: 2, title: 'Community Information', description: 'Community details and leader' },
            { id: 3, title: 'Project Information', description: 'Community project details' },
            { id: 4, title: 'Technology Focus', description: 'Technology area and solutions' },
            { id: 5, title: 'Documents', description: 'Required file uploads' }
         ];
      } else if (programCode === 'SSCP') {
         return [
            { id: 1, title: 'Contact Information', description: 'Basic contact details' },
            { id: 2, title: 'Enterprise Information', description: 'Company details' },
            { id: 3, title: 'Innovation Details', description: 'Innovation and commercialization' },
            { id: 4, title: 'Project Team', description: 'Team and financial information' },
            { id: 5, title: 'Documents', description: 'Required file uploads' }
         ];
      }
      
      return [
         { id: 1, title: 'Contact Information', description: 'Basic contact details' },
         { id: 2, title: 'Program Details', description: 'Program-specific information' },
         { id: 3, title: 'Documents', description: 'Required file uploads' }
      ];
   };

   const steps = getSteps();
   const totalSteps = steps.length;

   const handleInputChange = (e) => {
      const { name, value, type, files } = e.target;
      
      if (type === 'file') {
         setFormData(prev => ({
            ...prev,
            [name]: files[0] || null
         }));
      } else if (name.includes('.')) {
         // Handle nested object updates
         const [parent, child] = name.split('.');
         setFormData(prev => ({
            ...prev,
            [parent]: {
               ...prev[parent],
               [child]: value
            }
         }));
      } else {
         setFormData(prev => ({
            ...prev,
            [name]: value
         }));
      }
      
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors(prev => ({
            ...prev,
            [name]: ''
         }));
      }
   };

   const validateCurrentStep = () => {
      const newErrors = {};
      const programCode = formData.programCode;
      
      // Common validation for all steps
      if (currentStep === 1) {
         const commonFields = ['contactPerson', 'contactPersonTel', 'contactPersonEmail'];
         commonFields.forEach(field => {
            if (!formData[field]) {
               newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
            }
         });
         
         // Email validation
         if (formData.contactPersonEmail && !/\S+@\S+\.\S+/.test(formData.contactPersonEmail)) {
            newErrors.contactPersonEmail = 'Please enter a valid email address';
         }
      }
      
      // Program-specific step validation
      if (programCode === 'SETUP') {
         if (currentStep === 2) {
            const fields = [
               'enterpriseName', 'officeAddress', 'position', 'contactPersonTel', 'contactPersonEmail',
               'yearEstablished', 'organizationType', 'profitType', 'registrationNo', 'yearRegistered',
               'capitalClassification', 'employmentClassification'
            ];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 3) {
            const fields = ['businessActivity', 'specificProduct', 'enterpriseBackground'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 4) {
            const fields = ['technologyNeeds', 'currentTechnologyLevel', 'desiredTechnologyLevel', 'expectedOutcomes'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 5) {
            if (!formData.letterOfIntent) {
               newErrors.letterOfIntent = 'Letter of Intent is required';
            }
            if (!formData.enterpriseProfile) {
               newErrors.enterpriseProfile = 'Enterprise Profile is required';
            }
         }
      } else if (programCode === 'GIA') {
         if (currentStep === 2) {
            const fields = ['projectTitle', 'projectDuration', 'requestedAmount', 'projectDescription', 'methodology', 'researchArea', 'subResearchArea'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 5) {
            if (!formData.researchProposal) {
               newErrors.researchProposal = 'Research Proposal is required';
            }
            if (!formData.curriculumVitae) {
               newErrors.curriculumVitae = 'Curriculum Vitae is required';
            }
            if (!formData.endorsementLetter) {
               newErrors.endorsementLetter = 'Endorsement Letter is required';
            }
         }
      } else if (programCode === 'CEST') {
         if (currentStep === 2) {
            const fields = ['communityName', 'communityLocation', 'communityPopulation'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 3) {
            const fields = ['projectTitle', 'projectDuration', 'projectDescription'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 4) {
            const fields = ['proposedSolution', 'expectedImpact', 'technologyArea', 'specificTechnology', 'communityParticipation', 'totalBudget', 'requestedAmount', 'communityContribution'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 5) {
            if (!formData.communityProfile) {
               newErrors.communityProfile = 'Community Profile is required';
            }
            if (!formData.projectProposal) {
               newErrors.projectProposal = 'Project Proposal is required';
            }
            if (!formData.communityResolution) {
               newErrors.communityResolution = 'Community Resolution is required';
            }
         }
      } else if (programCode === 'SSCP') {
         if (currentStep === 2) {
            const fields = ['enterpriseName', 'enterpriseType', 'yearsInOperation'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 3) {
            const fields = ['innovationTitle', 'innovationDescription', 'technologyReadinessLevel', 'marketPotential', 'competitiveAdvantage', 'targetMarket', 'businessModel', 'marketStrategy'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 4) {
            const fields = ['totalProjectCost', 'requestedAmount', 'equityContribution'];
            fields.forEach(field => {
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
               }
            });
         } else if (currentStep === 5) {
            if (!formData.businessPlan) {
               newErrors.businessPlan = 'Business Plan is required';
            }
            if (!formData.technicalDocumentation) {
               newErrors.technicalDocumentation = 'Technical Documentation is required';
            }
            if (!formData.marketStudy) {
               newErrors.marketStudy = 'Market Study is required';
            }
            if (!formData.financialProjections) {
               newErrors.financialProjections = 'Financial Projections is required';
            }
         }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNext = () => {
      if (validateCurrentStep()) {
         setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
   };

   const handlePrevious = () => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
   };

   // Function to validate token format
   const validateToken = (token) => {
      if (!token) {
         console.log('MultiStepForm - No token provided');
         return false;
      }
      
      console.log('MultiStepForm - Token length:', token.length);
      console.log('MultiStepForm - Token preview:', token.substring(0, 20) + '...');
      
      const parts = token.split('.');
      console.log('MultiStepForm - Token parts count:', parts.length);
      
      if (parts.length !== 3) {
         console.log('MultiStepForm - Invalid token format - not 3 parts');
         return false;
      }
      
      try {
         const header = JSON.parse(atob(parts[0]));
         const payload = JSON.parse(atob(parts[1]));
         console.log('MultiStepForm - Token header:', header);
         console.log('MultiStepForm - Token payload:', payload);
         
         // Check if token is expired
         const currentTime = Math.floor(Date.now() / 1000);
         if (payload.exp && payload.exp < currentTime) {
            console.log('MultiStepForm - Token expired');
            return false;
         }
         
         return true;
      } catch (error) {
         console.error('MultiStepForm - Token decode error:', error);
         return false;
      }
   };

   // Function to clear all auth data
   const clearAuthData = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      console.log('MultiStepForm - Cleared all auth data from localStorage');
   };

   // Function to submit application to API
   const submitApplication = async (submissionData) => {
      try {
         setIsSubmitting(true);
         setSubmitError('');

         // Get auth token
         const token = localStorage.getItem('authToken');
         console.log('MultiStepForm - Auth token:', token ? 'Found' : 'Not found');
         
         if (!token) {
            throw new Error('Please login first');
         }

         // Validate token format
         if (!validateToken(token)) {
            console.log('MultiStepForm - Token validation failed, clearing auth data...');
            clearAuthData();
            throw new Error('Invalid token format. Please login again.');
         }

         // Create FormData for file uploads
         const submitData = new FormData();
         
         // Add all form fields
         Object.keys(submissionData).forEach(key => {
            if (submissionData[key] !== null && submissionData[key] !== undefined) {
               if (submissionData[key] instanceof File) {
                  submitData.append(key, submissionData[key]);
               } else if (typeof submissionData[key] === 'object') {
                  submitData.append(key, JSON.stringify(submissionData[key]));
               } else {
                  submitData.append(key, submissionData[key]);
               }
            }
         });

         // Get endpoint based on program type
         let endpoint = '';
         if (submissionData.programCode === 'SETUP') {
            endpoint = API_ENDPOINTS.SETUP_SUBMIT;
         } else if (submissionData.programCode === 'GIA') {
            endpoint = API_ENDPOINTS.GIA_SUBMIT;
         } else if (submissionData.programCode === 'CEST') {
            endpoint = API_ENDPOINTS.CEST_SUBMIT;
         } else if (submissionData.programCode === 'SSCP') {
            endpoint = API_ENDPOINTS.SSCP_SUBMIT;
         }

         console.log('MultiStepForm - Submitting to:', endpoint);
         
         const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: submitData
         });

         console.log('MultiStepForm - Response status:', response.status);
         const result = await response.json();
         console.log('MultiStepForm - Response result:', result);
         
         if (result.success) {
            alert('Application submitted successfully!');
            if (onSubmit) {
               onSubmit(submissionData);
            }
         } else {
            if (result.message === 'Invalid token.' || result.message.includes('token')) {
               // Clear invalid token and reload
               clearAuthData();
               alert('Your session has expired. Please login again.');
               window.location.reload();
            } else {
               throw new Error(result.message || 'Submission failed');
            }
         }
      } catch (error) {
         console.error('MultiStepForm - Submission error:', error);
         setSubmitError(error.message);
         
         // If it's a token-related error, clear auth data and reload
         if (error.message.includes('token') || error.message.includes('login')) {
            clearAuthData();
            alert('Authentication error. Please login again.');
            window.location.reload();
         } else {
            alert(`Error: ${error.message}`);
         }
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      
      if (validateCurrentStep()) {
         // Calculate total workers for SETUP
         if (formData.programCode === 'SETUP') {
            const total = parseInt(formData.directWorkers || 0) + 
                         parseInt(formData.contractWorkers || 0);
            formData.totalWorkers = total.toString();
         }
         
         const submissionData = {
            ...formData,
            programCode: selectedProgram.code,
            programName: selectedProgram.name,
            submissionDate: new Date().toISOString()
         };
         
         // Submit directly to API
         submitApplication(submissionData);
      }
   };

   const renderStepIndicator = () => {
      return (
         <div className="mb-8">
            <div className="flex items-center justify-between">
               {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                     <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.id
                           ? 'bg-blue-600 border-blue-600 text-white'
                           : 'bg-white border-gray-300 text-gray-500'
                     }`}>
                        {currentStep > step.id ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        ) : (
                           <span className="text-sm font-semibold">{step.id}</span>
                        )}
                     </div>
                     <div className="ml-3">
                        <p className={`text-sm font-medium ${
                           currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                           {step.title}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                     </div>
                     {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 ${
                           currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                     )}
                  </div>
               ))}
            </div>
         </div>
      );
   };

   const renderContactInformation = () => (
      <ContactInformation 
         formData={formData} 
         errors={errors} 
         handleInputChange={handleInputChange} 
      />
   );

   const renderProgramSpecificStep = () => {
      const programCode = formData.programCode;
      
      if (currentStep > 1) {
         if (programCode === 'SETUP') {
            return <SETUPFormSteps formData={formData} errors={errors} handleInputChange={handleInputChange} currentStep={currentStep} />;
         } else if (programCode === 'GIA') {
            return <GIAFormSteps formData={formData} errors={errors} handleInputChange={handleInputChange} currentStep={currentStep} />;
         } else if (programCode === 'CEST') {
            return <CESTForm formData={formData} errors={errors} handleInputChange={handleInputChange} />;
         } else if (programCode === 'SSCP') {
            return <SSCPForm formData={formData} errors={errors} handleInputChange={handleInputChange} />;
         }
      }
      
      return null;
   };

   const renderNavigationButtons = () => (
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
         <button
            type="button"
            onClick={currentStep === 1 ? onBack : handlePrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
         >
            {currentStep === 1 ? 'Back to Programs' : 'Previous'}
         </button>
         
         <div className="flex space-x-3">
            {currentStep < totalSteps ? (
               <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                  Next Step
               </button>
            ) : (
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                     isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
               >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
               </button>
            )}
         </div>
      </div>
   );

   const renderProgramHeader = () => {
      const programColors = {
         'SETUP': 'blue',
         'GIA': 'green',
         'CEST': 'purple',
         'SSCP': 'orange'
      };
      
      const color = programColors[selectedProgram.code] || 'blue';
      
      return (
         <div className={`mb-8 p-6 bg-gradient-to-r from-${color}-50 to-${color}-100 border border-${color}-200 rounded-xl`}>
            <div className="flex items-center">
               <div className="flex-shrink-0">
                  <div className={`w-16 h-16 bg-${color}-600 rounded-xl flex items-center justify-center`}>
                     <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        <path d="M2 17L12 22L22 17"/>
                        <path d="M2 12L12 17L22 12"/>
                     </svg>
                  </div>
               </div>
               <div className="ml-6">
                  <h1 className={`text-2xl font-bold text-${color}-900`}>
                     {selectedProgram.name} Program Application
                  </h1>
                  <p className={`text-${color}-700 mt-1`}>
                     {selectedProgram.description}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                     Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
                  </div>
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
         {renderProgramHeader()}
         {renderStepIndicator()}
         
         <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Display */}
            {submitError && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                     <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                     </div>
                     <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                           <p>{submitError}</p>
                        </div>
                        {submitError.includes('token') && (
                           <div className="mt-3">
                              <button
                                 onClick={clearAuthData}
                                 className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                 Clear Auth Data & Reload
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
            
            {currentStep === 1 && renderContactInformation()}
            {currentStep > 1 && renderProgramSpecificStep()}
            
            {renderNavigationButtons()}
         </form>
      </div>
   );
};

export default MultiStepForm;
