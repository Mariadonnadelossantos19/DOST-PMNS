import React, { useState } from 'react';
import { Card, Button, Badge } from '../UI';
import ProjectCard from './ProjectCard';
import TaskList from './TaskList';
import { UserManagement } from '../UserManagement';
import SuperAdminDashboard from '../../Pages/superAdmin/pages/SuperAdminDashboard';
import PSTODashboard from '../../Pages/PSTO/PSTODashboard';

const ProjectDashboard = ({ projects = [], tasks = [], currentUser }) => {
   const [selectedProject, setSelectedProject] = useState(null);
   const [view, setView] = useState('overview'); // 'overview', 'projects', 'tasks', 'users'

   // Render PSTO dashboard for PSTO users
   const renderProvinceDashboard = () => {
      console.log('renderProvinceDashboard called with:', currentUser);
      
      if (currentUser?.role === 'psto') {
         console.log('PSTO user detected, rendering PSTO dashboard');
         return <PSTODashboard currentUser={currentUser} />;
      }
      
      console.log('Not a PSTO user');
      return <div className="text-center p-8">
         <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Not Available</h2>
         <p className="text-gray-600">This dashboard is only available for PSTO users.</p>
      </div>;
   };

   // If user is super_admin, show super admin dashboard
   if (currentUser?.role === 'super_admin') {
      return <SuperAdminDashboard 
         projects={projects} 
         tasks={tasks} 
         currentUser={currentUser} 
      />;
   }

   // If user is PSTO, show province-specific dashboard
   if (currentUser?.role === 'psto') {
      console.log('PSTO user detected:', currentUser);
      console.log('User province:', currentUser?.province);
      return renderProvinceDashboard();
   }

   // Calculate dashboard statistics
   const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => {
         if (!t.dueDate) return false;
         return new Date(t.dueDate) < new Date() && t.status !== 'completed';
      }).length
   };

   const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

   const upcomingDeadlines = tasks
      .filter(t => t.dueDate && t.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

   const StatCard = ({ title, value, icon, color = 'blue', trend }) => (
      <Card className="p-6">
         <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-${color}-100`}>
               <span className={`text-${color}-600`}>
                  {icon}
               </span>
            </div>
            <div className="ml-4">
               <p className="text-sm font-medium text-gray-600">{title}</p>
               <p className="text-2xl font-semibold text-gray-900">{value}</p>
               {trend && (
                  <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {trend > 0 ? '+' : ''}{trend}% from last month
                  </p>
               )}
            </div>
         </div>
      </Card>
   );

   const renderOverview = () => (
      <div className="space-y-6">
         {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
               title="Total Projects"
               value={stats.totalProjects}
               icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
               }
               color="blue"
            />
            <StatCard
               title="Active Projects"
               value={stats.activeProjects}
               icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               }
               color="green"
            />
            <StatCard
               title="Completed Tasks"
               value={`${stats.completedTasks}/${stats.totalTasks}`}
               icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               }
               color="purple"
            />
            <StatCard
               title="Overdue Tasks"
               value={stats.overdueTasks}
               icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
               }
               color="red"
            />
         </div>

         {/* Recent Projects */}
         <Card>
            <Card.Header>
               <div className="flex justify-between items-center">
                  <Card.Title>Recent Projects</Card.Title>
                  <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => setView('projects')}
                  >
                     View All
                  </Button>
               </div>
            </Card.Header>
            <Card.Content>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentProjects.map((project) => (
                     <div 
                        key={project.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                           setSelectedProject(project);
                           setView('tasks');
                        }}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-medium text-gray-900">{project.name}</h4>
                           <Badge variant="primary" size="sm">{project.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                           {project.description}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                           <span>{project.teamSize || 0} members</span>
                           <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks</span>
                        </div>
                     </div>
                  ))}
               </div>
            </Card.Content>
         </Card>

         {/* Upcoming Deadlines */}
         <Card>
            <Card.Header>
               <Card.Title>Upcoming Deadlines</Card.Title>
            </Card.Header>
            <Card.Content>
               <div className="space-y-3">
                  {upcomingDeadlines.length > 0 ? (
                     upcomingDeadlines.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div>
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              <p className="text-sm text-gray-600">{task.projectName || 'No project'}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                 {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                              <Badge variant="warning" size="sm">{task.priority}</Badge>
                           </div>
                        </div>
                     ))
                  ) : (
                     <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                  )}
               </div>
            </Card.Content>
         </Card>
      </div>
   );

   const renderProjects = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            <Button>
               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
               New Project
            </Button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
               <ProjectCard
                  key={project.id}
                  project={project}
                  onView={(project) => {
                     setSelectedProject(project);
                     setView('tasks');
                  }}
                  onEdit={(project) => console.log('Edit project:', project)}
                  onDelete={(project) => console.log('Delete project:', project)}
               />
            ))}
         </div>
      </div>
   );

   const renderTasks = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProject ? `${selectedProject.name} - Tasks` : 'All Tasks'}
               </h2>
               {selectedProject && (
                  <p className="text-gray-600 mt-1">{selectedProject.description}</p>
               )}
            </div>
            <div className="flex gap-2">
               {selectedProject && (
                  <Button 
                     variant="outline"
                     onClick={() => setSelectedProject(null)}
                  >
                     View All Tasks
                  </Button>
               )}
               <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
               </Button>
            </div>
         </div>
         
         <TaskList
            tasks={selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : tasks}
            projectId={selectedProject?.id}
            onTaskUpdate={(taskId, updates) => console.log('Update task:', taskId, updates)}
            onTaskDelete={(taskId) => console.log('Delete task:', taskId)}
            onTaskCreate={(task) => console.log('Create task:', task)}
         />
      </div>
   );

   const renderUsers = () => (
      <UserManagement currentUser={currentUser} />
   );

   return (
      <div className="space-y-6">
         {/* Navigation Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'tasks', label: 'Tasks' },
                  ...(currentUser && currentUser.role === 'super_admin' ? [{ key: 'users', label: 'User Management' }] : [])
               ].map((tab) => (
                  <button
                     key={tab.key}
                     onClick={() => setView(tab.key)}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        view === tab.key
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </nav>
         </div>

         {/* Content */}
         {view === 'overview' && renderOverview()}
         {view === 'projects' && renderProjects()}
         {view === 'tasks' && renderTasks()}
         {view === 'users' && renderUsers()}
      </div>
   );
};

export default ProjectDashboard;
