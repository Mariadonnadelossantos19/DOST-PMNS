import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge, Alert, ConfirmationModal, useToast } from '../UI';

const UserManagement = ({ currentUser }) => {
   const [users, setUsers] = useState([]);
   const { showSuccess, showError, showWarning, showInfo } = useToast();

   const [showCreateModal, setShowCreateModal] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });
   const [searchTerm, setSearchTerm] = useState('');
   const [filterRole, setFilterRole] = useState('all');
   const [filterStatus, setFilterStatus] = useState('all');
   const [filterProvince, setFilterProvince] = useState('all');
   const [sortBy, setSortBy] = useState('createdAt');
   const [sortOrder, setSortOrder] = useState('desc');

   const [newUser, setNewUser] = useState({
      firstName: '',
      lastName: '',
      email: '',
      role: 'psto',
      department: '',
      position: '',
      province: '',
      password: '',
      confirmPassword: ''
   });

   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [isLoadingUsers, setIsLoadingUsers] = useState(true);

   // Confirmation modal states
   const [confirmationModal, setConfirmationModal] = useState({
      isOpen: false,
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'Confirm',
      onConfirm: null
   });

   // Confirmation modal helpers
   const showConfirmation = (title, message, type, confirmText, onConfirm) => {
      setConfirmationModal({
         isOpen: true,
         title,
         message,
         type,
         confirmText,
         onConfirm
      });
   };

   const hideConfirmation = () => {
      setConfirmationModal({
         isOpen: false,
         title: '',
         message: '',
         type: 'warning',
         confirmText: 'Confirm',
         onConfirm: null
      });
   };

   const handleConfirmAction = () => {
      if (confirmationModal.onConfirm) {
         confirmationModal.onConfirm();
      }
      hideConfirmation();
   };

   // Fetch users from database
   const fetchUsers = async () => {
      try {
         setIsLoadingUsers(true);
         const response = await fetch('http://localhost:4000/api/users');
         
         if (response.ok) {
            const data = await response.json();
            setUsers(data.users || []);
         } else {
            setAlert({
               show: true,
               type: 'error',
               message: 'Failed to load users'
            });
         }
      } catch (error) {
         console.error('Fetch users error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please try again.'
         });
      } finally {
         setIsLoadingUsers(false);
      }
   };

   // Load users on component mount
   useEffect(() => {
      fetchUsers();
   }, []);

   // Generate formatted user ID based on role and province
   const generateUserId = (role, province = '') => {
      if (role === 'personnel') {
         // Count existing personnel in the same province
         const provinceUsers = users.filter(user => 
            user.role === 'personnel' && user.province === province
         );
         const nextNumber = provinceUsers.length + 1;
         return `PSTO__${province}_${nextNumber}`;
      } else if (role === 'applicant') {
         // Count existing applicants
         const applicantUsers = users.filter(user => user.role === 'applicant');
         const nextNumber = applicantUsers.length + 1;
         return `DOST_Client_${nextNumber}`;
      }
      return `USER_${Date.now()}`;
   };

   // Filter users based on search and role
   // Enhanced filtering logic
   const filteredUsers = users.filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.userId && user.userId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesProvince = filterProvince === 'all' || user.province === filterProvince;
      return matchesSearch && matchesRole && matchesStatus && matchesProvince;
   }).sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
         case 'name':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
         case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
         case 'role':
            aValue = a.role;
            bValue = b.role;
            break;
         case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
         case 'province':
            aValue = a.province || '';
            bValue = b.province || '';
            break;
         case 'createdAt':
         default:
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
      }
      
      if (sortOrder === 'asc') {
         return aValue > bValue ? 1 : -1;
      } else {
         return aValue < bValue ? 1 : -1;
      }
   });

   // Handle input changes for new user
   const handleNewUserChange = (e) => {
      const { name, value } = e.target;
      setNewUser(prev => ({
         ...prev,
         [name]: value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
         setErrors(prev => ({
            ...prev,
            [name]: ''
         }));
      }
   };

   // Validate new user form
   const validateNewUser = () => {
      const newErrors = {};

      if (!newUser.firstName.trim()) {
         newErrors.firstName = 'First name is required';
      }

      if (!newUser.lastName.trim()) {
         newErrors.lastName = 'Last name is required';
      }

      if (!newUser.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
         newErrors.email = 'Email is invalid';
      }

      if (!newUser.department.trim()) {
         newErrors.department = 'Department is required';
      }

      if (!newUser.position.trim()) {
         newErrors.position = 'Position is required';
      }

      if (newUser.role === 'psto' && !newUser.province.trim()) {
         newErrors.province = 'Province is required for PSTO users';
      }

      if (!newUser.password) {
         newErrors.password = 'Password is required';
      } else if (newUser.password.length < 6) {
         newErrors.password = 'Password must be at least 6 characters';
      }

      if (!newUser.confirmPassword) {
         newErrors.confirmPassword = 'Please confirm password';
      } else if (newUser.password !== newUser.confirmPassword) {
         newErrors.confirmPassword = 'Passwords do not match';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Handle create user
   const handleCreateUser = (e) => {
      e.preventDefault();
      
      if (!validateNewUser()) {
         return;
      }

      showConfirmation(
         'Create New User',
         `Are you sure you want to create a new ${newUser.role.toUpperCase()} account for ${newUser.firstName} ${newUser.lastName}?`,
         'info',
         'Create User',
         () => performCreateUser()
      );
   };

   const performCreateUser = async () => {
      setIsLoading(true);

      try {
         const requestData = {
            firstName: newUser.firstName.trim(),
            lastName: newUser.lastName.trim(),
            email: newUser.email.trim().toLowerCase(),
            role: newUser.role,
            department: newUser.department.trim(),
            position: newUser.position.trim(),
            password: newUser.password,
            province: newUser.province
         };

         console.log('Sending user creation request with data:', requestData);
         console.log('Current user:', currentUser);

         const response = await fetch('http://localhost:4000/api/users/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
         });

         const data = await response.json();
         
         console.log('Server response status:', response.status);
         console.log('Server response data:', data);

         if (response.ok) {
            
            // Add new user to the list using server response
            setUsers(prev => [...prev, {
               _id: data.user.id,
               id: data.user.id,
               userId: data.user.userId,
               firstName: data.user.firstName,
               lastName: data.user.lastName,
               email: data.user.email,
               role: data.user.role,
               department: data.user.department,
               position: data.user.position,
               province: data.user.province,
               status: data.user.status,
               createdAt: data.user.createdAt,
               createdBy: data.user.createdBy
            }]);

            showSuccess(`${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} account created successfully!`);

            // Reset form
            setNewUser({
               firstName: '',
               lastName: '',
               email: '',
               role: 'psto',
               department: '',
               position: '',
               province: '',
               password: '',
               confirmPassword: ''
            });

            setShowCreateModal(false);
         } else {
            showError(data.message || 'Failed to create user account');
         }
      } catch (error) {
         console.error('Create user error:', error);
         showError('Network error. Please try again.');
      } finally {
         setIsLoading(false);
      }
   };


   // Handle delete user
   const handleDeleteUser = (user) => {
      showConfirmation(
         'Delete User',
         `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone and will remove all user data.`,
         'danger',
         'Delete',
         () => performDeleteUser(user)
      );
   };

   const performDeleteUser = async (user) => {
      try {
         // Use the MongoDB _id for API calls, fallback to id if _id doesn't exist
         const userId = user._id || user.id;
         const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
            method: 'DELETE'
         });

         if (response.ok) {
            setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
            showSuccess('User deleted successfully!');
         } else {
            showError('Failed to delete user');
         }
      } catch (error) {
         console.error('Delete user error:', error);
         showError('Network error. Please try again.');
      }
   };

   // Handle toggle user status
   const handleToggleStatus = (user) => {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const action = newStatus === 'active' ? 'activate' : 'deactivate';
      
      showConfirmation(
         `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
         `Are you sure you want to ${action} ${user.firstName} ${user.lastName}? This will ${newStatus === 'active' ? 'restore' : 'restrict'} their access to the system.`,
         newStatus === 'active' ? 'info' : 'warning',
         `${action.charAt(0).toUpperCase() + action.slice(1)}`,
         () => performToggleStatus(user, newStatus)
      );
   };

   const performToggleStatus = async (user, newStatus) => {
      try {
         // Use the MongoDB _id for API calls, fallback to id if _id doesn't exist
         const userId = user._id || user.id;
         const response = await fetch(`http://localhost:4000/api/users/${userId}/toggle-status`, {
            method: 'PATCH'
         });

         if (response.ok) {
            const data = await response.json();
            setUsers(prev => prev.map(u => 
               (u._id || u.id) === userId ? { ...u, status: data.user.status } : u
            ));
            showSuccess(`User ${data.user.status === 'active' ? 'activated' : 'deactivated'} successfully!`);
         } else {
            const data = await response.json();
            showError(`Failed to update user status: ${data.message || 'Unknown error'}`);
         }
      } catch (error) {
         console.error('Toggle status error:', error);
         showError('Network error. Please try again.');
      }
   };

   // Handle activate user
   const handleActivateUser = async (user) => {
      try {
         // Use the MongoDB _id for API calls, fallback to id if _id doesn't exist
         const userId = user._id || user.id;
         const response = await fetch(`http://localhost:4000/api/users/${userId}/activate`, {
            method: 'PATCH'
         });

         if (response.ok) {
            setUsers(prev => prev.map(u => 
               (u._id || u.id) === userId ? { ...u, status: 'active' } : u
            ));
            setAlert({
               show: true,
               type: 'success',
               message: 'User activated successfully!'
            });
         } else {
            const data = await response.json();
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Failed to activate user'
            });
         }
      } catch (error) {
         console.error('Activate user error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please try again.'
         });
      }
   };

   // Handle deactivate user
   const handleDeactivateUser = async (user) => {
      try {
         // Use the MongoDB _id for API calls, fallback to id if _id doesn't exist
         const userId = user._id || user.id;
         const response = await fetch(`http://localhost:4000/api/users/${userId}/deactivate`, {
            method: 'PATCH'
         });

         if (response.ok) {
            setUsers(prev => prev.map(u => 
               (u._id || u.id) === userId ? { ...u, status: 'inactive' } : u
            ));
            setAlert({
               show: true,
               type: 'success',
               message: 'User deactivated successfully!'
            });
         } else {
            const data = await response.json();
            setAlert({
               show: true,
               type: 'error',
               message: data.message || 'Failed to deactivate user'
            });
         }
      } catch (error) {
         console.error('Deactivate user error:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Network error. Please try again.'
         });
      }
   };

   // Get role color
   const getRoleColor = (role) => {
      switch (role) {
         case 'super_admin': return 'danger';
         case 'psto': return 'primary';
         case 'dost_mimaropa': return 'warning';
         default: return 'default';
      }
   };

   // Get status color
   const getStatusColor = (status) => {
      switch (status) {
         case 'active': return 'success';
         case 'pending': return 'warning';
         case 'inactive': return 'danger';
         default: return 'default';
      }
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
               <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
               Create User Account
            </Button>
         </div>

         {/* Alert */}
         {alert.show && (
            <Alert 
               type={alert.type} 
               onClose={() => setAlert({ show: false, type: '', message: '' })}
            >
               {alert.message}
            </Alert>
         )}

         {/* Enhanced Filters */}
         <Card className="p-4">
            <div className="space-y-4">
               {/* Search Bar */}
               <div className="flex-1">
                  <Input
                     placeholder="Search users by name, email, or user ID..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     leftIcon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     }
                  />
               </div>
               
               {/* Filter Row 1 */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                     <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="psto">PSTO</option>
                        <option value="dost_mimaropa">DOST MIMAROPA</option>
                        <option value="proponent">Proponent</option>
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                     <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                     <select
                        value={filterProvince}
                        onChange={(e) => setFilterProvince(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="all">All Provinces</option>
                        <option value="Marinduque">Marinduque</option>
                        <option value="Occidental Mindoro">Occidental Mindoro</option>
                        <option value="Oriental Mindoro">Oriental Mindoro</option>
                        <option value="Romblon">Romblon</option>
                        <option value="Palawan">Palawan</option>
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                     <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="createdAt">Date Created</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                        <option value="status">Status</option>
                        <option value="province">Province</option>
                     </select>
                  </div>
               </div>
               
               {/* Filter Row 2 - Sort Order and Clear Filters */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Order:</label>
                        <div className="flex">
                           <button
                              onClick={() => setSortOrder('asc')}
                              className={`px-3 py-1 text-sm border rounded-l-lg ${
                                 sortOrder === 'asc' 
                                    ? 'bg-blue-500 text-white border-blue-500' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                           >
                              A-Z
                           </button>
                           <button
                              onClick={() => setSortOrder('desc')}
                              className={`px-3 py-1 text-sm border rounded-r-lg ${
                                 sortOrder === 'desc' 
                                    ? 'bg-blue-500 text-white border-blue-500' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                           >
                              Z-A
                           </button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-2">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                           setSearchTerm('');
                           setFilterRole('all');
                           setFilterStatus('all');
                           setFilterProvince('all');
                           setSortBy('createdAt');
                           setSortOrder('desc');
                        }}
                     >
                        Clear Filters
                     </Button>
                     <div className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
                     </div>
                  </div>
               </div>
            </div>
         </Card>

         {/* Active Filters Display */}
         {(searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterProvince !== 'all') && (
            <Card className="p-3 bg-blue-50 border-blue-200">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                  {searchTerm && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                        <button
                           onClick={() => setSearchTerm('')}
                           className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                           ×
                        </button>
                     </span>
                  )}
                  {filterRole !== 'all' && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Role: {filterRole.replace('_', ' ')}
                        <button
                           onClick={() => setFilterRole('all')}
                           className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                           ×
                        </button>
                     </span>
                  )}
                  {filterStatus !== 'all' && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Status: {filterStatus}
                        <button
                           onClick={() => setFilterStatus('all')}
                           className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                           ×
                        </button>
                     </span>
                  )}
                  {filterProvince !== 'all' && (
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Province: {filterProvince}
                        <button
                           onClick={() => setFilterProvince('all')}
                           className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                           ×
                        </button>
                     </span>
                  )}
               </div>
            </Card>
         )}

         {/* Users Table */}
         <Card>
            <div className="overflow-x-auto">
               {isLoadingUsers ? (
                  <div className="flex justify-center items-center py-12">
                     <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading users...</p>
                     </div>
                  </div>
               ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                           <tr>
                              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                 No users found
                              </td>
                           </tr>
                        ) : (
                           filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono font-medium text-blue-600">
                                 {user.userId}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                 </div>
                                 <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                       {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getRoleColor(user.role)}>
                                 {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.department}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStatusColor(user.status)}>
                                 {user.status.toUpperCase()}
                              </Badge>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                 {/* Toggle Status Button */}
                                 <Button
                                    variant={user.status === 'active' ? 'warning' : 'success'}
                                    size="sm"
                                    onClick={() => handleToggleStatus(user)}
                                    title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                 >
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                 </Button>
                                 
                                 {/* Specific Action Buttons */}
                                 {user.status === 'active' ? (
                                    <Button
                                       variant="warning"
                                       size="sm"
                                       onClick={() => handleDeactivateUser(user)}
                                       title="Deactivate User"
                                    >
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                       </svg>
                                    </Button>
                                 ) : (
                                    <Button
                                       variant="success"
                                       size="sm"
                                       onClick={() => handleActivateUser(user)}
                                       title="Activate User"
                                    >
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                       </svg>
                                    </Button>
                                 )}
                                 
                                 {/* Delete Button */}
                                 <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    title="Delete User"
                                 >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                 </Button>
                              </div>
                           </td>
                        </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               )}
            </div>
         </Card>

         {/* Create User Modal */}
         <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Create User Account"
            size="lg"
         >
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <Input
                     label="First Name"
                     name="firstName"
                     value={newUser.firstName}
                     onChange={handleNewUserChange}
                     error={errors.firstName}
                     required
                  />
                  <Input
                     label="Last Name"
                     name="lastName"
                     value={newUser.lastName}
                     onChange={handleNewUserChange}
                     error={errors.lastName}
                     required
                  />
               </div>

               <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  error={errors.email}
                  required
               />

               <div className="grid grid-cols-2 gap-4">
                  <Input
                     label="Department"
                     name="department"
                     value={newUser.department}
                     onChange={handleNewUserChange}
                     error={errors.department}
                     required
                  />
                  <Input
                     label="Position"
                     name="position"
                     value={newUser.position}
                     onChange={handleNewUserChange}
                     error={errors.position}
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Role
                  </label>
                  <select
                     name="role"
                     value={newUser.role}
                     onChange={handleNewUserChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                     <option value="psto">PSTO (Provincial S&T Office)</option>
                     <option value="dost_mimaropa">DOST MIMAROPA</option>
                     <option value="super_admin">Super Admin</option>
                  </select>
               </div>

               {newUser.role === 'psto' && (
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province
                     </label>
                     <select
                        name="province"
                        value={newUser.province}
                        onChange={handleNewUserChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={newUser.role === 'psto'}
                     >
                        <option value="">Select Province</option>
                        <option value="Marinduque">Marinduque</option>
                        <option value="Occidental Mindoro">Occidental Mindoro</option>
                        <option value="Oriental Mindoro">Oriental Mindoro</option>
                        <option value="Romblon">Romblon</option>
                        <option value="Palawan">Palawan</option>
                     </select>
                     {errors.province && (
                        <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                     )}
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <Input
                     label="Password"
                     name="password"
                     type="password"
                     value={newUser.password}
                     onChange={handleNewUserChange}
                     error={errors.password}
                     required
                  />
                  <Input
                     label="Confirm Password"
                     name="confirmPassword"
                     type="password"
                     value={newUser.confirmPassword}
                     onChange={handleNewUserChange}
                     error={errors.confirmPassword}
                     required
                  />
               </div>

               <Modal.Footer>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => setShowCreateModal(false)}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     loading={isLoading}
                     disabled={isLoading}
                  >
                     {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
               </Modal.Footer>
            </form>
         </Modal>

         {/* Confirmation Modal */}
         <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={hideConfirmation}
            onConfirm={handleConfirmAction}
            title={confirmationModal.title}
            message={confirmationModal.message}
            type={confirmationModal.type}
            confirmText={confirmationModal.confirmText}
         />
      </div>
   );
};

export default UserManagement;
