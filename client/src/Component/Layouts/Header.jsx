import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../Context';

const Header = ({ user, onLogout, onToggleSidebar, onToggleSidebarCollapse, sidebarOpen, onNavigateToProfile }) => {
   const { isDarkMode, toggleDarkMode } = useDarkMode();
   
   // User dropdown state
   const [showUserDropdown, setShowUserDropdown] = useState(false);

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (showUserDropdown && !event.target.closest('.user-dropdown')) {
            setShowUserDropdown(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [showUserDropdown]);

   const handleProfileClick = () => {
      if (onNavigateToProfile) {
         onNavigateToProfile();
      } else if (window.openEnterpriseProfile) {
         window.openEnterpriseProfile();
      }
      setShowUserDropdown(false);
   };
   
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

            {/* User Profile Dropdown */}
            <div className="relative user-dropdown">
               <button 
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                     isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
               >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                     isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
                  }`}>
                     {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                  </div>
                  <div className="flex flex-col">
                     <span className={`text-sm font-semibold transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                        {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'User'}
                     </span>
                     <span className={`text-xs transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                     }`}>
                        {user?.userId || user?.id || 'No ID'} • {user?.role || 'Administrator'}
                     </span>
                  </div>
                  <svg 
                     className={`w-4 h-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24"
                  >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
               </button>

               {/* Dropdown Menu */}
               {showUserDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 ${
                     isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                     {/* Profile Option */}
                     {user?.role === 'proponent' && (
                        <button
                           onClick={handleProfileClick}
                           className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              isDarkMode 
                                 ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                 : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Enterprise Profile
                           </div>
                        </button>
                     )}
                     
                     {/* Divider */}
                     <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} my-1`}></div>
                     
                     {/* Logout Option */}
                     <button
                        onClick={onLogout}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                           isDarkMode 
                              ? 'text-red-400 hover:bg-red-900 hover:text-red-300' 
                              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                           </svg>
                           Logout
                        </div>
                     </button>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
};

export default Header;