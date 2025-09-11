import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from './NotificationToast';

const NotificationContext = createContext();

export const useNotifications = () => {
   const context = useContext(NotificationContext);
   if (!context) {
      throw new Error('useNotifications must be used within a NotificationProvider');
   }
   return context;
};

export const NotificationProvider = ({ children }) => {
   const [toasts, setToasts] = useState([]);

   const addToast = useCallback((notification) => {
      const id = Date.now() + Math.random();
      const toast = {
         id,
         type: 'info',
         duration: 5000,
         position: 'top-right',
         ...notification
      };
      
      setToasts(prev => [...prev, toast]);
      return id;
   }, []);

   const removeToast = useCallback((id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
   }, []);

   const showSuccess = useCallback((message, options = {}) => {
      return addToast({
         type: 'success',
         title: 'Success',
         message,
         ...options
      });
   }, [addToast]);

   const showError = useCallback((message, options = {}) => {
      return addToast({
         type: 'error',
         title: 'Error',
         message,
         ...options
      });
   }, [addToast]);

   const showWarning = useCallback((message, options = {}) => {
      return addToast({
         type: 'warning',
         title: 'Warning',
         message,
         ...options
      });
   }, [addToast]);

   const showInfo = useCallback((message, options = {}) => {
      return addToast({
         type: 'info',
         title: 'Info',
         message,
         ...options
      });
   }, [addToast]);

   const value = {
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo
   };

   return (
      <NotificationContext.Provider value={value}>
         {children}
         {/* Render toasts */}
         {toasts.map((toast) => (
            <NotificationToast
               key={toast.id}
               notification={toast}
               onClose={() => removeToast(toast.id)}
               onAction={toast.action?.onClick}
               duration={toast.duration}
               position={toast.position}
            />
         ))}
      </NotificationContext.Provider>
   );
};

export default NotificationProvider;
