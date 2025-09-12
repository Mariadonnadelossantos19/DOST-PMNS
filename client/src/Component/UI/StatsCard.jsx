import React from 'react';
import { useDarkMode } from '../Context';

const StatsCard = ({ 
   title, 
   value, 
   icon, 
   color = 'blue', 
   trend = null, 
   subtitle = null,
   className = '' 
}) => {
   const { isDarkMode } = useDarkMode();
   
   const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500'
   };

   const trendClasses = {
      up: isDarkMode ? 'text-green-400' : 'text-green-600',
      down: isDarkMode ? 'text-red-400' : 'text-red-600',
      neutral: isDarkMode ? 'text-gray-400' : 'text-gray-600'
   };

   return (
      <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
         isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
      } ${className}`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center">
               <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-sm`}>
                  <span className="text-white text-xl">
                     {icon}
                  </span>
               </div>
               <div className="ml-4">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{title}</p>
                  <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{value}</p>
                  {subtitle && (
                     <p className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                     }`}>{subtitle}</p>
                  )}
               </div>
            </div>
            {trend && (
               <div className={`text-right ${trendClasses[trend.type]}`}>
                  <div className="flex items-center">
                     <span className="text-sm font-medium">
                        {trend.type === 'up' ? '↗' : trend.type === 'down' ? '↘' : '→'}
                     </span>
                     <span className="text-sm font-medium ml-1">
                        {trend.value}
                     </span>
                  </div>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>{trend.label}</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default StatsCard;
