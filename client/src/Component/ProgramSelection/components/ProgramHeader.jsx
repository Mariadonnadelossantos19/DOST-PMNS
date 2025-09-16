import React from 'react';

const ProgramHeader = () => {
   return (
      <div className="text-center mb-12">
         <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
               <path d="M2 17L12 22L22 17"/>
               <path d="M2 12L12 17L22 12"/>
            </svg>
         </div>
         <h1 className="text-3xl font-bold text-gray-900 mb-4">
            DOST Programs
         </h1>
         <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Choose from our comprehensive range of DOST programs and embark on your journey towards innovation and growth.
         </p>
         <div className="flex justify-center">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
               <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Government-backed</span>
               </div>
               <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Expert guidance</span>
               </div>
               <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
