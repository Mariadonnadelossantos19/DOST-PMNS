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
         <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Approved TNA Reports</h1>
                     <p className="text-gray-600 text-sm mt-1">Loading approved TNA reports...</p>
                  </div>
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">Loading approved TNA reports...</p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Approved TNA Reports</h1>
                     <p className="text-gray-600 text-sm mt-1">Error loading approved TNA reports</p>
                  </div>
               </div>
            </div>
            <div className="p-6">
               <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                  <div className="text-center">
                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                     </div>
                     <h4 className="font-semibold text-gray-900 mb-2">Error Loading Approved TNAs</h4>
                     <p className="text-gray-600 mb-4 text-sm">{error}</p>
                     <Button 
                        onClick={fetchApprovedTnas} 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-gray-50 min-h-screen">
         {/* Compact Header */}
         <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">Approved TNA Reports</h1>
                  <p className="text-gray-600 text-sm mt-1">View and manage approved TNA reports</p>
               </div>
               <Button 
                  onClick={fetchApprovedTnas} 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
               </Button>
            </div>
         </div>

         <div className="p-6 space-y-6">

         {/* Compact Stats Cards */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">Total Approved</p>
                     <p className="text-xl font-bold text-gray-900">{approvedTnas.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">This Month</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => {
                           const tnaDate = new Date(tna.dostMimaropaApprovedAt || tna.updatedAt);
                           const now = new Date();
                           return tnaDate.getMonth() === now.getMonth() && tnaDate.getFullYear() === now.getFullYear();
                        }).length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">With Reports</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => tna.tnaReport?.originalName).length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">Active Projects</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => tna.applicationId?.status === 'approved').length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  </div>
               </div>
            </div>
         </div>

         {/* Compact TNA List */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
               <h3 className="text-lg font-semibold text-gray-900">Approved TNA Reports</h3>
            </div>
            
            <div className="p-4">
               {approvedTnas.length === 0 ? (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h4 className="font-medium text-gray-900 mb-1">No Approved TNAs</h4>
                     <p className="text-sm text-gray-600">
                        TNAs will appear here once approved by DOST MIMAROPA.
                     </p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {approvedTnas.map((tna) => (
                        <div key={tna._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                           <div className="flex justify-between items-start">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <h4 className="font-semibold text-gray-900 text-sm">
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
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">Application</p>
                                             <p className="text-gray-900">{tna.applicationId?.applicationId || 'N/A'}</p>
                                          </div>
                                       </div>
                                       
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">Proponent</p>
                                             <p className="text-gray-900">{tna.proponentId?.firstName} {tna.proponentId?.lastName}</p>
                                          </div>
                                       </div>
                                       
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">Enterprise</p>
                                             <p className="text-gray-900">{tna.applicationId?.enterpriseName || 'N/A'}</p>
                                          </div>
                                       </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">PSTO</p>
                                             <p className="text-gray-900">{tna.scheduledBy?.firstName} {tna.scheduledBy?.lastName}</p>
                                          </div>
                                       </div>
                                       
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">Approved</p>
                                             <p className="text-gray-900">{formatDate(tna.dostMimaropaApprovedAt)}</p>
                                          </div>
                                       </div>
                                       
                                       <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
                                             <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="font-medium text-gray-600">Location</p>
                                             <p className="text-gray-900">{tna.location || 'N/A'}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {tna.tnaReport && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                             <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                             </div>
                                             <div>
                                                <p className="text-xs font-medium text-blue-800">Report File</p>
                                                <p className="text-xs text-blue-600">{tna.tnaReport.originalName}</p>
                                             </div>
                                          </div>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handleViewReport(tna)}
                                             className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs px-2 py-1"
                                          >
                                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                             </svg>
                                             Download
                                          </Button>
                                       </div>
                                    </div>
                                 )}

                                 {tna.assessmentTeam && tna.assessmentTeam.length > 0 && (
                                    <div className="mt-3">
                                       <p className="text-xs font-medium text-gray-700 mb-1">Assessment Team</p>
                                       <div className="flex flex-wrap gap-1">
                                          {tna.assessmentTeam.map((member, index) => (
                                             <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border">
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
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1"
                                 >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Details
                                 </Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

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
                     <div className="border-t pt-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                 </div>
                                 <div>
                                    <h4 className="font-semibold text-blue-900">TNA Report File</h4>
                                    <p className="text-sm text-blue-700">{selectedTna.tnaReport.originalName}</p>
                                 </div>
                              </div>
                              <Button
                                 onClick={() => handleViewReport(selectedTna)}
                                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                              >
                                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 Download Report
                              </Button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </Modal>
         )}
         </div>
      </div>
   );
   
};

export default DostMimaropaApprovedTna;
