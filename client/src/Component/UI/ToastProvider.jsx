import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
   const context = useContext(ToastContext);
   if (!context) {
      throw new Error('useToast must be used within a ToastProvider');
   }
   return context;
};

export const ToastProvider = ({ children }) => {
   const [toasts, setToasts] = useState([]);

   const addToast = (message, type = 'success', duration = 5000) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, duration };
      
      setToasts(prev => [...prev, newToast]);
      
      return id;
   };

   const removeToast = (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
   };

   const showSuccess = (message, duration) => addToast(message, 'success', duration);
   const showError = (message, duration) => addToast(message, 'error', duration);
   const showWarning = (message, duration) => addToast(message, 'warning', duration);
   const showInfo = (message, duration) => addToast(message, 'info', duration);

   const value = {
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo
   };

   return (
      <ToastContext.Provider value={value}>
         {children}
         
         {/* Render all toasts */}
         <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
               <Toast
                  key={toast.id}
                  isVisible={true}
                  message={toast.message}
                  type={toast.type}
                  duration={toast.duration}
                  onClose={() => removeToast(toast.id)}
               />
            ))}
         </div>
      </ToastContext.Provider>
   );
};


