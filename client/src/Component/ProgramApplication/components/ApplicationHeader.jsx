import React from 'react';

const ApplicationHeader = ({ 
   isDarkMode, 
   viewMode, 
   setViewMode, 
   showFilters, 
   setShowFilters, 
   filterStatus, 
   searchTerm,
   onRefresh 
}) => {
   return (
      <div className={`rounded-xl p-6 transition-colors duration-300 ${
         isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-blue-600/40' : 'bg-gradient-to-br from-white to-gray-50 border-blue-200/60'
      } border shadow-xl`}>
         {/* Header Section */}
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded-xl ${
                  isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'
               }`}>
                  <svg className={`w-6 h-6 text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>My Applications</h2>
                  <p className={`text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Track and manage your submitted applications</p>
               </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
               {/* View Mode Toggle */}
               <div className="flex rounded-lg border overflow-hidden">
                  <button
                     onClick={() => setViewMode('grid')}
                     className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        viewMode === 'grid' 
                           ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                           : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50')
                     }`}
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                     </svg>
                  </button>
                  <button
                     onClick={() => setViewMode('list')}
                     className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        viewMode === 'list' 
                           ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                           : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50')
                     }`}
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                     </svg>
                  </button>
               </div>

               {/* Filter Toggle */}
               <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                     showFilters 
                        ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300')
                  }`}
               >
                  <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                     </svg>
                     <span>Filters</span>
                     {(filterStatus !== 'all' || searchTerm) && (
                        <span className={`w-2 h-2 rounded-full ${
                           isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500'
                        }`}></span>
                     )}
                  </div>
               </button>

               {/* Refresh Button */}
               <button
                  onClick={onRefresh}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 text-sm font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-md hover:shadow-lg"
               >
                  <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     <span>Refresh</span>
                  </div>
               </button>
            </div>
         </div>
      </div>
   );
};

export default ApplicationHeader;
