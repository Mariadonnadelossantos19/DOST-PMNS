import React from 'react';

/**
 * Reusable PSTO header component
 * Standardized header for all PSTO dashboards
 */
const PSTOHeader = ({ province, currentUser }) => {
   const provinceColors = {
      'Palawan': 'from-teal-600 to-teal-800',
      'Oriental Mindoro': 'from-blue-600 to-blue-800',
      'Occidental Mindoro': 'from-green-600 to-green-800',
      'Romblon': 'from-purple-600 to-purple-800',
      'Marinduque': 'from-pink-600 to-pink-800'
   };

   const colorClass = provinceColors[province] || 'from-gray-600 to-gray-800';

   return (
      <div className={`bg-gradient-to-r ${colorClass} rounded-lg p-6 text-white`}>
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">PSTO {province} Dashboard</h1>
               <p className="text-opacity-90 mt-2">
                  Welcome, {currentUser?.name || 'User'}! Manage {province}-specific programs and services.
               </p>
            </div>
            <div className="text-right">
               <div className="text-sm opacity-75">Provincial Science and Technology Office</div>
               <div className="text-lg font-semibold">{province}</div>
            </div>
         </div>
      </div>
   );
};

export default PSTOHeader;
