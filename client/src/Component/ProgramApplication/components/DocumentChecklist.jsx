import React, { useState } from 'react';
import { Card, Button, Badge } from '../../UI';

const DocumentChecklist = ({ program, uploadedDocuments = {}, onDocumentUpload, onComplete }) => {
   const [uploading, setUploading] = useState({});
   const [errors, setErrors] = useState({});

   const handleFileUpload = async (requirement, file) => {
      if (!file) return;

      // Validate file type
      const allowedTypes = requirement.fileTypes.map(type => type.toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
         setErrors(prev => ({
            ...prev,
            [requirement.id]: `Invalid file type. Allowed: ${requirement.fileTypes.join(', ')}`
         }));
         return;
      }

      // Validate file size
      const maxSize = parseInt(requirement.maxSize) * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSize) {
         setErrors(prev => ({
            ...prev,
            [requirement.id]: `File too large. Maximum size: ${requirement.maxSize}`
         }));
         return;
      }

      setUploading(prev => ({ ...prev, [requirement.id]: true }));
      setErrors(prev => ({ ...prev, [requirement.id]: null }));

      try {
         await onDocumentUpload(requirement.id, file);
      } catch (error) {
         setErrors(prev => ({
            ...prev,
            [requirement.id]: 'Upload failed. Please try again.'
         }));
      } finally {
         setUploading(prev => ({ ...prev, [requirement.id]: false }));
      }
   };

   const handleFileChange = (requirement, event) => {
      const file = event.target.files[0];
      if (file) {
         handleFileUpload(requirement, file);
      }
   };

   const isAllRequiredUploaded = () => {
      return program.documentRequirements
         .filter(req => req.required)
         .every(req => uploadedDocuments[req.id]);
   };

   const getUploadStatus = (requirement) => {
      if (uploading[requirement.id]) return 'uploading';
      if (uploadedDocuments[requirement.id]) return 'uploaded';
      return 'pending';
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'uploaded': return 'green';
         case 'uploading': return 'yellow';
         case 'pending': return 'gray';
         default: return 'gray';
      }
   };

   const getStatusText = (status) => {
      switch (status) {
         case 'uploaded': return 'Uploaded';
         case 'uploading': return 'Uploading...';
         case 'pending': return 'Pending';
         default: return 'Pending';
      }
   };

   return (
      <div className="space-y-6">
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
               Document Requirements Checklist
            </h3>
            <p className="text-blue-700 text-sm">
               Please upload all required documents for your {program.name} application. 
               All documents must be in the specified format and size.
            </p>
         </div>

         <div className="grid gap-4">
            {program.documentRequirements.map((requirement) => {
               const status = getUploadStatus(requirement);
               const isUploaded = status === 'uploaded';
               const isUploading = status === 'uploading';

               return (
                  <Card key={requirement.id} className="p-4">
                     <div className="flex items-start justify-between">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                 {requirement.name}
                                 {requirement.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                 )}
                              </h4>
                              <Badge 
                                 color={getStatusColor(status)}
                                 size="sm"
                              >
                                 {getStatusText(status)}
                              </Badge>
                           </div>
                           
                           <p className="text-sm text-gray-600 mb-3">
                              {requirement.description}
                           </p>
                           
                           <div className="text-xs text-gray-500 space-y-1">
                              <p>Accepted formats: {requirement.fileTypes.join(', ')}</p>
                              <p>Maximum size: {requirement.maxSize}</p>
                           </div>

                           {errors[requirement.id] && (
                              <p className="text-red-500 text-sm mt-2">
                                 {errors[requirement.id]}
                              </p>
                           )}

                           {isUploaded && (
                              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                 <p className="text-sm text-green-700">
                                    ✓ {uploadedDocuments[requirement.id]?.originalName || 'File uploaded successfully'}
                                 </p>
                              </div>
                           )}
                        </div>

                        <div className="ml-4">
                           <input
                              type="file"
                              id={`file-${requirement.id}`}
                              accept={requirement.fileTypes.join(',')}
                              onChange={(e) => handleFileChange(requirement, e)}
                              disabled={isUploading}
                              className="hidden"
                           />
                           <label
                              htmlFor={`file-${requirement.id}`}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md cursor-pointer ${
                                 isUploading
                                    ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                                    : isUploaded
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                           >
                              {isUploading ? (
                                 <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                 </>
                              ) : isUploaded ? (
                                 'Change File'
                              ) : (
                                 'Upload File'
                              )}
                           </label>
                        </div>
                     </div>
                  </Card>
               );
            })}
         </div>

         <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
               {program.documentRequirements.filter(req => req.required).length} required documents
            </div>
            
            <Button
               onClick={onComplete}
               disabled={!isAllRequiredUploaded()}
               className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
               {isAllRequiredUploaded() ? 'Continue to Application' : 'Complete All Required Documents'}
            </Button>
         </div>
      </div>
   );
};

export default DocumentChecklist;
