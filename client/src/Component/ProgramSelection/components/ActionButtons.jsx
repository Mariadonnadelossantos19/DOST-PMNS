import React from 'react';
import { useDarkMode } from '../../Context';

const ActionButtons = ({ selectedProgram, onBack, onNext, isLoading = false }) => {
   const { isDarkMode } = useDarkMode();

   return (
      <div className={`flex flex-col lg:flex-row justify-between items-center pt-6 border-t transition-colors duration-300 ${
         isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
         {/* Back Button */}
         <button
            onClick={onBack}
            className={`group flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 mb-4 lg:mb-0 ${
               isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            disabled={isLoading}
         >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
         </button>
         
         {/* Selected Program Info and Continue Button */}
         {selectedProgram && (
            <div className="flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-4">
               {/* Program Info */}
               <div className={`text-center lg:text-right p-3 rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                     ? 'bg-gray-800 border border-gray-700' 
                     : 'bg-gray-50 border border-gray-200'
               }`}>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                     Selected Program:
                  </p>
                  <p className={`font-bold text-lg transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                     {selectedProgram.name}
                  </p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                     selectedProgram.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                     selectedProgram.color === 'green' ? 'bg-green-100 text-green-800' :
                     selectedProgram.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                     'bg-orange-100 text-orange-800'
                  }`}>
                     {selectedProgram.code}
                  </div>
               </div>

               {/* Continue Button */}
               <button
                  onClick={onNext}
                  disabled={isLoading}
                  className={`group relative flex items-center px-5 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                     selectedProgram.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                     selectedProgram.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                     selectedProgram.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                     'bg-orange-600 hover:bg-orange-700'
                  }`}
               >
                  {/* Button Background Animation */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                     selectedProgram.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                     selectedProgram.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                     selectedProgram.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                     'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`} />

                  <span className="relative z-10 flex items-center">
                     {isLoading ? (
                        <>
                           <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                           </svg>
                           <span>Processing...</span>
                        </>
                     ) : (
                        <>
                           <span className="hidden sm:inline">Continue with {selectedProgram.code}</span>
                           <span className="sm:hidden">Continue</span>
                           <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                           </svg>
                        </>
                     )}
                  </span>
               </button>
            </div>
         )}

         {/* No Selection State */}
         {!selectedProgram && (
            <div className={`text-center p-6 rounded-xl transition-colors duration-300 ${
               isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gray-50 border border-gray-200'
            }`}>
               <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
               </div>
               <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
               }`}>
                  Select a program to continue
               </p>
            </div>
         )}
      </div>
   );
};

export default ActionButtons;
