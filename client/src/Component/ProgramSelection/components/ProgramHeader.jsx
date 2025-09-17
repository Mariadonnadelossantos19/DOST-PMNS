import React from 'react';
import { useDarkMode } from '../../Context';

const ProgramHeader = () => {
   const { isDarkMode } = useDarkMode();

   return (
      <div className="text-center mb-6">
         {/* Compact Header */}
         <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                  <path d="M2 17L12 22L22 17"/>
                  <path d="M2 12L12 17L22 12"/>
               </svg>
            </div>
            <div className="text-left">
               <h1 className={`text-lg font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                  DOST Programs
               </h1>
               <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>
                  Program Selection & Application
               </span>
            </div>
         </div>

         {/* Compact Description */}
         <p className={`text-sm max-w-2xl mx-auto leading-relaxed mb-3 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
         }`}>
            Choose from our comprehensive range of DOST programs and embark on your journey towards innovation and growth.
         </p>

         {/* Compact Features */}
         <div className="flex justify-center">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
               <div className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Government-backed</span>
               </div>
               <div className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Expert guidance</span>
               </div>
               <div className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Proven results</span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ProgramHeader;
