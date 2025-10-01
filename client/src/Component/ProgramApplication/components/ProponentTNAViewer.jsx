import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '../../UI';

const ProponentTNAViewer = ({ application }) => {
   const [tnaData, setTnaData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [showTNAModal, setShowTNAModal] = useState(false);

   // Fetch TNA data for this application
   useEffect(() => {
      if (application && (application.status === 'psto_approved' || 
                         application.status === 'tna_scheduled' || 
                         application.status === 'tna_completed' || 
                         application.status === 'tna_report_submitted' ||
                         application.status === 'dost_mimaropa_approved' ||
                         application.status === 'dost_mimaropa_rejected' ||
                         application.status === 'rd_signed')) {
         fetchTNAData();
      }
   }, [application]);

   const fetchTNAData = async () => {
      try {
         setLoading(true);
         setError(null);

         console.log('ProponentTNAViewer: Fetching TNA data for application:', application._id, 'Status:', application.status);

         const token = localStorage.getItem('authToken');
         if (!token) {
            setError('Authentication required');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/list?applicationId=${application._id}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            console.log('ProponentTNAViewer: TNA API response:', data);
            if (data.success && data.tnas && data.tnas.length > 0) {
               console.log('ProponentTNAViewer: Found TNA data:', data.tnas[0]);
               setTnaData(data.tnas[0]); // Get the first TNA for this application
            } else {
               console.log('ProponentTNAViewer: No TNA data found for application');
            }
         } else {
            console.error('ProponentTNAViewer: Failed to fetch TNA data, status:', response.status);
            setError('Failed to fetch TNA data');
         }
      } catch (error) {
         console.error('Error fetching TNA data:', error);
         setError('Error fetching TNA data');
      } finally {
         setLoading(false);
      }
   };

   const downloadTNAReport = async (tnaId) => {
      try {
         const token = localStorage.getItem('authToken');
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-report`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tna-report-${tnaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
         } else {
            alert('Error downloading TNA report');
         }
      } catch (error) {
         console.error('Error downloading TNA report:', error);
         alert('Error downloading TNA report');
      }
   };

   const downloadSignedTNAReport = async (tnaId) => {
      try {
         const token = localStorage.getItem('authToken');
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-signed-report`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `signed-tna-report-${tnaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
         } else {
            alert('Error downloading signed TNA report');
         }
      } catch (error) {
         console.error('Error downloading signed TNA report:', error);
         alert('Error downloading signed TNA report');
      }
   };

   const getStatusColor = (status) => {
      const statusColors = {
         'pending': 'yellow',
         'scheduled': 'blue',
         'in_progress': 'orange',
         'completed': 'green',
         'report_uploaded': 'blue',
         'forwarded_to_dost_mimaropa': 'purple',
         'dost_mimaropa_approved': 'green',
         'dost_mimaropa_rejected': 'red',
         'returned_to_psto': 'orange',
         'signed_by_rd': 'emerald',
         'cancelled': 'red'
      };
      return statusColors[status] || 'gray';
   };

   const getStatusLabel = (status) => {
      const statusLabels = {
         'pending': 'Pending',
         'scheduled': 'Scheduled',
         'in_progress': 'In Progress',
         'completed': 'Completed',
         'report_uploaded': 'Report Uploaded',
         'forwarded_to_dost_mimaropa': 'Forwarded to DOST',
         'dost_mimaropa_approved': 'Approved by DOST',
         'dost_mimaropa_rejected': 'Rejected by DOST',
         'returned_to_psto': 'Returned to PSTO',
         'signed_by_rd': 'Signed by RD',
         'cancelled': 'Cancelled'
      };
      return statusLabels[status] || 'Unknown';
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   // Don't show TNA viewer if no TNA data or application is not in a TNA-related status
   const tnaRelatedStatuses = ['psto_approved', 'tna_scheduled', 'tna_completed', 'tna_report_submitted', 
                              'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rd_signed'];
   
   if (!tnaRelatedStatuses.includes(application.status) || !tnaData) {
      return null;
   }

   if (loading) {
      return (
         <Card className="p-4">
            <div className="flex items-center justify-center">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
               <span className="ml-2 text-sm text-gray-600">Loading TNA information...</span>
            </div>
         </Card>
      );
   }

   if (error) {
      return (
         <Card className="p-4">
            <div className="text-center text-red-600">
               <p className="text-sm">Error loading TNA information: {error}</p>
            </div>
         </Card>
      );
   }

   return (
      <Card className="p-4">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TNA Assessment</h3>
            <Badge color={getStatusColor(tnaData.status)}>
               {getStatusLabel(tnaData.status)}
            </Badge>
         </div>

         <div className="space-y-3">
            {/* TNA Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <p className="text-sm font-medium text-gray-700">TNA ID</p>
                  <p className="text-sm text-gray-900">{tnaData.tnaId || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                  <p className="text-sm text-gray-900">{formatDate(tnaData.scheduledDate)}</p>
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-900">{tnaData.location || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-sm font-medium text-gray-700">Assessment Team</p>
                  <p className="text-sm text-gray-900">{tnaData.assessmentTeam?.length || 0} members</p>
               </div>
            </div>

            {/* TNA Report Section */}
            {tnaData.tnaReport && (
               <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                           <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-blue-800">TNA Report Available</p>
                           <p className="text-xs text-blue-600">{tnaData.tnaReport.originalName}</p>
                        </div>
                     </div>
                     <Button
                        onClick={() => downloadTNAReport(tnaData._id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors duration-200"
                     >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                     </Button>
                  </div>
               </div>
            )}

            {/* Signed TNA Report Section */}
            {tnaData.signedTnaReport && (
               <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                           <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                           </svg>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-emerald-800">Signed TNA Report (RD Signature)</p>
                           <p className="text-xs text-emerald-600">{tnaData.signedTnaReport.originalName}</p>
                           {tnaData.rdSignedAt && (
                              <p className="text-xs text-emerald-500">
                                 Signed: {formatDate(tnaData.rdSignedAt)}
                              </p>
                           )}
                        </div>
                     </div>
                     <Button
                        onClick={() => downloadSignedTNAReport(tnaData._id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors duration-200"
                     >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Signed
                     </Button>
                  </div>
               </div>
            )}

            {/* View Details Button */}
            <div className="mt-4">
               <Button
                  onClick={() => setShowTNAModal(true)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
               >
                  View TNA Details
               </Button>
            </div>
         </div>

         {/* TNA Details Modal */}
         {showTNAModal && (
            <Modal
               isOpen={showTNAModal}
               onClose={() => setShowTNAModal(false)}
               size="xl"
            >
               <Modal.Header>
                  <Modal.Title>TNA Assessment Details</Modal.Title>
               </Modal.Header>
               <Modal.Content>
                  <div className="space-y-6">
                     {/* TNA Overview */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm font-medium text-gray-700">TNA ID</p>
                           <p className="text-sm text-gray-900">{tnaData.tnaId || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-700">Status</p>
                           <Badge color={getStatusColor(tnaData.status)}>
                              {getStatusLabel(tnaData.status)}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                           <p className="text-sm text-gray-900">{formatDate(tnaData.scheduledDate)}</p>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-700">Location</p>
                           <p className="text-sm text-gray-900">{tnaData.location || 'N/A'}</p>
                        </div>
                     </div>

                     {/* Assessment Team */}
                     {tnaData.assessmentTeam && tnaData.assessmentTeam.length > 0 && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Team</h4>
                           <div className="space-y-2">
                              {tnaData.assessmentTeam.map((member, index) => (
                                 <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                       <span className="text-blue-600 text-sm font-medium">
                                          {member.name?.charAt(0) || 'A'}
                                       </span>
                                    </div>
                                    <div>
                                       <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                       <p className="text-xs text-gray-600">{member.position} - {member.department}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Report Summary */}
                     {tnaData.reportSummary && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Report Summary</h4>
                           <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                              {tnaData.reportSummary}
                           </p>
                        </div>
                     )}

                     {/* Recommendations */}
                     {tnaData.recommendations && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                           <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                              {tnaData.recommendations}
                           </p>
                        </div>
                     )}

                     {/* Technology Gaps */}
                     {tnaData.technologyGaps && tnaData.technologyGaps.length > 0 && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Technology Gaps</h4>
                           <div className="space-y-2">
                              {tnaData.technologyGaps.map((gap, index) => (
                                 <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <span className="text-sm text-gray-900">{gap.description}</span>
                                    <Badge color={gap.priority === 'high' ? 'red' : gap.priority === 'medium' ? 'yellow' : 'green'}>
                                       {gap.priority}
                                    </Badge>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Technology Recommendations */}
                     {tnaData.technologyRecommendations && tnaData.technologyRecommendations.length > 0 && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Technology Recommendations</h4>
                           <div className="space-y-2">
                              {tnaData.technologyRecommendations.map((rec, index) => (
                                 <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                    <span className="text-sm text-gray-900">{rec.description}</span>
                                    <Badge color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}>
                                       {rec.priority}
                                    </Badge>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Additional Notes */}
                     {tnaData.additionalNotes && (
                        <div>
                           <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                           <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                              {tnaData.additionalNotes}
                           </p>
                        </div>
                     )}
                  </div>
               </Modal.Content>
               <Modal.Footer>
                  <Button
                     onClick={() => setShowTNAModal(false)}
                     className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                     Close
                  </Button>
               </Modal.Footer>
            </Modal>
         )}
      </Card>
   );
};

export default ProponentTNAViewer;
