import React from 'react';
import { useDarkMode } from '../../Context';

const FormTextarea = ({ 
   label, 
   name, 
   value, 
   onChange, 
   placeholder, 
   error, 
   required = false,
   rows = 3,
   className = "",
   ...props 
}) => {
   const { isDarkMode } = useDarkMode();
   
   const textareaClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm resize-none ${
      error 
         ? 'border-red-500' 
         : isDarkMode 
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600' 
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:bg-white'
   } ${className}`;

   return (
      <div className="group">
         <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
         }`}>
            {label} {required && <span className="text-red-500">*</span>}
         </label>
         <div className="relative">
            <textarea
               name={name}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               rows={rows}
               className={textareaClasses}
               {...props}
            />
            {value && !error && (
               <div className="absolute right-3 top-3">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
               </div>
            )}
         </div>
         {error && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
               </svg>
               {error}
            </p>
         )}
      </div>
   );
};

export default FormTextarea;
