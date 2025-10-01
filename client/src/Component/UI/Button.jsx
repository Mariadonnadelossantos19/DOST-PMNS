import React from 'react';
import { useDarkMode } from '../Context';

const Button = ({ 
   children, 
   variant = 'primary', 
   size = 'md', 
   disabled = false, 
   loading = false,
   icon,
   iconPosition = 'left',
   className = '',
   onClick,
   type = 'button',
   ...props 
}) => {
   const { isDarkMode } = useDarkMode();
   const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed';
   
   const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: isDarkMode 
         ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500' 
         : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      outline: isDarkMode 
         ? 'border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-500' 
         : 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: isDarkMode 
         ? 'text-gray-300 hover:bg-gray-800 focus:ring-gray-500' 
         : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      link: 'text-blue-600 hover:text-blue-800 underline focus:ring-blue-500'
   };

   const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm',
      xl: 'px-6 py-3 text-base'
   };

   const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
   };

   const buttonClasses = `
      ${baseClasses}
      ${variants[variant]}
      ${sizes[size]}
      ${className}
   `;

   const iconElement = icon && (
      <span className={`${iconSizes[size]} ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`}>
         {icon}
      </span>
   );

   const loadingSpinner = (
      <svg className={`${iconSizes[size]} animate-spin ${children ? 'mr-2' : ''}`} fill="none" viewBox="0 0 24 24">
         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
   );

   return (
      <button
         type={type}
         className={buttonClasses}
         disabled={disabled || loading}
         onClick={onClick}
         {...props}
      >
         {loading ? (
            <>
               {loadingSpinner}
               {children}
            </>
         ) : (
            <>
               {iconPosition === 'left' && iconElement}
               {children}
               {iconPosition === 'right' && iconElement}
            </>
         )}
      </button>
   );
};

export default Button;
