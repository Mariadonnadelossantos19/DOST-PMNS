import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../../config/api';

export const useDostMimaropaApplications = () => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');

   // Helper functions
   const getStatusColor = (status, isDarkMode = false) => {
      switch (status) {
         case 'approved': return isDarkMode ? 'bg-green-900/90 text-green-200 border border-green-700/60' : 'bg-green-50 text-green-800 border border-green-200';
         case 'rejected': return isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700/60' : 'bg-red-50 text-red-800 border border-red-200';
         case 'returned': return isDarkMode ? 'bg-yellow-900/90 text-yellow-200 border border-yellow-700/60' : 'bg-yellow-50 text-yellow-800 border border-yellow-200';
         case 'pending': return isDarkMode ? 'bg-blue-900/90 text-blue-200 border border-blue-700/60' : 'bg-blue-50 text-blue-800 border border-blue-200';
         default: return isDarkMode ? 'bg-gray-900/90 text-gray-200 border border-gray-700/60' : 'bg-gray-50 text-gray-800 border border-gray-200';
      }
   };

   const formatDate = useCallback((dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   }, []);

   // Fetch applications for DOST MIMAROPA review
   const fetchApplications = useCallback(async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            setError('Please login first');
            return;
         }

         const response = await fetch(API_ENDPOINTS.DOST_MIMAROPA_APPLICATIONS, {
            headers: { 'Authorization': `Bearer ${token}` }
         });

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         
         if (result.success) {
            setApplications(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch applications');
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   }, []);

   // Review application
   const reviewApplication = useCallback(async (applicationId) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`/api/programs/dost-mimaropa/applications/${applicationId}/review`, {
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

         const result = await response.json();
         
         if (result.success) {
            alert('Application reviewed successfully!');
            setSelectedApplication(null);
            setReviewStatus('');
            setReviewComments('');
            fetchApplications();
         } else {
            throw new Error(result.message || 'Failed to review application');
         }
      } catch (error) {
         console.error('Error reviewing application:', error);
         alert('Error reviewing application: ' + error.message);
      }
   }, [reviewStatus, reviewComments, fetchApplications]);

   // Reset form when modal closes
   const closeModal = useCallback(() => {
      setSelectedApplication(null);
      setReviewStatus('');
      setReviewComments('');
   }, []);

   // Effects
   useEffect(() => {
      fetchApplications();
   }, [fetchApplications]);

   return {
      applications,
      loading,
      error,
      selectedApplication,
      reviewStatus,
      reviewComments,
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
