import React from 'react';

const FormSelect = ({ 
   label, 
   name, 
   value, 
   onChange, 
   options = [], 
   error, 
   required = false,
   placeholder = "Select an option",
   className = "",
   ...props 
}) => {
   const selectClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      error ? 'border-red-500' : 'border-gray-300'
   } ${className}`;

   return (
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
         </label>
         <select
            name={name}
            value={value}
            onChange={onChange}
            className={selectClasses}
            {...props}
         >
            <option value="">{placeholder}</option>
            {options.map((option) => (
               <option key={option.value} value={option.value}>
                  {option.label}
               </option>
            ))}
         </select>
         {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
         )}
      </div>
   );
};

export default FormSelect;
