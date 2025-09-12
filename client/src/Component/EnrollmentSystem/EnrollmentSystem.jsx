import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input, Modal } from '../UI';
import TnaEnrollmentForm from './TnaEnrollmentForm';
import axios from 'axios';

const EnrollmentSystem = ({ province, onEnroll }) => {
   const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
   const [showTnaModal, setShowTnaModal] = useState(false);
   const [selectedService, setSelectedService] = useState('');
   const [selectedEnrollment, setSelectedEnrollment] = useState(null);
   const [customerData, setCustomerData] = useState({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      businessType: '',
      address: ''
   });
   const [enrollments, setEnrollments] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // API base URL
   const API_BASE_URL = 'http://localhost:4000/api';

   // Load enrollments from database
   const loadEnrollments = useCallback(async () => {
      try {
         setLoading(true);
         const response = await axios.get(`${API_BASE_URL}/enrollments?province=${province}`);
         if (response.data.success) {
            setEnrollments(response.data.enrollments);
         }
      } catch (error) {
         console.error('Error loading enrollments:', error);
         setError('Failed to load enrollments');
      } finally {
         setLoading(false);
      }
   }, [province, API_BASE_URL]);

   // Load enrollments on component mount
   useEffect(() => {
      loadEnrollments();
   }, [province, loadEnrollments]);

   // Service options with their stages
   const serviceOptions = {
      SETUP: {
         name: 'Small Enterprise Technology Upgrading Program',
         description: 'Technology upgrading program for small enterprises',
         stages: [
            { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
            { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
            { id: 'funding', name: 'Funding', required: true, completed: false },
            { id: 'training', name: 'Technology Training', required: true, completed: false },
            { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
            { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
         ]
      },
      GIA: {
         name: 'Grants-in-Aid',
         description: 'Research and development grants for innovative projects',
         stages: [
            { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
            { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
            { id: 'funding', name: 'Funding', required: true, completed: false },
            { id: 'training', name: 'Technology Training', required: true, completed: false },
            { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
            { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
         ]
      },
      CEST: {
         name: 'Community Empowerment through Science and Technology',
         description: 'Community-based technology programs and initiatives',
         stages: [
            { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
            { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
            { id: 'funding', name: 'Funding', required: true, completed: false },
            { id: 'training', name: 'Technology Training', required: true, completed: false },
            { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
            { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
         ]
      },
      SSCP: {
         name: 'Small and Medium Enterprise Development Program',
         description: 'Comprehensive support for SME development and growth',
         stages: [
            { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
            { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
            { id: 'funding', name: 'Funding', required: true, completed: false },
            { id: 'training', name: 'Technology Training', required: true, completed: false },
            { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
            { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
         ]
      }
   };

   const handleEnrollCustomer = async () => {
      try {
         if (!selectedService || !customerData.name || !customerData.email) {
            alert('Please fill in all required fields');
            return;
         }

         setLoading(true);
         setError(null);

         // Prepare enrollment data for API
         const enrollmentData = {
            customer: customerData,
            service: selectedService,
            serviceData: serviceOptions[selectedService],
            province: province,
            enrolledBy: null, // Will be set by backend based on auth
            notes: '',
            tnaInfo: null // Will be filled when TNA form is submitted
         };

         // Save to database as draft
         console.log('Sending enrollment data:', enrollmentData);
         const response = await axios.post(`${API_BASE_URL}/enrollments/create`, enrollmentData);
         
         if (response.data.success) {
            // Add to local state
            const newEnrollment = response.data.enrollment;
            setEnrollments(prev => [...prev, newEnrollment]);
            
            // Close modal and reset form
            setShowEnrollmentModal(false);
            setCustomerData({
               name: '',
               email: '',
               phone: '',
               businessName: '',
               businessType: '',
               address: ''
            });
            setSelectedService('');

            // Open TNA form for the new enrollment
            setSelectedEnrollment(newEnrollment);
            setShowTnaModal(true);

            if (onEnroll) {
               onEnroll(newEnrollment);
            }
         } else {
            throw new Error(response.data.message || 'Failed to enroll customer');
         }
      } catch (error) {
         console.error('Error enrolling customer:', error);
         console.error('Error response:', error.response?.data);
         const errorMessage = error.response?.data?.message || error.message || 'Failed to enroll customer. Please try again.';
         setError(errorMessage);
         alert(`Error: ${errorMessage}`);
      } finally {
         setLoading(false);
      }
   };

   const updateStageStatus = async (enrollmentId, stageId, completed) => {
      try {
         setLoading(true);
         
         // Update in database
         const response = await axios.patch(`${API_BASE_URL}/enrollments/${enrollmentId}/stage`, {
            stageId,
            completed,
            notes: ''
         });

         if (response.data.success) {
            // Update local state
            setEnrollments(prev => prev.map(enrollment => {
               if (enrollment._id === enrollmentId) {
                  return response.data.enrollment;
               }
               return enrollment;
            }));
         } else {
            throw new Error(response.data.message || 'Failed to update stage status');
         }
      } catch (error) {
         console.error('Error updating stage status:', error);
         setError('Failed to update stage status. Please try again.');
         alert('An error occurred while updating stage status. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const getStageStatus = (stage, enrollment) => {
      if (stage.completed) return 'completed';
      if (enrollment.currentStage === stage.id) return 'current';
      if (enrollment.stages.find(s => s.id === stage.id && s.completed)) return 'completed';
      return 'pending';
   };

   const getStageColor = (status) => {
      switch (status) {
         case 'completed': return 'bg-green-500';
         case 'current': return 'bg-blue-500';
         case 'pending': return 'bg-gray-300';
         default: return 'bg-gray-300';
      }
   };

   const handleTnaFormSuccess = (updatedEnrollment) => {
      setEnrollments(prev => prev.map(enrollment => 
         enrollment._id === updatedEnrollment._id ? updatedEnrollment : enrollment
      ));
      setShowTnaModal(false);
      setSelectedEnrollment(null);
   };

   const handleServiceCardClick = (serviceKey) => {
      // PSTO can enroll unlimited customers without restrictions
      setSelectedService(serviceKey);
      setShowEnrollmentModal(true);
   };

   const canAccessStage = (enrollment, stageId) => {
      if (stageId === 'tna') return true;
      return enrollment.tnaStatus === 'approved';
   };

   const getStatusBadgeVariant = (status, tnaStatus) => {
      if (status === 'draft') return 'secondary';
      if (status === 'submitted' && tnaStatus === 'under_review') return 'warning';
      if (status === 'approved' && tnaStatus === 'approved') return 'success';
      if (status === 'rejected' && tnaStatus === 'rejected') return 'danger';
      if (status === 'in_progress') return 'info';
      if (status === 'completed') return 'success';
      return 'secondary';
   };

   const getStatusText = (enrollment) => {
      if (enrollment.status === 'draft') return 'Draft';
      if (enrollment.status === 'submitted' && enrollment.tnaStatus === 'under_review') return 'Under Review';
      if (enrollment.status === 'approved' && enrollment.tnaStatus === 'approved') return 'TNA Approved';
      if (enrollment.status === 'rejected' && enrollment.tnaStatus === 'rejected') return 'TNA Rejected';
      if (enrollment.status === 'in_progress') return 'In Progress';
      if (enrollment.status === 'completed') return 'Completed';
      return enrollment.status;
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Enrollment System</h2>
            <p className="text-gray-600">Click on a service card below to enroll customers for DOST services in {province}</p>
         </div>

         {/* Service Options Overview */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(serviceOptions).map(([key, service]) => (
               <Card 
                  key={key} 
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleServiceCardClick(key)}
               >
                  <div className="text-center">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold text-lg">{key}</span>
                     </div>
                     <h3 className="font-semibold text-gray-900 mb-1">{key}</h3>
                     <p className="text-sm text-gray-600 mb-2">{service.name}</p>
                     <div className="text-xs text-gray-500">
                        Click to enroll customer
                     </div>
                  </div>
               </Card>
            ))}
         </div>

         {/* Active Enrollments */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-semibold text-gray-900">Active Enrollments</h3>
               <Button 
                  onClick={loadEnrollments} 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
               >
                  {loading ? 'Loading...' : 'Refresh'}
               </Button>
            </div>
            
            {error && (
               <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{error}</p>
               </div>
            )}
            
            {loading && enrollments.length === 0 ? (
               <Card className="p-8 text-center">
                  <p className="text-gray-500">Loading enrollments...</p>
               </Card>
            ) : enrollments.length === 0 ? (
               <Card className="p-8 text-center">
                  <p className="text-gray-500">No active enrollments. Enroll a customer to get started.</p>
               </Card>
            ) : (
               <div className="space-y-4">
                  {enrollments.map(enrollment => (
                     <Card key={enrollment._id || enrollment.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                 {enrollment.customer.name}
                              </h4>
                              <p className="text-sm text-gray-600">{enrollment.customer.businessName}</p>
                              <p className="text-sm text-gray-500">{enrollment.serviceData.name}</p>
                           </div>
                           <div className="text-right">
                              <Badge variant={getStatusBadgeVariant(enrollment.status, enrollment.tnaStatus)}>
                                 {getStatusText(enrollment)}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                 Enrolled: {new Date(enrollment.enrolledDate).toLocaleDateString()}
                              </p>
                              {enrollment.tnaStatus === 'rejected' && enrollment.reviewNotes && (
                                 <p className="text-xs text-red-600 mt-1">
                                    Rejection reason: {enrollment.reviewNotes}
                                 </p>
                              )}
                           </div>
                        </div>

                        {/* Service Stages Progress */}
                        <div className="space-y-3">
                           <h5 className="font-medium text-gray-900">Service Progress</h5>
                           <div className="space-y-2">
                              {enrollment.stages.map((stage) => {
                                 const status = getStageStatus(stage, enrollment);
                                 const canAccess = canAccessStage(enrollment, stage.id);
                                 const isDisabled = !canAccess && status !== 'completed';
                                 
                                 return (
                                    <div key={stage.id} className="flex items-center space-x-3">
                                       <div className={`w-6 h-6 rounded-full ${getStageColor(status)} flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}>
                                          {status === 'completed' && (
                                             <span className="text-white text-xs">✓</span>
                                          )}
                                          {isDisabled && status !== 'completed' && (
                                             <span className="text-gray-400 text-xs">🔒</span>
                                          )}
                                       </div>
                                       <div className="flex-1">
                                          <p className={`text-sm ${status === 'current' ? 'font-medium text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                             {stage.name}
                                             {isDisabled && stage.id !== 'tna' && (
                                                <span className="text-xs text-gray-400 ml-2">(TNA approval required)</span>
                                             )}
                                          </p>
                                       </div>
                                       <div className="flex space-x-2">
                                          {status === 'current' && canAccess && (
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateStageStatus(enrollment._id || enrollment.id, stage.id, true)}
                                                disabled={loading}
                                             >
                                                {loading ? 'Updating...' : 'Mark Complete'}
                                             </Button>
                                          )}
                                          {stage.id === 'tna' && enrollment.status === 'draft' && (
                                             <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => {
                                                   setSelectedEnrollment(enrollment);
                                                   setShowTnaModal(true);
                                                }}
                                             >
                                                Complete TNA
                                             </Button>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            )}
         </div>

         {/* Enrollment Modal */}
         <Modal
            isOpen={showEnrollmentModal}
            onClose={() => setShowEnrollmentModal(false)}
            title="Enroll New Customer"
         >
            <div className="space-y-4">
               {/* Service Selection */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Select Service *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                     {Object.entries(serviceOptions).map(([key, service]) => (
                        <button
                           key={key}
                           onClick={() => setSelectedService(key)}
                           className={`p-3 border rounded-lg text-left transition-colors ${
                              selectedService === key
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-300 hover:border-gray-400'
                           }`}
                        >
                           <div className="font-medium text-gray-900">{key}</div>
                           <div className="text-sm text-gray-600">{service.name}</div>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Customer Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                     </label>
                     <Input
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter customer name"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                     </label>
                     <Input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                     </label>
                     <Input
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                     </label>
                     <Input
                        value={customerData.businessName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Enter business name"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type
                     </label>
                     <Input
                        value={customerData.businessType}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, businessType: e.target.value }))}
                        placeholder="Enter business type"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                     </label>
                     <Input
                        value={customerData.address}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                     />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-3 pt-4">
                  <Button
                     variant="outline"
                     onClick={() => setShowEnrollmentModal(false)}
                  >
                     Cancel
                  </Button>
                  <Button 
                     onClick={handleEnrollCustomer}
                     disabled={loading}
                  >
                     {loading ? 'Enrolling...' : 'Enroll Customer'}
                  </Button>
               </div>
            </div>
         </Modal>

         {/* TNA Enrollment Form Modal */}
         <TnaEnrollmentForm
            isOpen={showTnaModal}
            onClose={() => {
               setShowTnaModal(false);
               setSelectedEnrollment(null);
            }}
            enrollment={selectedEnrollment}
            onSuccess={handleTnaFormSuccess}
            province={province}
         />
      </div>
   );
};

export default EnrollmentSystem;
