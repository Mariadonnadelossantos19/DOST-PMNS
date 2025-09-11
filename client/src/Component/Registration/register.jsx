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
      role: 'psto',
      department: '',
      position: '',
      province: ''
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });
   
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

      if (!formData.department.trim()) {
         newErrors.department = 'Department is required';
      }

      if (!formData.position.trim()) {
         newErrors.position = 'Position is required';
      }

      if (formData.role === 'psto' && !formData.province.trim()) {
         newErrors.province = 'Province is required for PSTO users';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Handle form submission
   const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
         return;
      }

      showConfirmation(
         'Create Account',
         `Are you sure you want to create a ${formData.role.toUpperCase()} account for ${formData.firstName} ${formData.lastName}?`,
         'info',
         'Create Account',
         () => performRegistration()
      );
   };

   const performRegistration = async () => {
      setIsLoading(true);
      setAlert({ show: false, type: '', message: '' });

      try {
         // API call to server
         const response = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               firstName: formData.firstName.trim(),
               lastName: formData.lastName.trim(),
               email: formData.email.trim().toLowerCase(),
               password: formData.password,
               role: formData.role,
               department: formData.department.trim(),
               position: formData.position.trim(),
               province: formData.province
            })
         });

         const data = await response.json();

         if (response.ok) {
            console.log('Registration successful, received data:', data);
            showSuccess('Registration successful! Please check your email to verify your account.');
            
            // Reset form
            setFormData({
               firstName: '',
               lastName: '',
               email: '',
               password: '',
               confirmPassword: '',
               role: 'psto',
               department: '',
               position: '',
               province: ''
            });

            // Store user data for auto-login after registration
            if (data.user) {
               localStorage.setItem('isLoggedIn', 'true');
               localStorage.setItem('userData', JSON.stringify(data.user));
            }

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

   return (
      <div className="space-y-6">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
               Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
               Join the PMNS platform to manage your projects
            </p>
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
               <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  placeholder="Enter your first name"
               />
               <Input
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  placeholder="Enter your last name"
               />
            </div>

            {/* Email */}
            <Input
               label="Email Address"
               name="email"
               type="email"
               value={formData.email}
               onChange={handleChange}
               error={errors.email}
               required
               placeholder="Enter your email address"
            />

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
               <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder="Create a password"
               />
               <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  placeholder="Confirm your password"
               />
            </div>

            {/* Role Selection */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
               </label>
               <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                  <option value="psto">PSTO (Provincial S&T Office)</option>
                  <option value="dost_mimaropa">DOST MIMAROPA</option>
                  <option value="super_admin">Super Admin</option>
               </select>
            </div>

                  {/* Department and Position */}
                  <div className="grid grid-cols-2 gap-4">
                     <Input
                        label="Department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        error={errors.department}
                        required
                        placeholder="Enter your department"
                     />
                     <Input
                        label="Position"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleChange}
                        error={errors.position}
                        required
                        placeholder="Enter your position"
                     />
                  </div>

                  {/* Province for PSTO */}
                  {formData.role === 'psto' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Province
                        </label>
                        <select
                           name="province"
                           value={formData.province}
                           onChange={handleChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required={formData.role === 'psto'}
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
                  )}

            {/* Submit Button */}
            <Button
               type="submit"
               className="w-full"
               loading={isLoading}
               disabled={isLoading}
            >
               {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

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