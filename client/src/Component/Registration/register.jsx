import React, { useState } from 'react';
import { Button, Card, Input, Alert, ConfirmationModal, useToast } from '../UI';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
   const { showSuccess, showError } = useToast();
   
   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'proponent',
      phone: '',
      address: '',
      businessName: '',
      businessType: '',
      organizationType: 'Individual',
      province: ''
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [currentStep, setCurrentStep] = useState(1);
   const totalSteps = 3;
   
   // Confirmation modal state
   const [confirmationModal, setConfirmationModal] = useState({
      isOpen: false,
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'Confirm',
      onConfirm: null
   });

   // Confirmation modal helpers
   const showConfirmation = (title, message, type, confirmText, onConfirm) => {
      setConfirmationModal({
         isOpen: true,
         title,
         message,
         type,
         confirmText,
         onConfirm
      });
   };

   const hideConfirmation = () => {
      setConfirmationModal({
         isOpen: false,
         title: '',
         message: '',
         type: 'warning',
         confirmText: 'Confirm',
         onConfirm: null
      });
   };

   const handleConfirmAction = () => {
      if (confirmationModal.onConfirm) {
         confirmationModal.onConfirm();
      }
      hideConfirmation();
   };

   // Handle input changes
   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors(prev => ({
            ...prev,
            [name]: ''
         }));
      }
   };

   const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
         password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData(prev => ({
         ...prev,
         password: password,
         confirmPassword: password
      }));
   };

   // Step validation functions
   const validateStep1 = () => {
      const newErrors = {};
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = 'Email is invalid';
      }
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const validateStep2 = () => {
      const newErrors = {};
      if (!formData.organizationType.trim()) newErrors.organizationType = 'Organization type is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const validateStep3 = () => {
      const newErrors = {};
      if (!formData.password) {
         newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
         newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
         newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.province.trim()) {
         newErrors.province = 'Province is required';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Navigation functions
   const nextStep = () => {
      let isValid = false;
      switch (currentStep) {
         case 1: isValid = validateStep1(); break;
         case 2: isValid = validateStep2(); break;
         case 3: isValid = validateStep3(); break;
         default: isValid = false;
      }
      
      if (isValid && currentStep < totalSteps) {
         setCurrentStep(prev => prev + 1);
         setErrors({});
      }
   };

   const prevStep = () => {
      if (currentStep > 1) {
         setCurrentStep(prev => prev - 1);
         setErrors({});
      }
   };

   // Validate form
   const validateForm = () => {
      const newErrors = {};

      // Required fields validation
      if (!formData.firstName.trim()) {
         newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
         newErrors.lastName = 'Last name is required';
      }

      if (!formData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
         newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
         newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
         newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.address.trim()) {
         newErrors.address = 'Address is required';
      }

      if (!formData.organizationType.trim()) {
         newErrors.organizationType = 'Organization type is required';
      }

      if (!formData.province.trim()) {
         newErrors.province = 'Province is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Handle form submission
   const handleSubmit = (e) => {
      e.preventDefault();
      
      if (currentStep < totalSteps) {
         nextStep();
         return;
      }
      
      if (!validateForm()) {
         return;
      }

      showConfirmation(
         'Create Proponent Account',
         `Are you sure you want to create a proponent account for ${formData.firstName} ${formData.lastName}? You will be able to access your dashboard immediately.`,
         'info',
         'Create Account',
         () => performRegistration()
      );
   };

   const performRegistration = async () => {
      setIsLoading(true);
      setAlert({ show: false, type: '', message: '' });

      try {
         // API call to create user directly
         const response = await fetch('http://localhost:4000/api/users/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               firstName: formData.firstName.trim(),
               lastName: formData.lastName.trim(),
               email: formData.email.trim().toLowerCase(),
               password: formData.password,
               role: 'proponent',
               province: formData.province,
               proponentInfo: {
                  phone: formData.phone.trim(),
                  address: formData.address.trim(),
                  businessName: formData.businessName.trim(),
                  businessType: formData.businessType.trim(),
                  organizationType: formData.organizationType
               }
            })
         });

         const data = await response.json();

         if (response.ok) {
            console.log('Proponent account created successfully:', data);
            showSuccess('Proponent account created successfully! You can now login and access your dashboard immediately.');
            
            // Reset form
            setFormData({
               firstName: '',
               lastName: '',
               email: '',
               password: '',
               confirmPassword: '',
               role: 'proponent',
               phone: '',
               address: '',
               businessName: '',
               businessType: '',
               organizationType: 'Individual',
               province: ''
            });

            // Call success callback if provided
            if (onRegisterSuccess) {
               setTimeout(() => {
                  onRegisterSuccess(data);
               }, 2000);
            }
         } else {
            showError(`Registration failed: ${data.message || 'Please try again.'}`);
         }
      } catch (error) {
         console.error('Registration error:', error);
         showError('Network error. Please check your connection and try again.');
      } finally {
         setIsLoading(false);
      }
   };

   // Step indicator component
   const StepIndicator = () => (
      <div className="flex items-center justify-center mb-8">
         <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
               <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                     step <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                     {step}
                  </div>
                  {step < 3 && (
                     <div className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                     }`} />
                  )}
               </div>
            ))}
         </div>
      </div>
   );

   // Step titles
   const stepTitles = {
      1: 'Personal Information',
      2: 'Business Information', 
      3: 'Login Credentials & Location'
   };

   return (
      <div className="space-y-6">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
               Register as Proponent
            </h2>
            <p className="mt-2 text-sm text-gray-600">
               Create a proponent account to access DOST programs. You will be automatically assigned to your local PSTO based on your province.
            </p>
         </div>

         <StepIndicator />
         
         <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
               Step {currentStep} of {totalSteps}: {stepTitles[currentStep]}
            </h3>
         </div>

         {alert.show && (
            <Alert 
               type={alert.type} 
               className="mb-6"
               onClose={() => setAlert({ show: false, type: '', message: '' })}
            >
               {alert.message}
            </Alert>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
               <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input
                        label="First Name *"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  placeholder="Enter your first name"
               />
               <Input
                        label="Last Name *"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  placeholder="Enter your last name"
               />
            <Input
                        label="Email Address *"
               name="email"
               type="email"
               value={formData.email}
               onChange={handleChange}
               error={errors.email}
               required
               placeholder="Enter your email address"
            />
               <Input
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                  onChange={handleChange}
                        error={errors.phone}
                        placeholder="Enter your phone number"
                     />
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Address *
                        </label>
                        <textarea
                           name="address"
                           value={formData.address}
                  onChange={handleChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           rows="2"
                           placeholder="Enter your complete address"
                  required
               />
                        {errors.address && (
                           <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
            </div>
            </div>
               </Card>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
               <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input
                        label="Business Name"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleChange}
                        error={errors.businessName}
                        placeholder="Enter your business name"
                     />
                     <Input
                        label="Business Type"
                        name="businessType"
                        type="text"
                        value={formData.businessType}
                        onChange={handleChange}
                        error={errors.businessType}
                        placeholder="e.g., Agriculture, Technology"
                     />
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Organization Type *
                        </label>
                        <select
                           name="organizationType"
                           value={formData.organizationType}
                           onChange={handleChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        >
                           <option value="Individual">Individual</option>
                           <option value="SME">SME</option>
                           <option value="Corporation">Corporation</option>
                           <option value="Cooperative">Cooperative</option>
                           <option value="Association">Association</option>
                        </select>
                        {errors.organizationType && (
                           <p className="mt-1 text-sm text-red-600">{errors.organizationType}</p>
                        )}
                     </div>
                  </div>
               </Card>
            )}

            {/* Step 3: Login Credentials */}
            {currentStep === 3 && (
               <Card className="p-6">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                           You will use these credentials to login and access your dashboard immediately.
                        </p>
                        <button
                           type="button"
                           onClick={generatePassword}
                           className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                        >
                           Generate Password
                        </button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password *
                           </label>
                           <div className="relative">
                              <input
                                 type={showPassword ? "text" : "password"}
                                 name="password"
                                 value={formData.password}
                                 onChange={handleChange}
                                 className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="Create a password (min 6 characters)"
                                 required
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                 {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                 ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                 )}
                              </button>
                           </div>
                           {errors.password && (
                              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                           )}
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm Password *
                           </label>
                           <div className="relative">
                              <input
                                 type={showConfirmPassword ? "text" : "password"}
                                 name="confirmPassword"
                                 value={formData.confirmPassword}
                                 onChange={handleChange}
                                 className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="Confirm your password"
                                 required
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                 {showConfirmPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                 ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                 )}
                              </button>
                           </div>
                           {errors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                           )}
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Province *
                        </label>
                        <select
                           name="province"
                           value={formData.province}
                           onChange={handleChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        >
                           <option value="">Select Province</option>
                           <option value="Marinduque">Marinduque</option>
                           <option value="Occidental Mindoro">Occidental Mindoro</option>
                           <option value="Oriental Mindoro">Oriental Mindoro</option>
                           <option value="Romblon">Romblon</option>
                           <option value="Palawan">Palawan</option>
                        </select>
                        {errors.province && (
                           <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                        )}
                     </div>
                  </div>
               </Card>
            )}


            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
               <div>
                  {currentStep > 1 && (
                     <Button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                     >
                        Previous
                     </Button>
                  )}
               </div>
               
               <div className="flex space-x-3">
                  {currentStep < totalSteps ? (
                     <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                     >
                        Next Step
                     </Button>
                  ) : (
            <Button
               type="submit"
                        className="bg-green-600 hover:bg-green-700"
               loading={isLoading}
               disabled={isLoading}
            >
                        {isLoading ? 'Creating Account...' : 'Create Proponent Account'}
            </Button>
                  )}
               </div>
            </div>

            {/* Switch to Login */}
            <div className="text-center">
               <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                     type="button"
                     onClick={onSwitchToLogin}
                     className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                  >
                     Sign in here
                  </button>
               </p>
            </div>
         </form>

         {/* Confirmation Modal */}
         <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={hideConfirmation}
            onConfirm={handleConfirmAction}
            title={confirmationModal.title}
            message={confirmationModal.message}
            type={confirmationModal.type}
            confirmText={confirmationModal.confirmText}
         />
      </div>
   );
};

export default Register;