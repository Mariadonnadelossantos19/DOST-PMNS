import React from 'react';
import { ApplicationMonitor } from '../../Component/ProgramApplication';

const ApplicationMonitorPage = () => {
   console.log('ApplicationMonitorPage rendered');
   
   return (
      <div className="min-h-screen bg-gray-50">
         <div className="p-6">
            <ApplicationMonitor />
         </div>
      </div>
   );
};

export default ApplicationMonitorPage;
