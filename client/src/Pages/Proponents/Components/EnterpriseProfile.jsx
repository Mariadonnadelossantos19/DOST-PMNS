import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Alert, Modal } from '../../../Component/UI';

const EnterpriseProfile = () => {
   const [profileData, setProfileData] = useState({
      enterpriseName: '',
      contactPerson: '',
      officeAddress: '',
      factoryAddress: '',
      website: '',
      position: '',
      telephone: '',
      email: '',
      fax: ''
   });
   
   const [isEditing, setIsEditing] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [alert, setAlert] = useState({ show: false, type: '', message: '' });
   const [showEditModal, setShowEditModal] = useState(false);
   const [editFormData, setEditFormData] = useState({});

   // Load profile data on component mount
   useEffect(() => {
      loadProfileData();
   }, []);

   const loadProfileData = async () => {
      try {
         // Get user data from localStorage
         const userData = JSON.parse(localStorage.getItem('userData') || '{}');
         
         if (userData.proponentInfo) {
            setProfileData({
               enterpriseName: userData.proponentInfo.businessName || '',
               contactPerson: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
               officeAddress: userData.proponentInfo.address || '',
               factoryAddress: userData.proponentInfo.factoryAddress || '',
               website: userData.proponentInfo.website || '',
               position: userData.position || '',
               telephone: userData.proponentInfo.phone || '',
               email: userData.email || '',
               fax: userData.proponentInfo.fax || ''
            });
         }
      } catch (error) {
         console.error('Error loading profile data:', error);
      }
   };

   const handleEdit = () => {
      setEditFormData({ ...profileData });
      setShowEditModal(true);
   };

   const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleSave = async () => {
      setIsLoading(true);
      
      try {
         // Update profile data
         setProfileData(editFormData);
         setShowEditModal(false);
         setIsEditing(false);
         
         setAlert({
            show: true,
            type: 'success',
            message: 'Enterprise profile updated successfully!'
         });
         
         // Clear alert after 3 seconds
         setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
         }, 3000);
         
      } catch (error) {
         console.error('Error saving profile:', error);
         setAlert({
            show: true,
            type: 'error',
            message: 'Failed to update profile. Please try again.'
         });
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = () => {
      setShowEditModal(false);
      setEditFormData({});
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Enterprise Profile</h1>
               <p className="text-gray-600">Manage your enterprise information and contact details</p>
            </div>
            <Button
               onClick={handleEdit}
               className="bg-blue-600 hover:bg-blue-700"
            >
               Edit Profile
            </Button>
         </div>

         {/* Alert */}
         {alert.show && (
            <Alert 
               type={alert.type} 
               className="mb-6"
               onClose={() => setAlert({ show: false, type: '', message: '' })}
            >
               {alert.message}
            </Alert>
         )}

         {/* Profile Information */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enterprise Details */}
            <Card className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Details</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name of Enterprise
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.enterpriseName || 'Not specified'}
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.contactPerson || 'Not specified'}
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position in Enterprise
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.position || 'Not specified'}
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.website ? (
                           <a 
                              href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                           >
                              {profileData.website}
                           </a>
                        ) : 'Not specified'}
                     </div>
                  </div>
               </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.email || 'Not specified'}
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telephone Number
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.telephone || 'Not specified'}
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fax Number
                     </label>
                     <div className="p-3 bg-gray-50 rounded-md border">
                        {profileData.fax || 'Not specified'}
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* Address Information */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Office Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                     {profileData.officeAddress || 'Not specified'}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Factory Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                     {profileData.factoryAddress || 'Not specified'}
                  </div>
               </div>
            </div>
         </Card>

         {/* Edit Modal */}
         <Modal
            isOpen={showEditModal}
            onClose={handleCancel}
            title="Edit Enterprise Profile"
            size="lg"
         >
            <div className="space-y-4">
               {/* Enterprise Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                     label="Name of Enterprise"
                     name="enterpriseName"
                     value={editFormData.enterpriseName || ''}
                     onChange={handleEditChange}
                     placeholder="Enter enterprise name"
                  />
                  
                  <Input
                     label="Contact Person"
                     name="contactPerson"
                     value={editFormData.contactPerson || ''}
                     onChange={handleEditChange}
                     placeholder="Enter contact person name"
                  />
                  
                  <Input
                     label="Position in Enterprise"
                     name="position"
                     value={editFormData.position || ''}
                     onChange={handleEditChange}
                     placeholder="Enter your position"
                  />
                  
                  <Input
                     label="Website"
                     name="website"
                     value={editFormData.website || ''}
                     onChange={handleEditChange}
                     placeholder="Enter website URL"
                  />
               </div>

               {/* Contact Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                     label="Email Address"
                     name="email"
                     type="email"
                     value={editFormData.email || ''}
                     onChange={handleEditChange}
                     placeholder="Enter email address"
                  />
                  
                  <Input
                     label="Telephone Number"
                     name="telephone"
                     value={editFormData.telephone || ''}
                     onChange={handleEditChange}
                     placeholder="Enter telephone number"
                  />
                  
                  <Input
                     label="Fax Number"
                     name="fax"
                     value={editFormData.fax || ''}
                     onChange={handleEditChange}
                     placeholder="Enter fax number"
                  />
               </div>

               {/* Address Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Office Address
                     </label>
                     <textarea
                        name="officeAddress"
                        value={editFormData.officeAddress || ''}
                        onChange={handleEditChange}
                        placeholder="Enter office address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Factory Address
                     </label>
                     <textarea
                        name="factoryAddress"
                        value={editFormData.factoryAddress || ''}
                        onChange={handleEditChange}
                        placeholder="Enter factory address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
               </div>

               {/* Modal Actions */}
               <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                     onClick={handleCancel}
                     variant="outline"
                     disabled={isLoading}
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSave}
                     className="bg-blue-600 hover:bg-blue-700"
                     loading={isLoading}
                     disabled={isLoading}
                  >
                     {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default EnterpriseProfile;
