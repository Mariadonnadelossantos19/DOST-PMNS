import React from 'react';

const FormSection = ({ title, description, children, className = "" }) => {
   return (
      <div className={`border-b border-gray-200 pb-8 ${className}`}>
         <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            {description && (
               <p className="text-gray-600">{description}</p>
            )}
         </div>
         <div className="max-w-4xl mx-auto">
            {children}
         </div>
      </div>
   );
};

export default FormSection;
