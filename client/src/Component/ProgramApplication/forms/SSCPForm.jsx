import React from 'react';

const SSCPForm = ({ formData, errors, handleInputChange }) => {
   return (
      <>
         {/* Enterprise Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Enterprise Name *
                  </label>
                  <input
                     type="text"
                     name="enterpriseName"
                     value={formData.enterpriseName}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.enterpriseName ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter enterprise name"
                  />
                  {errors.enterpriseName && (
                     <p className="text-red-500 text-xs mt-1">{errors.enterpriseName}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Enterprise Type *
                  </label>
                  <select
                     name="enterpriseType"
                     value={formData.enterpriseType}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.enterpriseType ? 'border-red-500' : 'border-gray-300'
                     }`}
                  >
                     <option value="">Select enterprise type</option>
                     <option value="Startup">Startup</option>
                     <option value="SME">SME</option>
                     <option value="Corporation">Corporation</option>
                     <option value="Cooperative">Cooperative</option>
                  </select>
                  {errors.enterpriseType && (
                     <p className="text-red-500 text-xs mt-1">{errors.enterpriseType}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Years in Operation *
                  </label>
                  <input
                     type="number"
                     name="yearsInOperation"
                     value={formData.yearsInOperation}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.yearsInOperation ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter years in operation"
                  />
                  {errors.yearsInOperation && (
                     <p className="text-red-500 text-xs mt-1">{errors.yearsInOperation}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Innovation Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Innovation Information</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Innovation Title *
                  </label>
                  <input
                     type="text"
                     name="innovationTitle"
                     value={formData.innovationTitle}
                     onChange={handleInputChange}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.innovationTitle ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter innovation title"
                  />
                  {errors.innovationTitle && (
                     <p className="text-red-500 text-xs mt-1">{errors.innovationTitle}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Innovation Description *
                  </label>
                  <textarea
                     name="innovationDescription"
                     value={formData.innovationDescription}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.innovationDescription ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe your innovation"
                  />
                  {errors.innovationDescription && (
                     <p className="text-red-500 text-xs mt-1">{errors.innovationDescription}</p>
                  )}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technology Readiness Level *
                     </label>
                     <select
                        name="technologyReadinessLevel"
                        value={formData.technologyReadinessLevel}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                           errors.technologyReadinessLevel ? 'border-red-500' : 'border-gray-300'
                        }`}
                     >
                        <option value="">Select TRL</option>
                        <option value="TRL 1">TRL 1 - Basic principles observed</option>
                        <option value="TRL 2">TRL 2 - Technology concept formulated</option>
                        <option value="TRL 3">TRL 3 - Experimental proof of concept</option>
                        <option value="TRL 4">TRL 4 - Technology validated in lab</option>
                        <option value="TRL 5">TRL 5 - Technology validated in relevant environment</option>
                        <option value="TRL 6">TRL 6 - Technology demonstrated in relevant environment</option>
                        <option value="TRL 7">TRL 7 - System prototype demonstration in operational environment</option>
                        <option value="TRL 8">TRL 8 - System complete and qualified</option>
                        <option value="TRL 9">TRL 9 - Actual system proven through successful mission operations</option>
                     </select>
                     {errors.technologyReadinessLevel && (
                        <p className="text-red-500 text-xs mt-1">{errors.technologyReadinessLevel}</p>
                     )}
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Market Potential *
                     </label>
                     <select
                        name="marketPotential"
                        value={formData.marketPotential}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                           errors.marketPotential ? 'border-red-500' : 'border-gray-300'
                        }`}
                     >
                        <option value="">Select market potential</option>
                        <option value="Local">Local</option>
                        <option value="Regional">Regional</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                     </select>
                     {errors.marketPotential && (
                        <p className="text-red-500 text-xs mt-1">{errors.marketPotential}</p>
                     )}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Competitive Advantage *
                  </label>
                  <textarea
                     name="competitiveAdvantage"
                     value={formData.competitiveAdvantage}
                     onChange={handleInputChange}
                     rows={3}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.competitiveAdvantage ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe your competitive advantage"
                  />
                  {errors.competitiveAdvantage && (
                     <p className="text-red-500 text-xs mt-1">{errors.competitiveAdvantage}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Commercialization Plan */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commercialization Plan</h3>
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Market *
                     </label>
                     <input
                        type="text"
                        name="targetMarket"
                        value={formData.targetMarket}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                           errors.targetMarket ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter target market"
                     />
                     {errors.targetMarket && (
                        <p className="text-red-500 text-xs mt-1">{errors.targetMarket}</p>
                     )}
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Model *
                     </label>
                     <select
                        name="businessModel"
                        value={formData.businessModel}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                           errors.businessModel ? 'border-red-500' : 'border-gray-300'
                        }`}
                     >
                        <option value="">Select business model</option>
                        <option value="B2B">B2B (Business to Business)</option>
                        <option value="B2C">B2C (Business to Consumer)</option>
                        <option value="B2G">B2G (Business to Government)</option>
                        <option value="SaaS">SaaS (Software as a Service)</option>
                        <option value="Marketplace">Marketplace</option>
                        <option value="Subscription">Subscription</option>
                        <option value="Other">Other</option>
                     </select>
                     {errors.businessModel && (
                        <p className="text-red-500 text-xs mt-1">{errors.businessModel}</p>
                     )}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Market Strategy *
                  </label>
                  <textarea
                     name="marketStrategy"
                     value={formData.marketStrategy}
                     onChange={handleInputChange}
                     rows={4}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.marketStrategy ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Describe your market strategy"
                  />
                  {errors.marketStrategy && (
                     <p className="text-red-500 text-xs mt-1">{errors.marketStrategy}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Financial Information */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Total Project Cost (PHP) *
                  </label>
                  <input
                     type="number"
                     name="totalProjectCost"
                     value={formData.totalProjectCost}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.totalProjectCost ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter total project cost"
                  />
                  {errors.totalProjectCost && (
                     <p className="text-red-500 text-xs mt-1">{errors.totalProjectCost}</p>
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
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.requestedAmount ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter requested amount"
                  />
                  {errors.requestedAmount && (
                     <p className="text-red-500 text-xs mt-1">{errors.requestedAmount}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Equity Contribution (PHP) *
                  </label>
                  <input
                     type="number"
                     name="equityContribution"
                     value={formData.equityContribution}
                     onChange={handleInputChange}
                     min="0"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.equityContribution ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="Enter equity contribution"
                  />
                  {errors.equityContribution && (
                     <p className="text-red-500 text-xs mt-1">{errors.equityContribution}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Project Team */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Team</h3>
            <div className="space-y-4">
               <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Project Leader</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Full Name
                        </label>
                        <input
                           type="text"
                           name="projectLeader.name"
                           value={formData.projectLeader?.name || ''}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                           placeholder="Enter full name"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Position
                        </label>
                        <input
                           type="text"
                           name="projectLeader.position"
                           value={formData.projectLeader?.position || ''}
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                           placeholder="Enter position"
                        />
                     </div>
                     
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Qualifications
                        </label>
                        <textarea
                           name="projectLeader.qualifications"
                           value={formData.projectLeader?.qualifications || ''}
                           onChange={handleInputChange}
                           rows={2}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                           placeholder="Enter qualifications"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Required Documents */}
         <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Business Plan *
                  </label>
                  <input
                     type="file"
                     name="businessPlan"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.businessPlan ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.businessPlan && (
                     <p className="text-red-500 text-xs mt-1">{errors.businessPlan}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Technical Documentation *
                  </label>
                  <input
                     type="file"
                     name="technicalDocumentation"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.technicalDocumentation ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.technicalDocumentation && (
                     <p className="text-red-500 text-xs mt-1">{errors.technicalDocumentation}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Market Study *
                  </label>
                  <input
                     type="file"
                     name="marketStudy"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.marketStudy ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.marketStudy && (
                     <p className="text-red-500 text-xs mt-1">{errors.marketStudy}</p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Financial Projections *
                  </label>
                  <input
                     type="file"
                     name="financialProjections"
                     onChange={handleInputChange}
                     accept=".pdf,.doc,.docx"
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.financialProjections ? 'border-red-500' : 'border-gray-300'
                     }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                  {errors.financialProjections && (
                     <p className="text-red-500 text-xs mt-1">{errors.financialProjections}</p>
                  )}
               </div>
            </div>
         </div>
      </>
   );
};

export default SSCPForm;
