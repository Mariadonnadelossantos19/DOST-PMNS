import React, { useState } from 'react';
import { LandingPage } from './Component';
import { MainLayout, NotificationProvider } from './Component';
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
import './App.css';

// Application configuration
const APP_CONFIG = {
   name: 'DOST-PMNS',
   version: '2.0',
   description: 'Project Management & Notification System'
};

// Main App Content Component
const AppContent = ({ onLogout, currentPage, onNavigate }) => {
   // Get current user from localStorage
   const userData = localStorage.getItem('userData');
   let currentUser = null;
   
   if (userData) {
      try {
         const parsedData = JSON.parse(userData);
         // Handle both old format (with user nested) and new format (direct user)
         currentUser = parsedData.user || parsedData;
      } catch (error) {
         console.error('Error parsing user data:', error);
         currentUser = null;
      }
   }
   
   // Debug: Log the current user data
   console.log('App.jsx - Current user from localStorage:', currentUser);

   // Navigation handlers
   const handleNavigate = (path) => {
      console.log('Navigating to:', path);
      onNavigate(path);
   };

   const handleNavigateToProfile = () => {
      console.log('Navigate to profile');
   };

   const proponentNavigateToProfile = () => {
      console.log('Proponent navigate to profile');
   };

   // Render PSTO Dashboard
   const renderPSTODashboard = () => {
      return <UnifiedPSTODashboard currentUser={currentUser} />;
   };

   // Render different dashboards based on user role
   const renderDashboard = () => {
      if (currentUser.role === 'dost_mimaropa' || currentUser.role === 'super_admin') {
         const dostCurrentPath = `/${currentPage}`;
         console.log('App.jsx - Passing currentPath to DostMimaropaDashboard:', dostCurrentPath);
         return <DostMimaropaDashboard currentPath={dostCurrentPath} />;
      } else if (currentUser.role === 'proponent') {
         const proponentCurrentPath = `/${currentPage}`;
         console.log('App.jsx - Passing currentPath to ProponentMainPage:', proponentCurrentPath);
         return <ProponentMainPage 
            onNavigateToProfile={handleNavigateToProfile} 
            currentUser={currentUser}
            currentPath={proponentCurrentPath}
         />;
      } else if (currentUser.role === 'psto') {
         return renderPSTODashboard();
      } else {
         return (
            <div className="p-6 text-center">
               <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {APP_CONFIG.name}</h1>
               <p className="text-gray-600 mb-4">{APP_CONFIG.description}</p>
               <p className="text-gray-500">Please contact your administrator for access.</p>
            </div>
         );
      }
   };

   // Render Applications page
   const renderApplicationsPage = () => {
      if (currentUser.role === 'psto') {
         return <UnifiedPSTODashboard currentUser={currentUser} />;
      }
      
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

   // Render Management page
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
            onLogout={onLogout}
            onNavigate={handleNavigate}
            currentPath={currentPage}
         >
            <UnifiedPSTODashboard currentUser={currentUser} currentPage={currentPage} />
         </UnifiedLayout>
      );
   }

   const currentPathForLayout = `/${currentPage}`;
   console.log('App.jsx - Passing currentPath to MainLayout:', currentPathForLayout);
   
   return (
      <MainLayout 
         user={currentUser} 
         onLogout={onLogout}
         onNavigateToProfile={proponentNavigateToProfile}
         onNavigate={handleNavigate}
         currentPath={currentPathForLayout}
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
      console.log('App.jsx - Navigating to:', path);
      const cleanedPath = path.replace('/', '');
      console.log('App.jsx - Cleaned path:', cleanedPath);
      setCurrentPage(cleanedPath);
   };

   // Debug current page
   console.log('Current page:', currentPage);

   const handleLoginSuccess = (loginData) => {
      // Save login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      // Store only the user object, not the entire login response
      localStorage.setItem('userData', JSON.stringify(loginData.user));
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