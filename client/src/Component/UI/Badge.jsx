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
   const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors duration-300';
   
   const variants = {
      default: isDarkMode 
         ? 'bg-gray-700 text-gray-200' 
         : 'bg-gray-100 text-gray-800',
      primary: isDarkMode 
         ? 'bg-blue-900 text-blue-200' 
         : 'bg-blue-100 text-blue-800',
      success: isDarkMode 
         ? 'bg-green-900 text-green-200' 
         : 'bg-green-100 text-green-800',
      warning: isDarkMode 
         ? 'bg-yellow-900 text-yellow-200' 
         : 'bg-yellow-100 text-yellow-800',
      danger: isDarkMode 
         ? 'bg-red-900 text-red-200' 
         : 'bg-red-100 text-red-800',
      info: isDarkMode 
         ? 'bg-cyan-900 text-cyan-200' 
         : 'bg-cyan-100 text-cyan-800',
      purple: isDarkMode 
         ? 'bg-purple-900 text-purple-200' 
         : 'bg-purple-100 text-purple-800',
      pink: isDarkMode 
         ? 'bg-pink-900 text-pink-200' 
         : 'bg-pink-100 text-pink-800'
   };

   const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm'
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
