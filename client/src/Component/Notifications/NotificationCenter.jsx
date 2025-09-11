import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal } from '../UI';

const NotificationCenter = ({ notifications = [], onMarkAsRead, onMarkAllAsRead, onDelete }) => {
   const [selectedNotification, setSelectedNotification] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

   const getNotificationIcon = (type) => {
      switch (type) {
         case 'project':
            return (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            );
         case 'task':
            return (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
         case 'team':
            return (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            );
         case 'system':
            return (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            );
         default:
            return (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
               </svg>
            );
      }
   };

   const getNotificationColor = (type) => {
      switch (type) {
         case 'project':
            return 'blue';
         case 'task':
            return 'green';
         case 'team':
            return 'purple';
         case 'system':
            return 'yellow';
         default:
            return 'gray';
      }
   };

   const formatTimeAgo = (date) => {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return notificationDate.toLocaleDateString();
   };

   const filteredNotifications = notifications.filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
   });

   const unreadCount = notifications.filter(n => !n.read).length;

   const handleNotificationClick = (notification) => {
      setSelectedNotification(notification);
      setIsModalOpen(true);
      if (!notification.read) {
         onMarkAsRead?.(notification.id);
      }
   };

   const handleMarkAsRead = (notificationId) => {
      onMarkAsRead?.(notificationId);
   };

   const handleDelete = (notificationId) => {
      onDelete?.(notificationId);
      if (selectedNotification?.id === notificationId) {
         setIsModalOpen(false);
         setSelectedNotification(null);
      }
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
               <p className="text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
               </p>
            </div>
            <div className="flex gap-2">
               <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onMarkAllAsRead?.()}
                  disabled={unreadCount === 0}
               >
                  Mark All as Read
               </Button>
            </div>
         </div>

         {/* Filter Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {[
                  { key: 'all', label: 'All', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'read', label: 'Read', count: notifications.length - unreadCount }
               ].map((tab) => (
                  <button
                     key={tab.key}
                     onClick={() => setFilter(tab.key)}
                     className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        filter === tab.key
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     {tab.label}
                     <Badge variant="default" size="sm">{tab.count}</Badge>
                  </button>
               ))}
            </nav>
         </div>

         {/* Notifications List */}
         <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
               filteredNotifications.map((notification) => (
                  <Card 
                     key={notification.id}
                     className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : ''
                     }`}
                     onClick={() => handleNotificationClick(notification)}
                  >
                     <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-${getNotificationColor(notification.type)}-100 flex-shrink-0`}>
                           <span className={`text-${getNotificationColor(notification.type)}-600`}>
                              {getNotificationIcon(notification.type)}
                           </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <div className="flex items-start justify-between">
                              <div className="flex-1">
                                 <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
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
                              
                              <div className="flex items-center gap-2 ml-4">
                                 {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                 )}
                                 <div className="flex gap-1">
                                    {!notification.read && (
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleMarkAsRead(notification.id);
                                          }}
                                          title="Mark as read"
                                       >
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                       </Button>
                                    )}
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(notification.id);
                                       }}
                                       title="Delete notification"
                                    >
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                       </svg>
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))
            ) : (
               <Card className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                     <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                     {filter === 'all' 
                        ? "You're all caught up! No notifications to show."
                        : `No ${filter} notifications to show.`
                     }
                  </p>
               </Card>
            )}
         </div>

         {/* Notification Detail Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedNotification?.title}
            size="lg"
         >
            {selectedNotification && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Badge variant="default">{selectedNotification.type}</Badge>
                     <span className="text-sm text-gray-500">
                        {formatTimeAgo(selectedNotification.createdAt)}
                     </span>
                  </div>
                  
                  <div>
                     <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedNotification.message}
                     </p>
                  </div>
                  
                  {selectedNotification.details && (
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                           {JSON.stringify(selectedNotification.details, null, 2)}
                        </pre>
                     </div>
                  )}
                  
                  {selectedNotification.actionUrl && (
                     <div className="pt-4 border-t border-gray-200">
                        <Button 
                           onClick={() => {
                              window.open(selectedNotification.actionUrl, '_blank');
                              setIsModalOpen(false);
                           }}
                        >
                           View Details
                        </Button>
                     </div>
                  )}
               </div>
            )}
         </Modal>
      </div>
   );
};

export default NotificationCenter;
