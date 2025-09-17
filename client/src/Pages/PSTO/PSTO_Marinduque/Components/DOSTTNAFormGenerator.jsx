import React, { useState } from 'react';
import { Button, Modal } from '../../../../Component/UI';

const DOSTTNAFormGenerator = ({ 
   application, 
   isOpen, 
   onClose, 
   onGenerate 
}) => {
   const [formData, setFormData] = useState({
      // Enterprise Information
      enterpriseName: application?.enterpriseName || '',
      contactPerson: application?.contactPerson || '',
      position: application?.position || '',
      officeAddress: application?.officeAddress || '',
      officeTel: application?.contactPersonTel || '',
      officeFax: application?.contactPersonFax || '',
      officeEmail: application?.contactPersonEmail || '',
      factoryAddress: application?.factoryAddress || application?.officeAddress || '',
      factoryTel: application?.factoryTel || '',
      factoryFax: application?.factoryFax || '',
      factoryEmail: application?.factoryEmail || '',
      website: application?.website || '',
      
      // Additional TNA-specific fields
      businessActivity: application?.businessActivity || '',
      specificProduct: application?.specificProduct || '',
      yearEstablished: application?.yearEstablished || '',
      initialCapital: application?.initialCapital || '',
      organizationType: application?.organizationType || '',
      profitType: application?.profitType || '',
      registrationNo: application?.registrationNo || '',
      yearRegistered: application?.yearRegistered || '',
      capitalClassification: application?.capitalClassification || '',
      employmentClassification: application?.employmentClassification || '',
      
      // Employment Details
      directWorkers: application?.directWorkers || '',
      productionWorkers: application?.productionWorkers || '',
      nonProductionWorkers: application?.nonProductionWorkers || '',
      contractWorkers: application?.contractWorkers || '',
      totalWorkers: application?.totalWorkers || '',
      
      // Technology Details
      technologyNeeds: application?.technologyNeeds || '',
      currentTechnologyLevel: application?.currentTechnologyLevel || '',
      desiredTechnologyLevel: application?.desiredTechnologyLevel || '',
      expectedOutcomes: application?.expectedOutcomes || '',
      enterpriseBackground: application?.enterpriseBackground || ''
   });

   const handleInputChange = (field, value) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));
   };

   const handleGenerate = () => {
      // Generate the DOST TNA Form 01
      const tnaFormData = {
         ...formData,
         generatedDate: new Date().toLocaleDateString(),
         generatedBy: 'PSTO Marinduque',
         formType: 'DOST TNA Form 01',
         applicationId: application?.applicationId
      };
      
      onGenerate(tnaFormData);
   };

   const handlePrint = () => {
      window.print();
   };

   if (!isOpen) return null;

   return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
         <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-900">
                  DOST TNA Form 01 Generator
               </h2>
               <div className="flex space-x-2">
                  <Button
                     onClick={handlePrint}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                     </svg>
                     Print Form
                  </Button>
                  <Button
                     onClick={handleGenerate}
                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Generate & Download
                  </Button>
               </div>
            </div>

            {/* DOST TNA Form 01 */}
            <div className="bg-white border-2 border-gray-300 p-8 print:border-0 print:p-0" id="tna-form">
               {/* Header */}
               <div className="text-center mb-8">
                  <div className="text-sm text-gray-600 mb-2">Form 01</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                     APPLICATION FOR TECHNOLOGY NEEDS ASSESSMENT
                  </h1>
               </div>

               {/* Enterprise Information Table */}
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">ENTERPRISE INFORMATION</h2>
                  <div className="border border-gray-400">
                     <table className="w-full">
                        <tbody>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold w-1/3">
                                 Name of Enterprise:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.enterpriseName}
                                    onChange={(e) => handleInputChange('enterpriseName', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Contact Person:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Position in the Enterprise:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Office Address:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.officeAddress}
                                    onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Tel. No. / Mobile No.:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.officeTel}
                                    onChange={(e) => handleInputChange('officeTel', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Fax No.:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.officeFax || 'NONE'}
                                    onChange={(e) => handleInputChange('officeFax', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 E-mail Address:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="email"
                                    value={formData.officeEmail}
                                    onChange={(e) => handleInputChange('officeEmail', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Factory Address:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.factoryAddress}
                                    onChange={(e) => handleInputChange('factoryAddress', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Tel. No. (for Factory):
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.factoryTel}
                                    onChange={(e) => handleInputChange('factoryTel', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Fax No. (for Factory):
                              </td>
                              <td className="p-3">
                                 <input
                                    type="text"
                                    value={formData.factoryFax || 'NONE'}
                                    onChange={(e) => handleInputChange('factoryFax', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr className="border-b border-gray-400">
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 E-mail Address (for Factory):
                              </td>
                              <td className="p-3">
                                 <input
                                    type="email"
                                    value={formData.factoryEmail}
                                    onChange={(e) => handleInputChange('factoryEmail', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                           <tr>
                              <td className="border-r border-gray-400 p-3 bg-gray-100 font-semibold">
                                 Website:
                              </td>
                              <td className="p-3">
                                 <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent"
                                 />
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* General Agreements Section */}
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">GENERAL AGREEMENTS</h2>
                  <div className="space-y-4 text-sm">
                     <div className="flex">
                        <span className="font-semibold mr-2">1.</span>
                        <p>
                           The applicant must provide all necessary information (manuals, procedures, etc.) to DOST Regional Office No. IV B (DOST-MIMAROPA) to establish the technology status of core business functions and management systems.
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-semibold mr-2">2.</span>
                        <p>
                           If DOST-MIMAROPA finds deficiencies in business registration requirements, it will inform the applicant before starting the assessment.
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-semibold mr-2">3.</span>
                        <p>
                           Once the applicant supplies all required inputs, including Attachment A, DOST-MIMAROPA will assess the firm to identify technology needs and verify compliance with standards.
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-semibold mr-2">4.</span>
                        <p>
                           After the assessment, DOST-MIMAROPA will prepare a report with recommendations and opportunities for improvement, defining the scope of activities.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Additional Information Section */}
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">ADDITIONAL INFORMATION</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Business Activity:
                        </label>
                        <textarea
                           value={formData.businessActivity}
                           onChange={(e) => handleInputChange('businessActivity', e.target.value)}
                           rows={3}
                           className="w-full border border-gray-300 rounded-md p-2"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Specific Product/Service:
                        </label>
                        <textarea
                           value={formData.specificProduct}
                           onChange={(e) => handleInputChange('specificProduct', e.target.value)}
                           rows={3}
                           className="w-full border border-gray-300 rounded-md p-2"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Technology Needs:
                        </label>
                        <textarea
                           value={formData.technologyNeeds}
                           onChange={(e) => handleInputChange('technologyNeeds', e.target.value)}
                           rows={3}
                           className="w-full border border-gray-300 rounded-md p-2"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Expected Outcomes:
                        </label>
                        <textarea
                           value={formData.expectedOutcomes}
                           onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                           rows={3}
                           className="w-full border border-gray-300 rounded-md p-2"
                        />
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="flex justify-between text-xs text-gray-600 mt-8">
                  <div>SETUP Guidelines - Annex B-11 - DOST TNA Form 01</div>
                  <div>Page 1 of 10</div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
               <Button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
               >
                  Cancel
               </Button>
               <Button
                  onClick={handleGenerate}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
               >
                  Generate Form
               </Button>
            </div>
         </div>
      </Modal>
   );
};

export default DOSTTNAFormGenerator;
