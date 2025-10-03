import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../UI';

const PSTONotificationCenter = ({ userId }) => {
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);

   // Fetch notifications for the PSTO user
   const fetchNotifications = useCallback(async () => {
      try {
         setLoading(true);
         const response = await fetch(`http://localhost:4000/api/notifications/psto/${userId}`, {
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
         console.error('Error fetching PSTO notifications:', error);
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

   // Mark all notifications as read
   const markAllAsRead = async () => {
      try {
         const response = await fetch(`http://localhost:4000/api/notifications/psto/${userId}/mark-all-read`, {
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

   // Delete notification
   const deleteNotification = async (notificationId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
         }
      } catch (error) {
         console.error('Error deleting notification:', error);
      }
   };

   // Get notification icon based on type
   const getNotificationIcon = (type) => {
      switch (type) {
         case 'rtec_scheduled':
         case 'rtec_meeting':
            return (
               <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            );
         case 'rtec_invitation':
         case 'rtec_resend':
            return (
               <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
         case 'application_submitted':
         case 'application_review':
         case 'application_status':
            return (
               <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            );
         case 'tna_scheduled':
         case 'tna_completed':
         case 'tna_report':
         case 'tna_review':
            return (
               <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
               </svg>
            );
         case 'system':
         case 'general':
            return (
               <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            );
         default:
            return (
               <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
               </svg>
            );
      }
   };

   // Get notification priority color (currently unused but available for future use)
   // const getPriorityColor = (priority) => {
   //    switch (priority) {
   //       case 'high':
   //          return 'text-red-600 bg-red-50 border-red-200';
   //       case 'medium':
   //          return 'text-yellow-600 bg-yellow-50 border-yellow-200';
   //       case 'low':
   //          return 'text-green-600 bg-green-50 border-green-200';
   //       default:
   //          return 'text-blue-600 bg-blue-50 border-blue-200';
   //    }
   // };

   // Format date for display
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: '2-digit',
         day: '2-digit',
         year: 'numeric'
      });
   };

   useEffect(() => {
      fetchNotifications();
   }, [fetchNotifications]);

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
               <p className="text-gray-600">{unreadCount} unread notifications</p>
               <p className="text-sm text-gray-500">RTEC meetings, TNA assessments, and application reviews</p>
            </div>
            {unreadCount > 0 && (
               <Button
                  variant="primary"
                  onClick={markAllAsRead}
                  className="bg-blue-600 hover:bg-blue-700"
               >
                  Mark All as Read
               </Button>
            )}
         </div>

         {/* Notifications List */}
         <div className="space-y-4">
            {notifications.length === 0 ? (
               <Card className="p-8 text-center">
                  <div className="text-gray-500">
                     <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                     </svg>
                     <p className="text-lg font-medium">No notifications</p>
                     <p className="text-sm">You're all caught up!</p>
                  </div>
               </Card>
            ) : (
               notifications.map((notification) => (
                  <Card 
                     key={notification._id} 
                     className={`p-6 border-l-4 ${
                        notification.isRead 
                           ? 'bg-white border-gray-200' 
                           : 'bg-blue-50 border-blue-500'
                     }`}
                  >
                     <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                           {/* Notification Icon */}
                           <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                           </div>
                           
                           {/* Notification Content */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                 <h3 className="text-lg font-semibold text-gray-900">
                                    {notification.title}
                                 </h3>
                                 {!notification.isRead && (
                                    <Badge color="blue" size="sm">New</Badge>
                                 )}
                                 {notification.priority && (
                                    <Badge 
                                       color={notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'yellow' : 'green'}
                                       size="sm"
                                    >
                                       {notification.priority.toUpperCase()}
                                    </Badge>
                                 )}
                              </div>
                              
                              <p className="text-gray-700 mb-3">
                                 {notification.message}
                              </p>
                              
                              {/* Action Buttons */}
                              {notification.actionUrl && (
                                 <div className="flex items-center space-x-4">
                                    <a
                                       href={notification.actionUrl}
                                       className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                                    >
                                       <span>{notification.actionText || 'View Details'}</span>
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                       </svg>
                                    </a>
                                 </div>
                              )}
                           </div>
                        </div>
                        
                        {/* Right side - Date and Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                           <span className="text-sm text-gray-500">
                              {formatDate(notification.createdAt)}
                           </span>
                           
                           <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsRead(notification._id)}
                                    className="text-xs"
                                 >
                                    Mark Read
                                 </Button>
                              )}
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => deleteNotification(notification._id)}
                                 className="text-xs text-red-600 hover:text-red-800"
                              >
                                 Delete
                              </Button>
                           </div>
                        </div>
                     </div>
                  </Card>
               ))
            )}
         </div>
      </div>
   );
};

export default PSTONotificationCenter;
