import React from 'react';
import BasePSTODashboard from '../../../../Component/PSTO/BasePSTODashboard';

/**
 * Marinduque PSTO Dashboard
 * Clean, maintainable dashboard using the base template
 */
const MarinduqueDashboard = ({ currentUser }) => {
   // Marinduque-specific data
   const marinduqueData = {
      projects: [
         {
            id: 1,
            title: 'Marinduque SETUP Program',
            description: 'Small Enterprise Technology Upgrading Program for Marinduque',
            status: 'active',
            progress: 50,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            province: 'Marinduque',
            beneficiaries: 15
         },
         {
            id: 2,
            title: 'Marinduque GIA Research',
            description: 'Grants-in-Aid research projects in Marinduque',
            status: 'in progress',
            progress: 25,
            startDate: '2024-01-15',
            endDate: '2024-09-30',
            province: 'Marinduque',
            beneficiaries: 10
         }
      ],
      tasks: [
         {
            id: 1,
            title: 'Site visit to Boac, Marinduque',
            description: 'Conduct technology assessment for local MSMEs',
            status: 'in progress',
            priority: 'high',
            dueDate: '2024-03-05',
            province: 'Marinduque'
         },
         {
            id: 2,
            title: 'SETUP application review',
            description: 'Review applications from Marinduque entrepreneurs',
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-03-15',
            province: 'Marinduque'
         }
      ]
   };
                  
                  return (
      <BasePSTODashboard
         province="Marinduque"
         currentUser={currentUser}
         provinceData={marinduqueData}
      />
   );
};

export default MarinduqueDashboard;
