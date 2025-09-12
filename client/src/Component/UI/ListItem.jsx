import React from 'react';
import Badge from './Badge';
import { useDarkMode } from '../Context';

const ListItem = ({ 
   title, 
   subtitle, 
   badge = null,
   badgeVariant = 'default',
   icon = null,
   actions = null,
   className = '',
   onClick = null
}) => {
   const { isDarkMode } = useDarkMode();
   
   const baseClasses = `flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
      isDarkMode 
         ? 'bg-gray-700 hover:bg-gray-600' 
         : 'bg-gray-50 hover:bg-gray-100'
   }`;
   const clickableClasses = onClick ? "cursor-pointer" : "";
   
   return (
      <div 
         className={`${baseClasses} ${clickableClasses} ${className}`}
         onClick={onClick}
      >
         <div className="flex items-center flex-1">
            {icon && (
               <div className="flex-shrink-0 mr-3">
                  <span className={`text-lg transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}>{icon}</span>
               </div>
            )}
            <div className="flex-1 min-w-0">
               <p className={`font-medium truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>{title}</p>
               {subtitle && (
                  <p className={`text-sm mt-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{subtitle}</p>
               )}
            </div>
         </div>
         <div className="flex items-center space-x-3">
            {badge && (
               <Badge variant={badgeVariant}>
                  {badge}
               </Badge>
            )}
            {actions && (
               <div className="flex items-center space-x-2">
                  {actions}
               </div>
            )}
         </div>
      </div>
   );
};

export default ListItem;
