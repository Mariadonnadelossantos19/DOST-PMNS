import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user, onLogout }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [currentPath, setCurrentPath] = useState('/dashboard');

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
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <Header 
            user={user}
            onLogout={onLogout}
            onToggleSidebar={toggleSidebar}
            onToggleSidebarCollapse={toggleSidebarCollapse}
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
         />

         <div className="flex">
            {/* Sidebar */}
            <Sidebar 
               isOpen={sidebarOpen}
               onClose={closeSidebar}
               currentPath={currentPath}
               isCollapsed={sidebarCollapsed}
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
