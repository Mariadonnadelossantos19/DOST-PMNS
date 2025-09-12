import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { EnrollmentSystem } from '../../../../Component/EnrollmentSystem';
import { InteractiveDashboard } from '../../../../Component/Interactive';

const OrientalMindoroDashboard = ({ currentUser }) => {
   const [view, setView] = useState('overview');

   // Oriental Mindoro-specific data
   const orientalMindoroProjects = [
      {
         id: 1,
         title: 'Oriental Mindoro SETUP Program',
         description: 'Small Enterprise Technology Upgrading Program for Oriental Mindoro',
         status: 'active',
         progress: 85,
         startDate: '2024-01-10',
         endDate: '2024-12-31',
         province: 'Oriental Mindoro',
         beneficiaries: 32
      },
      {
         id: 2,
         title: 'Oriental Mindoro GIA Research',
         description: 'Grants-in-Aid research projects in Oriental Mindoro',
         status: 'in progress',
         progress: 55,
         startDate: '2024-03-15',
         endDate: '2024-11-30',
         province: 'Oriental Mindoro',
         beneficiaries: 15
      }
   ];

   const orientalMindoroTasks = [
      {
         id: 1,
         title: 'Site visit to Calapan, Oriental Mindoro',
         description: 'Conduct technology assessment for local MSMEs',
         status: 'completed',
         priority: 'high',
         dueDate: '2024-02-10',
         province: 'Oriental Mindoro'
      },
      {
         id: 2,
         title: 'SETUP application review',
         description: 'Review applications from Oriental Mindoro entrepreneurs',
         status: 'in progress',
         priority: 'medium',
         dueDate: '2024-02-18',
         province: 'Oriental Mindoro'
      }
   ];

   // Calculate Oriental Mindoro-specific statistics
   const stats = {
      totalProjects: orientalMindoroProjects.length,
      activeProjects: orientalMindoroProjects.filter(p => p.status === 'active' || p.status === 'in progress').length,
      completedProjects: orientalMindoroProjects.filter(p => p.status === 'completed').length,
      totalTasks: orientalMindoroTasks.length,
      completedTasks: orientalMindoroTasks.filter(t => t.status === 'completed').length,
      totalBeneficiaries: orientalMindoroProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0)
   };

   // Interactive user stats for Oriental Mindoro PSTO
   const userStats = {
      totalEnrollments: stats.totalProjects + stats.totalTasks,
      approvedApplications: stats.completedProjects,
      avgProcessingTime: 17,
      todayProcessed: stats.activeProjects,
      accuracyRate: 88,
      communitiesHelped: stats.totalBeneficiaries,
      timeSaved: stats.completedTasks * 2.2,
      completedTna: stats.completedProjects,
      perfectStreak: stats.completedProjects,
      helpfulActions: stats.totalTasks,
      dailyProcessed: stats.activeProjects
   };

   const renderOverview = () => (
      <div className="space-y-6">
         {/* Oriental Mindoro-specific stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">OM</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Total Projects</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">✓</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Active Projects</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.activeProjects}</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">📋</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">👥</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Beneficiaries</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.totalBeneficiaries}</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Oriental Mindoro-specific content */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Oriental Mindoro Projects</h3>
               <div className="space-y-3">
                  {orientalMindoroProjects.map(project => (
                     <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-medium text-gray-900">{project.title}</p>
                           <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                        <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                           {project.status}
                        </Badge>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
               <div className="space-y-3">
                  {orientalMindoroTasks.map(task => (
                     <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-medium text-gray-900">{task.title}</p>
                           <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'success' : 'warning'}>
                           {task.status}
                        </Badge>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
   );

   const renderProjects = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Oriental Mindoro Projects</h2>
            <Button>Add Project</Button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orientalMindoroProjects.map(project => (
               <Card key={project.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                     <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                        {project.status}
                     </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                           className="bg-green-600 h-2 rounded-full" 
                           style={{ width: `${project.progress}%` }}
                        ></div>
                     </div>
                     <div className="flex justify-between text-sm text-gray-500">
                        <span>Beneficiaries: {project.beneficiaries}</span>
                        <span>Due: {project.endDate}</span>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );

   const renderTasks = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Oriental Mindoro Tasks</h2>
            <Button>Add Task</Button>
         </div>
         
         <div className="space-y-4">
            {orientalMindoroTasks.map(task => (
               <Card key={task.id} className="p-6">
                  <div className="flex justify-between items-start">
                     <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                           <Badge variant={task.priority === 'high' ? 'danger' : 'warning'}>
                              {task.priority}
                           </Badge>
                           <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                        </div>
                     </div>
                     <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="danger" size="sm">Delete</Button>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold">PSTO Oriental Mindoro Dashboard</h1>
            <p className="text-green-100 mt-2">
               Welcome, {currentUser?.name || 'User'}! Manage Oriental Mindoro-specific programs and services.
            </p>
         </div>

         {/* Navigation Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'interactive', label: 'Interactive' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'enrollment', label: 'Enrollment' }
               ].map((tab) => (
                  <button
                     key={tab.key}
                     onClick={() => setView(tab.key)}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        view === tab.key
                           ? 'border-green-500 text-green-600'
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
         {view === 'interactive' && <InteractiveDashboard userStats={userStats} />}
         {view === 'projects' && renderProjects()}
         {view === 'tasks' && renderTasks()}
         {view === 'enrollment' && <EnrollmentSystem province="Oriental Mindoro" />}
      </div>
   );
};

export default OrientalMindoroDashboard;
