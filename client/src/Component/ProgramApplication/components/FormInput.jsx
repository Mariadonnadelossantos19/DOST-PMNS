import React from 'react';

const FormInput = ({ 
   label, 
   name, 
   type = "text", 
   value, 
   onChange, 
   placeholder, 
   error, 
   required = false,
   className = "",
   ...props 
}) => {
   const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      error ? 'border-red-500' : 'border-gray-300'
   } ${className}`;

   return (
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
         </label>
         <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
            {...props}
         />
         {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
         )}
      </div>
   );
};

export default FormInput;
