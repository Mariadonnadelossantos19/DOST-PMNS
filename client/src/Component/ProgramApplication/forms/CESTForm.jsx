import React from 'react';

const CESTForm = ({ formData, errors, handleInputChange }) => {
   return (
      <>
         {/* Community Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Name *
                  </label>
                  <input
                     type="text"
                     name="communityName"
                     value={formData.communityName}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityName ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter community name"
                  />
                  {errors.communityName && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityName}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Population *
                  </label>
                  <input
                     type="number"
                     name="communityPopulation"
                     value={formData.communityPopulation}
                     onChange={handleInputChange}
                     min="1"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityPopulation ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter population"
                  />
                  {errors.communityPopulation && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityPopulation}</p>
                  )}
               </div>
               
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Location *
                  </label>
                  <textarea
                     name="communityLocation"
                     value={formData.communityLocation}
                     onChange={handleInputChange}
                     rows={2}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityLocation ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter complete community location"
                  />
                  {errors.communityLocation && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityLocation}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Community Leader Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Leader</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Leader Name
                  </label>
                  <input
                     type="text"
                     name="communityLeader.name"
                     value={formData.communityLeader?.name || ''}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                     placeholder="Enter leader name"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Position
                  </label>
                  <input
                     type="text"
                     name="communityLeader.position"
                     value={formData.communityLeader?.position || ''}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                     placeholder="Enter position"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Contact
                  </label>
                  <input
                     type="text"
                     name="communityLeader.contact"
                     value={formData.communityLeader?.contact || ''}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                     placeholder="Enter contact information"
                  />
               </div>
            </div>
         </div>

         {/* Project Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Project Title *
                  </label>
                  <input
                     type="text"
                     name="projectTitle"
                     value={formData.projectTitle}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.projectTitle ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter project title"
                  />
                  {errors.projectTitle && (
                     <p className="text-red-500 text-xs mt-1">{errors.projectTitle}</p>
                  )}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Duration (months) *
                     </label>
                     <input
                        type="number"
                        name="projectDuration"
                        value={formData.projectDuration}
                        onChange={handleInputChange}
                        min="1"
                        max="60"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                           errors.projectDuration ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter duration in months"
                     />
                     {errors.projectDuration && (
                        <p className="text-red-500 text-xs mt-1">{errors.projectDuration}</p>
                     )}
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requested Amount (PHP) *
                     </label>
                     <input
                        type="number"
                        name="requestedAmount"
                        value={formData.requestedAmount}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                           errors.requestedAmount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter requested amount"
                     />
                     {errors.requestedAmount && (
                        <p className="text-red-500 text-xs mt-1">{errors.requestedAmount}</p>
                     )}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Project Description *
                  </label>
                  <textarea
                     name="projectDescription"
                     value={formData.projectDescription}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.projectDescription ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe your community project"
                  />
                  {errors.projectDescription && (
                     <p className="text-red-500 text-xs mt-1">{errors.projectDescription}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Technology Focus */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Technology Area *
                  </label>
                  <select
                     name="technologyArea"
                     value={formData.technologyArea}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.technologyArea ? 'border-red-500' : 'border-gray-300'
                     }`}
                  >
                     <option value="">Select technology area</option>
                     <option value="Agriculture">Agriculture</option>
                     <option value="Health">Health</option>
                     <option value="Education">Education</option>
                     <option value="Environment">Environment</option>
                     <option value="Energy">Energy</option>
                     <option value="Information Technology">Information Technology</option>
                     <option value="Water">Water</option>
                     <option value="Other">Other</option>
                  </select>
                  {errors.technologyArea && (
                     <p className="text-red-500 text-xs mt-1">{errors.technologyArea}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Specific Technology *
                  </label>
                  <input
                     type="text"
                     name="specificTechnology"
                     value={formData.specificTechnology}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.specificTechnology ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter specific technology"
                  />
                  {errors.specificTechnology && (
                     <p className="text-red-500 text-xs mt-1">{errors.specificTechnology}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Community Needs and Solutions */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Needs and Solutions</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Proposed Solution *
                  </label>
                  <textarea
                     name="proposedSolution"
                     value={formData.proposedSolution}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.proposedSolution ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe your proposed solution"
                  />
                  {errors.proposedSolution && (
                     <p className="text-red-500 text-xs mt-1">{errors.proposedSolution}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Expected Impact *
                  </label>
                  <textarea
                     name="expectedImpact"
                     value={formData.expectedImpact}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.expectedImpact ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe the expected impact on the community"
                  />
                  {errors.expectedImpact && (
                     <p className="text-red-500 text-xs mt-1">{errors.expectedImpact}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Participation Plan *
                  </label>
                  <textarea
                     name="communityParticipation"
                     value={formData.communityParticipation}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityParticipation ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe how the community will participate in the project"
                  />
                  {errors.communityParticipation && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityParticipation}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Budget Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Total Budget (PHP) *
                  </label>
                  <input
                     type="number"
                     name="totalBudget"
                     value={formData.totalBudget}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.totalBudget ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter total budget"
                  />
                  {errors.totalBudget && (
                     <p className="text-red-500 text-xs mt-1">{errors.totalBudget}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Contribution (PHP) *
                  </label>
                  <input
                     type="number"
                     name="communityContribution"
                     value={formData.communityContribution}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityContribution ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter community contribution"
                  />
                  {errors.communityContribution && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityContribution}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Requested Amount (PHP) *
                  </label>
                  <input
                     type="number"
                     name="requestedAmount"
                     value={formData.requestedAmount}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.requestedAmount ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter requested amount"
                  />
                  {errors.requestedAmount && (
                     <p className="text-red-500 text-xs mt-1">{errors.requestedAmount}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Required Documents */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Profile *
                  </label>
                  <input
                     type="file"
                     name="communityProfile"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityProfile ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.communityProfile && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityProfile}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Project Proposal *
                  </label>
                  <input
                     type="file"
                     name="projectProposal"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.projectProposal ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.projectProposal && (
                     <p className="text-red-500 text-xs mt-1">{errors.projectProposal}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Community Resolution *
                  </label>
                  <input
                     type="file"
                     name="communityResolution"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.communityResolution ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.communityResolution && (
                     <p className="text-red-500 text-xs mt-1">{errors.communityResolution}</p>
                  )}
               </div>
            </div>
         </div>
      </>
   );
};

export default CESTForm;
