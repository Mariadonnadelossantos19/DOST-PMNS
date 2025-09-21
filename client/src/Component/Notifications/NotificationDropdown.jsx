import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../UI';

const NotificationDropdown = ({ 
   notifications = [], 
   onMarkAsRead, 
   onMarkAllAsRead,
   onViewAll,
   className = '' 
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);

   const unreadCount = notifications.filter(n => !n.isRead).length;
   const recentNotifications = notifications.slice(0, 5);

   const getNotificationIcon = (type) => {
      switch (type) {
         case 'project':
            return (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            );
         case 'task':
            return (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
         case 'team':
            return (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            );
         default:
            return (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
               </svg>
            );
      }
   };

   const formatTimeAgo = (date) => {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return notificationDate.toLocaleDateString();
   };

   const handleNotificationClick = (notification) => {
      if (!notification.isRead) {
         onMarkAsRead?.(notification._id);
      }
      if (notification.actionUrl) {
         window.open(notification.actionUrl, '_blank');
      }
      setIsOpen(false);
   };

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   return (
      <div className={`relative ${className}`} ref={dropdownRef}>
         {/* Notification Button */}
         <button
            className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Notifications"
         >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9965 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
               </span>
            )}
         </button>

         {/* Dropdown */}
         {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
               {/* Header */}
               <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                     {unreadCount > 0 && (
                        <button
                           onClick={() => {
                              onMarkAllAsRead?.();
                              setIsOpen(false);
                           }}
                           className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                           Mark all as read
                        </button>
                     )}
                  </div>
               </div>

               {/* Notifications List */}
               <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                     <div className="divide-y divide-gray-200">
                        {recentNotifications.map((notification) => (
                           <div
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                 !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                           >
                              <div className="flex items-start gap-3">
                                 <div className="flex-shrink-0 mt-0.5">
                                    <span className="text-gray-400">
                                       {getNotificationIcon(notification.type)}
                                    </span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                       <div className="flex-1">
                                          <h4 className={`text-sm font-medium ${
                                             !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                          }`}>
                                             {notification.title}
                                          </h4>
                                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                             {notification.message}
                                          </p>
                                          <div className="flex items-center gap-2 mt-2">
                                             <span className="text-xs text-gray-500">
                                                {formatTimeAgo(notification.createdAt)}
                                             </span>
                                             <Badge variant="default" size="sm">
                                                {notification.type}
                                             </Badge>
                                          </div>
                                       </div>
                                       {!notification.isRead && (
                                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-8 text-center">
                        <div className="text-gray-400 mb-2">
                           <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                           </svg>
                        </div>
                        <p className="text-sm text-gray-600">No notifications</p>
                     </div>
                  )}
               </div>

               {/* Footer */}
               {notifications.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                     <button
                        onClick={() => {
                           onViewAll?.();
                           setIsOpen(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                     >
                        View all notifications
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default NotificationDropdown;
