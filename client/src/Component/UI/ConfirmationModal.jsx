import React from 'react';
import Button from './Button';

const ConfirmationModal = ({ 
   isOpen, 
   onClose, 
   onConfirm, 
   title, 
   message, 
   confirmText = 'Confirm', 
   cancelText = 'Cancel',
   type = 'warning' // warning, danger, info
}) => {
   if (!isOpen) return null;

   const getTypeStyles = () => {
      switch (type) {
         case 'danger':
            return {
               icon: '⚠️',
               confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
               iconBg: 'bg-red-100'
            };
         case 'info':
            return {
               icon: 'ℹ️',
               confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
               iconBg: 'bg-blue-100'
            };
         default: // warning
            return {
               icon: '⚠️',
               confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
               iconBg: 'bg-yellow-100'
            };
      }
   };

   const styles = getTypeStyles();

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
               className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
               onClick={onClose}
            ></div>

            {/* Modal panel */}
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                     {/* Icon */}
                     <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                        <span className="text-2xl">{styles.icon}</span>
                     </div>
                     
                     {/* Content */}
                     <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium text-gray-900">
                           {title}
                        </h3>
                        <div className="mt-2">
                           <p className="text-sm text-gray-500">
                              {message}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Actions */}
               <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button
                     onClick={onConfirm}
                     className={`ml-3 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto ${styles.confirmButton}`}
                  >
                     {confirmText}
                  </Button>
                  <Button
                     onClick={onClose}
                     className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                     {cancelText}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ConfirmationModal;
