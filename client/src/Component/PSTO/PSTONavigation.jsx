import React from 'react';

/**
 * Reusable PSTO navigation component
 * Standardized navigation tabs for all PSTO dashboards
 */
const PSTONavigation = ({ currentView, onViewChange, province }) => {
   const navigationItems = [
      { key: 'overview', label: 'Overview', icon: '📊' },
      { key: 'interactive', label: 'Interactive', icon: '🎯' },
      { key: 'projects', label: 'Projects', icon: '📁' },
      { key: 'tasks', label: 'Tasks', icon: '✅' },
      { key: 'proponents', label: 'Proponents', icon: '👥' },
      { key: 'pending-activations', label: 'Pending Activations', icon: '⏳' },
      { key: 'document-validation', label: 'Document Validation', icon: '📋' },
      { key: 'tna-management', label: 'TNA Management', icon: '🔍' },
      { key: 'tna-reports', label: 'TNA Reports', icon: '📊' },
      { key: 'enrollment', label: 'Enrollment', icon: '📝' }
   ];

   return (
      <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {navigationItems.map((item) => (
               <button
                  key={item.key}
                  onClick={() => onViewChange(item.key)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                     currentView === item.key
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
               </button>
            ))}
         </nav>
      </div>
   );
};

export default PSTONavigation;
