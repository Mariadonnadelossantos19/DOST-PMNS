import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../UI';

const ApplicationStatusTracker = ({ application, onStatusUpdate }) => {
   const [currentStatus, setCurrentStatus] = useState(application?.status || 'pending');
   const [currentStage, setCurrentStage] = useState(application?.currentStage || 'tna_application');

   useEffect(() => {
      if (application) {
         setCurrentStatus(application.status);
         setCurrentStage(application.currentStage);
      }
   }, [application]);

   const getStatusInfo = (status, stage) => {
      const statusMap = {
         'pending': {
            label: 'Pending Review',
            color: 'yellow',
            description: 'Your application is being reviewed by PSTO',
            icon: '⏳'
         },
         'under_review': {
            label: 'Under Review',
            color: 'blue',
            description: 'PSTO is currently reviewing your application',
            icon: '👀'
         },
         'psto_approved': {
            label: 'PSTO Approved',
            color: 'green',
            description: 'Your application has been approved by PSTO. TNA will be scheduled soon.',
            icon: '✅'
         },
         'psto_rejected': {
            label: 'PSTO Rejected',
            color: 'red',
            description: 'Your application was rejected by PSTO',
            icon: '❌'
         },
         'returned': {
            label: 'Returned for Revision',
            color: 'orange',
            description: 'Please revise and resubmit your application',
            icon: '🔄'
         },
         'tna_scheduled': {
            label: 'TNA Scheduled',
            color: 'blue',
            description: 'Technology Needs Assessment has been scheduled',
            icon: '📅'
         },
         'tna_conducted': {
            label: 'TNA Conducted',
            color: 'green',
            description: 'Technology Needs Assessment has been conducted and report is being prepared',
            icon: '📋'
         },
         'tna_report_submitted': {
            label: 'TNA Report Submitted',
            color: 'blue',
            description: 'TNA report has been submitted to DOST MIMAROPA for review',
            icon: '📤'
         },
         'dost_mimaropa_approved': {
            label: 'DOST MIMAROPA Approved',
            color: 'green',
            description: 'Your application has been approved by DOST MIMAROPA',
            icon: '🎉'
         },
         'dost_mimaropa_rejected': {
            label: 'DOST MIMAROPA Rejected',
            color: 'red',
            description: 'Your application was rejected by DOST MIMAROPA',
            icon: '❌'
         },
         'rtec_approved': {
            label: 'RTEC Approved',
            color: 'green',
            description: 'Your application has been approved by RTEC',
            icon: '🎉'
         },
         'rtec_rejected': {
            label: 'RTEC Rejected',
            color: 'red',
            description: 'Your application was rejected by RTEC',
            icon: '❌'
         },
         'implementation': {
            label: 'Implementation',
            color: 'purple',
            description: 'Your project is now in implementation phase',
            icon: '🚀'
         },
         'completed': {
            label: 'Completed',
            color: 'green',
            description: 'Your project has been completed successfully',
            icon: '🏆'
         }
      };

      return statusMap[status] || {
         label: 'Unknown Status',
         color: 'gray',
         description: 'Status information not available',
         icon: '❓'
      };
   };

   const getStageInfo = (stage) => {
      const stageMap = {
         'application_submitted': {
            label: 'Application Submitted',
            description: 'Your application has been submitted and is awaiting PSTO review'
         },
         'psto_review': {
            label: 'PSTO Review',
            description: 'PSTO is reviewing your application and documents'
         },
         'psto_approved': {
            label: 'PSTO Approved',
            description: 'Your application has been approved by PSTO. TNA will be scheduled.'
         },
         'tna_scheduled': {
            label: 'TNA Scheduled',
            description: 'Technology Needs Assessment has been scheduled'
         },
         'tna_conducted': {
            label: 'TNA Conducted',
            description: 'Technology Needs Assessment has been conducted'
         },
         'tna_report_submitted': {
            label: 'TNA Report Submitted',
            description: 'TNA report has been submitted to DOST MIMAROPA for review'
         },
         'dost_mimaropa_review': {
            label: 'DOST MIMAROPA Review',
            description: 'DOST MIMAROPA is reviewing the TNA report'
         },
         'rtec_evaluation': {
            label: 'RTEC Evaluation',
            description: 'Regional Technical Evaluation Committee evaluation'
         },
         'implementation': {
            label: 'Implementation',
            description: 'Project implementation and monitoring'
         },
         'completed': {
            label: 'Completed',
            description: 'Project completed successfully'
         }
      };

      return stageMap[stage] || {
         label: 'Unknown Stage',
        description: 'Stage information not available'
      };
   };

   const getProgressPercentage = (stage) => {
      const stageProgress = {
         'application_submitted': 10,
         'psto_review': 25,
         'psto_approved': 40,
         'tna_scheduled': 50,
         'tna_conducted': 60,
         'tna_report_submitted': 70,
         'dost_mimaropa_review': 80,
         'rtec_evaluation': 90,
         'implementation': 95,
         'completed': 100
      };

      return stageProgress[stage] || 0;
   };

   const statusInfo = getStatusInfo(currentStatus, currentStage);
   const stageInfo = getStageInfo(currentStage);
   const progressPercentage = getProgressPercentage(currentStage);

   return (
      <div className="space-y-6">
         <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-900">
                  Application Status
               </h3>
               <Badge color={statusInfo.color} size="lg">
                  {statusInfo.icon} {statusInfo.label}
               </Badge>
            </div>

            <p className="text-gray-600 mb-4">
               {statusInfo.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
               <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                     style={{ width: `${progressPercentage}%` }}
                  ></div>
               </div>
            </div>

            {/* Current Stage */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h4 className="font-medium text-blue-900 mb-1">
                  Current Stage: {stageInfo.label}
               </h4>
               <p className="text-sm text-blue-700">
                  {stageInfo.description}
               </p>
            </div>
         </Card>

         {/* Status History */}
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Application Timeline
            </h3>
            
            <div className="space-y-4">
               {/* Application Submitted */}
               <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">✓</span>
                     </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">
                        Application Submitted
                     </p>
                     <p className="text-xs text-gray-500">
                        {application?.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                     </p>
                  </div>
               </div>

               {/* PSTO Review */}
               <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['psto_approved', 'psto_rejected', 'returned', 'tna_scheduled', 'tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                           ? 'bg-green-100' : 'bg-gray-100'
                     }`}>
                        <span className={`text-sm ${
                           ['psto_approved', 'psto_rejected', 'returned', 'tna_scheduled', 'tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                              ? 'text-green-600' : 'text-gray-400'
                        }`}>
                           {['psto_approved', 'psto_rejected', 'returned', 'tna_scheduled', 'tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus) ? '✓' : '○'}
                        </span>
                     </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">
                        PSTO Review
                     </p>
                     <p className="text-xs text-gray-500">
                        {application?.pstoReviewedAt ? new Date(application.pstoReviewedAt).toLocaleDateString() : 'Pending'}
                     </p>
                     {application?.pstoComments && (
                        <p className="text-xs text-gray-600 mt-1">
                           Comments: {application.pstoComments}
                        </p>
                     )}
                  </div>
               </div>

               {/* TNA Assessment */}
               {['tna_scheduled', 'tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus) && (
                  <div className="flex items-start space-x-3">
                     <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                           ['tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                              ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                           <span className={`text-sm ${
                              ['tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                                 ? 'text-green-600' : 'text-yellow-600'
                           }`}>
                              {['tna_completed', 'dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus) ? '✓' : '⏳'}
                           </span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                           TNA Assessment
                        </p>
                        <p className="text-xs text-gray-500">
                           {currentStatus === 'tna_scheduled' ? 'Scheduled' : 
                            currentStatus === 'tna_completed' ? 'Completed' : 'In Progress'}
                        </p>
                     </div>
                  </div>
               )}

               {/* DOST MIMAROPA Review */}
               {['dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus) && (
                  <div className="flex items-start space-x-3">
                     <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                           ['dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                              ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                           <span className={`text-sm ${
                              ['dost_mimaropa_approved', 'dost_mimaropa_rejected', 'rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                                 ? 'text-green-600' : 'text-gray-400'
                           }`}>
                              ✓
                           </span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                           DOST MIMAROPA Review
                        </p>
                        <p className="text-xs text-gray-500">
                           {currentStatus === 'dost_mimaropa_approved' ? 'Approved' : 
                            currentStatus === 'dost_mimaropa_rejected' ? 'Rejected' : 'Completed'}
                        </p>
                     </div>
                  </div>
               )}

               {/* RTEC Evaluation */}
               {['rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus) && (
                  <div className="flex items-start space-x-3">
                     <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                           ['rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                              ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                           <span className={`text-sm ${
                              ['rtec_approved', 'rtec_rejected', 'implementation', 'completed'].includes(currentStatus)
                                 ? 'text-green-600' : 'text-gray-400'
                           }`}>
                              ✓
                           </span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                           RTEC Evaluation
                        </p>
                        <p className="text-xs text-gray-500">
                           {currentStatus === 'rtec_approved' ? 'Approved' : 
                            currentStatus === 'rtec_rejected' ? 'Rejected' : 'Completed'}
                        </p>
                     </div>
                  </div>
               )}

               {/* Implementation */}
               {['implementation', 'completed'].includes(currentStatus) && (
                  <div className="flex items-start space-x-3">
                     <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                           currentStatus === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                           <span className={`text-sm ${
                              currentStatus === 'completed' ? 'text-green-600' : 'text-blue-600'
                           }`}>
                              {currentStatus === 'completed' ? '✓' : '🚀'}
                           </span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                           Implementation
                        </p>
                        <p className="text-xs text-gray-500">
                           {currentStatus === 'completed' ? 'Completed' : 'In Progress'}
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </Card>
      </div>
   );
};

export default ApplicationStatusTracker;
