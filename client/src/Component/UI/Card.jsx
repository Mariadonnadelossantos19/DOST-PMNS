import React from 'react';
import { useDarkMode } from '../Context';

const Card = ({ 
   children, 
   className = '', 
   padding = 'default',
   shadow = 'default',
   border = false,
   hover = false,
   ...props 
}) => {
   const { isDarkMode } = useDarkMode();
   
   const paddingClasses = {
      none: '',
      sm: 'p-3',
      default: 'p-4',
      lg: 'p-6'
   };

   const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      default: 'shadow-sm',
      lg: 'shadow-md',
      xl: 'shadow-lg'
   };

   const cardClasses = `
      rounded-md transition-colors duration-150
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${border ? (isDarkMode ? 'border border-gray-700' : 'border border-gray-200') : ''}
      ${hover ? 'hover:shadow-md transition-shadow duration-150' : ''}
      ${className}
   `;

   return (
      <div className={cardClasses} {...props}>
         {children}
      </div>
   );
};

// Card sub-components
const CardHeader = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <div className={`border-b pb-3 mb-3 transition-colors duration-150 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`} {...props}>
         {children}
      </div>
   );
};

const CardTitle = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <h3 className={`text-base font-medium transition-colors duration-150 ${
         isDarkMode ? 'text-white' : 'text-gray-900'
      } ${className}`} {...props}>
         {children}
      </h3>
   );
};

const CardDescription = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <p className={`text-sm mt-1 transition-colors duration-150 ${
         isDarkMode ? 'text-gray-400' : 'text-gray-500'
      } ${className}`} {...props}>
         {children}
      </p>
   );
};

const CardContent = ({ children, className = '', ...props }) => (
   <div className={className} {...props}>
      {children}
   </div>
);

const CardFooter = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <div className={`border-t pt-3 mt-3 transition-colors duration-150 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`} {...props}>
         {children}
      </div>
   );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
