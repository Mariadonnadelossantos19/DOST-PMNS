import React from 'react';
import { Card } from '../UI';

/**
 * Standardized Page Layout Component
 * Provides consistent structure for all pages
 */
const PageLayout = ({ 
   title, 
   subtitle, 
   actions, 
   children, 
   className = '',
   loading = false,
   error = null 
}) => {
   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-sm text-gray-500 mt-4">Loading...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
               <div className="text-red-500 text-4xl mb-4">⚠️</div>
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
               <p className="text-gray-600">{error}</p>
            </Card>
         </div>
      );
   }

   return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-6">
               {/* Page Header */}
               {(title || subtitle || actions) && (
                  <div className="mb-6">
                     <div className="flex justify-between items-start">
                        <div>
                           {title && (
                              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                           )}
                           {subtitle && (
                              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                           )}
                        </div>
                        {actions && (
                           <div className="flex space-x-3">
                              {actions}
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Page Content */}
               <div className="space-y-6">
                  {children}
               </div>
            </div>
         </div>
      </div>
   );
};

export default PageLayout;
