import React, { useState } from 'react';
import { useDarkMode } from '../../Context/DarkModeContext';

const GeneralAgreement = ({ onAgreementChange, isRequired = true, initialData = {} }) => {
   const { isDarkMode } = useDarkMode();
   const [isAccepted, setIsAccepted] = useState(initialData.accepted || false);
   const [showFullText, setShowFullText] = useState(false);
   const [signatureFile, setSignatureFile] = useState(initialData.signatureFile || null);
   const [signatoryName, setSignatoryName] = useState(initialData.signatoryName || '');
   const [position, setPosition] = useState(initialData.position || '');
   const [signedDate, setSignedDate] = useState(initialData.signedDate || new Date().toISOString().split('T')[0]);

   console.log('GeneralAgreement - Component rendered with initialData:', initialData);
   console.log('GeneralAgreement - Current state - isAccepted:', isAccepted, 'signatoryName:', signatoryName, 'position:', position);

   // Note: Removed useEffect to prevent state reset issues
   // The component will use the initial values from props and update via user interaction

   const handleAgreementChange = (accepted) => {
      console.log('GeneralAgreement - handleAgreementChange called with:', accepted);
      console.log('GeneralAgreement - onAgreementChange function:', typeof onAgreementChange);
      setIsAccepted(accepted);
      const agreementData = {
         accepted,
         signatureFile,
         signatoryName,
         position,
         signedDate
      };
      console.log('GeneralAgreement - sending data to parent:', agreementData);
      if (typeof onAgreementChange === 'function') {
         onAgreementChange(agreementData);
      } else {
         console.error('GeneralAgreement - onAgreementChange is not a function!');
      }
   };

   const handleSignatureUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
         // Validate file type
         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
         if (!allowedTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF) or PDF');
            return;
         }
         
         // Validate file size (max 5MB)
         if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
         }
         
         setSignatureFile(file);
         handleAgreementChange(isAccepted);
      }
   };

   const handleSignatoryChange = (field, value) => {
      if (field === 'signatoryName') {
         setSignatoryName(value);
      } else if (field === 'position') {
         setPosition(value);
      } else if (field === 'signedDate') {
         setSignedDate(value);
      }
      handleAgreementChange(isAccepted);
   };

   const agreementText = `
   GENERAL AGREEMENT AND TERMS OF SERVICE
   
   By submitting this SETUP (Small Enterprise Technology Upgrading Program) application, I hereby acknowledge and agree to the following terms and conditions:
   
   1. DATA COLLECTION AND PRIVACY
   - I consent to the collection, processing, and storage of my personal and enterprise information for the purpose of evaluating my SETUP application.
   - I understand that my data will be used by DOST-MIMAROPA and its authorized personnel for program administration, evaluation, and monitoring.
   - I acknowledge that my information may be shared with relevant government agencies and program partners as necessary for program implementation.
   
   2. PROGRAM REQUIREMENTS AND OBLIGATIONS
   - I understand that participation in the SETUP program is subject to approval and availability of funds.
   - I agree to provide accurate, complete, and truthful information in my application.
   - I understand that providing false or misleading information may result in immediate disqualification from the program.
   - I agree to comply with all program guidelines, reporting requirements, and evaluation processes.
   
   3. TECHNOLOGY ASSESSMENT AND IMPLEMENTATION
   - I consent to undergo Technology Needs Assessment (TNA) as part of the application process.
   - I understand that the technology recommendations will be based on the assessment results and program criteria.
   - I agree to participate in training, workshops, and technical assistance as required by the program.
   - I commit to implementing the recommended technology upgrades within the agreed timeline.
   
   4. FINANCIAL OBLIGATIONS
   - I understand that SETUP provides technology assistance and may include cost-sharing arrangements.
   - I agree to provide the required counterpart funding as specified in the program guidelines.
   - I understand that I am responsible for the maintenance and operation of the technology after implementation.
   
   5. MONITORING AND EVALUATION
   - I consent to regular monitoring visits and evaluation activities by program personnel.
   - I agree to provide progress reports and documentation as requested by the program.
   - I understand that program benefits may be withdrawn if I fail to comply with monitoring requirements.
   
   6. INTELLECTUAL PROPERTY AND CONFIDENTIALITY
   - I agree to maintain confidentiality of any proprietary information shared during the program.
   - I understand that any intellectual property developed through the program will be subject to applicable laws and agreements.
   
   7. TERMINATION AND WITHDRAWAL
   - I understand that the program may be terminated if I fail to comply with the terms and conditions.
   - I agree to return any program-provided materials or equipment if the program is terminated.
   
   8. LIABILITY AND DISCLAIMER
   - I understand that DOST-MIMAROPA is not liable for any business decisions or outcomes resulting from technology implementation.
   - I acknowledge that the program provides assistance and guidance but does not guarantee business success.
   
   9. COMMUNICATION AND NOTIFICATIONS
   - I agree to receive communications related to my application and the program via email, phone, or other means.
   - I understand that I am responsible for keeping my contact information updated.
   
   10. GENERAL PROVISIONS
   - I understand that this agreement is governed by Philippine laws and regulations.
   - I acknowledge that I have read and understood all terms and conditions before submitting my application.
   - I understand that this agreement is binding and enforceable.
   
   By checking the agreement box below, I confirm that I have read, understood, and agree to all the terms and conditions stated above.
   `;

   return (
      <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
         <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               General Agreement and Terms of Service
            </h3>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               {isRequired ? 'Required' : 'Optional'}
            </span>
         </div>

         <div className={`max-h-96 overflow-y-auto border rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
            <div className={`text-sm leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
               {showFullText ? agreementText : agreementText.substring(0, 500) + '...'}
            </div>
            <button
               type="button"
               onClick={() => setShowFullText(!showFullText)}
               className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
               {showFullText ? 'Show Less' : 'Read Full Agreement'}
            </button>
         </div>

         {/* Signature Upload Section */}
         <div className={`mt-6 p-4 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
            <h4 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               Digital Signature and Undertaking
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Signature over Printed Name *
                  </label>
                  <input
                     type="text"
                     value={signatoryName}
                     onChange={(e) => handleSignatoryChange('signatoryName', e.target.value)}
                     placeholder="Enter your full name"
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                           : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                     }`}
                     required
                  />
               </div>
               
               <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Position in the Enterprise *
                  </label>
                  <select
                     value={position}
                     onChange={(e) => handleSignatoryChange('position', e.target.value)}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white' 
                           : 'bg-white border-gray-300 text-gray-900'
                     }`}
                     required
                  >
                     <option value="">Select Position</option>
                     <option value="Owner">Owner</option>
                     <option value="Manager">Manager</option>
                     <option value="Director">Director</option>
                     <option value="President">President</option>
                     <option value="General Manager">General Manager</option>
                     <option value="Operations Manager">Operations Manager</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Date *
                  </label>
                  <input
                     type="date"
                     value={signedDate}
                     onChange={(e) => handleSignatoryChange('signedDate', e.target.value)}
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white' 
                           : 'bg-white border-gray-300 text-gray-900'
                     }`}
                     required
                  />
               </div>
               
               <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                     Upload Signed Agreement *
                  </label>
                  <input
                     type="file"
                     onChange={handleSignatureUpload}
                     accept=".jpg,.jpeg,.png,.gif,.pdf"
                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                           ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white' 
                           : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700'
                     }`}
                     required
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                     Accepted formats: JPG, PNG, GIF, PDF (Max 5MB)
                  </p>
               </div>
            </div>
            
            {signatureFile && (
               <div className={`mt-3 p-3 rounded-md ${isDarkMode ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center">
                     <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     </svg>
                     <span className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        File uploaded: {signatureFile.name} ({(signatureFile.size / 1024 / 1024).toFixed(2)} MB)
                     </span>
                  </div>
               </div>
            )}
         </div>

         <div className="flex items-start space-x-3 mt-6">
            <input
               type="checkbox"
               id="generalAgreement"
               checked={isAccepted}
               onChange={(e) => handleAgreementChange(e.target.checked)}
               className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'
               }`}
               required={isRequired}
            />
            <label
               htmlFor="generalAgreement"
               className={`text-sm leading-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
               <span className="font-medium">
                  I agree to undertake and observe the above General Agreements as stipulated by the Department of Science and Technology Regional Office No.IVB DOST-MIMAROPA
               </span>
               <span className="block mt-1 text-xs text-gray-500">
                  By checking this box, you confirm your acceptance of all terms and conditions and that you have uploaded a signed copy of this agreement.
               </span>
            </label>
         </div>

         {(!isAccepted || !signatureFile || !signatoryName || !position) && isRequired && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
               <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                     <h3 className="text-sm font-medium text-red-800">
                        Complete Agreement Required
                     </h3>
                     <div className="mt-1 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                           {!isAccepted && <li>You must accept the General Agreement</li>}
                           {!signatureFile && <li>You must upload a signed copy of the agreement</li>}
                           {!signatoryName && <li>You must provide your signature over printed name</li>}
                           {!position && <li>You must specify your position in the enterprise</li>}
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default GeneralAgreement;
