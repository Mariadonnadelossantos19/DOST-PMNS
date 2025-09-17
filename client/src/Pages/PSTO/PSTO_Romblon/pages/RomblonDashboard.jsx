import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { InteractiveDashboard } from '../../../../Component/Interactive';
import { API_ENDPOINTS } from '../../../../config/api';

const RomblonDashboard = ({ currentUser }) => {
   const [view, setView] = useState('overview');
   const [proponents, setProponents] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   

   // Fetch proponents for this PSTO
   const fetchProponents = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const response = await fetch(`http://localhost:4000/api/users/psto/Romblon/proponents`, {
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

   // Romblon-specific data
   const romblonProjects = [
      {
         id: 1,
         title: 'Romblon SETUP Program',
         description: 'Small Enterprise Technology Upgrading Program for Romblon',
         status: 'active',
         progress: 40,
         startDate: '2024-02-15',
         endDate: '2024-12-31',
         province: 'Romblon',
         beneficiaries: 12
      },
      {
         id: 2,
         title: 'Romblon GIA Research',
         description: 'Grants-in-Aid research projects in Romblon',
         status: 'pending',
         progress: 0,
         startDate: '2024-05-01',
         endDate: '2024-12-31',
         province: 'Romblon',
         beneficiaries: 6
      }
   ];

   const romblonTasks = [
      {
         id: 1,
         title: 'Site visit to Romblon, Romblon',
         description: 'Conduct technology assessment for local MSMEs',
         status: 'pending',
         priority: 'high',
         dueDate: '2024-02-25',
         province: 'Romblon'
      },
      {
         id: 2,
         title: 'SETUP application review',
         description: 'Review applications from Romblon entrepreneurs',
         status: 'pending',
         priority: 'medium',
         dueDate: '2024-03-01',
         province: 'Romblon'
      }
   ];

   // Calculate Romblon-specific statistics
   const stats = {
      totalProjects: romblonProjects.length,
      activeProjects: romblonProjects.filter(p => p.status === 'active' || p.status === 'in progress').length,
      completedProjects: romblonProjects.filter(p => p.status === 'completed').length,
      totalTasks: romblonTasks.length,
      completedTasks: romblonTasks.filter(t => t.status === 'completed').length,
      totalBeneficiaries: romblonProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0),
      totalProponents: proponents.length,
      activeProponents: proponents.filter(p => p.status === 'active').length
   };

   // Interactive user stats for Romblon PSTO
   const userStats = {
      totalEnrollments: stats.totalProjects + stats.totalTasks,
      approvedApplications: stats.completedProjects,
      avgProcessingTime: 16,
      todayProcessed: stats.activeProjects,
      accuracyRate: 89,
      communitiesHelped: stats.totalBeneficiaries,
      timeSaved: stats.completedTasks * 2.5,
      completedTna: stats.completedProjects,
      perfectStreak: stats.completedProjects,
      helpfulActions: stats.totalTasks,
      dailyProcessed: stats.activeProjects
   };

   const renderOverview = () => (
      <div className="space-y-6">
         {/* Romblon-specific stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">R</span>
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
                     <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
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

         {/* Romblon-specific content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Romblon Projects</h3>
               <div className="space-y-3">
                  {romblonProjects.map(project => (
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
                  {romblonTasks.map(task => (
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
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
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
            <h2 className="text-2xl font-bold text-gray-900">Romblon Projects</h2>
            <Button>Add Project</Button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {romblonProjects.map(project => (
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
                           className="bg-purple-600 h-2 rounded-full" 
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
            <h2 className="text-2xl font-bold text-gray-900">Romblon Tasks</h2>
            <Button>Add Task</Button>
         </div>
         
         <div className="space-y-4">
            {romblonTasks.map(task => (
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

   const renderProponents = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Romblon Proponents</h2>
            <div className="flex space-x-2">
               <Button onClick={fetchProponents} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
               </Button>
            </div>
         </div>

         {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
               <p className="text-red-800 text-sm">{error}</p>
            </div>
         )}

         {loading ? (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
               <p className="text-gray-500 mt-4">Loading proponents...</p>
            </div>
         ) : proponents.length === 0 ? (
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏢</span>
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">No Proponents Yet</h3>
               <p className="text-gray-500">Proponents from Romblon will appear here once they register.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {proponents.map(proponent => (
                  <Card key={proponent._id} className="p-6">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-sm">
                                 {proponent.firstName?.charAt(0)}{proponent.lastName?.charAt(0)}
                              </span>
                           </div>
                           <div>
                              <h3 className="font-semibold text-gray-900">
                                 {proponent.firstName} {proponent.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{proponent.userId}</p>
                           </div>
                        </div>
                        <Badge variant={proponent.status === 'active' ? 'success' : 'warning'}>
                           {proponent.status}
                        </Badge>
                     </div>
                     
                     <div className="space-y-2">
                        <div>
                           <p className="text-sm font-medium text-gray-700">Email</p>
                           <p className="text-sm text-gray-600">{proponent.email}</p>
                        </div>
                        
                        {proponent.proponentInfo?.businessName && (
                           <div>
                              <p className="text-sm font-medium text-gray-700">Business</p>
                              <p className="text-sm text-gray-600">{proponent.proponentInfo.businessName}</p>
                           </div>
                        )}
                        
                        {proponent.proponentInfo?.businessType && (
                           <div>
                              <p className="text-sm font-medium text-gray-700">Type</p>
                              <p className="text-sm text-gray-600">{proponent.proponentInfo.businessType}</p>
                           </div>
                        )}
                        
                        <div>
                           <p className="text-sm font-medium text-gray-700">Joined</p>
                           <p className="text-sm text-gray-600">
                              {new Date(proponent.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                           View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                           Contact
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold">PSTO Romblon Dashboard</h1>
            <p className="text-purple-100 mt-2">
               Welcome, {currentUser?.name || 'User'}! Manage Romblon-specific programs and services.
            </p>
         </div>

         {/* Enhanced Navigation Tabs */}
         <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
            <nav className="-mb-px flex space-x-8 px-6">
               {[
                  { key: 'overview', label: 'Overview', icon: '📊' },
                  { key: 'interactive', label: 'Interactive', icon: '🎮' },
                  { key: 'projects', label: 'Projects', icon: '📁' },
                  { key: 'tasks', label: 'Tasks', icon: '✅' },
                  { key: 'proponents', label: 'Proponents', icon: '👥' },
                  { key: 'enrollment', label: 'Enrollment', icon: '📝' }
               ].map((tab) => (
                  <button
                     key={tab.key}
                     onClick={() => setView(tab.key)}
                     className={`py-3 px-2 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                        view === tab.key
                           ? 'border-purple-500 text-purple-600 bg-purple-50'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                     }`}
                  >
                     <span className="text-base">{tab.icon}</span>
                     <span>{tab.label}</span>
                  </button>
               ))}
            </nav>
         </div>

         {/* Content */}
         {view === 'overview' && renderOverview()}
         {view === 'interactive' && <InteractiveDashboard userStats={userStats} />}
         {view === 'projects' && renderProjects()}
         {view === 'tasks' && renderTasks()}
         {view === 'proponents' && renderProponents()}
         {view === 'enrollment' && (
            <div className="p-6 text-center">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollment System</h3>
               <p className="text-gray-600">Enrollment functionality will be implemented with the new flow.</p>
            </div>
         )}
      </div>
   );
};

export default RomblonDashboard;
