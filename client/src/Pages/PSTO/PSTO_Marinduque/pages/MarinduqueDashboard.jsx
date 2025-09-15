import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { InteractiveDashboard } from '../../../../Component/Interactive';

const MarinduqueDashboard = ({ currentUser }) => {
   const [view, setView] = useState('overview');
   const [proponents, setProponents] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Fetch proponents for this PSTO
   const fetchProponents = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const response = await fetch(`http://localhost:4000/api/users/psto/Marinduque/proponents`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });
         
         if (response.ok) {
            const data = await response.json();
            setProponents(data.data || []);
         } else {
            setError('Failed to load proponents');
         }
      } catch (err) {
         setError('Error loading proponents');
         console.error('Fetch proponents error:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProponents();
   }, []);

   // Marinduque-specific data
   const marinduqueProjects = [
      {
         id: 1,
         title: 'Marinduque SETUP Program',
         description: 'Small Enterprise Technology Upgrading Program for Marinduque',
         status: 'active',
         progress: 75,
         startDate: '2024-01-15',
         endDate: '2024-12-31',
         province: 'Marinduque',
         beneficiaries: 25
      },
      {
         id: 2,
         title: 'Marinduque GIA Research',
         description: 'Grants-in-Aid research projects in Marinduque',
         status: 'in progress',
         progress: 45,
         startDate: '2024-03-01',
         endDate: '2024-11-30',
         province: 'Marinduque',
         beneficiaries: 12
      }
   ];

   const marinduqueTasks = [
      {
         id: 1,
         title: 'Site visit to Boac, Marinduque',
         description: 'Conduct technology assessment for local MSMEs',
         status: 'pending',
         priority: 'high',
         dueDate: '2024-02-15',
         province: 'Marinduque'
      },
      {
         id: 2,
         title: 'SETUP application review',
         description: 'Review applications from Marinduque entrepreneurs',
         status: 'in progress',
         priority: 'medium',
         dueDate: '2024-02-20',
         province: 'Marinduque'
      }
   ];

   // Calculate Marinduque-specific statistics
   const stats = {
      totalProjects: marinduqueProjects.length,
      activeProjects: marinduqueProjects.filter(p => p.status === 'active' || p.status === 'in progress').length,
      completedProjects: marinduqueProjects.filter(p => p.status === 'completed').length,
      totalTasks: marinduqueTasks.length,
      completedTasks: marinduqueTasks.filter(t => t.status === 'completed').length,
      totalBeneficiaries: marinduqueProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0),
      totalProponents: proponents.length,
      activeProponents: proponents.filter(p => p.status === 'active').length
   };

   // Interactive user stats for Marinduque PSTO
   const userStats = {
      totalEnrollments: stats.totalProjects + stats.totalTasks,
      approvedApplications: stats.completedProjects,
      avgProcessingTime: 18,
      todayProcessed: stats.activeProjects,
      accuracyRate: 92,
      communitiesHelped: stats.totalBeneficiaries,
      timeSaved: stats.completedTasks * 3,
      completedTna: stats.completedProjects,
      perfectStreak: stats.completedProjects,
      helpfulActions: stats.totalTasks,
      dailyProcessed: stats.activeProjects
   };

   const renderOverview = () => (
      <div className="space-y-6">
         {/* Marinduque-specific stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
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
                     <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
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

            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">🏢</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Proponents</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.totalProponents}</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Marinduque-specific content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Marinduque Projects</h3>
               <div className="space-y-3">
                  {marinduqueProjects.map(project => (
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
                  {marinduqueTasks.map(task => (
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

            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Proponents</h3>
               {loading ? (
                  <div className="text-center py-4">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                     <p className="text-sm text-gray-500 mt-2">Loading proponents...</p>
                  </div>
               ) : error ? (
                  <div className="text-center py-4">
                     <p className="text-sm text-red-500">{error}</p>
                     <Button onClick={fetchProponents} className="mt-2 text-xs">
                        Retry
                     </Button>
                  </div>
               ) : proponents.length === 0 ? (
                  <div className="text-center py-4">
                     <p className="text-sm text-gray-500">No proponents yet</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {proponents.slice(0, 3).map(proponent => (
                        <div key={proponent._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div>
                              <p className="font-medium text-gray-900">
                                 {proponent.firstName} {proponent.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{proponent.email}</p>
                              {proponent.proponentInfo?.businessName && (
                                 <p className="text-xs text-gray-400">{proponent.proponentInfo.businessName}</p>
                              )}
                           </div>
                           <Badge variant={proponent.status === 'active' ? 'success' : 'warning'}>
                              {proponent.status}
                           </Badge>
                        </div>
                     ))}
                     {proponents.length > 3 && (
                        <Button 
                           onClick={() => setView('proponents')}
                           className="w-full text-xs"
                        >
                           View All ({proponents.length})
                        </Button>
                     )}
                  </div>
               )}
            </Card>
         </div>
      </div>
   );

   const renderProjects = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Marinduque Projects</h2>
            <Button>Add Project</Button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marinduqueProjects.map(project => (
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
                           className="bg-blue-600 h-2 rounded-full" 
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
            <h2 className="text-2xl font-bold text-gray-900">Marinduque Tasks</h2>
            <Button>Add Task</Button>
         </div>
         
         <div className="space-y-4">
            {marinduqueTasks.map(task => (
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
         <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold">PSTO Marinduque Dashboard</h1>
            <p className="text-blue-100 mt-2">
               Welcome, {currentUser?.name || 'User'}! Manage Marinduque-specific programs and services.
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
         {view === 'interactive' && <InteractiveDashboard userStats={userStats} />}
         {view === 'projects' && renderProjects()}
         {view === 'tasks' && renderTasks()}
         {view === 'enrollment' && (
            <div className="p-6 text-center">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollment System</h3>
               <p className="text-gray-600">Enrollment functionality will be implemented with the new flow.</p>
            </div>
         )}
      </div>
   );
};

export default MarinduqueDashboard;
