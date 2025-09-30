import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Textarea } from '../../../Component/UI';
import { API_ENDPOINTS } from '../../../config/api';
import TNADetailsDisplay from './TNADetailsDisplay';

const TNAReportReview = () => {
   const [tnaReports, setTnaReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedReport, setSelectedReport] = useState(null);
   const [reviewStatus, setReviewStatus] = useState('');
   const [reviewComments, setReviewComments] = useState('');
   const [showReviewModal, setShowReviewModal] = useState(false);

   // Fetch TNA reports for DOST MIMAROPA review
   const fetchTNAReports = async () => {
      try {
         setLoading(true);
         setError('');
         const token = localStorage.getItem('authToken');
         
         if (!token) {
            throw new Error('Please login first');
         }

         console.log('TNAReportReview - Fetching TNA reports...');
         const response = await fetch('http://localhost:4000/api/tna/dost-mimaropa/reports', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         console.log('TNAReportReview - Response status:', response.status);

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
            throw new Error(`Failed to fetch TNA reports: ${response.status} ${response.statusText}`);
         }

         const result = await response.json();
         console.log('TNAReportReview - API Response:', result);
         
         if (result.success) {
            console.log('TNAReportReview - TNA Reports found:', result.data?.length || 0);
            setTnaReports(result.data || []);
         } else {
            throw new Error(result.message || 'Failed to fetch TNA reports');
         }
      } catch (error) {
         console.error('Error fetching TNA reports:', error);
         setError(error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTNAReports();
   }, []);

   // Review TNA report
   const reviewTNAReport = async () => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/${selectedReport._id}/dost-mimaropa/review`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               status: reviewStatus,
               comments: reviewComments
            })
         });

         if (!response.ok) {
            throw new Error('Failed to review TNA report');
         }

         const result = await response.json();
         
         if (result.success) {
            alert('TNA report reviewed successfully!');
            setShowReviewModal(false);
            setSelectedReport(null);
            setReviewStatus('');
            setReviewComments('');
            fetchTNAReports();
         } else {
            throw new Error(result.message || 'Failed to review TNA report');
         }
      } catch (error) {
         console.error('Error reviewing TNA report:', error);
         alert('Error reviewing TNA report: ' + error.message);
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

   // Get status color
   const getStatusColor = (status) => {
      const colors = {
         'submitted_to_dost': 'blue',
         'approved': 'green',
         'rejected': 'red',
         'returned': 'orange'
      };
      return colors[status] || 'gray';
   };

   // Get application status color
   const getApplicationStatusColor = (status) => {
      const colors = {
         'tna_report_submitted': 'blue',
         'dost_mimaropa_approved': 'green',
         'dost_mimaropa_rejected': 'red',
         'dost_mimaropa_review': 'blue'
      };
      return colors[status] || 'gray';
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading TNA reports...</span>
         </div>
      );
   }

   if (error) {
      return (
         <div className="text-center py-8">
            <div className="text-red-600 mb-4">
               <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading TNA Reports</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTNAReports}>Try Again</Button>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">TNA Report Review</h2>
            <Button onClick={fetchTNAReports}>
               Refresh
            </Button>
         </div>

         {/* TNA Reports List */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               TNA Reports Submitted for Review
            </h3>
            
            {tnaReports.length === 0 ? (
               <div className="text-center py-8">
                  <p className="text-gray-500">No TNA reports submitted for review</p>
                  <p className="text-xs text-gray-400 mt-2">
                     Debug: Check browser console for API response details
                  </p>
                  <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-700 mb-2">To see TNA reports here:</h4>
                     <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>PSTO must approve an application</li>
                        <li>PSTO schedules a TNA for the approved application</li>
                        <li>PSTO conducts the TNA and marks it as completed</li>
                        <li>PSTO uploads a TNA report</li>
                        <li>PSTO forwards the TNA report to DOST MIMAROPA</li>
                     </ol>
                  </div>
               </div>
            ) : (
               <div className="space-y-4">
                  {tnaReports.map((report) => (
                     <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                 TNA Report - {report.tnaId}
                              </h4>
                              <p className="text-sm text-gray-600">
                                 Application: {report.applicationId?.applicationId || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                 Proponent: {report.proponentId?.firstName} {report.proponentId?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                 Enterprise: {report.applicationId?.enterpriseName || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                 PSTO: {report.assignedPSTO?.name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                 Submitted: {formatDate(report.submittedToDostMimaropaAt)}
                              </p>
                              {report.tnaReport && (
                                 <p className="text-sm text-blue-600">
                                    Report File: {report.tnaReport.originalName}
                                 </p>
                              )}
                           </div>
                           <div className="flex items-center space-x-3">
                              <Badge color={getStatusColor(report.status)}>
                                 {report.status.replace('_', ' ')}
                              </Badge>
                              <Badge color={getApplicationStatusColor(report.applicationId?.status)}>
                                 {report.applicationId?.status?.replace('_', ' ')}
                              </Badge>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                    setSelectedReport(report);
                                    setShowReviewModal(true);
                                 }}
                              >
                                 Review
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </Card>

         {/* Enhanced Review Modal */}
         <Modal
            isOpen={showReviewModal}
            onClose={() => {
               setShowReviewModal(false);
               setSelectedReport(null);
               setReviewStatus('');
               setReviewComments('');
            }}
            title="TNA Report Review - DOST MIMAROPA"
            size="full"
            className="max-w-7xl"
         >
            {selectedReport && (
               <div className="space-y-6">
                  {/* TNA Details using reusable component */}
                  <TNADetailsDisplay tnaData={selectedReport} formatDate={formatDate} />

                  {/* Enhanced Review Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                     <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-gray-900">DOST MIMAROPA Review Decision</h4>
                           <p className="text-sm text-gray-600">Review and approve/reject this TNA report</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                 <svg className="w-4 h-4 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                 </svg>
                                 Review Decision
                              </label>
                              <select
                                 value={reviewStatus}
                                 onChange={(e) => setReviewStatus(e.target.value)}
                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                              >
                                 <option value="">Select your decision...</option>
                                 <option value="approved">✅ Approve - Accept TNA Report</option>
                                 <option value="rejected">❌ Reject - TNA Report Needs Major Changes</option>
                                 <option value="returned">🔄 Return for Revision - Minor Changes Required</option>
                              </select>
                           </div>

                           {/* Decision Info Cards */}
                           <div className="space-y-2">
                              {reviewStatus === 'approved' && (
                                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-700">
                                       <span className="font-medium">Approved:</span> The TNA report will be marked as approved and the application will proceed to the next stage.
                                    </p>
                                 </div>
                              )}
                              {reviewStatus === 'rejected' && (
                                 <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">
                                       <span className="font-medium">Rejected:</span> The TNA report will be returned to PSTO with your feedback for major revisions.
                                    </p>
                                 </div>
                              )}
                              {reviewStatus === 'returned' && (
                                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-sm text-orange-700">
                                       <span className="font-medium">Returned:</span> The TNA report will be sent back to PSTO for minor corrections based on your comments.
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-3">
                              <svg className="w-4 h-4 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.319-.336l-2.143.856a1.077 1.077 0 01-1.398-1.398l.856-2.143A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                              </svg>
                              Review Comments & Feedback
                           </label>
                           <Textarea
                              value={reviewComments}
                              onChange={(e) => setReviewComments(e.target.value)}
                              placeholder="Please provide detailed feedback about the TNA report. Include specific recommendations, concerns, or approval notes..."
                              rows={6}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                           />
                           <p className="text-xs text-gray-500 mt-2">
                              Your comments will be shared with the PSTO team and the proponent.
                           </p>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                        <div className="flex items-center text-sm text-gray-500">
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                           </svg>
                           Review decision is required to proceed
                        </div>
                        
                        <div className="flex space-x-3">
                           <Button
                              variant="outline"
                              onClick={() => {
                                 setShowReviewModal(false);
                                 setSelectedReport(null);
                                 setReviewStatus('');
                                 setReviewComments('');
                              }}
                              className="px-6 py-2"
                           >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                           </Button>
                           <Button
                              onClick={reviewTNAReport}
                              disabled={!reviewStatus}
                              className={`px-6 py-2 ${
                                 reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                 reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                 reviewStatus === 'returned' ? 'bg-orange-600 hover:bg-orange-700' :
                                 'bg-blue-600 hover:bg-blue-700'
                              }`}
                           >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {!reviewStatus ? 'Submit Review' : 
                               reviewStatus === 'approved' ? 'Approve TNA Report' :
                               reviewStatus === 'rejected' ? 'Reject TNA Report' :
                               'Return for Revision'}
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </Modal>
      </div>
   );
};

export default TNAReportReview;
