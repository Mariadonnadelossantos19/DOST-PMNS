import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Textarea, TabNavigation } from '../../UI';
import TNADetailsModal from './TNADetailsModal';

const TNAManagement = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [tnas, setTnas] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [showScheduler, setShowScheduler] = useState(false);
   // Scheduler form states to submit schedule data to the backend
   const [scheduledDate, setScheduledDate] = useState('');
   const [scheduledTime, setScheduledTime] = useState('');
   const [location, setLocation] = useState('');
   const [assessmentTeam, setAssessmentTeam] = useState('');
   const [contactPerson, setContactPerson] = useState('');
   const [contactPhone, setContactPhone] = useState('');
   const [notes, setNotes] = useState('');
   
   // Enhanced UI states
   const [viewMode, setViewMode] = useState('grid');
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [sortBy, setSortBy] = useState('createdAt');
   
   // TNA Details Modal states
   const [selectedTNA, setSelectedTNA] = useState(null);
   const [showTNADetails, setShowTNADetails] = useState(false);
   
   // Report Upload states
   const [showReportModal, setShowReportModal] = useState(false);
   const [reportFile, setReportFile] = useState(null);
   const [reportSummary, setReportSummary] = useState('');
   const [recommendations, setRecommendations] = useState('');
   const [isUpdatingReport, setIsUpdatingReport] = useState(false);

   // StatCard component
   const StatCard = ({ title, value, color, icon }) => (
      <div className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-opacity-20`}>
         <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-opacity-80 uppercase tracking-wide">{title}</p>
               <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
               {icon}
            </div>
         </div>
      </div>
   );

   // Fetch applications that need TNA scheduling
   const fetchApplications = async () => {
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
   };

   // Fetch existing TNAs
   const fetchTNAs = async () => {
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
   };

   useEffect(() => {
      fetchApplications();
      fetchTNAs();
   }, [currentUser?.role, fetchApplications, fetchTNAs]);

   const handleScheduleTNA = (application) => {
      setSelectedApplication(application);
      setShowScheduler(true);
      // Reset scheduler form fields when opening the modal
      setScheduledDate('');
      setScheduledTime('');
      setLocation('');
      setAssessmentTeam('');
      // Pre-fill contact person using proponent name, phone left for user input
      const defaultContact = `${application.proponentId?.firstName || ''} ${application.proponentId?.lastName || ''}`.trim();
      setContactPerson(defaultContact);
      setContactPhone('');
      setNotes('');
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
            fetchTNAs();
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
         {/* Enhanced Header */}
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex justify-between items-center">
               <div>
                  <h2 className="text-3xl font-bold mb-2">TNA Management</h2>
                  <p className="text-blue-100">Manage Technology Needs Assessments and Reports</p>
               </div>
               <Button 
                  onClick={() => { fetchApplications(); fetchTNAs(); }}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white"
               >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
               </Button>
            </div>
         </div>

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

         {/* Controls Bar */}
         <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
               <div className="flex-1">
                  <Input
                     type="text"
                     placeholder="Search TNAs..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full"
                  />
               </div>
               <div className="flex gap-4">
                  <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                     <option value="all">All Status</option>
                     <option value="scheduled">Scheduled</option>
                     <option value="in_progress">In Progress</option>
                     <option value="completed">Completed</option>
                     <option value="completed_no_report">Completed (No Report)</option>
                     <option value="report_uploaded">Report Uploaded</option>
                     <option value="forwarded_to_dost_mimaropa">Forwarded to DOST</option>
                  </select>
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                     <option value="createdAt">Sort by Date</option>
                     <option value="scheduledDate">Sort by Scheduled Date</option>
                     <option value="status">Sort by Status</option>
                  </select>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                     <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                     </button>
                     <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Applications Ready for TNA - Only show for PSTO users */}
         {currentUser?.role !== 'dost_mimaropa' && (
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Applications Ready for TNA Scheduling
            </h3>
            
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
               <div className="text-center py-8">
                  <p className="text-gray-500">No applications ready for TNA scheduling</p>
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
         </Card>
         )}

         {/* TNAs Display */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Technology Needs Assessments
            </h3>
            
            {filteredTNAs.length === 0 ? (
               <div className="text-center py-8">
                  <p className="text-gray-500">No TNAs found matching your criteria</p>
               </div>
            ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTNAs.map((tna) => (
                     <div key={tna._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                 {tna.programName || tna.applicationId?.programName || 'SETUP Program'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                 {tna.applicationId?.enterpriseName || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                 {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                              </p>
                           </div>
                           <Badge color={getStatusColor(tna.status)}>
                              {getStatusLabel(tna.status)}
                           </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                           <p className="text-sm text-gray-600">
                              <span className="font-medium">Scheduled:</span> {new Date(tna.scheduledDate).toLocaleDateString()}
                           </p>
                           <p className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {tna.location}
                           </p>
                           {tna.tnaReport && (
                              <p className="text-sm text-green-600 font-medium">
                                 ✓ Report: {tna.tnaReport.originalName || tna.tnaReport.filename}
                              </p>
                           )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                           <Button
                              onClick={() => handleViewTNA(tna)}
                              variant="outline"
                              size="sm"
                           >
                              View
                           </Button>
                           
                           {tna.status === 'scheduled' && (
                              <Button
                                 onClick={() => markTNAAsInProgress(tna._id)}
                                 className="bg-purple-600 hover:bg-purple-700"
                                 size="sm"
                              >
                                 Start TNA
                              </Button>
                           )}
                           
                           {tna.status === 'in_progress' && (
                              <Button
                                 onClick={() => markTNAAsCompleted(tna._id)}
                                 className="bg-green-600 hover:bg-green-700"
                                 size="sm"
                              >
                                 Mark Complete
                              </Button>
                           )}
                           
                           {tna.status === 'completed' && !tna.tnaReport && (
                              <Button
                                 onClick={() => handleUploadReport(tna)}
                                 className="bg-blue-600 hover:bg-blue-700"
                                 size="sm"
                              >
                                 Upload Report
                              </Button>
                           )}
                           
                           {tna.tnaReport && (
                              <>
                                 <Button
                                    onClick={() => handleUpdateReport(tna)}
                                    variant="outline"
                                    size="sm"
                                 >
                                    Update Report
                                 </Button>
                                 <Button
                                    onClick={() => viewTNAReport(tna._id)}
                                    variant="outline"
                                    size="sm"
                                 >
                                    View Report
                                 </Button>
                                 <Button
                                    onClick={() => downloadTNAReport(tna._id)}
                                    variant="outline"
                                    size="sm"
                                 >
                                    Download
                                 </Button>
                              </>
                           )}
                           
                           {tna.tnaReport && tna.status !== 'forwarded_to_dost_mimaropa' && (
                              <Button
                                 onClick={() => forwardTNAToDostMimaropa(tna._id)}
                                 className="bg-indigo-600 hover:bg-indigo-700"
                                 size="sm"
                              >
                                 Forward to DOST
                              </Button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="space-y-4">
                  {filteredTNAs.map((tna) => (
                     <div key={tna._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                 <h4 className="font-medium text-gray-900">
                                    {tna.programName || tna.applicationId?.programName || 'SETUP Program'}
                                 </h4>
                                 <Badge color={getStatusColor(tna.status)}>
                                    {getStatusLabel(tna.status)}
                                 </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                 Enterprise: {tna.applicationId?.enterpriseName || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                 Proponent: {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                 Scheduled: {new Date(tna.scheduledDate).toLocaleDateString()} at {tna.scheduledTime}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                 Location: {tna.location}
                              </p>
                              {tna.tnaReport && (
                                 <p className="text-sm text-green-600 font-medium">
                                    ✓ Report: {tna.tnaReport.originalName || tna.tnaReport.filename}
                                 </p>
                              )}
                           </div>
                           <div className="flex items-center space-x-2">
                              <Button
                                 onClick={() => handleViewTNA(tna)}
                                 variant="outline"
                                 size="sm"
                              >
                                 View
                              </Button>
                              
                              {tna.status === 'scheduled' && (
                                 <Button
                                    onClick={() => markTNAAsInProgress(tna._id)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                    size="sm"
                                 >
                                    Start TNA
                                 </Button>
                              )}
                              
                              {tna.status === 'in_progress' && (
                                 <Button
                                    onClick={() => markTNAAsCompleted(tna._id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                 >
                                    Mark Complete
                                 </Button>
                              )}
                              
                              {tna.status === 'completed' && !tna.tnaReport && (
                                 <Button
                                    onClick={() => handleUploadReport(tna)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                 >
                                    Upload Report
                                 </Button>
                              )}
                              
                              {tna.tnaReport && (
                                 <>
                                    <Button
                                       onClick={() => handleUpdateReport(tna)}
                                       variant="outline"
                                       size="sm"
                                    >
                                       Update Report
                                    </Button>
                                    <Button
                                       onClick={() => viewTNAReport(tna._id)}
                                       variant="outline"
                                       size="sm"
                                    >
                                       View Report
                                    </Button>
                                    <Button
                                       onClick={() => downloadTNAReport(tna._id)}
                                       variant="outline"
                                       size="sm"
                                    >
                                       Download
                                    </Button>
                                 </>
                              )}
                              
                              {tna.tnaReport && tna.status !== 'forwarded_to_dost_mimaropa' && (
                                 <Button
                                    onClick={() => forwardTNAToDostMimaropa(tna._id)}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    size="sm"
                                 >
                                    Forward to DOST
                                 </Button>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </Card>

         {/* TNA Scheduler Modal */}
         {showScheduler && selectedApplication && (
            <Modal
               isOpen={showScheduler}
               onClose={() => {
                  setShowScheduler(false);
                  setSelectedApplication(null);
               // Clear scheduler form fields on close
               setScheduledDate('');
               setScheduledTime('');
               setLocation('');
               setAssessmentTeam('');
               setContactPerson('');
               setContactPhone('');
               setNotes('');
               }}
               title="Schedule Technology Needs Assessment"
            >
               <div className="p-6">
                  <p className="text-gray-600 mb-4">
                     Schedule TNA for {selectedApplication.programName} application by {selectedApplication.proponentId?.firstName} {selectedApplication.proponentId?.lastName}
                  </p>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                        <input
                           type="date"
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                        <input
                           type="time"
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                           type="text"
                           placeholder="Enter location"
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Team</label>
                        <input
                           type="text"
                           placeholder="Enter assessor names (comma separated)"
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={assessmentTeam}
                        onChange={(e) => setAssessmentTeam(e.target.value)}
                        />
                     </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                     <input
                        type="text"
                        placeholder="Enter contact person"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                     <input
                        type="text"
                        placeholder="Enter contact phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                     <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Optional notes about the schedule"
                        rows={3}
                     />
                  </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                     <Button
                        onClick={() => {
                           setShowScheduler(false);
                           setSelectedApplication(null);
                        setScheduledDate('');
                        setScheduledTime('');
                        setLocation('');
                        setAssessmentTeam('');
                        setContactPerson('');
                        setContactPhone('');
                        setNotes('');
                        }}
                        variant="outline"
                     >
                        Cancel
                     </Button>
                     <Button
                     onClick={async () => {
                        // Basic validation before submitting the schedule
                        if (!scheduledDate || !scheduledTime || !location || !contactPerson) {
                           alert('Please provide date, time, location, and contact person.');
                           return;
                        }

                        // Map comma-separated names to assessor objects required by backend
                        const assessors = (assessmentTeam || '')
                           .split(',')
                           .map(n => n.trim())
                           .filter(Boolean)
                           .map(name => ({ name, position: 'Member', department: 'PSTO' }));

                        const payload = {
                           applicationId: selectedApplication._id,
                           proponentId: selectedApplication.proponentId?._id || selectedApplication.proponentId,
                           programName: selectedApplication.programName,
                           scheduledDate,
                           scheduledTime,
                           location,
                           contactPerson,
                           contactPhone,
                           notes,
                           assessors
                        };

                        await handleTNAScheduled(payload);
                        // Refresh applications so newly scheduled items are removed from the list
                        fetchApplications();
                        // Clear form after submission
                        setScheduledDate('');
                        setScheduledTime('');
                        setLocation('');
                        setAssessmentTeam('');
                        setContactPerson('');
                        setContactPhone('');
                        setNotes('');
                     }}
                        className="bg-blue-600 hover:bg-blue-700"
                     >
                        Schedule TNA
                     </Button>
                  </div>
               </div>
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