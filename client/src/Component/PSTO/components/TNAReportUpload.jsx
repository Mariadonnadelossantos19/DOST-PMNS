import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Textarea } from '../../UI';

const TNAReportUpload = ({ currentUser }) => {
   const [tnas, setTnas] = useState([]);
   const [selectedTNA, setSelectedTNA] = useState(null);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [reportFile, setReportFile] = useState(null);
   const [reportSummary, setReportSummary] = useState('');
   const [recommendations, setRecommendations] = useState('');
   const [loading, setLoading] = useState(false);

   // Fetch TNAs that need report upload
   const fetchTNAs = async () => {
      try {
         setLoading(true);
         const response = await fetch('http://localhost:4000/api/tna/list', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setTnas(data.data || []);
         }
      } catch (error) {
         console.error('Error fetching TNAs:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTNAs();
   }, []);

   const handleUploadReport = (tna) => {
      setSelectedTNA(tna);
      setReportFile(null);
      setReportSummary('');
      setRecommendations('');
      setShowUploadModal(true);
   };

   const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         // Validate file type
         const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
         if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF or Word document');
            return;
         }
         
         // Validate file size (max 10MB)
         if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
         }
         
         setReportFile(file);
      }
   };

   const handleReportSubmit = async () => {
      if (!selectedTNA || !reportFile || !reportSummary.trim()) {
         alert('Please fill in all required fields and upload a report file');
         return;
      }

      try {
         setLoading(true);
         
         const formData = new FormData();
         formData.append('tnaId', selectedTNA._id);
         formData.append('reportFile', reportFile);
         formData.append('reportSummary', reportSummary);
         formData.append('recommendations', recommendations);
         formData.append('uploadedBy', currentUser.id);
         formData.append('uploadedAt', new Date().toISOString());

         const response = await fetch('http://localhost:4000/api/tna/upload-report', {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
         });

         if (response.ok) {
            alert('TNA report uploaded successfully!');
            setShowUploadModal(false);
            setSelectedTNA(null);
            fetchTNAs(); // Refresh the list
         } else {
            const errorData = await response.json();
            alert(`Failed to upload report: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error uploading report:', error);
         alert('Error uploading report. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const getStatusColor = (status) => {
      const colors = {
         'pending': 'yellow',
         'scheduled': 'blue',
         'in_progress': 'purple',
         'completed': 'green',
         'cancelled': 'red'
      };
      return colors[status] || 'gray';
   };

   const getStatusText = (status) => {
      const statusMap = {
         'pending': 'Pending',
         'scheduled': 'Scheduled',
         'in_progress': 'In Progress',
         'completed': 'Completed',
         'cancelled': 'Cancelled'
      };
      return statusMap[status] || status;
   };

   const downloadTNAReport = async (tnaId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-report`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TNA_Report_${tnaId}.pdf`;
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

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">TNA Report Management</h2>
            <Button onClick={fetchTNAs}>
               Refresh
            </Button>
         </div>

         {loading ? (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-sm text-gray-500 mt-2">Loading TNAs...</p>
            </div>
         ) : tnas.length === 0 ? (
            <Card className="p-8 text-center">
               <div className="text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium mb-2">No TNAs Available</h3>
                  <p>No Technology Needs Assessments have been scheduled yet.</p>
               </div>
            </Card>
         ) : (
            <div className="space-y-4">
               {tnas.map((tna) => (
                  <Card key={tna._id} className="p-6">
                     <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                 TNA for {tna.applicationId?.programName} Application
                              </h3>
                              <Badge color={getStatusColor(tna.status)}>
                                 {getStatusText(tna.status)}
                              </Badge>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                 <p className="text-sm text-gray-600">
                                    <strong>Proponent:</strong> {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                                 </p>
                                 <p className="text-sm text-gray-600">
                                    <strong>Enterprise:</strong> {tna.applicationId?.enterpriseName}
                                 </p>
                                 <p className="text-sm text-gray-600">
                                    <strong>Scheduled:</strong> {new Date(tna.scheduledDate).toLocaleDateString()}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-sm text-gray-600">
                                    <strong>Time:</strong> {tna.scheduledTime}
                                 </p>
                                 <p className="text-sm text-gray-600">
                                    <strong>Location:</strong> {tna.location}
                                 </p>
                                 <p className="text-sm text-gray-600">
                                    <strong>Assessors:</strong> {tna.assessors?.map(a => a.name).join(', ') || 'Not assigned'}
                                 </p>
                              </div>
                           </div>

                           {tna.reportUploaded && (
                              <div className="border-t pt-4">
                                 <h4 className="font-medium text-gray-900 mb-2">TNA Report</h4>
                                 <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                       Report uploaded on: {new Date(tna.reportUploadedAt).toLocaleDateString()}
                                    </span>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => downloadTNAReport(tna._id)}
                                    >
                                       Download Report
                                    </Button>
                                 </div>
                                 {tna.reportSummary && (
                                    <div className="mt-2">
                                       <p className="text-sm text-gray-600">
                                          <strong>Summary:</strong> {tna.reportSummary}
                                       </p>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        <div className="ml-6 flex flex-col space-y-2">
                           {!tna.reportUploaded ? (
                              <Button
                                 onClick={() => handleUploadReport(tna)}
                                 className="bg-green-600 hover:bg-green-700"
                                 size="sm"
                              >
                                 Upload Report
                              </Button>
                           ) : (
                              <Button
                                 onClick={() => handleUploadReport(tna)}
                                 variant="outline"
                                 size="sm"
                              >
                                 Update Report
                              </Button>
                           )}
                           
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                 // Navigate to TNA details
                                 console.log('View TNA details:', tna._id);
                              }}
                           >
                              View Details
                           </Button>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         )}

         {/* Upload Report Modal */}
         {showUploadModal && selectedTNA && (
            <Modal
               isOpen={showUploadModal}
               onClose={() => {
                  setShowUploadModal(false);
                  setSelectedTNA(null);
               }}
               title="Upload TNA Report"
            >
               <div className="space-y-4">
                  <div>
                     <h3 className="font-medium text-gray-900 mb-2">
                        TNA Report for: {selectedTNA.applicationId?.programName}
                     </h3>
                     <p className="text-sm text-gray-600">
                        Proponent: {selectedTNA.proponentId?.firstName} {selectedTNA.proponentId?.lastName}
                     </p>
                     <p className="text-sm text-gray-600">
                        Assessment Date: {new Date(selectedTNA.scheduledDate).toLocaleDateString()}
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        TNA Report File *
                     </label>
                     <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Summary *
                     </label>
                     <Textarea
                        value={reportSummary}
                        onChange={(e) => setReportSummary(e.target.value)}
                        placeholder="Provide a summary of the TNA findings..."
                        rows={4}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommendations
                     </label>
                     <Textarea
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Provide recommendations based on the TNA findings..."
                        rows={3}
                     />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                     <Button
                        variant="outline"
                        onClick={() => {
                           setShowUploadModal(false);
                           setSelectedTNA(null);
                        }}
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={handleReportSubmit}
                        disabled={loading || !reportFile || !reportSummary.trim()}
                        className="bg-green-600 hover:bg-green-700"
                     >
                        {loading ? 'Uploading...' : 'Upload Report'}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}
      </div>
   );
};

export default TNAReportUpload;


