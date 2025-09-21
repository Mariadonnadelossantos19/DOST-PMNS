import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../../../config/api';

const useApplicationEdit = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState(null);

   const updateApplication = useCallback(async (applicationId, formData) => {
      try {
         setIsSubmitting(true);
         setError(null);
         
         const token = localStorage.getItem('authToken');
         if (!token) {
            throw new Error('Please login first');
         }

         const url = API_ENDPOINTS.SETUP_APPLICATION(applicationId);
         console.log('Updating application with URL:', url);
         const response = await fetch(url, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
         });

         if (!response.ok) {
            throw new Error(`Failed to update application: ${response.status} ${response.statusText}`);
         }

         const data = await response.json();
         console.log('Application updated successfully:', data);
         return data;
      } catch (err) {
         console.error('Error updating application:', err);
         setError(err.message);
         throw err;
      } finally {
         setIsSubmitting(false);
      }
   }, []);

   const uploadDocuments = useCallback(async (applicationId, files) => {
      try {
         setIsSubmitting(true);
         setError(null);
         
         const token = localStorage.getItem('authToken');
         if (!token) {
            throw new Error('Please login first');
         }

         const formData = new FormData();
         Object.entries(files).forEach(([field, file]) => {
            if (file) {
               formData.append(field, file);
            }
         });

         const response = await fetch(API_ENDPOINTS.SETUP_APPLICATION_DOCUMENTS(applicationId), {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: formData
         });

         if (!response.ok) {
            throw new Error(`Failed to upload documents: ${response.status} ${response.statusText}`);
         }

         const data = await response.json();
         console.log('Documents uploaded successfully:', data);
         return data;
      } catch (err) {
         console.error('Error uploading documents:', err);
         setError(err.message);
         throw err;
      } finally {
         setIsSubmitting(false);
      }
   }, []);

   const resubmitApplication = useCallback(async (applicationId, formData, files) => {
      try {
         setIsSubmitting(true);
         setError(null);
         
         const token = localStorage.getItem('authToken');
         if (!token) {
            throw new Error('Please login first');
         }

         // First update the application data
         const updateResult = await updateApplication(applicationId, formData);
         
         // Then upload any new documents
         if (files && Object.keys(files).length > 0) {
            await uploadDocuments(applicationId, files);
         }

         // Check if resubmit is needed based on current status
         if (updateResult.data && updateResult.data.pstoStatus === 'returned') {
            // Only resubmit if the application is in 'returned' status
            const resubmitUrl = API_ENDPOINTS.SETUP_APPLICATION_RESUBMIT(applicationId);
            console.log('Resubmitting application with URL:', resubmitUrl);
            const response = await fetch(resubmitUrl, {
               method: 'POST',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            });

            if (!response.ok) {
               throw new Error(`Failed to resubmit application: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Application resubmitted successfully:', data);
            return data;
         } else {
            // Application is already in correct status, no resubmit needed
            console.log('Application updated successfully, no resubmit needed');
            return updateResult;
         }
      } catch (err) {
         console.error('Error resubmitting application:', err);
         setError(err.message);
         throw err;
      } finally {
         setIsSubmitting(false);
      }
   }, [updateApplication, uploadDocuments]);

   return {
      isSubmitting,
      error,
      updateApplication,
      uploadDocuments,
      resubmitApplication
   };
};

export default useApplicationEdit;
