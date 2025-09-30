import React, { useState } from 'react';
import SETUPFormSteps from './forms/SETUPFormSteps';
import GIAFormSteps from './forms/GIAFormSteps';
import CESTForm from './forms/CESTForm';
import SSCPForm from './forms/SSCPForm';
import { ContactInformation, DocumentChecklist } from './components';
import { API_ENDPOINTS } from '../../config/api';
import { useDarkMode } from '../Context';
import { programs } from '../ProgramSelection/data/programsData';

const MultiStepForm = ({ selectedProgram, onBack, onSubmit }) => {
   const { isDarkMode } = useDarkMode();
   const [currentStep, setCurrentStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState('');
   const [uploadedDocuments, setUploadedDocuments] = useState({});
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
      
      // General Agreement
      generalAgreement: {
         accepted: false,
         signatureFile: null,
         signatoryName: '',
         position: '',
         signedDate: new Date().toISOString().split('T')[0]
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
            { id: 2, title: 'Basic Enterprise Info', description: 'Company name and contact details' },
            { id: 6, title: 'Documents', description: 'Required file uploads' }
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

   const handleDocumentUpload = (requirementId, file) => {
      setUploadedDocuments(prev => ({
         ...prev,
         [requirementId]: {
            file,
            originalName: file.name,
            uploadedAt: new Date()
         }
      }));
   };

   const handleGeneralAgreementChange = (agreementData) => {
      console.log('MultiStepForm - handleGeneralAgreementChange called with:', agreementData);
      console.log('MultiStepForm - Current formData.generalAgreement before update:', formData.generalAgreement);
      setFormData(prev => {
         const newData = {
            ...prev,
            generalAgreement: {
               ...prev.generalAgreement,
               ...agreementData
            }
         };
         console.log('MultiStepForm - updated formData.generalAgreement:', newData.generalAgreement);
         return newData;
      });
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
            // Basic Enterprise Information
            const fields = [
               'enterpriseName', 'contactPerson', 'contactPersonTel', 'contactPersonEmail', 
               'officeAddress', 'position'
            ];
            console.log('Validating step 2 fields:', fields);
            fields.forEach(field => {
               console.log(`Checking field ${field}:`, formData[field]);
               if (!formData[field]) {
                  newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
                  console.log(`Field ${field} is missing, adding error`);
               }
            });
         } else if (currentStep === 6) {
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
      console.log('handleNext called, currentStep:', currentStep);
      console.log('formData for step 2:', {
         enterpriseName: formData.enterpriseName,
         contactPerson: formData.contactPerson,
         contactPersonTel: formData.contactPersonTel,
         contactPersonEmail: formData.contactPersonEmail,
         officeAddress: formData.officeAddress,
         position: formData.position
      });
      
      if (validateCurrentStep()) {
         console.log('Validation passed, moving to next step');
         setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      } else {
         console.log('Validation failed, errors:', errors);
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
               } else if (key === 'generalAgreement' && submissionData[key].signature instanceof File) {
                  // Handle general agreement separately to include signature file
                  const agreementData = { ...submissionData[key] };
                  const signatureFile = agreementData.signature;
                  delete agreementData.signature;
                  submitData.append('generalAgreement', JSON.stringify(agreementData));
                  submitData.append('signature', signatureFile);
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
      
      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
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
            submissionDate: new Date().toISOString(),
            // Ensure general agreement data is properly formatted
            generalAgreement: {
               accepted: formData.generalAgreement.accepted,
               acceptedAt: new Date().toISOString(),
               ipAddress: '', // Will be set by backend
               userAgent: navigator.userAgent,
               signatoryName: formData.generalAgreement.signatoryName,
               position: formData.generalAgreement.position,
               signedDate: new Date(formData.generalAgreement.signedDate).toISOString(),
               signature: formData.generalAgreement.signatureFile
            }
         };
         
         console.log('MultiStepForm - Submission data generalAgreement:', submissionData.generalAgreement);
         console.log('MultiStepForm - formData.generalAgreement:', formData.generalAgreement);
         console.log('MultiStepForm - generalAgreement.accepted:', formData.generalAgreement?.accepted);
         console.log('MultiStepForm - generalAgreement type:', typeof formData.generalAgreement);
         
         // Submit directly to API
         submitApplication(submissionData);
         }
      }, 100); // 100ms delay to ensure state updates are processed
   };

   const renderStepIndicator = () => {
      return (
         <div className="mb-6">
            <div className="flex items-center justify-between">
               {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center group">
                     <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        currentStep >= step.id
                           ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                           : isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-400 group-hover:border-gray-500'
                              : 'bg-white border-gray-300 text-gray-500 group-hover:border-gray-400'
                     }`}>
                        {currentStep > step.id ? (
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        ) : (
                           <span className="text-xs font-semibold">{step.id}</span>
                        )}
                     </div>
                     <div className="ml-2">
                        <p className={`text-xs font-medium transition-colors duration-300 ${
                           currentStep >= step.id 
                              ? 'text-blue-600' 
                              : isDarkMode 
                                 ? 'text-gray-400 group-hover:text-gray-300'
                                 : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                           {step.title}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                           {step.description}
                        </p>
                     </div>
                     {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${
                           currentStep > step.id 
                              ? 'bg-blue-600' 
                              : isDarkMode 
                                 ? 'bg-gray-600' 
                                 : 'bg-gray-300'
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
         // Check if this is the documents step
         const isDocumentsStep = steps[currentStep - 1]?.title === 'Documents';
         
         if (isDocumentsStep) {
            const program = programs.find(p => p.code === programCode);
            return (
               <DocumentChecklist
                  program={program}
                  uploadedDocuments={uploadedDocuments}
                  onDocumentUpload={handleDocumentUpload}
                  onComplete={() => setCurrentStep(prev => prev + 1)}
               />
            );
         }
         
         if (programCode === 'SETUP') {
            return <SETUPFormSteps formData={formData} errors={errors} handleInputChange={handleInputChange} currentStep={currentStep} onGeneralAgreementChange={handleGeneralAgreementChange} />;
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
      <div className={`flex justify-between items-center pt-6 border-t transition-colors duration-300 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
         <button
            type="button"
            onClick={currentStep === 1 ? onBack : handlePrevious}
            className={`px-4 py-2 border rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
               isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
         >
            <div className="flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               {currentStep === 1 ? 'Back to Programs' : 'Previous'}
            </div>
         </button>
         
         <div className="flex space-x-2">
            {currentStep < totalSteps ? (
               <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg hover:shadow-xl"
               >
                  <div className="flex items-center">
                     Next Step
                     <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                  </div>
               </button>
            ) : (
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                     isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  } text-white`}
               >
                  <div className="flex items-center">
                     {isSubmitting ? (
                        <>
                           <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                           </svg>
                           Submitting...
                        </>
                     ) : (
                        <>
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                           Submit Application
                        </>
                     )}
                  </div>
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
         <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
            isDarkMode 
               ? `bg-gradient-to-r from-${color}-900/20 to-${color}-800/20 border-${color}-700/30` 
               : `bg-gradient-to-r from-${color}-50 to-${color}-100 border-${color}-200`
         }`}>
            <div className="flex items-center">
               <div className="flex-shrink-0">
                  <div className={`w-12 h-12 bg-${color}-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                     <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        <path d="M2 17L12 22L22 17"/>
                        <path d="M2 12L12 17L22 12"/>
                     </svg>
                  </div>
               </div>
               <div className="ml-4">
                  <h1 className={`text-xl font-bold transition-colors duration-300 ${
                     isDarkMode ? `text-${color}-300` : `text-${color}-900`
                  }`}>
                     {selectedProgram.name} Application
                  </h1>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${
                     isDarkMode ? `text-${color}-400` : `text-${color}-700`
                  }`}>
                     {selectedProgram.description}
                  </p>
                  <div className={`mt-1 text-xs transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                     Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
                  </div>
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className={`rounded-lg shadow-lg p-4 max-w-5xl mx-auto transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
         {renderProgramHeader()}
         {renderStepIndicator()}
         
         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {submitError && (
               <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                  isDarkMode 
                     ? 'bg-red-900/20 border-red-700/30' 
                     : 'bg-red-50 border-red-200'
               }`}>
                  <div className="flex">
                     <div className="flex-shrink-0">
                        <svg className={`h-5 w-5 transition-colors duration-300 ${
                           isDarkMode ? 'text-red-400' : 'text-red-400'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                     </div>
                     <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium transition-colors duration-300 ${
                           isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}>Submission Error</h3>
                        <div className={`mt-2 text-sm transition-colors duration-300 ${
                           isDarkMode ? 'text-red-400' : 'text-red-700'
                        }`}>
                           <p>{submitError}</p>
                        </div>
                        {submitError.includes('token') && (
                           <div className="mt-3">
                              <button
                                 onClick={clearAuthData}
                                 className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors duration-300"
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
