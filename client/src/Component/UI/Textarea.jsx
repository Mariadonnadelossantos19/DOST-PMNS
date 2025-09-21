import React from 'react';

const Textarea = ({ 
   className = '', 
   placeholder = '', 
   value = '', 
   onChange = () => {}, 
   rows = 4,
   disabled = false,
   ...props 
}) => {
   const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200';
   const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
   
   return (
      <textarea
         className={`${baseClasses} ${disabledClasses} ${className}`}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         rows={rows}
         disabled={disabled}
         {...props}
      />
   );
};

export default Textarea;
