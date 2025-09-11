import React, { forwardRef } from 'react';

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
   const inputClasses = `
      block w-full px-3 py-2 border rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
      ${error 
         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
         : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
      }
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${className}
   `;

   return (
      <div className={containerClassName}>
         {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
               {label}
               {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
         )}
         
         <div className="relative">
            {leftIcon && (
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
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
                  <span className="text-gray-400">
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
            <p className="mt-1 text-sm text-gray-500">
               {helperText}
            </p>
         )}
      </div>
   );
});

Input.displayName = 'Input';

export default Input;
