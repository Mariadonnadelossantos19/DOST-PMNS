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
         {/* Header */}
         <Header 
            user={user}
            onLogout={onLogout}
            onToggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
         />

         <div className="flex">
            {/* Sidebar */}
            <Sidebar 
               isOpen={sidebarOpen}
               onClose={closeSidebar}
               currentPath={currentPath}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-0">
               <div className="p-6">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
};

export default MainLayout;
