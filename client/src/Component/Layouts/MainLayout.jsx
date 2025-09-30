import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useDarkMode } from '../Context';

const MainLayout = ({ children, user, onLogout, onNavigateToProfile, onNavigate, currentPath = '/dashboard' }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const { isDarkMode } = useDarkMode();

   const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
   };

   const toggleSidebarCollapse = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   const closeSidebar = () => {
      setSidebarOpen(false);
   };

   return (
      <div className={`min-h-screen transition-colors duration-300 ${
         isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
         {/* Header */}
         <Header 
            user={user}
            onLogout={onLogout}
            onToggleSidebar={toggleSidebar}
            onToggleSidebarCollapse={toggleSidebarCollapse}
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            onNavigateToProfile={onNavigateToProfile}
         />

         <div className="flex">
                    {/* Sidebar */}
                    <Sidebar 
                       isOpen={sidebarOpen}
                       onClose={closeSidebar}
                       currentPath={currentPath}
                       isCollapsed={sidebarCollapsed}
                       userRole={user?.role}
                       user={user}
                       onNavigate={onNavigate}
                    />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ease-in-out ${
               sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-0'
            }`}>
               <div className="p-6">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
};

export default MainLayout;
