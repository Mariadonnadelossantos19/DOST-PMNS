import React from 'react';
import { useDarkMode } from '../../Context';

const FormSection = ({ title, description, children, className = "" }) => {
   const { isDarkMode } = useDarkMode();
   
   return (
      <div className={`border-b pb-6 transition-colors duration-300 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } ${className}`}>
         <div className="text-center mb-4">
            <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
               isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{title}</h3>
            {description && (
               <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
               }`}>{description}</p>
            )}
         </div>
         <div className="max-w-3xl mx-auto">
            {children}
         </div>
      </div>
   );
};

export default FormSection;
