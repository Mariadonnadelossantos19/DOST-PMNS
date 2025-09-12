import React from 'react';
import { Card, Button, Badge } from '../UI';
import { useDarkMode } from '../Context';
import { getStatusBadgeVariant, getStatusText, getStageStatus, getStageColor, canAccessStage } from './utils/enrollmentHelpers.jsx';

const EnrollmentCard = ({ 
   enrollment, 
   onViewDetails, 
   onMarkComplete, 
   onCompleteTna, 
   loading 
}) => {
   const { isDarkMode } = useDarkMode();

   const handleMarkComplete = () => {
      const currentStage = enrollment.stages.find(stage => {
         const status = getStageStatus(stage, enrollment);
         const canAccess = canAccessStage(enrollment, stage.id);
         return status === 'current' && canAccess;
      });
      if (currentStage) {
         onMarkComplete(enrollment._id || enrollment.id, currentStage.id);
      }
   };

   const handleCompleteTna = () => {
      onCompleteTna(enrollment);
   };

   return (
      <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
         <div className="space-y-3">
            {/* Customer Info */}
            <div className="text-center">
               <h4 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                  {enrollment.customer.name}
               </h4>
               <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
               }`}>{enrollment.customer.businessName}</p>
               <p className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>{enrollment.serviceData.name}</p>
            </div>

            {/* Status Badge */}
            <div className="text-center">
               <Badge variant={getStatusBadgeVariant(enrollment.status, enrollment.tnaStatus)}>
                  {getStatusText(enrollment)}
               </Badge>
               <p className={`text-xs mt-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>
                  Enrolled: {new Date(enrollment.enrolledDate).toLocaleDateString()}
               </p>
               {enrollment.tnaStatus === 'rejected' && enrollment.reviewNotes && (
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                     Rejection reason: {enrollment.reviewNotes}
                  </p>
               )}
            </div>

            {/* Service Progress - Compact */}
            <div className="space-y-2">
               <h5 className={`font-medium text-sm text-center transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
               }`}>Progress</h5>
               <div className="space-y-1">
                  {enrollment.stages.map((stage) => {
                     const status = getStageStatus(stage, enrollment);
                     const canAccess = canAccessStage(enrollment, stage.id);
                     const isDisabled = !canAccess && status !== 'completed';
                     
                     return (
                        <div key={stage.id} className="flex items-center space-x-2">
                           <div className={`w-4 h-4 rounded-full ${getStageColor(status)} flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}>
                              {status === 'completed' && (
                                 <span className="text-white text-xs">✓</span>
                              )}
                              {isDisabled && status !== 'completed' && (
                                 <span className="text-gray-400 text-xs">🔒</span>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className={`text-xs truncate ${status === 'current' ? 'font-medium text-blue-600' : isDisabled ? 'text-gray-400' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                 {stage.name}
                              </p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 pt-2">
               <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(enrollment)}
                  className="w-full"
               >
                  View Details
               </Button>
               
               {enrollment.stages.some(stage => {
                  const status = getStageStatus(stage, enrollment);
                  const canAccess = canAccessStage(enrollment, stage.id);
                  return status === 'current' && canAccess;
               }) && (
                  <Button
                     size="sm"
                     variant="outline"
                     onClick={handleMarkComplete}
                     disabled={loading}
                     className="w-full"
                  >
                     {loading ? 'Updating...' : 'Mark Complete'}
                  </Button>
               )}
               
               {enrollment.stages.find(stage => stage.id === 'tna') && enrollment.status === 'draft' && (
                  <Button
                     size="sm"
                     variant="primary"
                     onClick={handleCompleteTna}
                     className="w-full"
                  >
                     Complete TNA
                  </Button>
               )}
            </div>
         </div>
      </Card>
   );
};

export default EnrollmentCard;
