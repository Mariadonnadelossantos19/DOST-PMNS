import React, { forwardRef } from 'react';
import { useDarkMode } from '../Context';

const Input = forwardRef(({ 
   label,
   error,
   helperText,
   leftIcon,
   rightIcon,
   className = '',
   containerClassName = '',
   ...props 
}, ref) => {
   const { isDarkMode } = useDarkMode();
   
   const inputClasses = `
      block w-full px-3 py-2 border rounded-md text-sm transition-colors duration-150
      focus:outline-none focus:ring-1 focus:ring-offset-0
      ${isDarkMode 
         ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
         : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      }
      ${error 
         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
         : isDarkMode
            ? 'focus:border-blue-400 focus:ring-blue-300'
            : 'focus:border-blue-500 focus:ring-blue-200'
      }
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${className}
   `;

   return (
      <div className={containerClassName}>
         {label && (
            <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${
               isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
               {label}
               {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
         )}
         
         <div className="relative">
            {leftIcon && (
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`transition-colors duration-150 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                     {leftIcon}
                  </span>
               </div>
            )}
            
            <input
               ref={ref}
               className={inputClasses}
               {...props}
            />
            
            {rightIcon && (
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className={`transition-colors duration-150 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                     {rightIcon}
                  </span>
               </div>
            )}
         </div>
         
         {error && (
            <p className="mt-1 text-sm text-red-600">
               {error}
            </p>
         )}
         
         {helperText && !error && (
            <p className={`mt-1 text-sm transition-colors duration-150 ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
               {helperText}
            </p>
         )}
      </div>
   );
});

Input.displayName = 'Input';

export default Input;
