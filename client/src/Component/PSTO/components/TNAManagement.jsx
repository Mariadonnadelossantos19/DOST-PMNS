import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Input, Textarea, TabNavigation } from '../../UI';
import TNADetailsModal from './TNADetailsModal';
import TNASchedulerForm from './TNASchedulerForm';

const TNAManagement = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [tnas, setTnas] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [showScheduler, setShowScheduler] = useState(false);
   
   // Enhanced UI states
   const [viewMode, setViewMode] = useState('grid');
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [sortBy, setSortBy] = useState('createdAt');
   const [showReadyApplications, setShowReadyApplications] = useState(false);
   
   // TNA Details Modal states
   const [selectedTNA, setSelectedTNA] = useState(null);
   const [showTNADetails, setShowTNADetails] = useState(false);
   
   // Report Upload states
   const [showReportModal, setShowReportModal] = useState(false);
   const [reportFile, setReportFile] = useState(null);
   const [reportSummary, setReportSummary] = useState('');
   const [recommendations, setRecommendations] = useState('');
   const [isUpdatingReport, setIsUpdatingReport] = useState(false);

   // Enhanced StatCard component
   const StatCard = ({ title, value, color, icon, trend }) => (
      <div className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-opacity-20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
         <div className="flex items-center justify-between">
            <div className="flex-1">
               <p className="text-sm font-medium text-opacity-80 uppercase tracking-wide mb-2">{title}</p>
               <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold">{value}</p>
                  {trend && (
                     <div className={`flex items-center text-xs ${trend.type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={trend.type === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                        </svg>
                        {trend.value}%
            </div>
                  )}
               </div>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-25 rounded-xl flex items-center justify-center backdrop-blur-sm">
               {icon}
            </div>
         </div>
      </div>
   );

   // Fetch applications that need TNA scheduling
   const fetchApplications = useCallback(async () => {
      try {
         setLoading(true);
         
         // DOST MIMAROPA users don't need to see applications ready for TNA scheduling
         if (currentUser?.role === 'dost_mimaropa') {
            setApplications([]);
            return;
         }
         
         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setApplications(data.data || []);
         }
      } catch (error) {
         console.error('Error fetching applications:', error);
      } finally {
         setLoading(false);
      }
   }, [currentUser?.role]);

   // Fetch existing TNAs
   const fetchTNAs = useCallback(async () => {
      try {
         setLoading(true);
         // Use different endpoint based on user role
         const endpoint = currentUser?.role === 'dost_mimaropa' 
            ? 'http://localhost:4000/api/tna/dost-mimaropa/reports'
            : 'http://localhost:4000/api/tna/list';
            
         const response = await fetch(endpoint, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            setTnas(data.data || []);
         } else {
            const errorText = await response.text();
            console.error('Error fetching TNAs:', response.status, errorText);
            alert(`Failed to load TNAs (${response.status}). Please check your access.`);
            setTnas([]);
         }
      } catch (error) {
         console.error('Error fetching TNAs:', error);
      }
      finally {
         setLoading(false);
      }
   }, [currentUser?.role]);

   useEffect(() => {
      fetchApplications();
      fetchTNAs();
   }, [currentUser?.role, fetchApplications, fetchTNAs]);

   const handleScheduleTNA = (application) => {
      setSelectedApplication(application);
      setShowScheduler(true);
   };

   const handleTNAScheduled = async (tnaData) => {
      try {
         const response = await fetch('http://localhost:4000/api/tna/schedule', {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(tnaData)
         });

         if (response.ok) {
            const resJson = await response.json().catch(() => null);
            const created = resJson?.data || resJson;

            if (created) {
               setTnas(prev => [created, ...prev]);
            }

            alert('TNA scheduled successfully!');
            setShowScheduler(false);
            setSelectedApplication(null);
            fetchApplications(); // Refresh to remove scheduled application from ready list
            fetchTNAs(); // Refresh TNAs list
         } else {
            const errorData = await response.json();
            alert(`Failed to schedule TNA: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error scheduling TNA:', error);
         alert('Error scheduling TNA. Please try again.');
      }
   };

   // TNA Status Management
   const markTNAAsCompleted = async (tnaId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/mark-completed`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const resJson = await response.json().catch(() => null);
            const updated = resJson?.data || resJson;

            if (updated) {
               setTnas(prev => prev.map(t => t._id === updated._id ? updated : t));
            }

            alert('TNA marked as completed successfully!');
            fetchTNAs();
         } else {
            const errorData = await response.json();
            alert(`Failed to mark TNA as completed: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error marking TNA as completed:', error);
         alert('Error marking TNA as completed. Please try again.');
      }
   };

   const markTNAAsInProgress = async (tnaId) => {
      try {
         console.log('Marking TNA as in progress:', tnaId);
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/mark-in-progress`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const resJson = await response.json().catch(() => null);
            const updated = resJson?.data || resJson;

            if (updated) {
               setTnas(prev => prev.map(t => t._id === updated._id ? updated : t));
            }

            alert('TNA marked as in progress successfully!');
            fetchTNAs();
         } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            alert(`Failed to mark TNA as in progress: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error marking TNA as in progress:', error);
         alert('Error marking TNA as in progress. Please try again.');
      }
   };

   // Report Upload Functions
   const handleUploadReport = (tna) => {
      setSelectedTNA(tna);
      setReportSummary(tna.reportSummary || '');
      setRecommendations(tna.reportRecommendations || '');
      setIsUpdatingReport(false);
      setShowReportModal(true);
   };

   const handleUpdateReport = (tna) => {
      setSelectedTNA(tna);
      setReportSummary(tna.reportSummary || '');
      setRecommendations(tna.reportRecommendations || '');
      setIsUpdatingReport(true);
      setShowReportModal(true);
   };

   const handleFileChange = (e) => {
      setReportFile(e.target.files[0]);
   };

   const handleReportSubmit = async (e) => {
      e.preventDefault();
      
      if (!selectedTNA) return;

      try {
         const formData = new FormData();
         formData.append('tnaId', selectedTNA._id);
         formData.append('reportSummary', reportSummary);
         formData.append('reportRecommendations', recommendations);
         
         if (reportFile) {
            formData.append('reportFile', reportFile);
         }

         const response = await fetch('http://localhost:4000/api/tna/upload-report', {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
         });

         if (response.ok) {
            alert(isUpdatingReport ? 'TNA report updated successfully!' : 'TNA report uploaded successfully!');
            setShowReportModal(false);
            setSelectedTNA(null);
            setReportFile(null);
            setReportSummary('');
            setRecommendations('');
            setIsUpdatingReport(false);
            fetchTNAs();
         } else {
            const errorData = await response.json();
            alert(`Failed to ${isUpdatingReport ? 'update' : 'upload'} TNA report: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error submitting TNA report:', error);
         alert(`Error ${isUpdatingReport ? 'updating' : 'uploading'} TNA report. Please try again.`);
      }
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
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-signed-report`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

   const viewTNAReport = async (tnaId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/download-report`, {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
         } else {
            const errorData = await response.json();
            alert(`Error viewing report: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error viewing TNA report:', error);
         alert('Error viewing TNA report. Please try again.');
      }
   };

   // Forward to DOST MIMAROPA
   const forwardTNAToDostMimaropa = async (tnaId) => {
      try {
         const response = await fetch(`http://localhost:4000/api/tna/${tnaId}/forward-to-dost-mimaropa`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const resJson = await response.json().catch(() => null);
            const updated = resJson?.data || resJson;
            if (updated) {
               setTnas(prev => prev.map(t => t._id === updated._id ? updated : t));
            }
            alert('TNA successfully forwarded to DOST MIMAROPA!');
            fetchTNAs();
         } else {
            const errorData = await response.json();
            alert(`Failed to forward TNA: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error forwarding TNA:', error);
         alert('Error forwarding TNA. Please try again.');
      }
   };

   // View TNA Details
   const handleViewTNA = (tna) => {
      setSelectedTNA(tna);
      setShowTNADetails(true);
   };

   // Helper functions
   const getStatusColor = (status) => {
      const colors = {
         'pending': 'yellow',
         'scheduled': 'blue',
         'in_progress': 'purple',
         'completed': 'green',
         'report_uploaded': 'blue',
         'forwarded_to_dost_mimaropa': 'indigo',
         'dost_mimaropa_approved': 'green',
         'dost_mimaropa_rejected': 'red',
         'returned_to_psto': 'orange',
         'signed_by_rd': 'emerald',
         'cancelled': 'red'
      };
      return colors[status] || 'gray';
   };

   const getStatusLabel = (status) => {
      const labels = {
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
      return labels[status] || status;
   };

   const getApplicationStatusColor = (status) => {
      const colors = {
         'pending': 'yellow',
         'under_review': 'blue',
         'psto_approved': 'green',
         'tna_scheduled': 'blue',
         'tna_conducted': 'green',
         'tna_report_submitted': 'blue',
         'dost_mimaropa_approved': 'green',
         'returned': 'orange',
         'rejected': 'red',
         'psto_rejected': 'red',
         'dost_mimaropa_rejected': 'red'
      };
      return colors[status] || 'gray';
   };

   // Filter and sort TNAs
   const getFilteredAndSortedTNAs = () => {
      let filtered = tnas;

      // Search filter
      if (searchTerm) {
         filtered = filtered.filter(tna => 
            tna.programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tna.applicationId?.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tna.proponentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tna.proponentId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
         );
      }

      // Status filter
      if (statusFilter !== 'all') {
         if (statusFilter === 'completed_no_report') {
            filtered = filtered.filter(tna => tna.status === 'completed' && !tna.tnaReport);
         } else if (statusFilter === 'report_uploaded') {
            filtered = filtered.filter(tna => tna.tnaReport);
         } else {
            filtered = filtered.filter(tna => tna.status === statusFilter);
         }
      }

      // Sort
      filtered.sort((a, b) => {
         switch (sortBy) {
            case 'createdAt':
               return new Date(b.createdAt) - new Date(a.createdAt);
            case 'scheduledDate':
               return new Date(b.scheduledDate) - new Date(a.scheduledDate);
            case 'status':
               return a.status.localeCompare(b.status);
            default:
               return 0;
         }
      });

      return filtered;
   };

   // Calculate statistics
   const stats = {
      totalApplications: currentUser?.role === 'dost_mimaropa' ? 0 : applications.length,
      readyForTNA: currentUser?.role === 'dost_mimaropa' ? 0 : applications.filter(app => {
         const isApproved = app.status === 'psto_approved';
         const hasTNA = tnas.some(tna => tna.applicationId === app._id || tna.applicationId?._id === app._id);
         return isApproved && !hasTNA;
      }).length,
      totalTNAs: tnas.length,
      scheduledTNAs: tnas.filter(tna => tna.status === 'scheduled').length,
      inProgressTNAs: tnas.filter(tna => tna.status === 'in_progress').length,
      completedTNAs: tnas.filter(tna => tna.status === 'completed').length,
      reportsUploaded: tnas.filter(tna => tna.tnaReport).length,
      pendingReports: tnas.filter(tna => tna.status === 'completed' && !tna.tnaReport).length,
      forwardedToDost: tnas.filter(tna => tna.status === 'forwarded_to_dost_mimaropa').length,
      // DOST MIMAROPA specific stats
      awaitingReview: currentUser?.role === 'dost_mimaropa' ? tnas.filter(tna => tna.status === 'forwarded_to_dost_mimaropa').length : 0,
      approvedByDost: currentUser?.role === 'dost_mimaropa' ? tnas.filter(tna => tna.status === 'dost_mimaropa_approved').length : 0,
      rejectedByDost: currentUser?.role === 'dost_mimaropa' ? tnas.filter(tna => tna.status === 'dost_mimaropa_rejected').length : 0
   };

   const filteredTNAs = getFilteredAndSortedTNAs();

   return (
      <div className="space-y-6">
         

         {/* Statistics Dashboard */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentUser?.role === 'dost_mimaropa' ? (
               // DOST MIMAROPA specific stats
               <>
                  <StatCard
                     title="Awaiting Review"
                     value={stats.awaitingReview}
                     color="from-yellow-50 to-yellow-100 text-yellow-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <StatCard
                     title="Approved by DOST"
                     value={stats.approvedByDost}
                     color="from-green-50 to-green-100 text-green-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <StatCard
                     title="Rejected by DOST"
                     value={stats.rejectedByDost}
                     color="from-red-50 to-red-100 text-red-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                  />
                  <StatCard
                     title="Total Reports"
                     value={stats.totalTNAs}
                     color="from-purple-50 to-purple-100 text-purple-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  />
                  <StatCard
                     title="With Reports"
                     value={stats.reportsUploaded}
                     color="from-blue-50 to-blue-100 text-blue-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>}
                  />
                  <StatCard
                     title="Completed"
                     value={stats.completedTNAs}
                     color="from-green-50 to-green-100 text-green-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
               </>
            ) : (
               // PSTO specific stats
               <>
                  <StatCard
                     title="Total Applications"
                     value={stats.totalApplications}
                     color="from-blue-50 to-blue-100 text-blue-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  />
                  <StatCard
                     title="Ready for TNA"
                     value={stats.readyForTNA}
                     color="from-yellow-50 to-yellow-100 text-yellow-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <StatCard
                     title="Total TNAs"
                     value={stats.totalTNAs}
                     color="from-purple-50 to-purple-100 text-purple-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  />
                  <StatCard
                     title="Completed"
                     value={stats.completedTNAs}
                     color="from-green-50 to-green-100 text-green-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  <StatCard
                     title="Reports Uploaded"
                     value={stats.reportsUploaded}
                     color="from-blue-50 to-blue-100 text-blue-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>}
                  />
                  <StatCard
                     title="Forwarded to DOST"
                     value={stats.forwardedToDost}
                     color="from-indigo-50 to-indigo-100 text-indigo-900"
                     icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                  />
               </>
            )}
         </div>

         {/* Enhanced Controls Bar */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
               {/* Search Section */}
               <div className="flex-1 max-w-md">
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                  <Input
                     type="text"
                        placeholder="Search TNAs by enterprise, proponent, or program..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
               </div>
               </div>

               {/* Filters and Controls */}
               <div className="flex flex-wrap gap-3 items-center">
                  {/* Refresh Button */}
                  <Button
                     onClick={() => {
                        fetchTNAs();
                        fetchApplications();
                     }}
                     variant="outline"
                     size="sm"
                     className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     <span>Refresh</span>
                  </Button>

                  {/* Status Filter */}
                  <div className="flex items-center space-x-2">
                     <span className="text-sm font-medium text-gray-700">Status:</span>
                  <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                  >
                     <option value="all">All Status</option>
                     <option value="scheduled">Scheduled</option>
                     <option value="in_progress">In Progress</option>
                     <option value="completed">Completed</option>
                     <option value="completed_no_report">Completed (No Report)</option>
                     <option value="report_uploaded">Report Uploaded</option>
                     <option value="forwarded_to_dost_mimaropa">Forwarded to DOST</option>
                  </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center space-x-2">
                     <span className="text-sm font-medium text-gray-700">Sort:</span>
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                     >
                        <option value="createdAt">Date Created</option>
                        <option value="scheduledDate">Scheduled Date</option>
                        <option value="status">Status</option>
                  </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                     <span className="text-sm font-medium text-gray-700">View:</span>
                     <div className="flex bg-gray-100 rounded-xl p-1">
                     <button
                        onClick={() => setViewMode('grid')}
                           className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              viewMode === 'grid' 
                                 ? 'bg-purple-600 text-white shadow-sm' 
                                 : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                           }`}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                     </button>
                     <button
                        onClick={() => setViewMode('list')}
                           className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              viewMode === 'list' 
                                 ? 'bg-purple-600 text-white shadow-sm' 
                                 : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                           }`}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                     </button>
                  </div>
               </div>

                  {/* Show Ready Applications Toggle - Only for PSTO users */}
                  {currentUser?.role !== 'dost_mimaropa' && (
                     <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Ready Apps:</span>
                        <button
                           onClick={() => setShowReadyApplications(!showReadyApplications)}
                           className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                              showReadyApplications
                                 ? 'bg-green-600 text-white shadow-sm'
                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                        >
                           <span>{showReadyApplications ? 'Hide' : 'Show'}</span>
                           <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              showReadyApplications 
                                 ? 'bg-green-500 text-white' 
                                 : 'bg-gray-200 text-gray-700'
                           }`}>
                              {stats.readyForTNA}
                           </span>
                        </button>
                     </div>
                  )}

                  {/* Results Count */}
                  <div className="text-right">
                     <p className="text-sm font-medium text-gray-900">{filteredTNAs.length}</p>
                     <p className="text-xs text-gray-500">
                        {statusFilter === 'all' ? 'Total TNAs' : `${statusFilter.replace('_', ' ')} TNAs`}
                        {searchTerm && ` matching "${searchTerm}"`}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Applications Ready for TNA - Only show for PSTO users and when toggled on */}
         {currentUser?.role !== 'dost_mimaropa' && showReadyApplications && (
         <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">
               Applications Ready for TNA Scheduling
            </h3>
                     <p className="text-sm text-green-700">
                        Approved applications awaiting TNA assessment
                     </p>
                  </div>
               </div>
            </div>
            <div className="p-6">
            
            {loading ? (
               <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading applications...</p>
               </div>
            ) : applications.filter(app => {
               // Only show applications that are approved AND don't have TNAs scheduled
               const isApproved = app.status === 'psto_approved';
               const hasTNA = tnas.some(tna => tna.applicationId === app._id || tna.applicationId?._id === app._id);
               return isApproved && !hasTNA;
            }).length === 0 ? (
               <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                     </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No applications ready for TNA scheduling</p>
                  <p className="text-sm text-gray-400 mt-1">Applications will appear here once they are approved by PSTO</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {applications
                     .filter(app => {
                        // Only show applications that are approved AND don't have TNAs scheduled
                        const isApproved = app.status === 'psto_approved';
                        const hasTNA = tnas.some(tna => tna.applicationId === app._id || tna.applicationId?._id === app._id);
                        return isApproved && !hasTNA;
                     })
                     .map((application) => (
                        <div key={application._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start">
                              <div className="flex-1">
                                 <h4 className="font-medium text-gray-900">
                                    {application.programName} Application
                                 </h4>
                                 <p className="text-sm text-gray-600">
                                    Proponent: {application.proponentId?.firstName} {application.proponentId?.lastName}
                                 </p>
                                 <p className="text-sm text-gray-600">
                                    Enterprise: {application.enterpriseName}
                                 </p>
                                 <p className="text-sm text-gray-500">
                                    Submitted: {new Date(application.createdAt).toLocaleDateString()}
                                 </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                 <Badge color={getApplicationStatusColor(application.status)}>
                                    {application.status.replace('_', ' ')}
                                 </Badge>
                                 <Button
                                    onClick={() => handleScheduleTNA(application)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                 >
                                    Schedule TNA
                                 </Button>
                              </div>
                           </div>
                        </div>
                     ))}
               </div>
            )}
            </div>
         </Card>
         )}

         {/* TNAs Display */}
         <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                     </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">
               Technology Needs Assessments
            </h3>
                        <p className="text-sm text-blue-700">
                           Manage and track TNA progress and reports
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-blue-600">{filteredTNAs.length}</p>
                     <p className="text-xs text-blue-500">
                        {statusFilter === 'all' ? 'Total' : statusFilter.replace('_', ' ')} TNAs
                     </p>
                  </div>
               </div>
            </div>
            <div className="p-6">
            
            {filteredTNAs.length === 0 ? (
               <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                     </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No TNAs found matching your criteria</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter settings</p>
               </div>
            ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTNAs.map((tna) => (
                     <Card key={tna._id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
                        <div className="relative overflow-hidden">
                           {/* Status Header Bar */}
                           <div className={`h-1 w-full bg-gradient-to-r ${
                              tna.status === 'scheduled' ? 'from-blue-400 to-blue-600' :
                              tna.status === 'in_progress' ? 'from-purple-400 to-purple-600' :
                              tna.status === 'completed' ? 'from-green-400 to-green-600' :
                              tna.status === 'forwarded_to_dost_mimaropa' ? 'from-indigo-400 to-indigo-600' :
                              'from-gray-400 to-gray-600'
                           }`}></div>

                           <div className="p-6">
                              {/* Header Section with Enhanced Design */}
                              <div className="flex items-start justify-between mb-5">
                                 <div className="flex items-start space-x-4 flex-1">
                                    <div className={`p-3 rounded-xl shadow-lg bg-gradient-to-br ${
                                       tna.status === 'scheduled' ? 'from-blue-500 to-blue-600' :
                                       tna.status === 'in_progress' ? 'from-purple-500 to-purple-600' :
                                       tna.status === 'completed' ? 'from-green-500 to-green-600' :
                                       tna.status === 'forwarded_to_dost_mimaropa' ? 'from-indigo-500 to-indigo-600' :
                                       'from-gray-500 to-gray-600'
                                    }`}>
                                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                       </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-gray-900 text-base mb-1 truncate">
                                 {tna.programName || tna.applicationId?.programName || 'SETUP Program'}
                              </h4>
                                       <p className="text-sm text-gray-500 font-medium">
                                          TNA Assessment
                                       </p>
                                    </div>
                                 </div>
                                 <Badge color={getStatusColor(tna.status)} className="ml-3 flex-shrink-0 px-3 py-1 text-xs font-semibold">
                                    {getStatusLabel(tna.status)}
                                 </Badge>
                              </div>

                              {/* Enterprise Info Card */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-5 border border-gray-100">
                                 <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                       </svg>
                                    </div>
                                    <div>
                                       <p className="font-semibold text-gray-900 text-sm">
                                 {tna.applicationId?.enterpriseName || 'N/A'}
                              </p>
                                    </div>
                                 </div>
                                 <div className="flex items-center space-x-3">
                                    <div className="p-1.5 bg-green-100 rounded-lg">
                                       <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                       </svg>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                 {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                              </p>
                           </div>
                        </div>
                        
                              {/* Schedule & Location Info Enhanced */}
                              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 mb-5">
                                 <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                       <div className="p-2 bg-blue-50 rounded-lg">
                                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                       </div>
                                       <div>
                                          <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                                          <p className="text-sm font-semibold text-gray-800">
                                             {new Date(tna.scheduledDate).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                             })}
                                          </p>
                                       </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                       <div className="p-2 bg-orange-50 rounded-lg">
                                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                       </div>
                                       <div>
                                          <p className="text-xs text-gray-500 font-medium">Location</p>
                                          <p className="text-sm font-semibold text-gray-800 truncate">
                                             {tna.location}
                                          </p>
                                       </div>
                                    </div>

                           {tna.tnaReport && (
                                       <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-200">
                                          <div className="p-2 bg-green-50 rounded-lg">
                                             <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                             </svg>
                                          </div>
                                          <div>
                                             <p className="text-xs text-gray-500 font-medium">Report Available</p>
                                             <p className="text-sm font-semibold text-green-600 truncate">
                                                {tna.tnaReport.originalName || tna.tnaReport.filename}
                                             </p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                        </div>

                              {/* Enhanced Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                           <Button
                              onClick={() => handleViewTNA(tna)}
                                    className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                           >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                              View
                           </Button>
                           
                           {tna.status === 'scheduled' && (
                              <Button
                                 onClick={() => markTNAAsInProgress(tna._id)}
                                       className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10v20m10-10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                 Start TNA
                              </Button>
                           )}
                           
                           {tna.status === 'in_progress' && (
                              <Button
                                 onClick={() => markTNAAsCompleted(tna._id)}
                                       className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                       Complete
                              </Button>
                           )}
                           
                           {tna.status === 'completed' && !tna.tnaReport && (
                              <Button
                                 onClick={() => handleUploadReport(tna)}
                                       className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                       </svg>
                                 Upload Report
                              </Button>
                           )}
                           
                           {tna.tnaReport && (
                              <>
                                 <Button
                                    onClick={() => handleUpdateReport(tna)}
                                          className="px-3 py-2 bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md"
                                 >
                                          Update
                                 </Button>
                                 <Button
                                    onClick={() => viewTNAReport(tna._id)}
                                          className="px-3 py-2 bg-white border-2 border-green-200 hover:border-green-300 text-green-600 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md"
                                 >
                                    View Report
                                 </Button>
                                 <Button
                                    onClick={() => downloadTNAReport(tna._id)}
                                          className="px-3 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md"
                                 >
                                    Download
                                 </Button>
                              </>
                           )}
                           
                                 {/* Signed TNA Report Section */}
                                 {tna.signedTnaReport && (
                                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                             </div>
                                             <div>
                                                <p className="text-sm font-medium text-emerald-800">Signed TNA Report (RD Signature)</p>
                                                <p className="text-xs text-emerald-600">{tna.signedTnaReport.originalName}</p>
                                                {tna.rdSignedAt && (
                                                   <p className="text-xs text-emerald-500 mt-1">
                                                      Signed on: {new Date(tna.rdSignedAt).toLocaleDateString('en-US', {
                                                         year: 'numeric',
                                                         month: 'long',
                                                         day: 'numeric',
                                                         hour: '2-digit',
                                                         minute: '2-digit'
                                                      })}
                                                   </p>
                                                )}
                                             </div>
                                          </div>
                                          <div className="flex space-x-2">
                                             <Button
                                                onClick={() => downloadSignedTNAReport(tna._id)}
                                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                                             >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Signed
                                             </Button>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                                 
                                 {tna.tnaReport && tna.status !== 'forwarded_to_dost_mimaropa' && tna.status !== 'dost_mimaropa_approved' && tna.status !== 'dost_mimaropa_rejected' && tna.status !== 'returned_to_psto' && tna.status !== 'signed_by_rd' && (
                              <Button
                                 onClick={() => forwardTNAToDostMimaropa(tna._id)}
                                       className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                       </svg>
                                 Forward to DOST
                              </Button>
                           )}
                        </div>
                     </div>
                        </div>
                     </Card>
                  ))}
               </div>
            ) : (
               <div className="space-y-4">
                  {filteredTNAs.map((tna) => (
                     <Card key={tna._id} className="hover:shadow-md transition-all duration-200">
                        <div className="p-4">
                           <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                 {/* Icon */}
                                 <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-3">
                                       <h4 className="font-semibold text-gray-900 text-sm">
                                    {tna.programName || tna.applicationId?.programName || 'SETUP Program'}
                                 </h4>
                                 <Badge color={getStatusColor(tna.status)}>
                                    {getStatusLabel(tna.status)}
                                 </Badge>
                              </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                       <div>
                                          <p className="font-medium text-gray-900">
                                             {tna.applicationId?.enterpriseName || 'N/A'}
                                          </p>
                                          <p className="text-gray-500 text-xs">
                                             {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                                          </p>
                                       </div>
                                       <div>
                                          <div className="flex items-center text-xs text-gray-600 mb-1">
                                             <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                             </svg>
                                             {new Date(tna.scheduledDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                             })} at {tna.scheduledTime}
                                          </div>
                                          <div className="flex items-center text-xs text-gray-600">
                                             <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                             </svg>
                                             {tna.location}
                                          </div>
                              {tna.tnaReport && (
                                             <div className="flex items-center text-xs text-green-600 font-medium mt-1">
                                                <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {tna.tnaReport.originalName || tna.tnaReport.filename}
                                             </div>
                              )}
                           </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                              <Button
                                 onClick={() => handleViewTNA(tna)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all duration-200"
                              >
                                 View
                              </Button>
                              
                              {tna.status === 'scheduled' && (
                                 <Button
                                    onClick={() => markTNAAsInProgress(tna._id)}
                                       className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm"
                                 >
                                    Start TNA
                                 </Button>
                              )}
                              
                              {tna.status === 'in_progress' && (
                                 <Button
                                    onClick={() => markTNAAsCompleted(tna._id)}
                                       className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm"
                                 >
                                       Complete
                                 </Button>
                              )}
                              
                              {tna.status === 'completed' && !tna.tnaReport && (
                                 <Button
                                    onClick={() => handleUploadReport(tna)}
                                       className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm"
                                 >
                                    Upload Report
                                 </Button>
                              )}
                              
                              {tna.tnaReport && (
                                 <>
                                    <Button
                                       onClick={() => handleUpdateReport(tna)}
                                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all duration-200"
                                    >
                                          Update
                                    </Button>
                                    <Button
                                       onClick={() => viewTNAReport(tna._id)}
                                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all duration-200"
                                    >
                                       View Report
                                    </Button>
                                    <Button
                                       onClick={() => downloadTNAReport(tna._id)}
                                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all duration-200"
                                    >
                                       Download
                                    </Button>
                                 </>
                              )}
                              
                                 {/* Signed TNA Report Section - List View */}
                                 {tna.signedTnaReport && (
                                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                             <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                             </div>
                                             <div>
                                                <p className="text-xs font-medium text-emerald-800">Signed TNA Report (RD Signature)</p>
                                                <p className="text-xs text-emerald-600">{tna.signedTnaReport.originalName}</p>
                                                {tna.rdSignedAt && (
                                                   <p className="text-xs text-emerald-500">
                                                      Signed: {new Date(tna.rdSignedAt).toLocaleDateString('en-US', {
                                                         month: 'short',
                                                         day: 'numeric',
                                                         hour: '2-digit',
                                                         minute: '2-digit'
                                                      })}
                                                   </p>
                                                )}
                                             </div>
                                          </div>
                                          <Button
                                             onClick={() => downloadSignedTNAReport(tna._id)}
                                             className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors duration-200"
                                          >
                                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                             </svg>
                                             Download
                                          </Button>
                                       </div>
                                    </div>
                                 )}
                                 
                                 {tna.tnaReport && tna.status !== 'forwarded_to_dost_mimaropa' && tna.status !== 'dost_mimaropa_approved' && tna.status !== 'dost_mimaropa_rejected' && tna.status !== 'returned_to_psto' && tna.status !== 'signed_by_rd' && (
                                 <Button
                                    onClick={() => forwardTNAToDostMimaropa(tna._id)}
                                       className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm"
                                 >
                                    Forward to DOST
                                 </Button>
                              )}
                           </div>
                        </div>
                     </div>
                     </Card>
                  ))}
               </div>
            )}
            </div>
         </Card>

         {/* TNA Scheduler Modal */}
         {showScheduler && selectedApplication && (
            <Modal
               isOpen={showScheduler}
               onClose={() => {
                  setShowScheduler(false);
                  setSelectedApplication(null);
               }}
               title="Schedule Technology Needs Assessment"
               size="xl"
            >
               <TNASchedulerForm
                  application={selectedApplication}
                  onSchedule={handleTNAScheduled}
                  onCancel={() => {
                           setShowScheduler(false);
                           setSelectedApplication(null);
                  }}
               />
            </Modal>
         )}

         {/* Report Upload Modal */}
         {showReportModal && selectedTNA && (
            <Modal
               isOpen={showReportModal}
               onClose={() => {
                  setShowReportModal(false);
                  setSelectedTNA(null);
                  setReportFile(null);
                  setReportSummary('');
                  setRecommendations('');
                  setIsUpdatingReport(false);
               }}
               title={isUpdatingReport ? "Update TNA Report" : "Upload TNA Report"}
            >
               <form onSubmit={handleReportSubmit} className="p-6">
                  <div className="space-y-4">
                     {isUpdatingReport && selectedTNA.tnaReport && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <p className="text-sm font-medium text-blue-800">Current Report:</p>
                           <p className="text-sm text-blue-600">{selectedTNA.tnaReport.originalName || selectedTNA.tnaReport.filename}</p>
                        </div>
                     )}
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Report File {isUpdatingReport ? '(Optional - leave empty to keep current file)' : '*'}
                        </label>
                        <input
                           type="file"
                           accept=".pdf,.doc,.docx"
                           onChange={handleFileChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Summary *</label>
                        <Textarea
                           value={reportSummary}
                           onChange={(e) => setReportSummary(e.target.value)}
                           placeholder="Enter a summary of the TNA findings..."
                           rows={4}
                           required
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations *</label>
                        <Textarea
                           value={recommendations}
                           onChange={(e) => setRecommendations(e.target.value)}
                           placeholder="Enter recommendations based on the TNA..."
                           rows={4}
                           required
                        />
                     </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                     <Button
                        type="button"
                        onClick={() => {
                           setShowReportModal(false);
                           setSelectedTNA(null);
                           setReportFile(null);
                           setReportSummary('');
                           setRecommendations('');
                           setIsUpdatingReport(false);
                        }}
                        variant="outline"
                     >
                        Cancel
                     </Button>
                     <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!reportSummary || !recommendations}
                     >
                        {isUpdatingReport ? 'Update Report' : 'Upload Report'}
                     </Button>
                  </div>
               </form>
            </Modal>
         )}

         {/* TNA Details Modal */}
         <TNADetailsModal
            selectedTNA={selectedTNA}
            setSelectedTNA={setSelectedTNA}
            showTNADetails={showTNADetails}
            setShowTNADetails={setShowTNADetails}
         />
      </div>
   );
};

export default TNAManagement;