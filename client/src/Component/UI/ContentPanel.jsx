import React from 'react';

const ContentPanel = ({ 
   title, 
   subtitle = null,
   children, 
   className = '',
   headerAction = null,
   emptyState = null,
   isEmpty = false
}) => {
   return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
         <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  {subtitle && (
                     <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                  )}
               </div>
               {headerAction && (
                  <div className="flex items-center space-x-2">
                     {headerAction}
                  </div>
               )}
            </div>
         </div>
         <div className="p-6">
            {isEmpty && emptyState ? (
               <div className="text-center py-8">
                  {emptyState}
               </div>
            ) : (
               children
            )}
         </div>
      </div>
   );
};

export default ContentPanel;
