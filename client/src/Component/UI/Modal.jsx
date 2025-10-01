import React, { useEffect } from 'react';
import { useDarkMode } from '../Context';

const Modal = ({ 
   isOpen, 
   onClose, 
   title, 
   children, 
   size = 'md',
   closeOnOverlayClick = true,
   showCloseButton = true,
   className = ''
}) => {
   const { isDarkMode } = useDarkMode();
   // Handle escape key
   useEffect(() => {
      const handleEscape = (e) => {
         if (e.key === 'Escape' && isOpen) {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener('keydown', handleEscape);
         document.body.style.overflow = 'hidden';
      }

      return () => {
         document.removeEventListener('keydown', handleEscape);
         document.body.style.overflow = 'unset';
      };
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
   };

   const handleOverlayClick = (e) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
         onClose();
      }
   };

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         {/* Overlay */}
         <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleOverlayClick}
         />

         {/* Modal */}
         <div className="flex min-h-full items-center justify-center p-4">
            <div className={`
               relative rounded-md shadow-lg w-full transition-colors duration-150
               ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
               ${sizeClasses[size]}
               transform transition-all duration-150
               ${className}
            `}>
               {/* Header */}
               {(title || showCloseButton) && (
                  <div className={`flex items-center justify-between p-4 border-b transition-colors duration-150 ${
                     isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                     {title && (
                        <h3 className={`text-base font-medium transition-colors duration-150 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                           {title}
                        </h3>
                     )}
                     {showCloseButton && (
                        <button
                           onClick={onClose}
                           className={`transition-colors duration-150 ${
                              isDarkMode 
                                 ? 'text-gray-400 hover:text-gray-200' 
                                 : 'text-gray-400 hover:text-gray-600'
                           }`}
                        >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     )}
                  </div>
               )}

               {/* Content */}
               <div className="p-4">
                  {children}
               </div>
            </div>
         </div>
      </div>
   );
};

// Modal sub-components
const ModalHeader = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <div className={`border-b pb-3 mb-3 transition-colors duration-150 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`} {...props}>
         {children}
      </div>
   );
};

const ModalTitle = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <h3 className={`text-base font-medium transition-colors duration-150 ${
         isDarkMode ? 'text-white' : 'text-gray-900'
      } ${className}`} {...props}>
         {children}
      </h3>
   );
};

const ModalContent = ({ children, className = '', ...props }) => (
   <div className={className} {...props}>
      {children}
   </div>
);

const ModalFooter = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <div className={`border-t pt-3 mt-3 flex justify-end gap-2 transition-colors duration-150 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`} {...props}>
         {children}
      </div>
   );
};

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
