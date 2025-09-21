import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Textarea, DataTable, StatusBadge } from '../../UI';
import PageLayout from '../../Layouts/PageLayout';

const DocumentValidation = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [showValidationModal, setShowValidationModal] = useState(false);
   const [validationComments, setValidationComments] = useState('');
   const [validationStatus, setValidationStatus] = useState('pending');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Fetch applications pending PSTO validation
   const fetchApplications = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setApplications(data.data || []);
         } else {
            const errorData = await response.json();
            setError(`Failed to fetch applications: ${errorData.message || 'Unknown error'}`);
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
         setError('Failed to fetch applications. Please check your connection and try again.');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchApplications();
   }, []);

   const handleValidateApplication = (application) => {
      setSelectedApplication(application);
      setValidationComments('');
      setValidationStatus('pending');
      setShowValidationModal(true);
   };

   const handleValidationSubmit = async () => {
      if (!selectedApplication) return;

      try {
         setLoading(true);
         const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${selectedApplication._id}/validate`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: validationStatus,
               comments: validationComments,
               validatedBy: currentUser.id,
               validatedAt: new Date().toISOString()
            })
         });

         if (response.ok) {
            alert(`Application ${validationStatus === 'approved' ? 'approved' : 'returned for revision'} successfully!`);
            setShowValidationModal(false);
            setSelectedApplication(null);
            fetchApplications(); // Refresh the list
         } else {
            const errorData = await response.json();
            alert(`Failed to validate application: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error validating application:', error);
         alert('Error validating application. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   // Define table columns for applications
   const applicationColumns = [
      {
         key: 'programName',
         header: 'Program',
         render: (value, row) => (
            <div>
               <div className="font-medium text-gray-900">{value} Application</div>
               <div className="text-sm text-gray-500">Enterprise: {row.enterpriseName}</div>
            </div>
         )
      },
      {
         key: 'proponentId',
         header: 'Proponent',
         render: (value) => (
            <div>
               <div className="font-medium text-gray-900">{value?.firstName} {value?.lastName}</div>
               <div className="text-sm text-gray-500">{value?.email}</div>
            </div>
         )
      },
      {
         key: 'status',
         header: 'Status',
         render: (value) => <StatusBadge status={value} />
      },
      {
         key: 'createdAt',
         header: 'Submitted',
         render: (value) => new Date(value).toLocaleDateString()
      }
   ];

   const getApplicationActions = (application) => (
      <div className="flex space-x-2">
         <Button
            onClick={() => handleValidateApplication(application)}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
         >
            Review & Validate
         </Button>
         {application.status === 'psto_approved' && (
            <Button
               variant="outline"
               size="sm"
               onClick={() => {
                  window.location.hash = '#tna-management';
               }}
            >
               Schedule TNA
            </Button>
         )}
      </div>
   );

   const downloadDocument = async (applicationId, fileType) => {
      try {
         const response = await fetch(`http://localhost:4000/api/programs/psto/applications/${applicationId}/download/${fileType}`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileType}_${applicationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
         } else {
            alert('Error downloading document');
         }
      } catch (error) {
         console.error('Error downloading document:', error);
         alert('Error downloading document');
      }
   };

   return (
      <PageLayout
         title="Document Validation"
         subtitle="Review and validate submitted application documents"
         actions={
            <Button onClick={fetchApplications}>
               Refresh
            </Button>
         }
         loading={loading}
         error={error}
      >
         <DataTable
            data={applications}
            columns={applicationColumns}
            actions={getApplicationActions}
            emptyMessage="No applications to review. All applications have been processed or no new applications are available."
         />

         {/* Validation Modal */}
         {showValidationModal && selectedApplication && (
            <Modal
               isOpen={showValidationModal}
               onClose={() => {
                  setShowValidationModal(false);
                  setSelectedApplication(null);
               }}
               title="Application Details & Document Validation"
               size="large"
            >
               <div className="space-y-6">
                  {/* Application Header */}
                  <div className="border-b pb-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-xl font-semibold text-gray-900">
                              {selectedApplication.programName} Application
                           </h3>
                           <p className="text-sm text-gray-600 mt-1">
                              Submitted: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <StatusBadge status={selectedApplication.status} />
                     </div>
                  </div>

                  {/* Proponent Information */}
                  <div>
                     <h4 className="text-lg font-medium text-gray-900 mb-3">Proponent Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Name</p>
                           <p className="text-sm text-gray-900">
                              {selectedApplication.proponentId?.firstName} {selectedApplication.proponentId?.lastName}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Email</p>
                           <p className="text-sm text-gray-900">{selectedApplication.proponentId?.email}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Province</p>
                           <p className="text-sm text-gray-900">{selectedApplication.proponentId?.province}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Phone</p>
                           <p className="text-sm text-gray-900">{selectedApplication.contactPersonTel || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Enterprise Information */}
                  <div>
                     <h4 className="text-lg font-medium text-gray-900 mb-3">Enterprise Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Enterprise Name</p>
                           <p className="text-sm text-gray-900">{selectedApplication.enterpriseName}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Business Type</p>
                           <p className="text-sm text-gray-900">{selectedApplication.businessType || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Person</p>
                           <p className="text-sm text-gray-900">{selectedApplication.contactPerson}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-600">Contact Email</p>
                           <p className="text-sm text-gray-900">{selectedApplication.contactPersonEmail}</p>
                        </div>
                     </div>
                  </div>

                  {/* Submitted Documents */}
                  <div>
                     <h4 className="text-lg font-medium text-gray-900 mb-3">Submitted Documents</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedApplication.letterOfIntent && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Letter of Intent</span>
                                 <p className="text-xs text-gray-500">Formal letter expressing interest</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'letterOfIntent')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}
                        
                        {selectedApplication.enterpriseProfile && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Enterprise Profile</span>
                                 <p className="text-xs text-gray-500">Comprehensive enterprise details</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'enterpriseProfile')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}

                        {selectedApplication.businessPlan && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Business Plan</span>
                                 <p className="text-xs text-gray-500">Detailed business plan with projections</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'businessPlan')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}

                        {selectedApplication.financialStatements && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Financial Statements</span>
                                 <p className="text-xs text-gray-500">Latest 2 years audited statements</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'financialStatements')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}

                        {selectedApplication.registrationDocuments && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Registration Documents</span>
                                 <p className="text-xs text-gray-500">SEC/DTI registration and permits</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'registrationDocuments')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}

                        {selectedApplication.generalAgreement?.signature && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Signature</span>
                                 <p className="text-xs text-gray-500">General agreement signature</p>
                              </div>
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => downloadDocument(selectedApplication._id, 'generalAgreement')}
                              >
                                 Download
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* PSTO Review Status */}
                  {selectedApplication.pstoStatus && (
                     <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Previous PSTO Review</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">Status</span>
                              <StatusBadge status={selectedApplication.pstoStatus} />
                           </div>
                           {selectedApplication.pstoComments && (
                              <div>
                                 <span className="text-sm font-medium text-gray-900">Comments</span>
                                 <p className="text-sm text-gray-700 mt-1">{selectedApplication.pstoComments}</p>
                              </div>
                           )}
                           {selectedApplication.validatedAt && (
                              <div className="mt-2">
                                 <span className="text-sm font-medium text-gray-900">Reviewed On</span>
                                 <p className="text-sm text-gray-700">
                                    {new Date(selectedApplication.validatedAt).toLocaleDateString()}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Validation Section */}
                  <div className="border-t pt-4">
                     <h4 className="text-lg font-medium text-gray-900 mb-3">Validation Decision</h4>


                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Validation Decision
                        </label>
                        <div className="space-y-2">
                           <label className="flex items-center">
                              <input
                                 type="radio"
                                 name="validationStatus"
                                 value="approved"
                                 checked={validationStatus === 'approved'}
                                 onChange={(e) => setValidationStatus(e.target.value)}
                                 className="mr-2"
                              />
                              <span className="text-sm">Approve - Documents are complete and valid</span>
                           </label>
                           <label className="flex items-center">
                              <input
                                 type="radio"
                                 name="validationStatus"
                                 value="returned"
                                 checked={validationStatus === 'returned'}
                                 onChange={(e) => setValidationStatus(e.target.value)}
                                 className="mr-2"
                              />
                              <span className="text-sm">Return for Revision - Documents need corrections</span>
                           </label>
                           <label className="flex items-center">
                              <input
                                 type="radio"
                                 name="validationStatus"
                                 value="rejected"
                                 checked={validationStatus === 'rejected'}
                                 onChange={(e) => setValidationStatus(e.target.value)}
                                 className="mr-2"
                              />
                              <span className="text-sm">Reject - Application does not meet requirements</span>
                           </label>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Comments
                        </label>
                        <Textarea
                           value={validationComments}
                           onChange={(e) => setValidationComments(e.target.value)}
                           placeholder="Provide detailed feedback on the documents..."
                           rows={4}
                        />
                     </div>

                     <div className="flex justify-end space-x-3 pt-4">
                        <Button
                           variant="outline"
                           onClick={() => {
                              setShowValidationModal(false);
                              setSelectedApplication(null);
                           }}
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={handleValidationSubmit}
                           disabled={loading || !validationStatus}
                           className="bg-blue-600 hover:bg-blue-700"
                        >
                           {loading ? 'Processing...' : 'Submit Validation'}
                        </Button>
                     </div>
                  </div>
               </div>
            </Modal>
         )}
      </PageLayout>
   );
};

export default DocumentValidation;
