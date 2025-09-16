import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../../Component/UI';
import { InteractiveDashboard } from '../../../../Component/Interactive';
import { API_ENDPOINTS } from '../../../../config/api';

const RomblonDashboard = ({ currentUser }) => {
   const [view, setView] = useState('overview');
   const [proponents, setProponents] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   
   // Application review states
   const [applications, setApplications] = useState([]);
   const [applicationsLoading, setApplicationsLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');

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

   // Fetch applications for PSTO review
   const fetchApplications = async () => {
      try {
         setApplicationsLoading(true);
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            setError('Please login first');
            return;
         }

         const response = await fetch(API_ENDPOINTS.PSTO_APPLICATIONS, {   
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            if (response.status === 403) {
               setError('Access denied. PSTO role required.');
               return;
            }
            throw new Error('Failed to fetch applications');
         }

         const data = await response.json();
         setApplications(data.data || []);
      } catch (err) {
         console.error('Error fetching applications:', err);
         setError(err.message);
      } finally {
         setApplicationsLoading(false);
      }
   };

   // Review application
   const reviewApplication = async (applicationId) => {
      try {
         const token = localStorage.getItem('authToken');
         
         const response = await fetch(`${API_ENDPOINTS.PSTO_APPLICATIONS}/${applicationId}/review`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: reviewStatus,
               comments: reviewComments
            })
         });

         if (!response.ok) {
            throw new Error('Failed to review application');
         }

         const data = await response.json();
         console.log('Application reviewed:', data);
         
         // Refresh applications list
         fetchApplications();
         setSelectedApplication(null);
         setReviewStatus('');
         setReviewComments('');
         
         alert('Application reviewed successfully!');
      } catch (err) {
         console.error('Error reviewing application:', err);
         alert('Error reviewing application: ' + err.message);
      }
   };

   useEffect(() => {
      fetchProponents();
      fetchApplications();
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

   const getStatusColor = (status) => {
      switch (status) {
         case 'pending': return 'bg-yellow-100 text-yellow-800';
         case 'approved': return 'bg-green-100 text-green-800';
         case 'returned': return 'bg-blue-100 text-blue-800';
         case 'rejected': return 'bg-red-100 text-red-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   const renderApplications = () => (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">SETUP Applications</h2>
            <Button onClick={fetchApplications} disabled={applicationsLoading}>
               {applicationsLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
         </div>

         {applicationsLoading ? (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
               <p className="text-gray-500 mt-4">Loading applications...</p>
            </div>
         ) : applications.length === 0 ? (
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
               <p className="mt-1 text-sm text-gray-500">No applications are currently pending review.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {applications.map((application) => (
                  <Card key={application._id} className="p-6">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                           <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {application.applicationId}
                           </h3>
                           <p className="text-sm text-gray-600">
                              {application.enterpriseName}
                           </p>
                        </div>
                        <Badge className={getStatusColor(application.pstoStatus)}>
                           {application.pstoStatus?.toUpperCase()}
                        </Badge>
                     </div>

                     <div className="space-y-2 mb-4">
                        <div>
                           <span className="text-sm font-medium text-gray-500">Contact Person:</span>
                           <p className="text-sm text-gray-900">{application.contactPerson}</p>
                        </div>
                        <div>
                           <span className="text-sm font-medium text-gray-500">Province:</span>
                           <p className="text-sm text-gray-900">{application.proponentId?.province || 'N/A'}</p>
                        </div>
                        <div>
                           <span className="text-sm font-medium text-gray-500">Submitted:</span>
                           <p className="text-sm text-gray-900">{formatDate(application.createdAt)}</p>
                        </div>
                        <div>
                           <span className="text-sm font-medium text-gray-500">Business Activity:</span>
                           <p className="text-sm text-gray-900">{application.businessActivity || 'N/A'}</p>
                        </div>
                     </div>

                     <div className="flex space-x-2">
                        <Button
                           onClick={() => setSelectedApplication(application)}
                           className="flex-1"
                        >
                           Review
                        </Button>
                        <Button
                           onClick={() => window.open(`/api/programs/psto/applications/${application._id}/download/letterOfIntent`, '_blank')}
                           variant="outline"
                        >
                           Files
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         )}

         {/* Review Modal */}
         {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Review Application</h3>
                        <button
                           onClick={() => setSelectedApplication(null)}
                           className="text-gray-500 hover:text-gray-700"
                        >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>

                     <div className="space-y-4 mb-6">
                        <div>
                           <h4 className="font-semibold text-gray-900">Application Details</h4>
                           <div className="mt-2 space-y-2">
                              <p><span className="font-medium">Application ID:</span> {selectedApplication.applicationId}</p>
                              <p><span className="font-medium">Enterprise:</span> {selectedApplication.enterpriseName}</p>
                              <p><span className="font-medium">Contact Person:</span> {selectedApplication.contactPerson}</p>
                              <p><span className="font-medium">Business Activity:</span> {selectedApplication.businessActivity}</p>
                              <p><span className="font-medium">Technology Needs:</span> {selectedApplication.technologyNeeds}</p>
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Decision
                           </label>
                           <select
                              value={reviewStatus}
                              onChange={(e) => setReviewStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                           >
                              <option value="">Select decision</option>
                              <option value="approved">Approve</option>
                              <option value="returned">Return for Revision</option>
                              <option value="rejected">Reject</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comments
                           </label>
                           <textarea
                              value={reviewComments}
                              onChange={(e) => setReviewComments(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter your review comments..."
                           />
                        </div>
                     </div>

                     <div className="flex justify-end space-x-3">
                        <Button
                           onClick={() => setSelectedApplication(null)}
                           variant="outline"
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={() => reviewApplication(selectedApplication._id)}
                           disabled={!reviewStatus}
                        >
                           Submit Review
                        </Button>
                     </div>
                  </div>
               </div>
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

         {/* Navigation Tabs */}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
               {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'interactive', label: 'Interactive' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'proponents', label: 'Proponents' },
                  { key: 'applications', label: 'Applications' },
                  { key: 'enrollment', label: 'Enrollment' }
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
         {view === 'proponents' && renderProponents()}
         {view === 'applications' && renderApplications()}
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
