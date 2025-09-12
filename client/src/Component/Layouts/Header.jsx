import React from 'react';
import { useDarkMode } from '../Context';

const Header = ({ user, onLogout, onToggleSidebar, onToggleSidebarCollapse, sidebarOpen, sidebarCollapsed }) => {
   const { isDarkMode, toggleDarkMode } = useDarkMode();
   
   return (
      <header className={`flex items-center justify-between px-6 h-16 border-b shadow-sm sticky top-0 z-50 transition-colors duration-300 ${
         isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
      }`}>
         {/* Left Section */}
         <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button 
               className={`p-2 rounded-md transition-colors lg:hidden ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
               }`}
               onClick={onToggleSidebar}
               aria-label="Toggle sidebar"
            >  
               <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-0.5 w-full transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  } ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 w-full transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  } ${sidebarOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 w-full transition-all duration-300 ${
                     isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                  } ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
               </div>
            </button>

            {/* Desktop Collapse Toggle */}
            <button 
               className={`hidden lg:block p-2 rounded-md transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
               }`}
               onClick={onToggleSidebarCollapse}
               aria-label="Collapse sidebar"
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
               </svg>
            </button>
            <div className="flex flex-col">
               <h1 className={`text-xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>DOST-PMNS</h1>
               <span className={`text-xs font-medium hidden sm:block transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>Project Management & Notification System</span>
            </div>
         </div>

         {/* Center Section - Search */}
         <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Search projects, tasks, or notifications..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all ${
                     isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-300' 
                        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
               />
               <button className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
               }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
               </button>
            </div>
         </div>

         {/* Right Section */}
         <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
               onClick={toggleDarkMode}
               className={`p-2 rounded-md transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
               }`}
               aria-label="Toggle dark mode"
               title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
               {isDarkMode ? (
                  // Sun icon for light mode
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                     <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
               ) : (
                  // Moon icon for dark mode
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
               )}
            </button>

            {/* Notifications */}
            <div className="relative">
               <button className={`p-2 rounded-md transition-colors relative ${
                  isDarkMode 
                     ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                     : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
               }`} aria-label="Notifications">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                     <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9965 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">3</span>
               </button>
            </div>

            {/* User Profile */}
            <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
               isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}>
               <div className={`relative w-10 h-10 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
               }`}>
                  <img 
                     src={user?.avatar || '/default-avatar.png'} 
                     alt={user?.name || 'User'} 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                     }}
                  />
                  <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm" style={{display: 'none'}}>
                     {user?.name?.charAt(0) || 'U'}
                  </div>
               </div>
               <div className="hidden sm:flex flex-col">
                  <span className={`text-sm font-semibold transition-colors ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                     {user?.name || user?.firstName + ' ' + user?.lastName || 'User'}
                  </span>
                  <span className={`text-xs transition-colors ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                     {user?.userId || user?.id || 'No ID'} • {user?.role || 'Administrator'}
                  </span>
               </div>
               <button 
                  className={`p-2 rounded-md transition-colors ${
                     isDarkMode 
                        ? 'hover:bg-red-900 text-gray-300 hover:text-red-400' 
                        : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                  }`} 
                  onClick={onLogout} 
                  title="Logout"
               >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
               </button>
            </div>
         </div>
      </header>
   );
};

export default Header;