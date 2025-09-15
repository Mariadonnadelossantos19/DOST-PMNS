import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Input, Alert } from '../../../Component/UI';

const ProponentDashboard = ({ userData }) => {
   const [enrollments, setEnrollments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
   const [enrollmentData, setEnrollmentData] = useState({
      program: '',
      businessName: '',
      businessType: '',
      businessDescription: '',
      expectedOutcomes: ''
   });

   // Load proponent's enrollments
   const loadEnrollments = useCallback(async () => {
      try {
         setLoading(true);
         const response = await fetch(`http://localhost:4000/api/enrollments/proponent/${userData.id}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });
         
         if (response.ok) {
            const data = await response.json();
            setEnrollments(data.data || []);
         } else {
            setError('Failed to load enrollments');
         }
      } catch (err) {
         setError('Error loading enrollments');
         console.error('Load enrollments error:', err);
      } finally {
         setLoading(false);
      }
   }, [userData.id]);

   useEffect(() => {
      loadEnrollments();
   }, [loadEnrollments]);

   const handleEnroll = async (e) => {
      e.preventDefault();
      
      try {
         const response = await fetch('http://localhost:4000/api/enrollments/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
               customerData: {
                  name: userData.firstName + ' ' + userData.lastName,
                  email: userData.email,
                  phone: '',
                  address: '',
                  businessName: enrollmentData.businessName,
                  businessType: enrollmentData.businessType,
                  type: userData.position
               },
               tnaData: {
                  enterpriseName: enrollmentData.businessName,
                  businessActivity: enrollmentData.businessDescription,
                  expectedOutcomes: enrollmentData.expectedOutcomes,
                  typeOfOrganization: userData.position
               },
               program: enrollmentData.program
            })
         });

         if (response.ok) {
            setShowEnrollmentModal(false);
            setEnrollmentData({
               program: '',
               businessName: '',
               businessType: '',
               businessDescription: '',
               expectedOutcomes: ''
            });
            loadEnrollments();
         } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to create enrollment');
         }
      } catch (err) {
         setError('Error creating enrollment');
         console.error('Enroll error:', err);
      }
   };


   const getStatusColor = (status) => {
      switch (status) {
         case 'pending': return 'yellow';
         case 'approved': return 'green';
         case 'rejected': return 'red';
         case 'under_review': return 'blue';
         default: return 'gray';
      }
   };

   const programOptions = [
      { value: 'SETUP', label: 'SETUP - Small Enterprise Technology Upgrading Program' },
      { value: 'GIA', label: 'GIA - Grants-in-Aid Program' },
      { value: 'CEST', label: 'CEST - Community Empowerment through Science and Technology' },
      { value: 'SSCP', label: 'SSCP - Small Scale Commercialization Program' }
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {/* Header */}
         <div className="bg-white rounded-lg shadow p-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
               Welcome, {userData.firstName}!
            </h1>
            <p className="text-sm text-gray-600">
               Proponent Dashboard - {userData.province}
            </p>
         </div>

         {/* Error Alert */}
         {error && (
            <Alert type="error" onClose={() => setError(null)}>
               {error}
            </Alert>
         )}

         {/* Quick Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
               <h3 className="font-medium text-gray-900 mb-1 text-sm">Enrollments</h3>
               <p className="text-2xl font-bold text-blue-600">{enrollments.length}</p>
               <p className="text-xs text-gray-500">Total</p>
            </Card>
            
            <Card className="p-3">
               <h3 className="font-medium text-gray-900 mb-1 text-sm">Active</h3>
               <p className="text-2xl font-bold text-green-600">
                  {enrollments.filter(e => e.status === 'approved').length}
               </p>
               <p className="text-xs text-gray-500">Approved</p>
            </Card>
            
            <Card className="p-3">
               <h3 className="font-medium text-gray-900 mb-1 text-sm">Pending</h3>
               <p className="text-2xl font-bold text-yellow-600">
                  {enrollments.filter(e => e.status === 'pending').length}
               </p>
               <p className="text-xs text-gray-500">Review</p>
            </Card>

            <Card className="p-3">
               <h3 className="font-medium text-gray-900 mb-1 text-sm">Tasks</h3>
               <p className="text-2xl font-bold text-purple-600">0</p>
               <p className="text-xs text-gray-500">Assigned</p>
            </Card>
         </div>


         {/* Enrollments List */}
         <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
               <h2 className="font-semibold text-gray-900">My Enrollments</h2>
               <Button 
                  onClick={() => setShowEnrollmentModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-sm py-1 px-3"
               >
                  New Enrollment
               </Button>
            </div>

            {enrollments.length === 0 ? (
               <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">No enrollments yet</p>
                  <Button 
                     onClick={() => setShowEnrollmentModal(true)}
                     className="bg-blue-600 hover:bg-blue-700"
                  >
                     Create Your First Enrollment
                  </Button>
               </div>
            ) : (
               <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                     <div key={enrollment.id} className="border rounded p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                           <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                 {enrollment.programName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                 {enrollment.businessName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                 Created: {new Date(enrollment.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                           <Badge color={getStatusColor(enrollment.status)}>
                              {enrollment.status}
                           </Badge>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </Card>

         {/* Enrollment Modal */}
         <Modal
            isOpen={showEnrollmentModal}
            onClose={() => setShowEnrollmentModal(false)}
            title="Create New Enrollment"
         >
            <form onSubmit={handleEnroll} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Program *
                  </label>
                  <select
                     value={enrollmentData.program}
                     onChange={(e) => setEnrollmentData({...enrollmentData, program: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  >
                     <option value="">Select a program</option>
                     {programOptions.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </select>
               </div>

               <Input
                  label="Business Name *"
                  value={enrollmentData.businessName}
                  onChange={(e) => setEnrollmentData({...enrollmentData, businessName: e.target.value})}
                  placeholder="Enter your business name"
                  required
               />

               <Input
                  label="Business Type"
                  value={enrollmentData.businessType}
                  onChange={(e) => setEnrollmentData({...enrollmentData, businessType: e.target.value})}
                  placeholder="e.g., Agriculture, Technology, Manufacturing"
               />

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Business Description *
                  </label>
                  <textarea
                     value={enrollmentData.businessDescription}
                     onChange={(e) => setEnrollmentData({...enrollmentData, businessDescription: e.target.value})}
                     placeholder="Describe your business activities"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     rows="3"
                     required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Expected Outcomes
                  </label>
                  <textarea
                     value={enrollmentData.expectedOutcomes}
                     onChange={(e) => setEnrollmentData({...enrollmentData, expectedOutcomes: e.target.value})}
                     placeholder="What do you hope to achieve with this program?"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     rows="3"
                  />
               </div>

               <div className="flex justify-end space-x-3 pt-4">
                  <Button
                     type="button"
                     onClick={() => setShowEnrollmentModal(false)}
                     className="bg-gray-300 hover:bg-gray-400"
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     className="bg-blue-600 hover:bg-blue-700"
                  >
                     Create Enrollment
                  </Button>
               </div>
            </form>
         </Modal>

      </div>
   );
};

export default ProponentDashboard;
