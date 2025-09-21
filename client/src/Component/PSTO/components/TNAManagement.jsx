import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '../../UI';
import TNASchedulerForm from './TNASchedulerForm';

const TNAManagement = ({ currentUser }) => {
   const [applications, setApplications] = useState([]);
   const [tnas, setTnas] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [showScheduler, setShowScheduler] = useState(false);

   // Fetch applications that need TNA scheduling
   const fetchApplications = async () => {
      try {
         setLoading(true);
         const response = await fetch('http://localhost:4000/api/programs/psto/applications', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
         });

         if (response.ok) {
            const data = await response.json();
            console.log('Fetched applications for TNA:', data.data || []);
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
      }
   };

   useEffect(() => {
      fetchApplications();
      fetchTNAs();
   }, []);

   const handleScheduleTNA = (application) => {
      console.log('Schedule TNA clicked for application:', application);
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
            alert('TNA scheduled successfully!');
            setShowScheduler(false);
            setSelectedApplication(null);
            fetchTNAs(); // Refresh TNA list
         } else {
            const errorData = await response.json();
            alert(`Failed to schedule TNA: ${errorData.message}`);
         }
      } catch (error) {
         console.error('Error scheduling TNA:', error);
         alert('Error scheduling TNA. Please try again.');
      }
   };

   const getStatusColor = (status) => {
      const colors = {
         'pending': 'yellow',
         'scheduled': 'blue',
         'in_progress': 'purple',
         'completed': 'green',
         'report_uploaded': 'blue',
         'submitted_to_dost': 'blue',
         'cancelled': 'red'
      };
      return colors[status] || 'gray';
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

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">TNA Management</h2>
            <Button onClick={() => { fetchApplications(); fetchTNAs(); }}>
               Refresh
            </Button>
         </div>

         {/* Applications Ready for TNA */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Applications Ready for TNA Scheduling
            </h3>
            
            {loading ? (
               <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading applications...</p>
               </div>
            ) : applications.length === 0 ? (
               <div className="text-center py-8">
                  <p className="text-gray-500">No applications ready for TNA scheduling</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {(() => {
                     // Filter applications that are PSTO-approved and ready for TNA scheduling
                     const filteredApps = applications.filter(app => app.status === 'psto_approved');
                     console.log('PSTO-approved applications for TNA:', filteredApps);
                     console.log('All application statuses:', applications.map(app => ({ id: app._id, status: app.status })));
                     return filteredApps;
                  })()
                     .map((application) => (
                        <div key={application._id} className="border border-gray-200 rounded-lg p-4">
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

         {/* Existing TNAs */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Scheduled TNAs
            </h3>
            
            {tnas.length === 0 ? (
               <div className="text-center py-8">
                  <p className="text-gray-500">No TNAs scheduled yet</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {tnas.map((tna) => (
                     <div key={tna._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                 TNA for {tna.applicationId?.programName} Application
                              </h4>
                              <p className="text-sm text-gray-600">
                                 Proponent: {tna.proponentId?.firstName} {tna.proponentId?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                 Scheduled: {new Date(tna.scheduledDate).toLocaleDateString()} at {tna.scheduledTime}
                              </p>
                              <p className="text-sm text-gray-600">
                                 Location: {tna.location}
                              </p>
                              {tna.assessors && tna.assessors.length > 0 && (
                                 <p className="text-sm text-gray-600">
                                    Assessors: {tna.assessors.map(a => a.name).join(', ')}
                                 </p>
                              )}
                           </div>
                           <div className="flex items-center space-x-3">
                              <Badge color={getStatusColor(tna.status)}>
                                 {tna.status.replace('_', ' ')}
                              </Badge>
                              <Button
                                 variant="outline"
                                 size="sm"
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

         {/* TNA Scheduler Modal */}
         {showScheduler && selectedApplication && (
            <Modal
               isOpen={showScheduler}
               onClose={() => {
                  setShowScheduler(false);
                  setSelectedApplication(null);
               }}
               title="Schedule Technology Needs Assessment"
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
      </div>
   );
};

export default TNAManagement;
