import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal, Alert } from '../../../Component/UI';
// Note: ProjectCard and TaskList removed as they're not needed for DOST-PMNS
import { UserManagement } from '../../../Component/UserManagement';
import { InteractiveDashboard } from '../../../Component/Interactive';
import axios from 'axios';

const SuperAdminDashboard = ({ projects = [], tasks = [], currentUser }) => {
   const [view, setView] = useState('overview'); // 'overview', 'projects', 'tasks', 'users', 'interactive', 'psto'
   
   // PSTO Management State
   const [pstos, setPstos] = useState([]);
   const [pstoUsers, setPstoUsers] = useState([]);
   const [showCreatePSTOModal, setShowCreatePSTOModal] = useState(false);
   const [pstoFormData, setPstoFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      province: '',
      department: 'Provincial Science and Technology Office',
      position: 'Provincial Director'
   });
   const [loading, setLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });

   // Load PSTO data
   useEffect(() => {
      if (view === 'psto') {
         loadPSTOData();
      }
   }, [view]);

   const loadPSTOData = async () => {
      try {
         setLoading(true);
         const [pstosResponse, usersResponse] = await Promise.all([
            axios.get('/api/pstos', {
               headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            }),
            axios.get('/api/users', {
               headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            })
         ]);
         
         setPstos(pstosResponse.data.pstos || []);
         setPstoUsers(usersResponse.data.users?.filter(user => user.role === 'psto') || []);
      } catch (error) {
         console.error('Error loading PSTO data:', error);
         setAlert({ show: true, type: 'error', message: 'Failed to load PSTO data' });
      } finally {
         setLoading(false);
      }
   };

   const handleCreatePSTO = async (e) => {
      e.preventDefault();
      try {
         setLoading(true);
         const response = await axios.post('/api/users', {
            ...pstoFormData,
            role: 'psto'
         }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
         });

         setAlert({ show: true, type: 'success', message: 'PSTO user created successfully!' });
         setShowCreatePSTOModal(false);
         setPstoFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            province: '',
            department: 'Provincial Science and Technology Office',
            position: 'Provincial Director'
         });
         loadPSTOData();
      } catch (error) {
         console.error('Error creating PSTO:', error);
         setAlert({ show: true, type: 'error', message: error.response?.data?.message || 'Failed to create PSTO user' });
      } finally {
         setLoading(false);
      }
   };

   const handleToggleUserStatus = async (userId, currentStatus) => {
      try {
         const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
         await axios.put(`/api/users/${userId}`, {
            status: newStatus
         }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
         });

         setAlert({ show: true, type: 'success', message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!` });
         loadPSTOData();
      } catch (error) {
         console.error('Error updating user status:', error);
         setAlert({ show: true, type: 'error', message: 'Failed to update user status' });
      }
   };

   const provinces = [
      'Marinduque',
      'Occidental Mindoro',
      'Oriental Mindoro',
      'Romblon',
      'Palawan'
   ];

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

   // Interactive user stats for Super Admin
   const userStats = {
      totalEnrollments: stats.totalProjects + stats.totalTasks,
      approvedApplications: stats.completedProjects,
      avgProcessingTime: 12,
      todayProcessed: stats.activeProjects,
      accuracyRate: 96,
      communitiesHelped: stats.totalProjects,
      timeSaved: stats.completedTasks * 2,
      completedTna: stats.completedProjects,
      perfectStreak: stats.completedProjects,
      helpfulActions: stats.totalTasks,
      dailyProcessed: stats.activeProjects
   };

   const renderOverview = () => (
      <div className="space-y-6">
         {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">P</span>
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
                     <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">⚠</span>
                     </div>
                  </div>
                  <div className="ml-4">
                     <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
                     <p className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Recent Projects and Upcoming Deadlines */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
               <div className="space-y-3">
                  {recentProjects.map(project => (
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
               <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
               <div className="space-y-3">
                  {upcomingDeadlines.map(task => (
                     <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-medium text-gray-900">{task.title}</p>
                           <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                        </div>
                        <Badge variant={task.priority === 'high' ? 'danger' : 'warning'}>
                           {task.priority}
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
            <h2 className="text-2xl font-bold text-gray-900">System Projects</h2>
         </div>
         
         <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Management</h3>
            <p className="text-gray-600">System-wide project overview and management will be available here.</p>
         </Card>
      </div>
   );

   const renderTasks = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">System Tasks</h2>
         </div>
         
         <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Management</h3>
            <p className="text-gray-600">System-wide task tracking and management will be available here.</p>
         </Card>
      </div>
   );

   const renderUsers = () => (
      <UserManagement currentUser={currentUser} />
   );

   const renderPSTOManagement = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">PSTO Management</h2>
            <Button onClick={() => setShowCreatePSTOModal(true)}>
               Create PSTO User
            </Button>
         </div>

         {/* PSTO Users Table */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PSTO Users</h3>
            {loading ? (
               <div className="text-center py-8">Loading...</div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {pstoUsers.map((user) => (
                           <tr key={user._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{user.province || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{user.position}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                                    {user.status}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                 <Button
                                    size="sm"
                                    variant={user.status === 'active' ? 'danger' : 'success'}
                                    onClick={() => handleToggleUserStatus(user._id, user.status)}
                                 >
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </Card>

         {/* PSTO Records */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PSTO Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {pstos.map((psto) => (
                  <div key={psto._id} className="border rounded-lg p-4">
                     <h4 className="font-medium text-gray-900">{psto.officeName}</h4>
                     <p className="text-sm text-gray-600">{psto.province}</p>
                     <p className="text-sm text-gray-500">{psto.contactInfo?.email}</p>
                  </div>
               ))}
            </div>
         </Card>
      </div>
   );

   return (
      <div className="space-y-6">
         {/* Navigation Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'interactive', label: 'Interactive' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'psto', label: 'PSTO Management' },
                  ...(currentUser && currentUser.role === 'super_admin' ? [{ key: 'users', label: 'User Management' }] : [])
               ].map((tab) => (
                  <button
                     key={tab.key}
                     onClick={() => setView(tab.key)}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        view === tab.key
                           ? 'border-purple-500 text-purple-600'
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
         {view === 'psto' && renderPSTOManagement()}
         {view === 'users' && renderUsers()}

         {/* Alert */}
         {alert.show && (
            <Alert 
               type={alert.type} 
               className="fixed top-4 right-4 z-50"
               onClose={() => setAlert({ show: false, type: '', message: '' })}
            >
               {alert.message}
            </Alert>
         )}

         {/* Create PSTO Modal */}
         {showCreatePSTOModal && (
            <Modal isOpen={showCreatePSTOModal} onClose={() => setShowCreatePSTOModal(false)}>
               <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create PSTO User</h3>
                  <form onSubmit={handleCreatePSTO} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                           label="First Name *"
                           value={pstoFormData.firstName}
                           onChange={(e) => setPstoFormData({...pstoFormData, firstName: e.target.value})}
                           required
                        />
                        <Input
                           label="Last Name *"
                           value={pstoFormData.lastName}
                           onChange={(e) => setPstoFormData({...pstoFormData, lastName: e.target.value})}
                           required
                        />
                     </div>
                     <Input
                        label="Email *"
                        type="email"
                        value={pstoFormData.email}
                        onChange={(e) => setPstoFormData({...pstoFormData, email: e.target.value})}
                        required
                     />
                     <Input
                        label="Password *"
                        type="password"
                        value={pstoFormData.password}
                        onChange={(e) => setPstoFormData({...pstoFormData, password: e.target.value})}
                        required
                     />
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                        <select
                           value={pstoFormData.province}
                           onChange={(e) => setPstoFormData({...pstoFormData, province: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        >
                           <option value="">Select Province</option>
                           {provinces.map(province => (
                              <option key={province} value={province}>{province}</option>
                           ))}
                        </select>
                     </div>
                     <div className="flex justify-end space-x-3">
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={() => setShowCreatePSTOModal(false)}
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           loading={loading}
                           disabled={loading}
                        >
                           Create PSTO User
                        </Button>
                     </div>
                  </form>
               </div>
            </Modal>
         )}
      </div>
   );
};

export default SuperAdminDashboard;
