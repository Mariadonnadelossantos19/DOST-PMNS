import React, { useState } from 'react';
import { Register } from './Component';
import { MainLayout, ProjectDashboard, LandingPage, NotificationProvider, useNotifications } from './Component';
import { ToastProvider } from './Component/UI';
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
   name: 'John Administrator',
   role: 'super_admin',
   avatar: null
};

function AppContent({ onLogout }) {
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
               userId: userData.userId || userData.id || 'No ID',
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
      
      // Fallback to sample user if no data found
      console.log('No user data found, using sample user');
      return sampleUser;
   };

   const currentUser = getUserData();
   
   // Debug: Log the current user data
   console.log('Current user data:', currentUser);

   const handleLogout = () => {
      showInfo('Logging out...');
      onLogout();
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

   return (
      <MainLayout user={currentUser} onLogout={handleLogout}>
         <ProjectDashboard
            projects={sampleProjects}
            tasks={sampleTasks}
            currentUser={currentUser}
            onProjectUpdate={handleProjectUpdate}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
         />
      </MainLayout>
   );
}

function App() {
   const [showDashboard, setShowDashboard] = useState(() => {
      // Check if user is logged in from localStorage
      return localStorage.getItem('isLoggedIn') === 'true';
   });

   const handleLoginSuccess = (userData) => {
      // Save login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      setShowDashboard(true);
   };

   const handleLogout = () => {
      // Clear login state from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      setShowDashboard(false);
   };

   if (showDashboard) {
      return (
         <NotificationProvider>
            <ToastProvider>
               <AppContent onLogout={handleLogout} />
            </ToastProvider>
         </NotificationProvider>
      );
   }

   return (
      <ToastProvider>
         <LandingPage onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
   );
}

export default App;
