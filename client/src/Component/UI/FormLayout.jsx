import React from 'react';
import { Card } from './index';

/**
 * Standardized Form Layout Component
 * Provides consistent form structure across the application
 */
const FormLayout = ({ 
   title, 
   subtitle, 
   children, 
   onSubmit, 
   onCancel,
   submitText = "Submit",
   cancelText = "Cancel",
   loading = false,
   className = ""
}) => {
   return (
      <Card className={`p-6 ${className}`}>
         {(title || subtitle) && (
            <div className="mb-6">
               {title && (
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
               )}
               {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
               )}
            </div>
         )}

         <form onSubmit={onSubmit} className="space-y-6">
            {children}

            {(onSubmit || onCancel) && (
               <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  {onCancel && (
                     <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                        {cancelText}
                     </button>
                  )}
                  {onSubmit && (
                     <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? 'Processing...' : submitText}
                     </button>
                  )}
               </div>
            )}
         </form>
      </Card>
   );
};

export default FormLayout;


