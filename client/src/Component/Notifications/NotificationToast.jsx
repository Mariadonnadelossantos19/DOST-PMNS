import React, { useState, useEffect } from 'react';
import { Button } from '../UI';

const NotificationToast = ({ 
   notification, 
   onClose, 
   onAction,
   duration = 5000,
   position = 'top-right' 
}) => {
   const [isVisible, setIsVisible] = useState(false);
   const [isLeaving, setIsLeaving] = useState(false);

   useEffect(() => {
      // Show toast with animation
      const showTimer = setTimeout(() => setIsVisible(true), 100);
      
      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
         handleClose();
      }, duration);

      return () => {
         clearTimeout(showTimer);
         clearTimeout(hideTimer);
      };
   }, [duration]);

   const handleClose = () => {
      setIsLeaving(true);
      setTimeout(() => {
         onClose?.();
      }, 300);
   };

   const handleAction = () => {
      onAction?.(notification);
      handleClose();
   };

   const getNotificationIcon = (type) => {
      switch (type) {
         case 'success':
            return (
               <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
            );
         case 'error':
            return (
               <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
               </svg>
            );
         case 'warning':
            return (
               <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
            );
         case 'info':
         default:
            return (
               <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
            );
      }
   };

   const getNotificationStyles = (type) => {
      switch (type) {
         case 'success':
            return 'bg-green-50 border-green-200';
         case 'error':
            return 'bg-red-50 border-red-200';
         case 'warning':
            return 'bg-yellow-50 border-yellow-200';
         case 'info':
         default:
            return 'bg-blue-50 border-blue-200';
      }
   };

   const getPositionStyles = (position) => {
      switch (position) {
         case 'top-left':
            return 'top-4 left-4';
         case 'top-center':
            return 'top-4 left-1/2 transform -translate-x-1/2';
         case 'top-right':
            return 'top-4 right-4';
         case 'bottom-left':
            return 'bottom-4 left-4';
         case 'bottom-center':
            return 'bottom-4 left-1/2 transform -translate-x-1/2';
         case 'bottom-right':
            return 'bottom-4 right-4';
         default:
            return 'top-4 right-4';
      }
   };

   return (
      <div className={`
         fixed z-50 max-w-sm w-full
         ${getPositionStyles(position)}
         transform transition-all duration-300 ease-in-out
         ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}>
         <div className={`
            border rounded-lg shadow-lg p-4
            ${getNotificationStyles(notification.type)}
         `}>
            <div className="flex items-start">
               <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
               </div>
               
               <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                     {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                     {notification.message}
                  </p>
                  
                  {notification.action && (
                     <div className="mt-3">
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={handleAction}
                        >
                           {notification.action.label}
                        </Button>
                     </div>
                  )}
               </div>
               
               <div className="ml-4 flex-shrink-0">
                  <button
                     onClick={handleClose}
                     className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default NotificationToast;
