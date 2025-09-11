import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user, onLogout }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [currentPath, setCurrentPath] = useState('/dashboard');

   const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
   };

   const closeSidebar = () => {
      setSidebarOpen(false);
   };

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="flex">
            {/* Sidebar */}
            <Sidebar 
               isOpen={sidebarOpen}
               onClose={closeSidebar}
               currentPath={currentPath}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ease-in-out ${
               sidebarOpen ? 'ml-64' : 'ml-0'
            }`}>
               {/* Header */}
               <Header 
                  user={user}
                  onLogout={onLogout}
                  onToggleSidebar={toggleSidebar}
                  sidebarOpen={sidebarOpen}
               />

               {/* Main Content */}
               <main>
                  <div className="p-6">
                     {children}
                  </div>
               </main>
            </div>
         </div>
      </div>
   );
};

export default MainLayout;
