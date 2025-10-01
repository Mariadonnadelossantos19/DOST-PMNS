import React, { useState, useEffect } from 'react';
import { 
   Card, 
   Button, 
   Badge, 
   Modal, 
   Textarea,
   DashboardHeader,
   StatusBadge,
   StatsCard,
   Alert
} from '../../../Component/UI';
import { API_ENDPOINTS } from '../../../config/api';
import TNADetailsDisplay from './TNADetailsDisplay';

const DostMimaropaApprovedTna = () => {
   const [approvedTnas, setApprovedTnas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedTna, setSelectedTna] = useState(null);
   const [showDetailsModal, setShowDetailsModal] = useState(false);

   // Fetch approved TNA reports
   const fetchApprovedTnas = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         console.log('DostMimaropaApprovedTna - Fetching approved TNAs...');
         const response = await fetch('http://localhost:4000/api/tna/dost-mimaropa/approved', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         console.log('DostMimaropaApprovedTna - Response status:', response.status);

         if (!response.ok) {
            if (response.status === 401) {
               localStorage.removeItem('authToken');
               localStorage.removeItem('isLoggedIn');
               localStorage.removeItem('userData');
               window.location.reload();
               return;
            }
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch approved TNAs: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         console.log('DostMimaropaApprovedTna - API Response:', result);
         
         if (result.success) {
            console.log('DostMimaropaApprovedTna - Approved TNAs found:', result.data?.length || 0);
            setApprovedTnas(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch approved TNAs');
         }
      } catch (error) {
         console.error('Error fetching approved TNAs:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchApprovedTnas();
   }, []);

   // View/Download TNA report
   const handleViewReport = async (tna) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/${tna._id}/download-report`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               alert('Session expired. Please login again.');
               return;
            }
            throw new Error(`Failed to download report: ${response.status}`);
         }

         // Get the blob and create a download link
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = tna.tnaReport?.originalName || 'tna-report.pdf';
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (error) {
         console.error('Error downloading report:', error);
         alert('Error downloading report: ' + error.message);
      }
   };

   // Format date
   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
         return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch (error) {
         console.error('Error formatting date:', error, 'Input:', dateString);
         return 'Invalid Date';
      }
   };

   if (loading) {
      return (
         <div className="space-y-6">
            <DashboardHeader
               title="Approved TNA Reports"
               subtitle="Loading approved TNA reports..."
               color="green"
            />
            <div className="flex items-center justify-center h-64">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading approved TNA reports...</p>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <DashboardHeader
               title="Approved TNA Reports"
               subtitle="View approved TNA reports and their details"
               color="red"
            />
            <Alert
               type="error"
               title="Error Loading Approved TNAs"
               message={error}
               action={
                  <Button onClick={fetchApprovedTnas} size="sm">
                     Try Again
                  </Button>
               }
            />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <DashboardHeader
            title="Approved TNA Reports"
            subtitle="View approved TNA reports and their details"
            color="green"
         >
            <Button onClick={fetchApprovedTnas} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               Refresh
            </Button>
         </DashboardHeader>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
               title="Total Approved"
               value={approvedTnas.length}
               icon="✅"
               color="green"
               subtitle="Approved TNA reports"
            />
            <StatsCard
               title="This Month"
               value={approvedTnas.filter(tna => {
                  const tnaDate = new Date(tna.dostMimaropaApprovedAt || tna.updatedAt);
                  const now = new Date();
                  return tnaDate.getMonth() === now.getMonth() && tnaDate.getFullYear() === now.getFullYear();
               }).length}
               icon="📅"
               color="blue"
               subtitle="Approved this month"
            />
            <StatsCard
               title="With Reports"
               value={approvedTnas.filter(tna => tna.tnaReport?.originalName).length}
               icon="📄"
               color="purple"
               subtitle="Reports available"
            />
            <StatsCard
               title="Active Projects"
               value={approvedTnas.filter(tna => tna.applicationId?.status === 'approved').length}
               icon="🚀"
               color="orange"
               subtitle="Active applications"
            />
         </div>

         {/* Approved TNAs List */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Approved TNA Reports
            </h3>
            
            {approvedTnas.length === 0 ? (
               <Alert
                  type="info"
                  title="No Approved TNAs"
                  message="There are currently no approved TNA reports. TNAs will appear here once they are approved by DOST MIMAROPA."
               />
            ) : (
               <div className="space-y-4">
                  {approvedTnas.map((tna) => (
                     <div key={tna._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                 <h4 className="font-medium text-gray-900">
                                    TNA Report - {tna.tnaId}
                                 </h4>
                                 <StatusBadge 
                                    status={tna.status}
                                    size="sm"
                                 />
                                 <StatusBadge 
                                    status={tna.applicationId?.status}
                                    size="sm"
                                 />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                 <div>
                                    <p><strong>Application:</strong> {tna.applicationId?.applicationId || 'N/A'}</p>
                                    <p><strong>Proponent:</strong> {tna.proponentId?.firstName} {tna.proponentId?.lastName}</p>
                                    <p><strong>Enterprise:</strong> {tna.applicationId?.enterpriseName || 'N/A'}</p>
                                 </div>
                                 <div>
                                    <p><strong>PSTO:</strong> {tna.assignedPSTO?.name || 'N/A'}</p>
                                    <p><strong>Approved:</strong> {formatDate(tna.dostMimaropaApprovedAt)}</p>
                                    <p><strong>Location:</strong> {tna.location || 'N/A'}</p>
                                 </div>
                              </div>

                              {tna.tnaReport && (
                                 <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <span className="text-sm font-medium text-blue-800">
                                             Report File: {tna.tnaReport.originalName}
                                          </span>
                                       </div>
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewReport(tna)}
                                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                       >
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          Download
                                       </Button>
                                    </div>
                                 </div>
                              )}

                              {tna.assessmentTeam && tna.assessmentTeam.length > 0 && (
                                 <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Assessment Team:</p>
                                    <div className="flex flex-wrap gap-2">
                                       {tna.assessmentTeam.map((member, index) => (
                                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                             {member.name} ({member.position})
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>
                           
                           <div className="flex items-center space-x-2 ml-4">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                    setSelectedTna(tna);
                                    setShowDetailsModal(true);
                                 }}
                              >
                                 View Details
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </Card>

         {/* TNA Details Modal */}
         {showDetailsModal && selectedTna && (
            <Modal
               isOpen={showDetailsModal}
               onClose={() => {
                  setShowDetailsModal(false);
                  setSelectedTna(null);
               }}
               size="xl"
               title="TNA Report Details"
            >
               <div className="space-y-6">
                  <TNADetailsDisplay tnaData={selectedTna} formatDate={formatDate} />
                  
                  {selectedTna.tnaReport && (
                     <div className="border-t pt-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md">
                           <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div>
                                 <p className="font-medium text-blue-800">TNA Report File</p>
                                 <p className="text-sm text-blue-600">{selectedTna.tnaReport.originalName}</p>
                              </div>
                           </div>
                           <Button
                              onClick={() => handleViewReport(selectedTna)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                           >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download Report
                           </Button>
                        </div>
                     </div>
                  )}
               </div>
            </Modal>
         )}
      </div>
   );
};

export default DostMimaropaApprovedTna;
