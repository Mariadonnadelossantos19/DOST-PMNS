import React from 'react';

const ActionButtons = ({ selectedProgram, onBack, onNext }) => {
   return (
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
         <button
            onClick={onBack}
            className="group flex items-center px-8 py-4 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
         >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
         </button>
         
         {selectedProgram && (
            <div className="flex items-center space-x-4">
               <div className="text-right">
                  <p className="text-sm text-gray-600">Selected Program:</p>
                  <p className="font-semibold text-gray-900">{selectedProgram.name}</p>
               </div>
               <button
                  onClick={onNext}
                  className="group flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
               >
                  Continue with {selectedProgram.code}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
               </button>
            </div>
         )}
      </div>
   );
};

export default ActionButtons;
