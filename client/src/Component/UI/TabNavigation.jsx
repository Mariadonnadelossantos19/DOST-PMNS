import React from 'react';

const TabNavigation = ({ 
   tabs, 
   activeTab, 
   onTabChange, 
   className = '',
   color = 'purple'
}) => {
   const colorClasses = {
      blue: 'border-blue-500 text-blue-600',
      green: 'border-green-500 text-green-600',
      yellow: 'border-yellow-500 text-yellow-600',
      red: 'border-red-500 text-red-600',
      purple: 'border-purple-500 text-purple-600',
      indigo: 'border-indigo-500 text-indigo-600',
      pink: 'border-pink-500 text-pink-600',
      teal: 'border-teal-500 text-teal-600',
      orange: 'border-orange-500 text-orange-600'
   };

   return (
      <div className={`border-b border-gray-200 ${className}`}>
         <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
               <button
                  key={tab.id || tab.key}
                  onClick={() => onTabChange(tab.id || tab.key)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                     activeTab === (tab.id || tab.key)
                        ? `${colorClasses[color]}`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  <div className="flex items-center space-x-2">
                     {tab.icon && (
                        <span className="text-lg">{tab.icon}</span>
                     )}
                     <span>{tab.label}</span>
                     {(tab.count !== undefined || tab.badge) && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                           {tab.count || tab.badge}
                        </span>
                     )}
                  </div>
               </button>
            ))}
         </nav>
      </div>
   );
};

export default TabNavigation;
