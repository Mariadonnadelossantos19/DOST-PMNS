import React, { useState } from 'react';
import { Modal, Button } from '../../../../Component/UI';
import { ProgramSelection } from '../../../../Component/ProgramSelection';
import PersonalInfoStep from './PersonalInfoStep';
import BusinessInfoStep from './BusinessInfoStep';
import LoginCredentialsStep from './LoginCredentialsStep';
import ProgramRequestStep from './ProgramRequestStep';
import OverviewStep from './OverviewStep';

const ProponentRegistrationForm = ({ isOpen, onClose, onSuccess }) => {
   const [formData, setFormData] = useState({
      // Personal Information
      name: '',
      email: '',
      phone: '',
      address: '',
      
      // Business Information
      businessName: '',
      businessType: '',
      type: 'Individual',
      
      // Login Credentials
      password: '',
      confirmPassword: '',
      
      // Request Information
      province: '',
      requestedProgram: '',
      requestReason: '',
      businessDescription: '',
      expectedOutcomes: ''
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);
   const [currentStep, setCurrentStep] = useState(0); // Start with program selection
   const [selectedProgram, setSelectedProgram] = useState(null);

   const programs = [
      { value: 'SETUP', label: 'Small Enterprise Technology Upgrading Program' },
      { value: 'GIA', label: 'Grants-in-Aid' },
      { value: 'CEST', label: 'Community Empowerment through Science and Technology' },
      { value: 'SSCP', label: 'Small and Medium Enterprise Development Program' }
   ];

   const handleChange = (field, value) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));
      if (error) setError(null);
   };

   const handleProgramSelect = (program) => {
      setSelectedProgram(program);
      setFormData(prev => ({
         ...prev,
         requestedProgram: program.code
      }));
   };

   const handleNext = () => {
      if (currentStep === 0 && selectedProgram) {
         setCurrentStep(1);
      } else if (validateCurrentStep()) {
         setCurrentStep(prev => prev + 1);
      }
   };

   const handleBack = () => {
      if (currentStep > 0) {
         setCurrentStep(prev => prev - 1);
      }
   };

   const validateCurrentStep = () => {
      switch (currentStep) {
         case 1: // Personal Information
            return formData.name && formData.email && formData.address;
         case 2: // Business Information
            return formData.type;
         case 3: // Login Credentials
            return formData.password && formData.confirmPassword && 
                   formData.password === formData.confirmPassword && 
                   formData.password.length >= 6;
         case 4: // Program Request
            return formData.province && formData.requestedProgram && 
                   formData.requestReason && formData.businessDescription;
         default:
            return true;
      }
   };

   const validateForm = () => {
      const required = ['name', 'email', 'password', 'confirmPassword', 'address', 'type', 'province', 'requestedProgram', 'requestReason', 'businessDescription'];
      const missing = required.filter(field => !formData[field].trim());
      
      if (missing.length > 0) {
         setError(`Please fill in: ${missing.join(', ')}`);
         return false;
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
         setError('Please enter a valid email address');
         return false;
      }

      if (formData.password.length < 6) {
         setError('Password must be at least 6 characters long');
         return false;
      }

      if (formData.password !== formData.confirmPassword) {
         setError('Passwords do not match');
         return false;
      }

      return true;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      try {
         setLoading(true);
         setError(null);

         const response = await fetch('http://localhost:4000/api/proponent-requests', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               proponentInfo: {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  businessName: formData.businessName,
                  businessType: formData.businessType,
                  type: formData.type
               },
               loginCredentials: {
                  password: formData.password,
                  confirmPassword: formData.confirmPassword
               },
               province: formData.province,
               requestedProgram: formData.requestedProgram,
               requestReason: formData.requestReason,
               businessDescription: formData.businessDescription,
               expectedOutcomes: formData.expectedOutcomes
            })
         });

         const data = await response.json();

         if (response.ok) {
            setSuccess(true);
            setTimeout(() => {
               onSuccess && onSuccess(data);
               handleClose();
            }, 2000);
         } else {
            setError(data.message || 'Failed to submit request');
         }
      } catch (err) {
         setError('Network error. Please try again.');
         console.error('Submit error:', err);
      } finally {
         setLoading(false);
      }
   };

   const resetForm = () => {
      setFormData({
         name: '',
         email: '',
         phone: '',
         address: '',
         businessName: '',
         businessType: '',
         type: 'Individual',
         password: '',
         confirmPassword: '',
         province: '',
         requestedProgram: '',
         requestReason: '',
         businessDescription: '',
         expectedOutcomes: ''
      });
      setError(null);
      setSuccess(false);
      setCurrentStep(1);
   };

   const nextStep = () => {
      if (validateCurrentStep() && currentStep < 5) {
         setCurrentStep(currentStep + 1);
      } else if (!validateCurrentStep()) {
         setError('Please fill in all required fields before proceeding.');
      }
   };

   const prevStep = () => {
      if (currentStep > 1) {
         setCurrentStep(currentStep - 1);
      }
   };

   const getStepTitle = (step) => {
      switch (step) {
         case 0: return 'Program Selection';
         case 1: return 'Personal Information';
         case 2: return 'Business Information';
         case 3: return 'Login Credentials';
         case 4: return 'Program Request';
         case 5: return 'Overview';
         default: return '';
      }
   };

   const getSelectedProgramLabel = () => {
      const program = programs.find(p => p.value === formData.requestedProgram);
      return program ? `${program.value} - ${program.label}` : '';
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   const renderCurrentStep = () => {
      switch (currentStep) {
         case 0:
            return (
               <ProgramSelection
                  onProgramSelect={handleProgramSelect}
                  selectedProgram={selectedProgram}
                  onNext={handleNext}
                  onBack={handleBack}
               />
            );
         case 1:
            return <PersonalInfoStep formData={formData} handleChange={handleChange} error={error} />;
         case 2:
            return <BusinessInfoStep formData={formData} handleChange={handleChange} error={error} />;
         case 3:
            return <LoginCredentialsStep formData={formData} handleChange={handleChange} error={error} />;
         case 4:
            return <ProgramRequestStep formData={formData} handleChange={handleChange} error={error} />;
         case 5:
            return <OverviewStep formData={formData} getSelectedProgramLabel={getSelectedProgramLabel} />;
         default:
            return null;
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">
                        Register as Proponent
                     </h2>
                     <p className="text-sm text-gray-500 mt-1">
                        Step {currentStep + 1} of 6: {getStepTitle(currentStep)}
                     </p>
                  </div>
                  <button
                     onClick={handleClose}
                     className="text-gray-400 hover:text-gray-600"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>

               {/* Progress Bar */}
               <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm text-gray-600">Progress</span>
                     <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / 6) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
                     ></div>
                  </div>
               </div>
               
               <p className="text-gray-600 mb-6">
                  Fill out the form below to request a proponent account. Your local PSTO will review and approve your request.
               </p>

               {success ? (
                  <div className="text-center py-8">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                     <p className="text-gray-600 mb-4">
                        Your account request has been submitted successfully. 
                        You will receive an email notification once your PSTO approves your account.
                     </p>
                     <p className="text-sm text-gray-500">
                        Please check your email for updates on your request status.
                     </p>
                  </div>
               ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                           <p className="text-red-800 text-sm">{error}</p>
                        </div>
                     )}

                     {renderCurrentStep()}

                     {/* Navigation Buttons */}
                     <div className="flex justify-between pt-4">
                        <Button
                           type="button"
                           onClick={prevStep}
                           disabled={currentStep === 1}
                           className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           Previous
                        </Button>
                        
                        <div className="flex space-x-3">
                           <Button
                              type="button"
                              onClick={handleClose}
                              className="bg-gray-300 hover:bg-gray-400"
                           >
                              Cancel
                           </Button>
                           
                           {currentStep < 5 ? (
                              <Button
                                 type="button"
                                 onClick={nextStep}
                                 className="bg-blue-600 hover:bg-blue-700"
                              >
                                 Next
                              </Button>
                           ) : (
                              <Button
                                 type="submit"
                                 disabled={loading}
                                 className="bg-green-600 hover:bg-green-700"
                              >
                                 {loading ? 'Submitting...' : 'Submit Request'}
                              </Button>
                           )}
                        </div>
                     </div>
                  </form>
               )}
            </div>
         </div>
      </div>
   );
};

export default ProponentRegistrationForm;
