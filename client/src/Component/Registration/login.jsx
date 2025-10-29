import React, { useState } from 'react';
import { Button, Card, Input, Alert } from '../UI';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
   const [formData, setFormData] = useState({
      email: '',
      password: '',
      rememberMe: false
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });

   // Handle input changes
   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
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

      if (!formData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
         newErrors.password = 'Password is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
         return;
      }

      setIsLoading(true);
      setAlert({ show: false, type: '', message: '' });

      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/login`, {            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: formData.email.trim().toLowerCase(),
               password: formData.password,
               rememberMe: formData.rememberMe
            })
         });

         const data = await response.json();

         if (response.ok) {
            console.log('Login successful, received data:', data);
            
            setAlert({
               show: true,
               type: 'success',
               message: 'Login successful! Redirecting...'
            });

            // Store user data and token
            if (data.token) {
               localStorage.setItem('authToken', data.token);
               console.log('Auth token stored');
            }
            if (data.user) {
               localStorage.setItem('isLoggedIn', 'true');
               localStorage.setItem('userData', JSON.stringify(data.user));
               console.log('User data stored:', data.user);
            }

            // Call success callback
            if (onLoginSuccess) {
               setTimeout(() => {
                  onLoginSuccess(data);
               }, 1500);
            }
         } else {
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Login failed. Please check your credentials.'
            });
         }
      } catch (error) {
         console.error('Login error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please check your connection and try again.'
         });
      } finally {
         setIsLoading(false);
      }
   };

   // Handle forgot password
   const handleForgotPassword = async () => {
      if (!formData.email.trim()) {
         setAlert({
            show: true,
            type: 'error',
            message: 'Please enter your email address first.'
         });
         return;
      }

      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: formData.email.trim().toLowerCase()
            })
         });

         const data = await response.json();

         if (response.ok) {
            let message = 'Password reset instructions sent to your email.';
            
            // If reset URL is provided (for testing), show it
            if (data.resetUrl) {
               message += `\n\nFor testing, you can use this link: ${data.resetUrl}`;
            }
            
            setAlert({
               show: true,
               type: 'success',
               message: message
            });
         } else {
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Failed to send reset instructions.'
            });
         }
      } catch (error) {
         console.error('Forgot password error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please try again later.'
         });
      }
   };

   return (
      <div className="space-y-6">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
               Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
               Welcome back! Please enter your details
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
               leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
               }
            />

            {/* Password */}
            <Input
               label="Password"
               name="password"
               type="password"
               value={formData.password}
               onChange={handleChange}
               error={errors.password}
               required
               placeholder="Enter your password"
               leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
               <div className="flex items-center">
                  <input
                     id="rememberMe"
                     name="rememberMe"
                     type="checkbox"
                     checked={formData.rememberMe}
                     onChange={handleChange}
                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                     Remember me
                  </label>
               </div>

               <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
               >
                  Forgot password?
               </button>
            </div>

            {/* Submit Button */}
            <Button
               type="submit"
               className="w-full"
               loading={isLoading}
               disabled={isLoading}
            >
               {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Switch to Register */}
            <div className="text-center">
               <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                     type="button"
                     onClick={onSwitchToRegister}
                     className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                  >
                     Create one here
                  </button>
               </p>
            </div>
         </form>

        
      </div>
   );
};

export default Login;
