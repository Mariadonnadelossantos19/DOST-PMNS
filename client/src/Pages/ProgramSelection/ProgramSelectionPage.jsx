import React, { useState } from 'react';
import ProgramSelection from '../../Component/ProgramSelection/ProgramSelection';
import { MultiStepForm } from '../../Component/ProgramApplication';

const ProgramSelectionPage = () => {
   const [selectedProgram, setSelectedProgram] = useState(null);
   const [showApplicationForm, setShowApplicationForm] = useState(false);

   console.log('ProgramSelectionPage rendered');

   const handleProgramSelect = (program) => {
      console.log('Program selected:', program);
      setSelectedProgram(program);
   };

   const handleNext = () => {
      if (selectedProgram) {
         console.log('Proceeding with program:', selectedProgram);
         setShowApplicationForm(true);
      }
   };

   const handleBack = () => {
      console.log('Back button clicked');
      if (showApplicationForm) {
         setShowApplicationForm(false);
      }
   };


   const handleSubmit = (formData) => {
      console.log('Form submitted with data:', formData);
      // MultiStepForm now handles API submission directly
      // This is just for any additional handling after successful submission
      setShowApplicationForm(false);
      setSelectedProgram(null);
   };

   if (showApplicationForm) {
      return (
         <div className="min-h-screen bg-gray-50">
            <div className="p-4">
               <h1 className="text-2xl font-bold mb-4">
                  {selectedProgram?.name} Application Form
               </h1>
               <p className="mb-4">Complete the application for {selectedProgram?.name}</p>
            </div>
            <MultiStepForm 
               selectedProgram={selectedProgram}
               onBack={handleBack}
               onSubmit={handleSubmit}
            />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         
         <ProgramSelection
            onProgramSelect={handleProgramSelect}
            selectedProgram={selectedProgram}
            onNext={handleNext}
            onBack={handleBack}
         />
      </div>
   );
};

export default ProgramSelectionPage;
