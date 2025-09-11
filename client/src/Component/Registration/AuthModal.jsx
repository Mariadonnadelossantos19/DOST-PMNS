import React, { useState } from 'react';
import { Modal } from '../UI';
import Login from './login';
import Register from './register';

const AuthModal = ({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }) => {
   const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

   const handleClose = () => {
      setActiveTab('login'); // Reset to login when closing
      onClose();
   };

   const handleLoginSuccess = (data) => {
      onLoginSuccess?.(data);
      handleClose();
   };

   const handleRegisterSuccess = (data) => {
      onRegisterSuccess?.(data);
      // Switch to login after successful registration
      setActiveTab('login');
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={handleClose}
         size="lg"
         className="max-w-2xl"
      >
         <div className="relative">
            {/* Close Button */}
            <button
               onClick={handleClose}
               className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
               <nav className="flex space-x-8">
                  <button
                     onClick={() => setActiveTab('login')}
                     className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'login'
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     Sign In
                  </button>
                  <button
                     onClick={() => setActiveTab('register')}
                     className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'register'
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     Create Account
                  </button>
               </nav>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
               {activeTab === 'login' ? (
                  <Login
                     onSwitchToRegister={() => setActiveTab('register')}
                     onLoginSuccess={handleLoginSuccess}
                  />
               ) : (
                  <Register
                     onSwitchToLogin={() => setActiveTab('login')}
                     onRegisterSuccess={handleRegisterSuccess}
                  />
               )}
            </div>
         </div>
      </Modal>
   );
};

export default AuthModal;
