import React, { useEffect } from 'react';

const Toast = ({ 
   isVisible, 
   message, 
   type = 'success', 
   duration = 5000, 
   onClose 
}) => {
   useEffect(() => {
      if (isVisible) {
         const timer = setTimeout(() => {
            onClose();
         }, duration);

         return () => clearTimeout(timer);
      }
   }, [isVisible, duration, onClose]);

   if (!isVisible) return null;

   const getTypeStyles = () => {
      switch (type) {
         case 'success':
            return {
               bgColor: 'bg-green-500',
               icon: '✅',
               borderColor: 'border-green-500'
            };
         case 'error':
            return {
               bgColor: 'bg-red-500',
               icon: '❌',
               borderColor: 'border-red-500'
            };
         case 'warning':
            return {
               bgColor: 'bg-yellow-500',
               icon: '⚠️',
               borderColor: 'border-yellow-500'
            };
         case 'info':
            return {
               bgColor: 'bg-blue-500',
               icon: 'ℹ️',
               borderColor: 'border-blue-500'
            };
         default:
            return {
               bgColor: 'bg-gray-500',
               icon: 'ℹ️',
               borderColor: 'border-gray-500'
            };
      }
   };

   const styles = getTypeStyles();

   return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
         <div className={`
            flex items-center p-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-md
            ${styles.bgColor} ${styles.borderColor} text-white
         `}>
            {/* Icon */}
            <div className="flex-shrink-0 mr-3">
               <span className="text-xl">{styles.icon}</span>
            </div>
            
            {/* Message */}
            <div className="flex-1">
               <p className="text-sm font-medium">{message}</p>
            </div>
            
            {/* Close Button */}
            <button
               onClick={onClose}
               className="ml-3 flex-shrink-0 text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors duration-200"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
      </div>
   );
};

export default Toast;


