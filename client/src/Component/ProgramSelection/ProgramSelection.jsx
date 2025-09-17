import React, { useState, useCallback } from 'react';
import { ProgramCard, ProgramHeader, ActionButtons } from './components';
import { programs } from './data/programsData.jsx';
import { useDarkMode } from '../Context';

const ProgramSelection = ({ onProgramSelect, selectedProgram, onNext, onBack }) => {
   const { isDarkMode } = useDarkMode();
   const [hoveredProgram, setHoveredProgram] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const handleProgramClick = useCallback(async (program) => {
      if (isLoading) return;
      
      try {
         setIsLoading(true);
         await onProgramSelect(program);
      } catch (error) {
         console.error('Error selecting program:', error);
      } finally {
         setIsLoading(false);
      }
   }, [onProgramSelect, isLoading]);

   const handleMouseEnter = useCallback((programId) => {
      setHoveredProgram(programId);
   }, []);

   const handleMouseLeave = useCallback(() => {
      setHoveredProgram(null);
   }, []);

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
            @keyframes slideInFromTop {
               from {
                  opacity: 0;
                  transform: translateY(-20px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            .program-selection-container {
               animation: slideInFromTop 0.6s ease-out;
            }
         `}</style>
         <div className={`program-selection-container transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
         }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               {/* Enhanced Header */}
               <ProgramHeader />

               {/* Program Cards Grid with Enhanced Layout */}
               <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
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
               </div>

               {/* Enhanced Action Buttons */}
               <ActionButtons
                  selectedProgram={selectedProgram}
                  onBack={onBack}
                  onNext={onNext}
                  isLoading={isLoading}
               />
            </div>
         </div>
      </>
   );
};

export default ProgramSelection;
