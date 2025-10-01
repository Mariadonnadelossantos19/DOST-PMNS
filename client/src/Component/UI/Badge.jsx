import React from 'react';
import { useDarkMode } from '../Context';

const Badge = ({ 
   children, 
   variant = 'default', 
   size = 'md',
   className = '',
   ...props 
}) => {
   const { isDarkMode } = useDarkMode();
   const baseClasses = 'inline-flex items-center font-medium rounded-md transition-colors duration-150';
   
   const variants = {
      default: isDarkMode 
         ? 'bg-gray-700 text-gray-200' 
         : 'bg-gray-100 text-gray-800',
      primary: isDarkMode 
         ? 'bg-blue-600 text-white' 
         : 'bg-blue-100 text-blue-800',
      success: isDarkMode 
         ? 'bg-green-600 text-white' 
         : 'bg-green-100 text-green-800',
      warning: isDarkMode 
         ? 'bg-yellow-600 text-white' 
         : 'bg-yellow-100 text-yellow-800',
      danger: isDarkMode 
         ? 'bg-red-600 text-white' 
         : 'bg-red-100 text-red-800',
      info: isDarkMode 
         ? 'bg-cyan-600 text-white' 
         : 'bg-cyan-100 text-cyan-800',
      purple: isDarkMode 
         ? 'bg-purple-600 text-white' 
         : 'bg-purple-100 text-purple-800',
      pink: isDarkMode 
         ? 'bg-pink-600 text-white' 
         : 'bg-pink-100 text-pink-800'
   };

   const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2 py-0.5 text-xs',
      lg: 'px-2.5 py-1 text-sm'
   };

   const badgeClasses = `
      ${baseClasses}
      ${variants[variant]}
      ${sizes[size]}
      ${className}
   `;

   return (
      <span className={badgeClasses} {...props}>
         {children}
      </span>
   );
};

export default Badge;
