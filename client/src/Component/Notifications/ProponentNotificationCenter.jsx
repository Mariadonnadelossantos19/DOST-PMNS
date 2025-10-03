import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../UI';

const ProponentNotificationCenter = ({ userId }) => {
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);

   // Fetch notifications for the proponent
   const fetchNotifications = useCallback(async () => {
      try {
         setLoading(true);
         const response = await fetch(`http://localhost:4000/api/notifications/proponent/${userId}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
         }
      } catch (error) {
         console.error('Error fetching notifications:', error);
      } finally {
         setLoading(false);
      }
   }, [userId]);

   // Mark notification as read
   const markAsRead = async (notificationId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            // Update local state
            setNotifications(prev => 
               prev.map(notif => 
                  notif._id === notificationId 
                     ? { ...notif, isRead: true }
                     : notif
               )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
         }
      } catch (error) {
         console.error('Error marking notification as read:', error);
      }
   };

   // Mark all as read
   const markAllAsRead = async () => {
      try {
         const response = await fetch(`http://localhost:4000/api/notifications/proponent/${userId}/mark-all-read`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            setNotifications(prev => 
               prev.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
         }
      } catch (error) {
         console.error('Error marking all notifications as read:', error);
      }
   };

   useEffect(() => {
      if (userId) {
         fetchNotifications();
      }
   }, [userId, fetchNotifications]);

   const getNotificationIcon = (type) => {
      const icons = {
         'application_submitted': '📝',
         'application_approved': '✅',
         'application_rejected': '❌',
         'application_returned': '🔄',
         'application_under_review': '👀',
         'application_psto_approved': '✅',
         'application_psto_rejected': '❌',
         'application_dost_approved': '🎉',
         'application_dost_rejected': '❌',
         'tna_scheduled': '📅',
         'tna_completed': '✅',
         'document_required': '📄',
         'status_update': '📢',
         'general': 'ℹ️'
      };
      return icons[type] || 'ℹ️';
   };

   // Get notification color (currently unused but available for future use)
   // const getNotificationColor = (type) => {
   //    const colors = {
   //       'application_submitted': 'blue',
   //       'application_approved': 'green',
   //       'application_rejected': 'red',
   //       'application_returned': 'orange',
   //       'application_under_review': 'yellow',
   //       'application_psto_approved': 'green',
   //       'application_psto_rejected': 'red',
   //       'application_dost_approved': 'green',
   //       'application_dost_rejected': 'red',
   //       'tna_scheduled': 'blue',
   //       'tna_completed': 'green',
   //       'document_required': 'yellow',
   //       'status_update': 'blue',
   //       'general': 'gray'
   //    };
   //    return colors[type] || 'gray';
   // };

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) {
         return 'Just now';
      } else if (diffInHours < 24) {
         return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInHours < 48) {
         return 'Yesterday';
      } else {
         return date.toLocaleDateString();
      }
   };

   if (loading) {
      return (
         <Card className="p-6">
            <div className="animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
               <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
               </div>
            </div>
         </Card>
      );
   }

   return (
      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
               Notifications
               {unreadCount > 0 && (
                  <Badge color="red" size="sm" className="ml-2">
                     {unreadCount}
                  </Badge>
               )}
            </h3>
            {unreadCount > 0 && (
               <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
               >
                  Mark All as Read
               </Button>
            )}
         </div>

         {notifications.length === 0 ? (
            <Card className="p-6 text-center">
               <div className="text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll receive updates about your applications here</p>
               </div>
            </Card>
         ) : (
            <div className="space-y-3">
               {notifications.map((notification) => (
                  <Card
                     key={notification._id}
                     className={`p-4 cursor-pointer transition-colors ${
                        notification.isRead 
                           ? 'bg-white hover:bg-gray-50' 
                           : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                     }`}
                     onClick={() => markAsRead(notification._id)}
                  >
                     <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-2xl">
                           {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${
                                 notification.isRead ? 'text-gray-900' : 'text-blue-900'
                              }`}>
                                 {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                 <span className="text-xs text-gray-500">
                                    {formatDate(notification.createdAt)}
                                 </span>
                                 {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                 )}
                              </div>
                           </div>
                           <p className={`text-sm mt-1 ${
                              notification.isRead ? 'text-gray-600' : 'text-blue-700'
                           }`}>
                              {notification.message}
                           </p>
                           {notification.actionUrl && (
                              <Button
                                 size="sm"
                                 className="mt-2"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = notification.actionUrl;
                                 }}
                              >
                                 View Details
                              </Button>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );
};

export default ProponentNotificationCenter;
