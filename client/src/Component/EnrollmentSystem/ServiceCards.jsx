import React from 'react';
import { Card } from '../UI';
import { useDarkMode } from '../Context';
import { serviceOptions } from './utils/enrollmentHelpers.jsx';

const ServiceCards = ({ onServiceClick }) => {
   const { isDarkMode } = useDarkMode();

   const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700'
   };

   const iconColorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600'
   };

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {Object.entries(serviceOptions).map(([key, service]) => ( 
            <Card 
               key={key}
               className={`p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:scale-105 ${
                  colorClasses[service.color]
               }`}
               onClick={() => onServiceClick(key)}
            >
               <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                     colorClasses[service.color]
                  }`}>
                     <span className={iconColorClasses[service.color]}>
                        {service.icon}
                     </span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{service.name}</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{service.description}</p>
               </div>
            </Card>
         ))}
      </div>
   );
};

export default ServiceCards;
