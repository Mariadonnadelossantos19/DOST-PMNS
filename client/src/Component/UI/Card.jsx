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
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8'
   };

   const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      default: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
   };

   const cardClasses = `
      rounded-lg transition-colors duration-300
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${border ? (isDarkMode ? 'border border-gray-700' : 'border border-gray-200') : ''}
      ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
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
      <div className={`border-b pb-4 mb-4 transition-colors duration-300 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`} {...props}>
         {children}
      </div>
   );
};

const CardTitle = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <h3 className={`text-lg font-semibold transition-colors duration-300 ${
         isDarkMode ? 'text-white' : 'text-gray-900'
      } ${className}`} {...props}>
         {children}
      </h3>
   );
};

const CardDescription = ({ children, className = '', ...props }) => {
   const { isDarkMode } = useDarkMode();
   return (
      <p className={`text-sm mt-1 transition-colors duration-300 ${
         isDarkMode ? 'text-gray-300' : 'text-gray-600'
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
      <div className={`border-t pt-4 mt-4 transition-colors duration-300 ${
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
