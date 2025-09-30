import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDarkMode } from '../Context';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const Sidebar = ({ isOpen, onClose, currentPath, userRole = 'applicant', isCollapsed = false, onNavigate, user }) => {
   const { isDarkMode } = useDarkMode();
   const [stats, setStats] = useState({
      totalApplications: 0,
      pendingApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0
   });

   // Notification state for proponents
   const [notifications, setNotifications] = useState([]);

   // Fetch notifications for proponents
   const fetchNotifications = useCallback(async () => {
      if (!user || user.role !== 'proponent') {
         return;
      }
      
      try {
         const response = await fetch(`http://localhost:4000/api/notifications/proponent/${user.userId || user._id || user.id}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
         }
      } catch (error) {
         console.error('Error fetching notifications:', error);
      }
   }, [user]);

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
         const response = await fetch(`http://localhost:4000/api/notifications/proponent/${user.userId || user._id || user.id}/mark-all-read`, {
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

   const loadStatistics = useCallback(async () => {
      try {
         if (userRole === 'dost_mimaropa' || userRole === 'super_admin') {
            // Load DOST MIMAROPA applications statistics
            const response = await axios.get('http://localhost:4000/api/programs/dost-mimaropa/applications', {
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
               }
            });
            if (response.data.success) {
               const applications = response.data.data || [];
               setStats({
                  totalApplications: applications.length,
                  pendingApplications: applications.filter(app => app.dostMimaropaStatus === 'pending').length,
                  approvedApplications: applications.filter(app => app.dostMimaropaStatus === 'approved').length,
                  rejectedApplications: applications.filter(app => app.dostMimaropaStatus === 'rejected').length
               });
            }
         } else {
            // Load regular enrollment statistics for other roles
            const response = await axios.get('http://localhost:4000/api/enrollments/stats');
            if (response.data.success) {
               setStats({
                  totalApplications: response.data.stats.totalEnrollments || 0,
                  pendingApplications: response.data.stats.enrolled || 0,
                  approvedApplications: response.data.stats.completed || 0,
                  rejectedApplications: response.data.stats.cancelled || 0
               });
            }
         }
      } catch (error) {
         console.error('Error loading statistics:', error);
      }
   }, [userRole]);

   // Load statistics and notifications
   useEffect(() => {
      if (userRole === 'dost_mimaropa' || userRole === 'super_admin') {
         loadStatistics();
      }
      if (userRole === 'proponent') {
         fetchNotifications();
      }
   }, [userRole, loadStatistics, fetchNotifications]);

   // Program Application
   const programApplication = {
      id: 'program-application',
      label: 'Program Application',
      description: 'Apply for DOST programs',
      icon: (
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
         </svg>
      ),
      path: '/program-selection',
      color: 'indigo'
   };

   // Management sections
   const managementSections = [
      {
         id: 'tna-management',
         label: 'TNA Management',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
               <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ),
         path: '/tna-management'
      },
      {
         id: 'management',
         label: 'Management',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M2 3H6C6.55228 3 7 3.44772 7 4V20C7 20.5523 6.55228 21 6 21H2C1.44772 21 1 20.5523 1 20V4C1 3.44772 1.44772 3 2 3Z" stroke="currentColor" strokeWidth="2"/>
               <path d="M9 9H21C21.5523 9 22 9.44772 22 10V11C22 11.5523 21.5523 12 21 12H9C8.44772 12 8 11.5523 8 11V10C8 9.44772 8.44772 9 9 9Z" stroke="currentColor" strokeWidth="2"/>
               <path d="M9 15H21C21.5523 15 22 15.4477 22 16V17C22 17.5523 21.5523 18 21 18H9C8.44772 18 8 17.5523 8 17V16C8 15.4477 8.44772 15 9 15Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
         ),
         path: '/management'
      },
      {
         id: 'applications',
         label: 'Applications',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ),
         path: '/applications'
      },
      {
         id: 'proponent-management',
         label: 'Proponent Management',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
               <path d="M20 21V19C20 18.1645 19.7155 17.3541 19.2094 16.7006C18.7033 16.047 17.9991 15.5858 17.2 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ),
         path: '/proponent-management'
      },
      {
         id: 'notifications',
         label: 'Notifications',
         icon: (
            <div className="relative">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9965 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               {userRole === 'proponent' && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                     {notifications.filter(n => !n.isRead).length > 99 ? '99+' : notifications.filter(n => !n.isRead).length}
                  </span>
               )}
            </div>
         ),
         path: '/notifications'
      },
      {
         id: 'reports',
         label: 'Reports',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ),
         path: '/reports'
      },
      {
         id: 'settings',
         label: 'Settings',
         icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
               <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5053 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49372 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ),
         path: '/settings'
      }
   ];

   return (
      <>
         {/* Mobile Overlay */}
         {isOpen && (
            <div 
               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
               onClick={onClose}
            />
         )}

         {/* Sidebar */}
         <aside className={`
            fixed top-0 left-0 h-full border-r shadow-lg z-50
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:shadow-none
            ${isCollapsed ? 'w-16' : 'w-64'}
            ${isDarkMode 
               ? 'bg-gray-800 border-gray-700' 
               : 'bg-white border-gray-200'
            }
         `}>
            <div className="flex flex-col h-full">
               {/* Sidebar Header */}
               <div className={`p-6 border-b transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
               } ${isCollapsed ? 'px-4' : ''}`}>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                           <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                     </div>
                     {!isCollapsed && (
                        <div>
                           <h2 className={`text-lg font-bold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>PMNS</h2>
                           <p className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                           }`}>Management System</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Navigation Menu */}
               <nav className={`flex-1 p-4 space-y-6 ${isCollapsed ? 'px-2' : ''}`}>

                  {/* Program Application Section - Only for Proponents */}
                  {userRole === 'proponent' && (
                  <div>
                     {!isCollapsed && (
                        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                           Applications
                        </h3>
                     )}
                     <div className="space-y-2">
                        <div className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                           currentPath === programApplication.path
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : isDarkMode 
                                 ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                 : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}>
                           <button
                              onClick={() => onNavigate && onNavigate(programApplication.path)}
                              className={`flex items-start gap-3 group ${isCollapsed ? 'justify-center' : ''} w-full text-left`}
                              title={isCollapsed ? programApplication.label : ''}
                           >
                              <div className={`p-2 rounded-lg ${currentPath === programApplication.path ? 'bg-white' : isDarkMode ? 'bg-gray-600 group-hover:bg-gray-500' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                 <span className={`${
                                    currentPath === programApplication.path 
                                       ? 'text-indigo-600' 
                                       : isDarkMode 
                                          ? 'text-gray-400 group-hover:text-gray-300' 
                                          : 'text-gray-500 group-hover:text-gray-700'
                                 }`}>
                                    {programApplication.icon}
                                 </span>
                              </div>
                              {!isCollapsed && (
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                       <h4 className="font-semibold text-sm">{programApplication.label}</h4>
                                    </div>
                                    <p className={`text-xs leading-relaxed line-clamp-2 transition-colors duration-300 ${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                       {programApplication.description}
                                    </p>
                                 </div>
                              )}
                           </button>
                        </div>
                     </div>
                  </div>
                  )}


                  {/* Quick Stats Section for DOST MIMAROPA */}
                  {(userRole === 'dost_mimaropa' || userRole === 'super_admin') && (
                     <div>
                     {!isCollapsed && (
                        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                           Quick Stats
                        </h3>
                     )}
                        <div className="space-y-2">
                           <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-blue-700">Total Applications</span>
                                 </div>
                                 <span className="text-sm font-bold text-blue-800">{stats.totalApplications}</span>
                              </div>
                           </div>
                           <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-yellow-700">Pending Review</span>
                                 </div>
                                 <span className="text-sm font-bold text-yellow-800">{stats.pendingApplications}</span>
                              </div>
                           </div>
                           <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-green-700">Approved</span>
                                 </div>
                                 <span className="text-sm font-bold text-green-800">{stats.approvedApplications}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}


                  {/* Management Section */}
                  <div>
                     {!isCollapsed && (
                        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${
                           isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                           {userRole === 'proponent' ? 'My Account' : 'Management'}
                        </h3>
                     )}
                     <ul className="space-y-1">
                        {managementSections
                           .filter(section => {
                              // Filter sections based on user role
                              if (userRole === 'proponent') {
                                 // For proponents, only show relevant sections
                                 const allowedSections = ['dashboard', 'monitoring', 'notifications', 'reports', 'settings'];
                                 return allowedSections.includes(section.id);
                              }
                              // For other roles (PSTO, DOST MIMAROPA, Super Admin), show all sections
                              return true;
                           })
                           .map((section) => {
                           const isActive = currentPath === section.path;
                           return (
                              <li key={section.id}>
                                 <button
                                    onClick={() => onNavigate && onNavigate(section.path)}
                                    className={`
                                       flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left
                                       ${
                                          isActive 
                                             ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                             : isDarkMode 
                                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                       }
                                       ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? section.label : ''}
                                 >
                                    <span className={`${
                                       isActive 
                                          ? 'text-blue-600' 
                                          : isDarkMode 
                                             ? 'text-gray-400' 
                                             : 'text-gray-500'
                                    }`}>
                                       {section.icon}
                                    </span>
                                    {!isCollapsed && section.label}
                                 </button>
                              </li>
                           );
                        })}
                     </ul>
                  </div>

               </nav>

            </div>
         </aside>
      </>
   );
};

export default Sidebar;
