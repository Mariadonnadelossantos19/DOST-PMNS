import React, { useState } from 'react';
import { Card, Button, Input, Modal } from '../UI';
import axios from 'axios';

const TnaEnrollmentForm = ({ 
   isOpen, 
   onClose, 
   enrollment, 
   onSuccess,
   province 
}) => {
   const [formData, setFormData] = useState({
      affiliation: '',
      otherAffiliation: '',
      contactPerson: '',
      position: '',
      officeAddress: '',
      contactNumber: '',
      emailAddress: '',
      letterOfIntent: null,
      dostTnaForm: null,
      enterpriseProfile: null
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const API_BASE_URL = 'http://localhost:4000/api';

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleFileChange = (e) => {
      const { name, files } = e.target;
      if (files && files[0]) {
         setFormData(prev => ({
            ...prev,
            [name]: files[0]
         }));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.affiliation || !formData.contactPerson || !formData.position || 
          !formData.officeAddress || !formData.contactNumber || !formData.emailAddress) {
         setError('Please fill in all required fields');
         return;
      }

      if (formData.affiliation === 'Other' && !formData.otherAffiliation) {
         setError('Please specify other affiliation');
         return;
      }

      setLoading(true);
      setError(null);

      try {
         // Prepare form data for file upload
         const submitData = new FormData();
         submitData.append('tnaInfo', JSON.stringify({
            affiliation: formData.affiliation,
            otherAffiliation: formData.otherAffiliation,
            contactPerson: formData.contactPerson,
            position: formData.position,
            officeAddress: formData.officeAddress,
            contactNumber: formData.contactNumber,
            emailAddress: formData.emailAddress
         }));

         if (formData.letterOfIntent) {
            submitData.append('letterOfIntent', formData.letterOfIntent);
         }
         if (formData.dostTnaForm) {
            submitData.append('dostTnaForm', formData.dostTnaForm);
         }
         if (formData.enterpriseProfile) {
            submitData.append('enterpriseProfile', formData.enterpriseProfile);
         }

         const response = await axios.post(
            `${API_BASE_URL}/enrollments/${enrollment._id}/submit-tna`,
            submitData,
            {
               headers: {
                  'Content-Type': 'multipart/form-data'
               }
            }
         );

         if (response.data.success) {
            onSuccess(response.data.enrollment);
            onClose();
         } else {
            throw new Error(response.data.message || 'Failed to submit TNA enrollment');
         }
      } catch (error) {
         console.error('Error submitting TNA enrollment:', error);
         setError(error.response?.data?.message || error.message || 'Failed to submit TNA enrollment');
      } finally {
         setLoading(false);
      }
   };

   const handleSaveDraft = async () => {
      setLoading(true);
      setError(null);

      try {
         const response = await axios.put(`${API_BASE_URL}/enrollments/${enrollment._id}`, {
            tnaInfo: {
               affiliation: formData.affiliation,
               otherAffiliation: formData.otherAffiliation,
               contactPerson: formData.contactPerson,
               position: formData.position,
               officeAddress: formData.officeAddress,
               contactNumber: formData.contactNumber,
               emailAddress: formData.emailAddress
            }
         });

         if (response.data.success) {
            onSuccess(response.data.enrollment);
            onClose();
         } else {
            throw new Error(response.data.message || 'Failed to save draft');
         }
      } catch (error) {
         console.error('Error saving draft:', error);
         setError(error.response?.data?.message || error.message || 'Failed to save draft');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         title="TNA Enrollment Form"
         size="lg"
      >
         <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
               <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{error}</p>
               </div>
            )}

            {/* Part 1: Basic Information */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Part 1: Basic Information</h3>
               
               {/* Affiliation */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Affiliation *
                  </label>
                  <select
                     name="affiliation"
                     value={formData.affiliation}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  >
                     <option value="">Select Affiliation</option>
                     <option value="MSME">MSME (Micro, Small, & Medium Enterprises)</option>
                     <option value="LGU">LGU (Local Government Unit)</option>
                     <option value="SUC">SUC (State University/College)</option>
                     <option value="Cooperative">Cooperative</option>
                     <option value="NGO">NGO (Nongovernmental Organization)</option>
                     <option value="Other">Other</option>
                  </select>
               </div>

               {/* Other Affiliation */}
               {formData.affiliation === 'Other' && (
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please Specify *
                     </label>
                     <Input
                        name="otherAffiliation"
                        value={formData.otherAffiliation}
                        onChange={handleInputChange}
                        placeholder="Please specify other affiliation"
                        required
                     />
                  </div>
               )}

               {/* Contact Person */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Person *
                  </label>
                  <Input
                     name="contactPerson"
                     value={formData.contactPerson}
                     onChange={handleInputChange}
                     placeholder="Enter contact person name"
                     required
                  />
               </div>

               {/* Position */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Position *
                  </label>
                  <Input
                     name="position"
                     value={formData.position}
                     onChange={handleInputChange}
                     placeholder="Enter position"
                     required
                  />
               </div>

               {/* Office Address */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Office Address *
                  </label>
                  <textarea
                     name="officeAddress"
                     value={formData.officeAddress}
                     onChange={handleInputChange}
                     placeholder="Enter office address"
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                  />
               </div>

               {/* Contact Number */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Number *
                  </label>
                  <Input
                     name="contactNumber"
                     value={formData.contactNumber}
                     onChange={handleInputChange}
                     placeholder="Enter contact number"
                     required
                  />
               </div>

               {/* Email Address */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     E-mail Address *
                  </label>
                  <Input
                     type="email"
                     name="emailAddress"
                     value={formData.emailAddress}
                     onChange={handleInputChange}
                     placeholder="Enter email address"
                     required
                  />
               </div>
            </div>

            {/* Part 2: Document Requirements */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Part 2: Document Requirements</h3>
               
               {/* Letter of Intent */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Letter of Intent (LOI) and/or Board Resolution
                  </label>
                  <input
                     type="file"
                     name="letterOfIntent"
                     onChange={handleFileChange}
                     accept=".pdf,.doc,.docx"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                     PDF, DOC, or DOCX files only
                  </p>
               </div>

               {/* DOST TNA Form */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     DOST TNA Form 01
                  </label>
                  <input
                     type="file"
                     name="dostTnaForm"
                     onChange={handleFileChange}
                     accept=".pdf,.doc,.docx"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                     PDF, DOC, or DOCX files only
                  </p>
               </div>

               {/* Enterprise Profile */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Enterprise Profile
                  </label>
                  <input
                     type="file"
                     name="enterpriseProfile"
                     onChange={handleFileChange}
                     accept=".pdf,.doc,.docx"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                     PDF, DOC, or DOCX files only
                  </p>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
               <div className="flex space-x-3">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={handleSaveDraft}
                     disabled={loading}
                  >
                     {loading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onClose}
                  >
                     Cancel
                  </Button>
               </div>
               <Button
                  type="submit"
                  disabled={loading}
               >
                  {loading ? 'Submitting...' : 'Submit for Review'}
               </Button>
            </div>
         </form>
      </Modal>
   );
};

export default TnaEnrollmentForm;
