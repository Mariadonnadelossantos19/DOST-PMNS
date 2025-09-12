// Helper functions for enrollment system
export const getStatusBadgeVariant = (status, tnaStatus) => {
   if (status === 'draft') return 'secondary';
   if (status === 'submitted' && tnaStatus === 'under_review') return 'warning';
   if (status === 'approved' && tnaStatus === 'approved') return 'success';
   if (status === 'rejected' && tnaStatus === 'rejected') return 'danger';
   if (status === 'in_progress') return 'info';
   if (status === 'completed') return 'success';
   return 'secondary';
};

export const getStatusText = (enrollment) => {
   if (enrollment.status === 'draft') return 'Draft';
   if (enrollment.status === 'submitted' && enrollment.tnaStatus === 'under_review') return 'Under Review';
   if (enrollment.status === 'approved' && enrollment.tnaStatus === 'approved') return 'TNA Approved';
   if (enrollment.status === 'rejected' && enrollment.tnaStatus === 'rejected') return 'TNA Rejected';
   if (enrollment.status === 'in_progress') return 'In Progress';
   if (enrollment.status === 'completed') return 'Completed';
   return enrollment.status;
};

export const getStageStatus = (stage, enrollment) => {
   const stageData = enrollment.stageData?.find(s => s.stageId === stage.id);
   if (stageData?.completed) return 'completed';
   if (stageData?.inProgress) return 'current';
   return 'pending';
};

export const getStageColor = (status) => {
   switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
   }
};

export const canAccessStage = (enrollment, stageId) => {
   if (stageId === 'tna') return true;
   return enrollment.tnaStatus === 'approved';
};

export const serviceOptions = {
   setup: {
      name: 'SETUP',
      description: 'Small Enterprise Technology Upgrading Program',
      color: 'blue',
      icon: (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
         </svg>
      )
   },
   gia: {
      name: 'GIA',
      description: 'Grants-in-Aid Program',
      color: 'green',
      icon: (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
         </svg>
      )
   },
   cest: {
      name: 'CEST',
      description: 'Community Empowerment through Science and Technology',
      color: 'purple',
      icon: (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
         </svg>
      )
   },
   sscp: {
      name: 'SSCP',
      description: 'Small Scale Coconut Processing',
      color: 'yellow',
      icon: (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
         </svg>
      )
   }
};
