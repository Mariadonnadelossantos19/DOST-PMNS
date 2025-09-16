import React, { useState } from 'react';
import { ProgramCard, ProgramHeader, ActionButtons } from './components';
import { programs } from './data/programsData.jsx';

const ProgramSelection = ({ onProgramSelect, selectedProgram, onNext, onBack }) => {
   const [hoveredProgram, setHoveredProgram] = useState(null);

   const handleProgramClick = (program) => {
      onProgramSelect(program);
   };

   const handleMouseEnter = (programId) => {
      setHoveredProgram(programId);
   };

   const handleMouseLeave = () => {
      setHoveredProgram(null);
   };

   return (
      <>
         <style>{`
            @keyframes fadeInUp {
               from {
                  opacity: 0;
                  transform: translateY(30px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
         `}</style>
         <div className="bg-gray-50 py-4">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               {/* Header */}
               <ProgramHeader />

               {/* Program Cards Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {programs.map((program, index) => (
                     <ProgramCard
                        key={program.id}
                        program={program}
                        isSelected={selectedProgram?.id === program.id}
                        isHovered={hoveredProgram === program.id}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleProgramClick}
                        index={index}
                     />
                  ))}
               </div>

               {/* Action Buttons */}
               <ActionButtons
                  selectedProgram={selectedProgram}
                  onBack={onBack}
                  onNext={onNext}
               />
            </div>
         </div>
      </>
   );
};

export default ProgramSelection;
