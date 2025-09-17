import React from 'react';
import { Button } from '../UI';
import { useApplicationReview } from './hooks/useApplicationReview';
import ApplicationsList from './ApplicationsList';
import ApplicationReviewModal from './ApplicationReviewModal';

const ApplicationsPageTemplate = () => {
   const {
      applications,
      applicationsLoading,
      selectedApplication,
      reviewStatus,
      reviewComments,
      setSelectedApplication,
      setReviewStatus,
      setReviewComments,
      fetchApplications,
      reviewApplication,
      getStatusColor,
      formatDate
   } = useApplicationReview();

   return (
      <div className="space-y-6">
         {/* Applications List */}
         <ApplicationsList
            applications={applications}
            applicationsLoading={applicationsLoading}
            fetchApplications={fetchApplications}
            setSelectedApplication={setSelectedApplication}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
         />

         {/* Review Modal */}
         <ApplicationReviewModal
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            reviewStatus={reviewStatus}
            setReviewStatus={setReviewStatus}
            reviewComments={reviewComments}
            setReviewComments={setReviewComments}
            reviewApplication={reviewApplication}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
         />
      </div>
   );
};

export default ApplicationsPageTemplate;
