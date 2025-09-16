import React from 'react';

const FormFileUpload = ({ 
   label, 
   name, 
   onChange, 
   error, 
   required = false,
   accept = ".pdf,.doc,.docx",
   helpText = "PDF, DOC, or DOCX files only (max 10MB)",
   className = "",
   ...props 
}) => {
   const fileInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      error ? 'border-red-500' : 'border-gray-300'
   } ${className}`;

   return (
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
         </label>
         <input
            type="file"
            name={name}
            onChange={onChange}
            accept={accept}
            className={fileInputClasses}
            {...props}
         />
         {helpText && (
            <p className="text-xs text-gray-500 mt-1">{helpText}</p>
         )}
         {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
         )}
      </div>
   );
};

export default FormFileUpload;
