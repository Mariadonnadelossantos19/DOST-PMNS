import React, { useState } from 'react';
import { Button, Modal } from '../../UI';

const DOSTTNAFormGenerator = ({ 
   application, 
   isOpen, 
   onClose, 
   onGenerate,
   pstoOffice = 'PSTO'
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
      enterpriseBackground: application?.enterpriseBackground || '',
      
      // Signature Details
      signature: application?.contactPerson || '',
      signatureDate: new Date().toISOString().split('T')[0]
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
         generatedBy: pstoOffice,
         formType: 'DOST TNA Form 01',
         applicationId: application?.applicationId,
         proponentId: application?.proponentId?._id || application?.proponentId
      };
      
      onGenerate(tnaFormData);
   };

   const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      const formContent = document.getElementById('tna-form').innerHTML;
      
      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
         <head>
            <title>DOST TNA Form 01 - ${formData.enterpriseName}</title>
            <style>
               body { font-family: Arial, sans-serif; margin: 15px; font-size: 11px; }
               table { width: 100%; border-collapse: collapse; }
               td { border: 1px solid #000; padding: 2px; vertical-align: top; }
               @page { margin: 0.5in; }
               .header-bg { background-color: #f5f5f5; font-weight: bold; }
               .text-center { text-align: center; }
               .text-lg { font-size: 18px; }
               .text-sm { font-size: 14px; }
               .font-bold { font-weight: bold; }
               .mb-4 { margin-bottom: 16px; }
               .mb-8 { margin-bottom: 32px; }
               .mt-8 { margin-top: 32px; }
               .space-y-4 > * + * { margin-top: 16px; }
               .flex { display: flex; }
               .mr-2 { margin-right: 8px; }
               .font-semibold { font-weight: 600; }
               .text-xs { font-size: 12px; }
               .text-gray-600 { color: #6b7280; }
               .text-gray-900 { color: #111827; }
               .justify-between { justify-content: space-between; }
               .grid { display: grid; }
               .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
               .gap-6 { gap: 24px; }
               .w-1-3 { width: 33.333333%; }
               .w-full { width: 100%; }
               .border-none { border: none; }
               .outline-none { outline: none; }
               .bg-transparent { background-color: transparent; }
               .border { border: 1px solid #d1d5db; }
               .border-gray-300 { border-color: #d1d5db; }
               .rounded-md { border-radius: 6px; }
               .p-2 { padding: 8px; }
               .p-3 { padding: 12px; }
               .p-8 { padding: 32px; }
               .border-2 { border-width: 2px; }
               .border-gray-400 { border-color: #9ca3af; }
               .bg-gray-100 { background-color: #f3f4f6; }
               .border-r { border-right: 1px solid #9ca3af; }
               .border-b { border-bottom: 1px solid #9ca3af; }
               @media print {
                  .no-print { display: none; }
                  body { margin: 0; padding: 0.25in; font-size: 10px; }
                  .print\\:border-0 { border: 0; }
                  .print\\:p-0 { padding: 0; }
                  #tna-form { margin: 0; padding: 0; }
                  table { font-size: 10px; }
                  td { padding: 1px; }
               }
            </style>
         </head>
         <body>
            ${formContent}
         </body>
         </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
   };

   const handleDownload = () => {
      // Create a downloadable PDF or Word document
      const tnaFormData = {
         ...formData,
         generatedDate: new Date().toLocaleDateString(),
         generatedBy: pstoOffice,
         formType: 'DOST TNA Form 01',
         applicationId: application?.applicationId,
         proponentId: application?.proponentId?._id || application?.proponentId
      };
      
      // For now, we'll create a downloadable JSON file
      // In a real implementation, you'd use a library like jsPDF or docx
      const dataStr = JSON.stringify(tnaFormData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `DOST_TNA_Form_01_${formData.enterpriseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
   };

   if (!isOpen) return null;

   return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
         <div className="p-6">
            <div className="flex justify-between items-center mb-6 no-print">
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
                     onClick={handleDownload}
                     className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Download
                  </Button>
               </div>
            </div>

            {/* DOST TNA Form 01 */}
            <div className="bg-white border-2 border-gray-300 p-6 print:border-0 print:p-4" id="tna-form">
               {/* Header */}
               <div className="text-center mb-4">
                  <div className="text-xs text-gray-600 mb-1 text-right">A Form 01</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 underline">
                     APPLICATION FOR TECHNOLOGY NEEDS ASSESSMENT
                  </h3>
               </div>

               {/* Enterprise Information Table - Compact Layout */}
               <div className="mb-6">
                  
                  <div className="border-2 border-gray-800">
                     <table className="w-full text-xs">
                        <tbody>
                           {/* Enterprise Name - Full Width */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold w-1/4">
                                 Name of Enterprise:
                              </td>
                              <td className="px-2 py-1" colSpan="3">
                                 <input
                                    type="text"
                                    value={formData.enterpriseName}
                                    onChange={(e) => handleInputChange('enterpriseName', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.enterpriseName}</span>
                              </td>
                           </tr>
                           
                           {/* Contact Person and Position - Side by Side */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Contact Person:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.contactPerson}</span>
                              </td>
                              <td className="border-l border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Position in the Enterprise:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.position}</span>
                              </td>
                           </tr>
                           
                           {/* Office Address and Contact Details */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Office Address:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.officeAddress}
                                    onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.officeAddress}</span>
                              </td>
                              <td className="border-l border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Tel. No. / Mobile No.:
                              </td>
                              <td className="px-2 py-1">
                                 <div className="space-y-0.5">
                                    <input
                                       type="text"
                                       value={formData.officeTel}
                                       onChange={(e) => handleInputChange('officeTel', e.target.value)}
                                       className="w-full border-none outline-none bg-transparent no-print text-xs"
                                    />
                                    <span className="print-only">{formData.officeTel}</span>
                                 </div>
                              </td>
                           </tr>
                           
                           {/* Fax and Email Row */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Fax No.:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.officeFax || 'NONE'}
                                    onChange={(e) => handleInputChange('officeFax', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.officeFax || 'NONE'}</span>
                              </td>
                              <td className="border-l border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 E-mail Address:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="email"
                                    value={formData.officeEmail}
                                    onChange={(e) => handleInputChange('officeEmail', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.officeEmail}</span>
                              </td>
                           </tr>
                           
                           {/* Factory Address and Contact Details */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Factory Address:
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.factoryAddress}
                                    onChange={(e) => handleInputChange('factoryAddress', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.factoryAddress}</span>
                              </td>
                              <td className="border-l border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Tel. No. (for Factory):
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.factoryTel}
                                    onChange={(e) => handleInputChange('factoryTel', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.factoryTel}</span>
                              </td>
                           </tr>
                           
                           {/* Factory Fax and Email */}
                           <tr className="border-b border-gray-800">
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Fax No. (for Factory):
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="text"
                                    value={formData.factoryFax || 'NONE'}
                                    onChange={(e) => handleInputChange('factoryFax', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.factoryFax || 'NONE'}</span>
                              </td>
                              <td className="border-l border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 E-mail Address (for Factory):
                              </td>
                              <td className="px-2 py-1">
                                 <input
                                    type="email"
                                    value={formData.factoryEmail}
                                    onChange={(e) => handleInputChange('factoryEmail', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.factoryEmail}</span>
                              </td>
                           </tr>
                           
                           {/* Website - Full Width */}
                           <tr>
                              <td className="border-r border-gray-800 px-2 py-1 bg-gray-100 font-semibold">
                                 Website:
                              </td>
                              <td className="px-2 py-1" colSpan="3">
                                 <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full border-none outline-none bg-transparent no-print text-xs"
                                 />
                                 <span className="print-only">{formData.website}</span>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* General Agreements Section - Compact */}
               <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2">GENERAL AGREEMENTS:</h2>
                  <div className="space-y-1 text-xs">
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">1.</span>
                        <p className="flex-1">
                           The applicant shall, at the earliest opportunity, make available to the DOST Regional Office No. IV B (DOST-MIMAROPA) all information (manuals, procedures, etc.) required to establish the technology status of the selected core business functions and management systems;
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">2.</span>
                        <p className="flex-1">
                           If DOST-MIMAROPA is not satisfied that all the requirements for business registration are complied with, the Team shall inform the applicant of the observed deficiencies before the assessment to take place;
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">3.</span>
                        <p className="flex-1">
                           When the required inputs to the assessment are supplied by the applicant, including the Attachment A, the DOST-MIMAROPA will assess the selected core business functions and management systems to identify technology needs and verify compliance to standard vis-à-vis existing practices;
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">4.</span>
                        <p className="flex-1">
                           When the DOST-MIMAROPA has completed the technology assessment, a report will be prepared identifying assessment results against the agreed or standard criteria with compliance results, conclusions, recommendations, and opportunities for improvement. The report prepared will define the scope of activities, functions, management practices and locations assessed. The applicant shall not claim or otherwise imply that the report applies to other locations, product or activities not covered by the report;
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">5.</span>
                        <p className="flex-1">
                           The applicant agrees that the report will not be used until permission has been granted by the DOST-MIMAROPA;
                        </p>
                     </div>
                     <div className="flex">
                        <span className="font-bold mr-2 w-4">6.</span>
                        <p className="flex-1">
                           The applicant agrees that the receipt or acknowledgment of the report ends the assessment stage; any technical assistance ensuing from the recommendations of the report will be viewed as a separate project.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Undertaking and Signature Section */}
               <div className="mb-6">
                  <p className="text-lg font-bold text-gray-900 mb-4 text-center">UNDERTAKING</p>
                  
                  {/* Certification Text in Border Box */}
                  <div className="border border-gray-800 p-3 mb-6">
                     <p className="text-sm text-justify">
                        I agree to undertake and observe the above General Conditions stipulated by the Department of Science and Technology Regional Office No. IVB DOST
                     </p>
                  </div>
                  
                  {/* Signature and Date Fields */}
                  <div className="space-y-4">
                     {/* Signature and Date Row */}
                     <div className="flex space-x-8">
                        <div className="flex-1">
                           <div className="border-b border-gray-800 h-8 flex items-end">
                              <input
                                 type="text"
                                 value={formData.signature}
                                 onChange={(e) => handleInputChange('signature', e.target.value)}
                                 className="w-full border-none outline-none bg-transparent no-print text-sm font-bold"
                                 placeholder=""
                              />
                              <span className="print-only font-bold">{formData.signature}</span>
                           </div>
                           <p className="text-xs text-gray-600 mt-1 text-left">Signature over Printed Name</p>
                        </div>
                        
                        <div className="flex-1">
                           <div className="border-b border-gray-800 h-8 flex items-end">
                              <input
                                 type="date"
                                 value={formData.signatureDate}
                                 onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                                 className="w-full border-none outline-none bg-transparent no-print text-sm font-bold"
                              />
                              <span className="print-only font-bold">{new Date(formData.signatureDate).toLocaleDateString()}</span>
                           </div>
                           <p className="text-xs text-gray-600 mt-1 text-left">Date</p>
                        </div>
                     </div>
                     
                     {/* Position Field */}
                     <div className="w-full">
                        <div className="border-b border-gray-800 h-8 flex items-end">
                           <input
                              type="text"
                              value={formData.position}
                              onChange={(e) => handleInputChange('position', e.target.value)}
                              className="w-full border-none outline-none bg-transparent no-print text-sm font-bold"
                              placeholder=""
                           />
                           <span className="print-only font-bold">{formData.position}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 text-left">Position in the Enterprise</p>
                     </div>
                  </div>
               </div>

               
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 no-print">
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
