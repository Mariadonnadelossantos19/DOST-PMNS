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
            console.log('TNAReportReview - Report statuses:', result.data?.map(r => ({ id: r._id, status: r.status, tnaId: r.tnaId })));
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

   // View/Download TNA report
   const handleViewReport = async () => {
      try {
         const token = localStorage.getItem('authToken');
         if (!token) {
            alert('Please login first');
            return;
         }

         const response = await fetch(`http://localhost:4000/api/tna/${selectedReport._id}/download-report`, {
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
         a.download = selectedReport.tnaReport?.originalName || 'tna-report.pdf';
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (error) {
         console.error('Error downloading report:', error);
         alert('Error downloading report: ' + error.message);
      }
   };

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
            console.log('TNAReportReview - Review successful, refreshing reports...');
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


   if (loading) {
      return (
         <div className="space-y-6">
            <DashboardHeader
               title="TNA Report Review"
               subtitle="Loading TNA reports..."
               color="blue"
            />
            <div className="flex items-center justify-center h-64">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading TNA reports...</p>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <DashboardHeader
               title="TNA Report Review"
               subtitle="Review and approve TNA reports submitted by PSTO offices"
               color="red"
            />
            <Alert
               type="error"
               title="Error Loading TNA Reports"
               message={error}
               action={
                  <Button onClick={fetchTNAReports} size="sm">
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
            title="TNA Report Review"
            subtitle="Review and approve TNA reports submitted by PSTO offices"
            color="purple"
         >
            <Button onClick={fetchTNAReports} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               Refresh
            </Button>
         </DashboardHeader>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
               title="Total Reports"
               value={tnaReports.length}
               icon="📊"
               color="blue"
               subtitle="Reports submitted for review"
            />
            <StatsCard
               title="Pending Review"
               value={tnaReports.filter(report => report.status === 'forwarded_to_dost_mimaropa').length}
               icon="⏳"
               color="yellow"
               subtitle="Awaiting DOST review"
            />
            <StatsCard
               title="Reviewed"
               value={tnaReports.filter(report => ['dost_mimaropa_approved', 'dost_mimaropa_rejected', 'returned_to_psto'].includes(report.status)).length}
               icon="✅"
               color="green"
               subtitle="Completed reviews"
            />
         </div>

         {/* TNA Reports List */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               TNA Reports Submitted for Review
            </h3>
            
            {tnaReports.length === 0 ? (
               <div className="space-y-4">
                  <Alert
                     type="info"
                     title="No TNA Reports Available"
                     message="There are currently no TNA reports submitted for review."
                  />
                  <Alert
                     type="warning"
                     title="TNA Report Workflow"
                     message="For TNA reports to appear here, PSTO offices must: (1) Approve applications, (2) Schedule and conduct TNAs, (3) Upload TNA reports, and (4) Forward them to DOST MIMAROPA for review."
                  />
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
                              <StatusBadge 
                                 status={report.status}
                                 size="sm"
                              />
                              <StatusBadge 
                                 status={report.applicationId?.status}
                                 size="sm"
                              />
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

         {/* Clean Minimalist TNA Report Review Modal */}
         {showReviewModal && selectedReport && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReport(null);
                  setReviewStatus('');
                  setReviewComments('');
               }} />

               <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                     {/* Clean Header */}
                     <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <h2 className="text-base font-medium text-gray-900">TNA Report Review</h2>
                              <p className="text-base text-gray-600">DOST MIMAROPA Review Panel</p>
                           </div>
                           <div className="flex items-center space-x-3">
                              {selectedReport?.tnaReport?.originalName && (
                                 <button
                                    onClick={handleViewReport}
                                    className="px-4 py-2 text-base text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-md transition-colors"
                                 >
                                    Download Report
                                 </button>
                              )}
                              <button
                                 onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedReport(null);
                                    setReviewStatus('');
                                    setReviewComments('');
                                 }}
                                 className="w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Content Area */}
                     <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                           <TNADetailsDisplay tnaData={selectedReport} formatDate={formatDate} />
                        </div>
                     </div>

                     {/* Review Section */}
                     <div className="border-t border-gray-200 bg-white px-6 py-4">
                        <div className="space-y-4">
                           <h3 className="text-base font-medium text-gray-900">Review Decision</h3>
                           
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-base font-medium text-gray-700 mb-2">Decision</label>
                                 <select
                                    value={reviewStatus}
                                    onChange={(e) => setReviewStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                 >
                                    <option value="">Select your decision...</option>
                                    <option value="approved">Approve TNA Report</option>
                                    <option value="rejected">Reject TNA Report</option>
                                    <option value="returned">Return for Revision</option>
                                 </select>
                              </div>

                              <div>
                                 <label className="block text-base font-medium text-gray-700 mb-2">Comments & Feedback</label>
                                 <Textarea
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder="Enter your review comments..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                 />
                              </div>
                           </div>

                           {/* Status Info */}
                           {reviewStatus && (
                              <div className={`p-4 rounded-md border ${
                                 reviewStatus === 'approved' ? 'bg-green-50 border-green-200' :
                                 reviewStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                                 'bg-orange-50 border-orange-200'
                              }`}>
                                 <p className={`text-base ${
                                    reviewStatus === 'approved' ? 'text-green-800' :
                                    reviewStatus === 'rejected' ? 'text-red-800' :
                                    'text-orange-800'
                                 }`}>
                                    {reviewStatus === 'approved' && 'The TNA report will be approved and the application will proceed to the next stage.'}
                                    {reviewStatus === 'rejected' && 'The TNA report will be rejected and returned to PSTO for major revisions.'}
                                    {reviewStatus === 'returned' && 'The TNA report will be returned to PSTO for minor corrections.'}
                                 </p>
                              </div>
                           )}

                           {/* Action Buttons */}
                           <div className="flex justify-end space-x-3">
                              <Button
                                 variant="outline"
                                 onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedReport(null);
                                    setReviewStatus('');
                                    setReviewComments('');
                                 }}
                                 className="px-4 py-2 text-base"
                              >
                                 Cancel
                              </Button>
                              <Button
                                 onClick={reviewTNAReport}
                                 disabled={!reviewStatus}
                                 className={`px-4 py-2 text-base ${
                                    reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                    reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                    reviewStatus === 'returned' ? 'bg-orange-600 hover:bg-orange-700' :
                                    'bg-blue-600 hover:bg-blue-700'
                                 } ${!reviewStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                 {reviewStatus === 'approved' ? 'Approve Report' :
                                  reviewStatus === 'rejected' ? 'Reject Report' :
                                  reviewStatus === 'returned' ? 'Return for Revision' :
                                  'Submit Review'}
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TNAReportReview;
