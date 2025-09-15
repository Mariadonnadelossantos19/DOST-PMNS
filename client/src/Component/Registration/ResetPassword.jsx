import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Input, Alert } from '../UI';

const ResetPassword = ({ onNavigateToLogin }) => {
   // Get token from URL parameters
   const getTokenFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token');
   };
   
   const token = getTokenFromUrl();
   
   const [formData, setFormData] = useState({
      newPassword: '',
      confirmPassword: ''
   });
   
   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });
   const [userInfo, setUserInfo] = useState(null);
   const [tokenValid, setTokenValid] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   // Verify token on component mount
   useEffect(() => {
      if (token) {
         verifyToken();
      } else {
         setAlert({
            show: true,
            type: 'error',
            message: 'Invalid reset link. Please request a new password reset.'
         });
      }
   }, [token, verifyToken]);

   const verifyToken = useCallback(async () => {
      try {
         const response = await fetch(`http://localhost:4000/api/auth/verify-reset-token/${token}`);
         const data = await response.json();
         
         if (response.ok) {
            setTokenValid(true);
            setUserInfo(data.user);
         } else {
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Invalid or expired reset link'
            });
         }
      } catch (error) {
         console.error('Token verification error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Error verifying reset link. Please try again.'
         });
      }
   }, [token]);

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

      if (!formData.newPassword) {
         newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
         newErrors.newPassword = 'Password must be at least 6 characters long';
      }

      if (!formData.confirmPassword) {
         newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== formData.confirmPassword) {
         newErrors.confirmPassword = 'Passwords do not match';
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
         const response = await fetch('http://localhost:4000/api/auth/reset-password', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               token: token,
               newPassword: formData.newPassword
            })
         });

         const data = await response.json();

         if (response.ok) {
            setAlert({
               show: true,
               type: 'success',
               message: 'Password reset successfully! Redirecting to login...'
            });
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
               if (onNavigateToLogin) {
                  onNavigateToLogin();
               } else {
                  window.location.href = '/';
               }
            }, 2000);
         } else {
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Failed to reset password'
            });
         }
      } catch (error) {
         console.error('Reset password error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please check your connection and try again.'
         });
      } finally {
         setIsLoading(false);
      }
   };

   if (!token) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full space-y-8 p-8">
               <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
                  <p className="mt-2 text-sm text-gray-600">
                     The password reset link is invalid or missing.
                  </p>
                  <Button
                     onClick={() => onNavigateToLogin ? onNavigateToLogin() : window.location.href = '/'}
                     className="mt-4"
                  >
                     Back to Login
                  </Button>
               </div>
            </Card>
         </div>
      );
   }

   if (!tokenValid) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full space-y-8 p-8">
               <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Verifying Reset Link...</h2>
                  <div className="mt-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
               </div>
            </Card>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <Card className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-gray-900">
                  Reset Your Password
               </h2>
               <p className="mt-2 text-sm text-gray-600">
                  {userInfo && `Hello ${userInfo.firstName}! Please enter your new password.`}
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
               {/* New Password */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     New Password *
                  </label>
                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your new password"
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
                  {errors.newPassword && (
                     <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
               </div>

               {/* Confirm Password */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Confirm New Password *
                  </label>
                  <div className="relative">
                     <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm your new password"
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

               {/* Submit Button */}
               <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
               >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
               </Button>

               {/* Back to Login */}
               <div className="text-center">
                  <p className="text-sm text-gray-600">
                     Remember your password?{' '}
                     <button
                        type="button"
                        onClick={() => onNavigateToLogin ? onNavigateToLogin() : window.location.href = '/'}
                        className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                     >
                        Sign in here
                     </button>
                  </p>
               </div>
            </form>
         </Card>
      </div>
   );
};

export default ResetPassword;
