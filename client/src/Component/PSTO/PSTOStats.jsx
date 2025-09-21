import React from 'react';
import { Card } from '../UI';

/**
 * Reusable PSTO statistics component
 * Displays key metrics for PSTO dashboard
 */
const PSTOStats = ({ stats, province }) => {
   const statCards = [
      {
         title: 'Total Projects',
         value: stats.totalProjects,
         icon: 'P',
         color: 'bg-teal-500',
         description: 'Active projects in ' + province
      },
      {
         title: 'Active Projects',
         value: stats.activeProjects,
         icon: '✓',
         color: 'bg-green-500',
         description: 'Currently running'
      },
      {
         title: 'Total Tasks',
         value: stats.totalTasks,
         icon: '📋',
         color: 'bg-yellow-500',
         description: 'Assigned tasks'
      },
      {
         title: 'Beneficiaries',
         value: stats.totalBeneficiaries,
         icon: '👥',
         color: 'bg-purple-500',
         description: 'People helped'
      },
      {
         title: 'Proponents',
         value: stats.totalProponents,
         icon: '🏢',
         color: 'bg-indigo-500',
         description: 'Registered proponents'
      },
      {
         title: 'Pending Activations',
         value: stats.pendingActivations,
         icon: '⏳',
         color: 'bg-orange-500',
         description: 'Awaiting activation'
      }
   ];

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
         {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{stat.icon}</span>
                     </div>
                  </div>
                  <div className="ml-3 flex-1">
                     <p className="text-xs font-medium text-gray-500 truncate">{stat.title}</p>
                     <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
               </div>
            </Card>
         ))}
      </div>
   );
};

export default PSTOStats;
