import React, { useState, useEffect, useCallback } from 'react';

const NotificationsPage = ({ currentUser }) => {
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch notifications
   const fetchNotifications = useCallback(async () => {
      try {
         setLoading(true);
         
         // Debug: Log current user to see what's available
         console.log('NotificationsPage - currentUser:', currentUser);
         
         // Get user ID from various possible sources
         const userId = currentUser?.userId || currentUser?._id || currentUser?.id;
         
         if (!userId) {
            console.error('No user ID found in currentUser:', currentUser);
            setError('User not authenticated');
            setLoading(false);
            return;
         }
         
         console.log('Fetching notifications for user ID:', userId);
         console.log('User role:', currentUser?.role);
         
         // Determine the correct endpoint based on user role
         let endpoint;
         switch (currentUser?.role) {
            case 'proponent':
               endpoint = `http://localhost:4000/api/notifications/proponent/${userId}`;
               break;
            case 'psto':
               endpoint = `http://localhost:4000/api/notifications/psto/${userId}`;
               break;
            case 'dost_mimaropa':
               endpoint = `http://localhost:4000/api/notifications/dost/${userId}`;
               break;
            default:
               endpoint = `http://localhost:4000/api/notifications/proponent/${userId}`;
         }
         
         console.log('Using endpoint:', endpoint);
         
         const response = await fetch(endpoint, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
         } else {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            setError(`Failed to fetch notifications: ${response.status}`);
         }
      } catch (err) {
         setError('Error fetching notifications');
         console.error('Error fetching notifications:', err);
      } finally {
         setLoading(false);
      }
   }, [currentUser]);

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
            setNotifications(prev => 
               prev.map(notif => 
                  notif._id === notificationId 
                     ? { ...notif, isRead: true }
                     : notif
               )
            );
         }
      } catch (error) {
         console.error('Error marking notification as read:', error);
      }
   };

   // Mark all as read
   const markAllAsRead = async () => {
      try {
         const userId = currentUser.userId || currentUser._id || currentUser.id;
         
         // Determine the correct endpoint based on user role
         let endpoint;
         switch (currentUser?.role) {
            case 'proponent':
               endpoint = `http://localhost:4000/api/notifications/proponent/${userId}/mark-all-read`;
               break;
            case 'psto':
               endpoint = `http://localhost:4000/api/notifications/psto/${userId}/mark-all-read`;
               break;
            case 'dost_mimaropa':
               endpoint = `http://localhost:4000/api/notifications/dost/${userId}/mark-all-read`;
               break;
            default:
               endpoint = `http://localhost:4000/api/notifications/proponent/${userId}/mark-all-read`;
         }
         
         const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            setNotifications(prev => 
               prev.map(notif => ({ ...notif, isRead: true }))
            );
         }
      } catch (error) {
         console.error('Error marking all notifications as read:', error);
      }
   };

   // Fetch notifications on component mount
   useEffect(() => {
      if (currentUser) {
         fetchNotifications();
      }
   }, [currentUser, fetchNotifications]);

   const unreadCount = notifications.filter(n => !n.isRead).length;

   // Early return if no currentUser
   if (!currentUser) {
      return (
         <div className="p-6">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
               <p className="text-gray-600">Please log in to view your notifications.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="p-6">
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600">
               {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
         </div>
         
         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header with actions */}
            <div className="p-4 border-b border-gray-200">
               <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">All Notifications</h3>
                  {unreadCount > 0 && (
                     <button
                        onClick={markAllAsRead}
                        className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                     >
                        Mark All as Read
                     </button>
                  )}
               </div>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-gray-200">
               {loading ? (
                  <div className="p-8 text-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-500">Loading notifications...</p>
                  </div>
               ) : error ? (
                  <div className="p-8 text-center">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading notifications</h3>
                     <p className="text-gray-500 mb-4">{error}</p>
                     <button 
                        onClick={fetchNotifications}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                     >
                        Try Again
                     </button>
                  </div>
               ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9965 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
                        </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                     <p className="text-gray-500 mb-6">You'll see notifications about your applications and system updates here.</p>
                     <button 
                        onClick={fetchNotifications}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                     >
                        Refresh Notifications
                     </button>
                  </div>
               ) : (
                  notifications.map((notification) => (
                     <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                           !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification._id)}
                     >
                        <div className="flex items-start gap-3">
                           <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                              notification.isRead ? 'bg-gray-400' : 'bg-blue-500'
                           }`}></div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                 <h4 className={`text-sm font-medium ${
                                    notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                 }`}>
                                    {notification.title}
                                 </h4>
                                 <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                 </span>
                              </div>
                              <p className={`text-sm ${
                                 notification.isRead ? 'text-gray-600' : 'text-gray-800'
                              }`}>
                                 {notification.message}
                              </p>
                              {notification.actionUrl && (
                                 <div className="mt-2">
                                    <a
                                       href={notification.actionUrl}
                                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                       {notification.actionText || 'View Details'} →
                                    </a>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
};

export default NotificationsPage;
