import React, { useState, useEffect } from 'react';
import { 
   Card, 
   Button, 
   Badge, 
   Modal, 
   Textarea,
   StatusBadge,
   StatsCard,
   Alert
} from '../../../Component/UI';
import { API_ENDPOINTS } from '../../../config/api';
import RTECScheduleModal from './RTECScheduleModal';
import RTECMeetingDetailsModal from './RTECMeetingDetailsModal';

const RTECManagement = () => {
   const [rtecMeetings, setRtecMeetings] = useState([]);
   const [readyTNAs, setReadyTNAs] = useState([]);
   const [statistics, setStatistics] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [activeTab, setActiveTab] = useState('meetings'); // 'meetings', 'schedule', 'statistics'
   const [showScheduleModal, setShowScheduleModal] = useState(false);
   const [selectedTna, setSelectedTna] = useState(null);
   const [selectedMeeting, setSelectedMeeting] = useState(null);
   const [showDetailsModal, setShowDetailsModal] = useState(false);

   // Fetch RTEC meetings
   const fetchRTECMeetings = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         console.log('RTECManagement - Fetching RTEC meetings...');
         const response = await fetch('http://localhost:4000/api/rtec/dost-mimaropa', {
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
            throw new Error(`Failed to fetch RTEC meetings: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         console.log('RTECManagement - API Response:', result);
         
         if (result.success) {
            setRtecMeetings(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch RTEC meetings');
         }
      } catch (error) {
         console.error('Error fetching RTEC meetings:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   // Fetch TNAs ready for RTEC
   const fetchReadyTNAs = async () => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) return;

         const response = await fetch('http://localhost:4000/api/rtec/tna/ready-for-rtec', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               setReadyTNAs(result.data || []);
            }
         }
      } catch (error) {
         console.error('Error fetching ready TNAs:', error);
      }
   };

   // Fetch RTEC statistics
   const fetchStatistics = async () => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) return;

         const response = await fetch('http://localhost:4000/api/rtec/statistics', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.ok) {
            const result = await response.json();
            if (result.success) {
               setStatistics(result.data || {});
            }
         }
      } catch (error) {
         console.error('Error fetching statistics:', error);
      }
   };

   useEffect(() => {
      fetchRTECMeetings();
      fetchReadyTNAs();
      fetchStatistics();
   }, []);

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
                     <h1 className="text-2xl font-bold text-gray-900">RTEC Management</h1>
                     <p className="text-gray-600 text-sm mt-1">Loading RTEC meetings...</p>
                  </div>
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">Loading RTEC meetings...</p>
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
                     <h1 className="text-2xl font-bold text-gray-900">RTEC Management</h1>
                     <p className="text-gray-600 text-sm mt-1">Error loading RTEC meetings</p>
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
                     <h4 className="font-semibold text-gray-900 mb-2">Error Loading RTEC Meetings</h4>
                     <p className="text-gray-600 mb-4 text-sm">{error}</p>
                     <Button 
                        onClick={fetchRTECMeetings} 
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
         {/* Header */}
         <div className="bg-white border-b border-gray-200">
            <div className="pl-1 pr-4 py-2">
               <h1 className="text-lg font-bold text-gray-900">RTEC Management</h1>
            </div>
         </div>

         <div className="pl-1 pr-4 py-2">
            {/* Tabs */}
            <div className="mb-2">
               <nav className="flex space-x-4" aria-label="Tabs">
                  <button
                     onClick={() => setActiveTab('meetings')}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'meetings'
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>RTEC Meetings</span>
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                           {rtecMeetings.length}
                        </span>
                     </div>
                  </button>
                  <button
                     onClick={() => setActiveTab('schedule')}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'schedule'
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Schedule RTEC</span>
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                           {readyTNAs.length}
                        </span>
                     </div>
                  </button>
                  <button
                     onClick={() => setActiveTab('statistics')}
                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'statistics'
                           ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Statistics</span>
                     </div>
                  </button>
               </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'meetings' ? (
               // RTEC Meetings Tab
               <div className="space-y-3">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                     <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Total Meetings</p>
                              <p className="text-base font-bold text-gray-900">{statistics.totalMeetings || 0}</p>
                           </div>
                           <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Scheduled</p>
                              <p className="text-base font-bold text-gray-900">{statistics.scheduledMeetings || 0}</p>
                           </div>
                           <div className="w-5 h-5 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Under Review</p>
                              <p className="text-base font-bold text-gray-900">{statistics.underReview || 0}</p>
                           </div>
                           <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Completed</p>
                              <p className="text-base font-bold text-gray-900">{statistics.completed || 0}</p>
                           </div>
                           <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* RTEC Meetings List */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                     <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">RTEC Meetings</h3>
                     </div>
                     <div className="p-3">
                        {rtecMeetings.length === 0 ? (
                           <div className="text-center py-8">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                              </div>
                              <h3 className="text-base font-medium text-gray-900 mb-1">No RTEC Meetings</h3>
                              <p className="text-sm text-gray-600">RTEC meetings will appear here</p>
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {rtecMeetings.map((meeting) => (
                                 <div key={meeting._id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                       <div className="flex items-center space-x-2">
                                          <h4 className="text-base font-semibold text-gray-900">{meeting.meetingTitle}</h4>
                                          <StatusBadge status={meeting.status} size="sm" />
                                       </div>
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                             setSelectedMeeting(meeting);
                                             setShowDetailsModal(true);
                                          }}
                                          className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs px-2 py-1"
                                       >
                                          View Details
                                       </Button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                       <div className="space-y-2">
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Meeting Date</p>
                                             <p className="text-sm text-gray-900">{formatDate(meeting.meetingDate)}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Location</p>
                                             <p className="text-sm text-gray-900">{meeting.meetingLocation}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Meeting Type</p>
                                             <p className="text-sm text-gray-900 capitalize">{meeting.meetingType}</p>
                                          </div>
                                       </div>

                                       <div className="space-y-2">
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Application</p>
                                             <p className="text-sm text-gray-900">{meeting.tnaId?.applicationId?.applicationId || 'N/A'}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Proponent</p>
                                             <p className="text-sm text-gray-900">{meeting.tnaId?.proponentId?.firstName} {meeting.tnaId?.proponentId?.lastName}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">PSTO</p>
                                             <p className="text-sm text-gray-900">{meeting.pstoId?.firstName} {meeting.pstoId?.lastName}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ) : activeTab === 'schedule' ? (
               // Schedule RTEC Tab
               <div className="space-y-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                     <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">TNAs Ready for RTEC Scheduling</h3>
                     </div>
                     <div className="p-3">
                        {readyTNAs.length === 0 ? (
                           <div className="text-center py-8">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                              </div>
                              <h3 className="text-base font-medium text-gray-900 mb-1">No TNAs Ready for RTEC</h3>
                              <p className="text-sm text-gray-600">TNAs signed by RD will appear here</p>
                           </div>
                        ) : (
                           <div className="space-y-3">
                              {readyTNAs.map((tna) => (
                                 <div key={tna._id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                       <div className="flex items-center space-x-2">
                                          <h4 className="text-base font-semibold text-gray-900">TNA Report - {tna.tnaId}</h4>
                                          <StatusBadge status={tna.status} size="sm" />
                                       </div>
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                             setSelectedTna(tna);
                                             setShowScheduleModal(true);
                                          }}
                                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                                       >
                                          Schedule RTEC
                                       </Button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                       <div className="space-y-2">
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Application</p>
                                             <p className="text-sm text-gray-900">{tna.applicationId?.applicationId || 'N/A'}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Proponent</p>
                                             <p className="text-sm text-gray-900">{tna.proponentId?.firstName} {tna.proponentId?.lastName}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Enterprise</p>
                                             <p className="text-sm text-gray-900">{tna.applicationId?.enterpriseName || 'N/A'}</p>
                                          </div>
                                       </div>

                                       <div className="space-y-2">
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">PSTO</p>
                                             <p className="text-sm text-gray-900">{tna.scheduledBy?.firstName} {tna.scheduledBy?.lastName}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Signed by RD</p>
                                             <p className="text-sm text-gray-900">{formatDate(tna.rdSignedAt)}</p>
                                          </div>
                                          
                                          <div>
                                             <p className="text-xs font-medium text-gray-600 mb-1">Location</p>
                                             <p className="text-sm text-gray-900">{tna.location || 'N/A'}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ) : (
               // Statistics Tab
               <div className="space-y-3">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Total Meetings</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.totalMeetings || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Scheduled</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.scheduledMeetings || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Under Review</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.underReview || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Completed</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.completed || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Approved</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.approved || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Rejected</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.rejected || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Proposal Requested</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.proposalRequested || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-xs font-medium text-gray-600">Proposal Submitted</p>
                              <p className="text-lg font-bold text-gray-900">{statistics.proposalSubmitted || 0}</p>
                           </div>
                           <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* RTEC Schedule Modal */}
         <RTECScheduleModal
            isOpen={showScheduleModal}
            onClose={() => {
               setShowScheduleModal(false);
               setSelectedTna(null);
            }}
            tna={selectedTna}
            onSchedule={() => {
               fetchRTECMeetings();
               fetchReadyTNAs();
               fetchStatistics();
            }}
         />

         {/* RTEC Meeting Details Modal */}
         <RTECMeetingDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
               setShowDetailsModal(false);
               setSelectedMeeting(null);
            }}
            meeting={selectedMeeting}
            onAction={() => {
               fetchRTECMeetings();
               fetchStatistics();
            }}
         />
      </div>
   );
};

export default RTECManagement;
