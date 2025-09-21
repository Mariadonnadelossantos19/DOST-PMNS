import React from 'react';
import BasePSTODashboard from '../../Component/PSTO/BasePSTODashboard';

/**
 * Unified PSTO Dashboard
 * Uses BasePSTODashboard with province-specific data
 */
const PSTODashboard = ({ currentUser }) => {
   // Province-specific data can be loaded from API or config
   const provinceData = {
      projects: [],
      tasks: []
   };

   return (
      <BasePSTODashboard
         province={currentUser.province}
         currentUser={currentUser}
         provinceData={provinceData}
      />
   );
};

export default PSTODashboard;
