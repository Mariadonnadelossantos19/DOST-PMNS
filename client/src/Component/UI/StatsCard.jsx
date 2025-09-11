import React from 'react';

const StatsCard = ({ 
   title, 
   value, 
   icon, 
   color = 'blue', 
   trend = null, 
   subtitle = null,
   className = '' 
}) => {
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
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600'
   };

   return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center">
               <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-sm`}>
                  <span className="text-white text-xl">
                     {icon}
                  </span>
               </div>
               <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  {subtitle && (
                     <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
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
                  <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default StatsCard;
