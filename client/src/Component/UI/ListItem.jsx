import React from 'react';
import Badge from './Badge';

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
   const baseClasses = "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200";
   const clickableClasses = onClick ? "cursor-pointer" : "";
   
   return (
      <div 
         className={`${baseClasses} ${clickableClasses} ${className}`}
         onClick={onClick}
      >
         <div className="flex items-center flex-1">
            {icon && (
               <div className="flex-shrink-0 mr-3">
                  <span className="text-gray-400 text-lg">{icon}</span>
               </div>
            )}
            <div className="flex-1 min-w-0">
               <p className="font-medium text-gray-900 truncate">{title}</p>
               {subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
