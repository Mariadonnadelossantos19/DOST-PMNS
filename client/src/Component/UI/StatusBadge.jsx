import React from 'react';

/**
 * Standardized Status Badge Component
 * Provides consistent status display across the application
 */
const StatusBadge = ({ 
   status, 
   size = 'sm',
   className = '' 
}) => {
   const getStatusConfig = (status) => {
      const statusMap = {
         // Application Statuses - Correct DOST PMNS Workflow
         'pending': { color: 'yellow', text: 'Pending' },
         'under_review': { color: 'blue', text: 'Under Review' },
         'psto_approved': { color: 'green', text: 'PSTO Approved' },
         'psto_rejected': { color: 'red', text: 'PSTO Rejected' },
         'tna_scheduled': { color: 'blue', text: 'TNA Scheduled' },
         'tna_conducted': { color: 'green', text: 'TNA Conducted' },
         'tna_report_submitted': { color: 'blue', text: 'TNA Report Submitted' },
         'dost_mimaropa_approved': { color: 'green', text: 'DOST MIMAROPA Approved' },
         'dost_mimaropa_rejected': { color: 'red', text: 'DOST MIMAROPA Rejected' },
         'returned': { color: 'orange', text: 'Returned' },
         'rejected': { color: 'red', text: 'Rejected' },
         'approved': { color: 'green', text: 'Approved' },
         
         // TNA Statuses
         'scheduled': { color: 'blue', text: 'Scheduled' },
         'in_progress': { color: 'purple', text: 'In Progress' },
         'completed': { color: 'green', text: 'Completed' },
         'report_uploaded': { color: 'blue', text: 'Report Uploaded' },
         'submitted_to_dost': { color: 'blue', text: 'Submitted to DOST' },
         'cancelled': { color: 'red', text: 'Cancelled' },
         
         // User Statuses
         'active': { color: 'green', text: 'Active' },
         'inactive': { color: 'gray', text: 'Inactive' },
         
         // Project Statuses
         'draft': { color: 'gray', text: 'Draft' },
         'published': { color: 'green', text: 'Published' },
         'archived': { color: 'gray', text: 'Archived' }
      };

      return statusMap[status] || { color: 'gray', text: status };
   };

   const config = getStatusConfig(status);
   const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-sm'
   };

   const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800'
   };

   return (
      <span
         className={`
            inline-flex items-center font-medium rounded-full
            ${sizeClasses[size]}
            ${colorClasses[config.color]}
            ${className}
         `}
      >
         {config.text}
      </span>
   );
};

export default StatusBadge;
