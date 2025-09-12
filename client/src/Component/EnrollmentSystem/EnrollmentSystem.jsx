import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../UI';
import TnaEnrollmentForm from './TnaEnrollmentForm';
import EnrollmentCard from './EnrollmentCard';
import CustomerDetailsModal from './CustomerDetailsModal';
import EnrollmentFormModal from './EnrollmentFormModal';
import ServiceCards from './ServiceCards';
import { useDarkMode } from '../Context';
import { serviceOptions } from './utils/enrollmentHelpers.jsx';
import axios from 'axios';

const EnrollmentSystem = ({ province, onEnroll }) => {
   const { isDarkMode } = useDarkMode();
   
   // Modal states
   const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
   const [showTnaModal, setShowTnaModal] = useState(false);
   const [showDetailsModal, setShowDetailsModal] = useState(false);
   
   // Form states
   const [selectedService, setSelectedService] = useState('');
   const [selectedEnrollment, setSelectedEnrollment] = useState(null);
   const [customerData, setCustomerData] = useState({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      businessType: '',
      address: '',
      province: province
   });
   
   // Data states
   const [enrollments, setEnrollments] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const API_BASE_URL = 'http://localhost:4000/api';

   // Load enrollments
   const loadEnrollments = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
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
   }, [province]);

   useEffect(() => {
      loadEnrollments();
   }, [loadEnrollments]);

   // Event handlers
   const handleServiceCardClick = (serviceKey) => {
      setSelectedService(serviceKey);
      setShowEnrollmentModal(true);
   };

   const handleViewDetails = (enrollment) => {
      setSelectedEnrollment(enrollment);
      setShowDetailsModal(true);
   };

   const handleMarkComplete = async (enrollmentId, stageId) => {
      try {
         setLoading(true);
         await axios.put(`${API_BASE_URL}/enrollments/${enrollmentId}/stages/${stageId}`, {
            completed: true
         });
         await loadEnrollments();
      } catch (error) {
         console.error('Error updating stage:', error);
         setError('Failed to update stage');
      } finally {
         setLoading(false);
      }
   };

   const handleCompleteTna = (enrollment) => {
      setSelectedEnrollment(enrollment);
      setShowTnaModal(true);
   };

   const handleEnrollCustomer = async () => {
      try {
         if (!selectedService || !customerData.name || !customerData.email) {
            alert('Please fill in all required fields');
            return;
         }

         setLoading(true);
         setError(null);

         const enrollmentData = {
            customer: customerData,
            service: selectedService,
            serviceData: serviceOptions[selectedService],
            province: province,
            enrolledBy: null,
            notes: '',
            tnaInfo: null
         };

         const response = await axios.post(`${API_BASE_URL}/enrollments/create`, enrollmentData);
         
         if (response.data.success) {
            const newEnrollment = response.data.enrollment;
            setEnrollments(prev => [...prev, newEnrollment]);
            
            setShowEnrollmentModal(false);
            setCustomerData({
               name: '',
               email: '',
               phone: '',
               businessName: '',
               businessType: '',
               address: '',
               province: province
            });
            setSelectedService('');

            setSelectedEnrollment(newEnrollment);
            setShowTnaModal(true);
         }
      } catch (error) {
         console.error('Error enrolling customer:', error);
         setError('Failed to enroll customer');
      } finally {
         setLoading(false);
      }
   };

   const handleTnaFormSuccess = () => {
      loadEnrollments();
      setShowTnaModal(false);
      setSelectedEnrollment(null);
   };

   const handleCustomerDataChange = (field, value) => {
      setCustomerData(prev => ({
         ...prev,
         [field]: value
      }));
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="mb-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
               isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Customer Enrollment System</h2>
            <p className={`transition-colors duration-300 ${
               isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Click on a service card below to enroll customers for DOST services in {province}</p>
         </div>

         {/* Service Options Overview */}
         <ServiceCards onServiceClick={handleServiceCardClick} />

         {/* Active Enrollments */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>Active Enrollments</h3>
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
               <div className={`border rounded-md p-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
               }`}>
                  <p className={`transition-colors duration-300 ${
                     isDarkMode ? 'text-red-300' : 'text-red-600'
                  }`}>{error}</p>
               </div>
            )}
            
            {loading && enrollments.length === 0 ? (
               <Card className="p-8 text-center">
                  <p className={`transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Loading enrollments...</p>
               </Card>
            ) : enrollments.length === 0 ? (
               <Card className="p-8 text-center">
                  <p className={`transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No active enrollments. Enroll a customer to get started.</p>
               </Card>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enrollments.map(enrollment => (
                     <EnrollmentCard
                        key={enrollment._id || enrollment.id}
                        enrollment={enrollment}
                        onViewDetails={handleViewDetails}
                        onMarkComplete={handleMarkComplete}
                        onCompleteTna={handleCompleteTna}
                        loading={loading}
                     />
                  ))}
               </div>
            )}
         </div>

         {/* Modals */}
         <EnrollmentFormModal
            isOpen={showEnrollmentModal}
            onClose={() => setShowEnrollmentModal(false)}
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
            customerData={customerData}
            onCustomerDataChange={handleCustomerDataChange}
            onSubmit={handleEnrollCustomer}
            loading={loading}
         />

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

         <CustomerDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            enrollment={selectedEnrollment}
         />
      </div>
   );
};

export default EnrollmentSystem;