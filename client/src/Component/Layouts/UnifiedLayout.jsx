import React, { useState } from 'react';
import { useDarkMode } from '../Context';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Unified Layout Component
 * Combines sidebar navigation with main content area
 * Eliminates redundancy between sidebar and tabs
 */
const UnifiedLayout = ({ 
   children, 
   user, 
   onLogout, 
   onNavigate,
   currentPath = '/dashboard'
}) => {
   const { isDarkMode } = useDarkMode();
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

   const handleSidebarToggle = () => {
      setSidebarOpen(!sidebarOpen);
   };

   const handleSidebarCollapse = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   const handleNavigate = (path) => {
      setSidebarOpen(false); // Close mobile sidebar after navigation
      if (onNavigate) {
         onNavigate(path);
      }
   };

   return (
      <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
         {/* Sidebar */}
         <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPath={currentPath}
            userRole={user?.role}
            isCollapsed={sidebarCollapsed}
            user={user}
            onNavigate={handleNavigate}
         />

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header
               user={user}
               onLogout={onLogout}
               onSidebarToggle={handleSidebarToggle}
               onSidebarCollapse={handleSidebarCollapse}
               sidebarCollapsed={sidebarCollapsed}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
               <div className="h-full">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
};

export default UnifiedLayout;
