import React, { useState } from 'react';
import { Register } from './Component';
import { MainLayout, ProjectDashboard, LandingPage, NotificationProvider, useNotifications } from './Component';
import UnifiedLayout from './Component/Layouts/UnifiedLayout';
import UnifiedPSTODashboard from './Pages/PSTO/UnifiedPSTODashboard';
import { ToastProvider } from './Component/UI';
import { FloatingMiniGamesButton } from './Component/Interactive';
import { DarkModeProvider } from './Component/Context';
import DostMimaropaDashboard from './Pages/DOST_MIMAROPA/DostMimaropaDashboard';
import { ProponentMainPage } from './Pages/Proponents/pages';
import { ProgramSelectionPage } from './Pages/ProgramSelection';
import { ApplicationMonitorPage } from './Pages/ApplicationMonitor';
import NotificationsPage from './Pages/NotificationsPage';
import ResetPassword from './Component/Registration/ResetPassword';
import PSTODashboard from './Pages/PSTO/PSTODashboard';
import './App.css';

// Sample data for demonstration
const sampleProjects = [
   {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      status: 'active',
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      teamSize: 5,
      completedTasks: 12,
      totalTasks: 25,
      createdAt: '2024-01-10',
      teamMembers: [
         { name: 'John Doe' },
         { name: 'Jane Smith' },
         { name: 'Mike Johnson' },
         { name: 'Sarah Wilson' }
      ]
   },
   {
      id: 2,
      name: 'Mobile App Development',
      description: 'Development of a new mobile application for iOS and Android',
      status: 'in progress',
      priority: 'medium',
      startDate: '2024-02-01',
      endDate: '2024-06-01',
      teamSize: 8,
      completedTasks: 8,
      totalTasks: 40,
      createdAt: '2024-01-25',
      teamMembers: [
         { name: 'Alex Brown' },
         { name: 'Emma Davis' },
         { name: 'Chris Lee' }
      ]
   },
   {
      id: 3,
      name: 'Database Migration',
      description: 'Migration of legacy database to new cloud infrastructure',
      status: 'completed',
      priority: 'high',
      startDate: '2023-12-01',
      endDate: '2024-01-31',
      teamSize: 3,
      completedTasks: 15,
      totalTasks: 15,
      createdAt: '2023-11-20',
      teamMembers: [
         { name: 'David Miller' },
         { name: 'Lisa Garcia' }
      ]
   }
];

const sampleTasks = [
   {
      id: 1,
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'completed',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-01-20',
      projectId: 1,
      projectName: 'Website Redesign'
   },
   {
      id: 2,
      title: 'Implement User Authentication',
      description: 'Set up secure user login and registration system',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Jane Smith',
      dueDate: '2024-02-15',
      projectId: 2,
      projectName: 'Mobile App Development'
   },
   {
      id: 3,
      title: 'Database Schema Design',
      description: 'Design the new database schema for the application',
      status: 'todo',
      priority: 'medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-28',
      projectId: 1,
      projectName: 'Website Redesign'
   },
   {
      id: 4,
      title: 'API Integration',
      description: 'Integrate third-party APIs for payment processing',
      status: 'todo',
      priority: 'medium',
      assignee: 'Alex Brown',
      dueDate: '2024-03-10',
      projectId: 2,
      projectName: 'Mobile App Development'
   },
   {
      id: 5,
      title: 'Performance Optimization',
      description: 'Optimize database queries and application performance',
      status: 'completed',
      priority: 'low',
      assignee: 'David Miller',
      dueDate: '2024-01-25',
      projectId: 3,
      projectName: 'Database Migration'
   }
];

const sampleUser = {
   name: 'John Doe',
   role: 'proponent',
   userId: '68ceb300289e363622ed1d64', // Use the user ID that has notifications in database
   _id: '68ceb300289e363622ed1d64', // Also add _id for compatibility
   id: '68ceb300289e363622ed1d64', // Also add id for compatibility
   firstName: 'John',
   lastName: 'Doe',
   email: 'john.doe@example.com',
   province: 'Marinduque',
   avatar: null
};

function AppContent({ onLogout, currentPage, onNavigate }) {
   const { showSuccess, showInfo } = useNotifications();

   // Helper function to extract province from PSTO userId
   const extractProvinceFromUserId = (userId) => {
      if (userId && userId.startsWith('PSTO_')) {
         const province = userId.replace('PSTO_', '');
         // Convert to proper case for matching
         switch (province) {
            case 'Marinduque':
               return 'Marinduque';
            case 'OccidentalMindoro':
               return 'Occidental Mindoro';
            case 'OrientalMindoro':
               return 'Oriental Mindoro';
            case 'Romblon':
               return 'Romblon';
            case 'Palawan':
               return 'Palawan';
            default:
               return province;
         }
      }
      return undefined;
   };

   // Get user data from localStorage or use sample user as fallback
   const getUserData = () => {
      try {
         const storedUserData = localStorage.getItem('userData');
         console.log('Stored user data from localStorage:', storedUserData);
         
         if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            console.log('Parsed user data:', parsedData);
            
            // Extract user data from the response object
            const userData = parsedData.user || parsedData;
            console.log('Extracted user data:', userData);
            
            // Transform user data to match expected format
            const transformedUser = {
               name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
               role: userData.role || 'user',
               userId: userData.userId || userData.id || userData._id || 'No ID',
               _id: userData._id || userData.userId || userData.id || 'No ID',
               id: userData.id || userData.userId || userData._id || 'No ID',
               firstName: userData.firstName,
               lastName: userData.lastName,
               email: userData.email,
               province: userData.province || (userData.role === 'psto' ? extractProvinceFromUserId(userData.userId) : undefined),
               department: userData.department,
               position: userData.position,
               avatar: userData.avatar
            };
            console.log('Transformed user data:', transformedUser);
            return transformedUser;
         }
      } catch (error) {
         console.error('Error parsing user data from localStorage:', error);
      }
      
      // Return null if no data found (fallback handled by caller)
      console.log('No user data found in localStorage');
      return null;
   };

   // Clear localStorage to force using sample user with correct ID
   const clearUserData = () => {
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      console.log('Cleared localStorage data');
   };

   // Set up sample user data and mock auth token
   const setupSampleUser = () => {
      // Clear any existing data
      clearUserData();
      
      // Set up sample user data
      const sampleUserData = {
         user: sampleUser,
         token: 'mock-token-for-testing',
         success: true
      };
      
      localStorage.setItem('userData', JSON.stringify(sampleUserData));
      localStorage.setItem('authToken', 'mock-token-for-testing');
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('Set up sample user with mock auth token');
   };

   // Check if there's real user data in localStorage first
   const hasRealUserData = localStorage.getItem('userData') && localStorage.getItem('isLoggedIn') === 'true';
   
   let currentUser;
   if (hasRealUserData) {
      console.log('Using real user data from localStorage');
      currentUser = getUserData();
   } else {
      console.log('No real user data found, setting up sample user');
      setupSampleUser();
      currentUser = getUserData();
   }
   
   // Debug: Log the current user data
   console.log('Current user data:', currentUser);

   const handleLogout = () => {
      showInfo('Logging out...');
      onLogout();
   };

   // Navigation handler with user role logic
   const handleNavigate = (path) => {
      console.log('Navigating to:', path);
      // For DOST MIMAROPA users, keep the full path with leading slash
      if (currentUser.role === 'dost_mimaropa' || currentUser.role === 'super_admin') {
         onNavigate(path);
      } else {
         onNavigate(path.replace('/', ''));
      }
   };

   const handleProjectUpdate = (projectId, updates) => {
      showSuccess(`Project updated successfully!`);
      console.log('Project update:', projectId, updates);
   };

   const handleTaskUpdate = (taskId, updates) => {
      showSuccess(`Task updated successfully!`);
      console.log('Task update:', taskId, updates);
   };

   const handleTaskCreate = (task) => {
      showSuccess(`New task created: ${task.title}`);
      console.log('Task created:', task);
   };

   const handleTaskDelete = (taskId) => {
      showSuccess('Task deleted successfully!');
      console.log('Task deleted:', taskId);
   };

   // Navigation function for proponent profile
   const [proponentNavigateToProfile, setProponentNavigateToProfile] = useState(null);

   // Create a stable navigation function
   const handleNavigateToProfile = (callback) => {
      if (callback) {
         setProponentNavigateToProfile(() => callback);
      }
   };

   // Render PSTO dashboard
   const renderPSTODashboard = () => {
      return <UnifiedPSTODashboard currentUser={currentUser} />;
   };

   // Render different dashboards based on user role
   const renderDashboard = () => {
      if (currentUser.role === 'dost_mimaropa' || currentUser.role === 'super_admin') {
         return <DostMimaropaDashboard currentPath={currentPage} />;
      } else if (currentUser.role === 'proponent') {
         return <ProponentMainPage onNavigateToProfile={handleNavigateToProfile} />;
      } else if (currentUser.role === 'psto') {
         return renderPSTODashboard();
      } else {
         return (
            <ProjectDashboard
               projects={sampleProjects}
               tasks={sampleTasks}
               currentUser={currentUser}
               onProjectUpdate={handleProjectUpdate}
               onTaskUpdate={handleTaskUpdate}
               onTaskCreate={handleTaskCreate}
               onTaskDelete={handleTaskDelete}
            />
         );
      }
   };

   // Render Applications page - now uses unified PSTO dashboard
   const renderApplicationsPage = () => {
      // For PSTO users, redirect to their dashboard which includes applications
      if (currentUser.role === 'psto') {
         return <UnifiedPSTODashboard currentUser={currentUser} />;
      }
      
      // For other users, show a generic applications page
      return (
         <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Applications</h1>
            <p className="text-gray-600 mb-4">
               Applications page for {currentUser.province || 'Unknown'} province
            </p>
            <p className="text-gray-500">Applications functionality will be available soon.</p>
         </div>
      );
   };

   // Render Management page - comprehensive PSTO management
   const renderManagementPage = () => {
      if (currentUser.role === 'psto') {
         return <UnifiedPSTODashboard currentUser={currentUser} />;
      }
      
      return (
         <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Management</h1>
            <p className="text-gray-600 mb-4">
               Management functionality for {currentUser.role} users
            </p>
            <p className="text-gray-500">Management features will be available soon.</p>
         </div>
      );
   };

   // Render Notifications page
   const renderNotificationsPage = () => {
      return <NotificationsPage currentUser={currentUser} />;
   };

   // Render content based on current page
   const renderContent = () => {
      console.log('AppContent - renderContent called with currentPage:', currentPage);
      switch (currentPage) {
         case 'program-selection':
            console.log('Rendering ProgramSelectionPage');
            return <ProgramSelectionPage />;
         case 'monitoring':
            console.log('Rendering ApplicationMonitorPage');
            return <ApplicationMonitorPage />;
         case 'applications':
            console.log('Rendering ApplicationsPage');
            return renderApplicationsPage();
         case 'management':
            console.log('Rendering ManagementPage');
            return renderManagementPage();
         case 'notifications':
            console.log('Rendering NotificationsPage');
            return renderNotificationsPage();
         case 'dashboard':
         default:
            console.log('Rendering Dashboard');
            return renderDashboard();
      }
   };

   // Use UnifiedLayout for PSTO users, MainLayout for others
   if (currentUser.role === 'psto') {
      return (
         <UnifiedLayout
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            currentPath={currentPage}
         >
            <UnifiedPSTODashboard currentUser={currentUser} currentPage={currentPage} />
         </UnifiedLayout>
      );
   }

   return (
      <MainLayout 
         user={currentUser} 
         onLogout={handleLogout}
         onNavigateToProfile={proponentNavigateToProfile}
         onNavigate={onNavigate}
      >
         {renderContent()}
      </MainLayout>
   );
}

function App() {
   const [showDashboard, setShowDashboard] = useState(() => {
      // Check if user is logged in from localStorage
      return localStorage.getItem('isLoggedIn') === 'true';
   });

   const [currentPage, setCurrentPage] = useState(() => {
      // Check URL for reset password token
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
         return 'reset-password';
      }
      return 'landing';
   });

   // Navigation handler
   const handleNavigate = (path) => {
      console.log('Navigating to:', path);
      setCurrentPage(path.replace('/', ''));
   };

   // Debug current page
   console.log('Current page:', currentPage);

   const handleLoginSuccess = (userData) => {
      // Save login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      setShowDashboard(true);
      setCurrentPage('dashboard');
   };

   const handleLogout = () => {
      // Clear login state from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      setShowDashboard(false);
      setCurrentPage('landing');
   };

   const handleNavigateToLogin = () => {
      setCurrentPage('landing');
   };

   // Handle reset password page
   if (currentPage === 'reset-password') {
      return (
         <DarkModeProvider>
            <ToastProvider>
               <ResetPassword onNavigateToLogin={handleNavigateToLogin} />
            </ToastProvider>
         </DarkModeProvider>
      );
   }

   if (showDashboard) {
      return (
         <DarkModeProvider>
            <NotificationProvider>
               <ToastProvider>
                  <AppContent onLogout={handleLogout} currentPage={currentPage} onNavigate={handleNavigate} />
                  <FloatingMiniGamesButton />
               </ToastProvider>
            </NotificationProvider>
         </DarkModeProvider>
      );
   }

   return (
      <DarkModeProvider>
         <ToastProvider>
            <LandingPage onLoginSuccess={handleLoginSuccess} />
            <FloatingMiniGamesButton />
         </ToastProvider>
      </DarkModeProvider>
   );
}

export default App;
