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

const TNAWithRDSignature = () => {
   const [approvedTnas, setApprovedTnas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedTna, setSelectedTna] = useState(null);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [signedFile, setSignedFile] = useState(null);
   const [uploading, setUploading] = useState(false);

   // Fetch approved TNAs that need RD signature
   const fetchApprovedTnas = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         console.log('TNAWithRDSignature - Fetching approved TNAs for RD signature...');
         const response = await fetch('http://localhost:4000/api/tna/dost-mimaropa/approved', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

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
         console.log('TNAWithRDSignature - API Response:', result);
         
         if (result.success) {
            console.log('TNAWithRDSignature - Approved TNAs found:', result.data?.length || 0);
            console.log('TNAWithRDSignature - TNA statuses:', result.data?.map(tna => ({ id: tna._id, status: tna.status, tnaId: tna.tnaId })));
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

   // Download TNA report for printing
   const handleDownloadForSignature = async (tna) => {
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
         a.download = `TNA-${tna.tnaId}-for-signature.pdf`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (error) {
         console.error('Error downloading report:', error);
         alert('Error downloading report: ' + error.message);
      }
   };

   // Download signed TNA report
   const handleDownloadSignedTNA = async (tnaId) => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-signed-report`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               alert('Session expired. Please login again.');
               return;
            }
            throw new Error(`Failed to download signed report: ${response.status}`);
         }

         // Get the blob and create a download link
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `TNA-${tnaId}-signed-by-RD.pdf`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (error) {
         console.error('Error downloading signed report:', error);
         alert('Error downloading signed report: ' + error.message);
      }
   };

   // Upload signed TNA
   const handleUploadSignedTNA = async () => {
      if (!signedFile || !selectedTna) {
         alert('Please select a file to upload');
         return;
      }

      try {
         setUploading(true);
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const formData = new FormData();
         formData.append('signedTnaReport', signedFile);
         formData.append('tnaId', selectedTna._id);

         const response = await fetch(`http://localhost:4000/api/tna/${selectedTna._id}/upload-signed-report`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`
            },
            body: formData
         });

         if (!response.ok) {
            if (response.status === 401) {
               alert('Session expired. Please login again.');
               return;
            }
            throw new Error(`Failed to upload signed report: ${response.status}`);
         }

         const result = await response.json();
         if (result.success) {
            alert('Signed TNA report uploaded successfully! It has been forwarded to PSTO.');
            setShowUploadModal(false);
            setSelectedTna(null);
            setSignedFile(null);
            fetchApprovedTnas(); // Refresh the list
         } else {
            throw new Error(result.message || 'Failed to upload signed report');
         }
      } catch (error) {
         console.error('Error uploading signed report:', error);
         alert('Error uploading signed report: ' + error.message);
      } finally {
         setUploading(false);
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
                     <h1 className="text-2xl font-bold text-gray-900">TNA with RD Signature</h1>
                     <p className="text-gray-600 text-sm mt-1">Loading approved TNAs for RD signature...</p>
                  </div>
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">Loading approved TNAs...</p>
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
                     <h1 className="text-2xl font-bold text-gray-900">TNA with RD Signature</h1>
                     <p className="text-gray-600 text-sm mt-1">Error loading approved TNAs</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">TNA with RD Signature</h1>
                  <p className="text-gray-600 text-sm mt-1">Download, print, get RD signature, and upload signed TNAs</p>
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
                     <p className="text-xs font-medium text-gray-600">Pending Signature</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => tna.status === 'dost_mimaropa_approved').length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">Ready for Download</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => tna.status === 'dost_mimaropa_approved' && tna.tnaReport?.originalName).length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600">Signed TNAs</p>
                     <p className="text-xl font-bold text-gray-900">
                        {approvedTnas.filter(tna => tna.status === 'signed_by_rd').length}
                     </p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
               </div>
            </div>
         </div>

         {/* TNA List for RD Signature */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
               <h3 className="text-lg font-semibold text-gray-900">TNAs Pending RD Signature</h3>
            </div>
            
            <div className="p-4">
               {approvedTnas.length === 0 ? (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                     </div>
                     <h4 className="font-medium text-gray-900 mb-1">No TNAs Pending RD Signature</h4>
                     <p className="text-sm text-gray-600">
                        Approved TNAs will appear here for RD signature process.
                     </p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {approvedTnas.map((tna) => (
                        <div key={tna._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                           <div className="flex justify-between items-start">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                                             onClick={() => handleDownloadForSignature(tna)}
                                             className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs px-2 py-1"
                                          >
                                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                             </svg>
                                             Download for Print
                                          </Button>
                                       </div>
                                    </div>
                                 )}
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                 {tna.status === 'signed_by_rd' && tna.signedTnaReport ? (
                                    // Show "View Signed TNA" button if already signed
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleDownloadSignedTNA(tna._id)}
                                       className="border-green-300 text-green-600 hover:bg-green-50 text-xs px-3 py-1"
                                    >
                                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                       </svg>
                                       View Signed TNA
                                    </Button>
                                 ) : (
                                    // Show "Upload Signed" button if not yet signed
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => {
                                          setSelectedTna(tna);
                                          setShowUploadModal(true);
                                       }}
                                       className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs px-3 py-1"
                                    >
                                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                       </svg>
                                       Upload Signed
                                    </Button>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Upload Signed TNA Modal */}
         {showUploadModal && selectedTna && (
            <Modal
               isOpen={showUploadModal}
               onClose={() => {
                  setShowUploadModal(false);
                  setSelectedTna(null);
                  setSignedFile(null);
               }}
               size="md"
               title="Upload Signed TNA Report"
            >
               <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                     <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-blue-800">Instructions</h4>
                     </div>
                     <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Download the TNA report for printing</li>
                        <li>2. Print the report</li>
                        <li>3. Get RD (Regional Director) signature</li>
                        <li>4. Scan the signed document</li>
                        <li>5. Upload the signed TNA report here</li>
                     </ol>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        TNA Report: {selectedTna.tnaId}
                     </label>
                     <div className="text-sm text-gray-600 mb-3">
                        <p><strong>Application:</strong> {selectedTna.applicationId?.applicationId}</p>
                        <p><strong>Proponent:</strong> {selectedTna.proponentId?.firstName} {selectedTna.proponentId?.lastName}</p>
                        <p><strong>Enterprise:</strong> {selectedTna.applicationId?.enterpriseName}</p>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Signed TNA Report *
                     </label>
                     <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setSignedFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                        Supported formats: PDF, JPG, JPEG, PNG
                     </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                     <Button
                        variant="outline"
                        onClick={() => {
                           setShowUploadModal(false);
                           setSelectedTna(null);
                           setSignedFile(null);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={handleUploadSignedTNA}
                        disabled={!signedFile || uploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                     >
                        {uploading ? (
                           <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                           </>
                        ) : (
                           <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload Signed TNA
                           </>
                        )}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}
         </div>
      </div>
   );
};

export default TNAWithRDSignature;
