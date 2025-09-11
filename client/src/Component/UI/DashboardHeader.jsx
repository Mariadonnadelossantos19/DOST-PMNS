import React from 'react';

const DashboardHeader = ({ 
   title, 
   subtitle, 
   color = 'purple',
   className = '',
   children 
}) => {
   const colorClasses = {
      blue: 'from-blue-600 to-blue-800',
      green: 'from-green-600 to-green-800',
      yellow: 'from-yellow-600 to-yellow-800',
      red: 'from-red-600 to-red-800',
      purple: 'from-purple-600 to-purple-800',
      indigo: 'from-indigo-600 to-indigo-800',
      pink: 'from-pink-600 to-pink-800',
      teal: 'from-teal-600 to-teal-800',
      orange: 'from-orange-600 to-orange-800'
   };

   return (
      <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg ${className}`}>
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">{title}</h1>
               {subtitle && (
                  <p className="text-opacity-90 mt-2 text-lg">{subtitle}</p>
               )}
            </div>
            {children && (
               <div className="flex items-center space-x-3">
                  {children}
               </div>
            )}
         </div>
      </div>
   );
};

export default DashboardHeader;
