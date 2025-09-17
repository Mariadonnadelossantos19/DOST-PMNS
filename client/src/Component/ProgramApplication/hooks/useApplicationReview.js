import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';

export const useApplicationReview = () => {
   const [applications, setApplications] = useState([]);
   const [applicationsLoading, setApplicationsLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [_error, setError] = useState(null);

   // Helper functions
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

   // Fetch applications for PSTO review
   const fetchApplications = async () => {
      try {
         setApplicationsLoading(true);
         setError(null);
         const token = localStorage.getItem('authToken');
         
         console.log('Fetching PSTO applications...');
         console.log('API Endpoint:', API_ENDPOINTS.PSTO_APPLICATIONS);
         console.log('Token:', token ? 'Present' : 'Missing');
         
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

         console.log('Response status:', response.status);
         console.log('Response ok:', response.ok);

         if (!response.ok) {
            if (response.status === 403) {
               setError('Access denied. PSTO role required.');
               return;
            }
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
         }

         const data = await response.json();
         console.log('Applications response:', data);
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

   // Reset form when modal closes
   const closeModal = () => {
      setSelectedApplication(null);
      setReviewStatus('');
      setReviewComments('');
   };

   useEffect(() => {
      fetchApplications();
   }, []);

   return {
      applications,
      applicationsLoading,
      selectedApplication,
      reviewStatus,
      reviewComments,
      _error,
      setSelectedApplication,
      setReviewStatus,
      setReviewComments,
      fetchApplications,
      reviewApplication,
      closeModal,
      getStatusColor,
      formatDate
   };
};
