import { useState, useEffect } from 'react';

/**
 * Custom hook for PSTO data management
 * Centralizes all PSTO-related API calls and state management
 */
export const usePSTOData = (province) => {
   const [proponents, setProponents] = useState([]);
   const [pendingProponents, setPendingProponents] = useState([]);
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [pendingLoading, setPendingLoading] = useState(false);
   const [applicationsLoading, setApplicationsLoading] = useState(false);
   const [error, setError] = useState(null);

   // Fetch proponents for this PSTO
   const fetchProponents = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const response = await fetch(`http://localhost:4000/api/users/psto/${province}/proponents`, {
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

   // Fetch pending proponents for activation
   const fetchPendingProponents = async () => {
      try {
         setPendingLoading(true);
         const response = await fetch('http://localhost:4000/api/users/psto/pending-proponents', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });
         
         if (response.ok) {
            const data = await response.json();
            setPendingProponents(data.proponents || []);
         } else {
            console.error('Failed to load pending proponents');
         }
      } catch (err) {
         console.error('Error loading pending proponents:', err);
      } finally {
         setPendingLoading(false);
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

         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const data = await response.json();
            setApplications(data.applications || []);
         } else {
            console.error('Failed to load applications');
         }
      } catch (err) {
         console.error('Error loading applications:', err);
      } finally {
         setApplicationsLoading(false);
      }
   };

   // Activate proponent account
   const activateProponent = async (proponentId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/users/psto/activate-proponent/${proponentId}`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });
         
         if (response.ok) {
            const data = await response.json();
            // Refresh both lists
            fetchPendingProponents();
            fetchProponents();
            return { success: true, data };
         } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message };
         }
      } catch (err) {
         console.error('Error activating proponent:', err);
         return { success: false, error: err.message };
      }
   };

   // Review application
   const reviewApplication = async (applicationId, reviewData) => {
      try {
         const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${applicationId}/review`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
         });

         if (response.ok) {
            const data = await response.json();
            // Refresh applications list
            fetchApplications();
            return { success: true, data };
         } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message };
         }
      } catch (err) {
         console.error('Error reviewing application:', err);
         return { success: false, error: err.message };
      }
   };

   // Load all data on mount
   useEffect(() => {
      fetchProponents();
      fetchApplications();
      fetchPendingProponents();
   }, [province]);

   return {
      // Data
      proponents,
      pendingProponents,
      applications,
      
      // Loading states
      loading,
      pendingLoading,
      applicationsLoading,
      
      // Error state
      error,
      
      // Actions
      fetchProponents,
      fetchPendingProponents,
      fetchApplications,
      activateProponent,
      reviewApplication
   };
};
