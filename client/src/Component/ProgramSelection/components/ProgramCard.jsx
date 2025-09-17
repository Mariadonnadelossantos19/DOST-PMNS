import React, { useState, useMemo, useCallback } from 'react';
import { useDarkMode } from '../../Context';

const ProgramCard = ({ 
   program, 
   isSelected, 
   onMouseEnter, 
   onMouseLeave, 
   onClick, 
   index 
}) => {
   const { isDarkMode } = useDarkMode();
   const [isHovered, setIsHovered] = useState(false);
   const [showAllBenefits, setShowAllBenefits] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   // Optimized color system with memoization
   const colorScheme = useMemo(() => {
      const baseClasses = "transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1";
      const selectedClasses = isSelected 
         ? 'ring-2 ring-blue-500 ring-opacity-80 shadow-xl shadow-blue-500/25' 
         : 'shadow-lg hover:shadow-xl';

      const colorMap = {
         blue: {
            bg: isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-gray-50",
            border: isDarkMode ? "border-blue-600/40" : "border-blue-200/60",
            icon: "text-blue-600",
            iconBg: isDarkMode ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-50 to-blue-100",
            badge: isDarkMode ? "bg-blue-900/90 text-blue-200 border border-blue-700/60" : "bg-blue-50 text-blue-800 border border-blue-200",
            accent: "from-blue-500 to-blue-600",
            button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg ring-1 ring-blue-500/20 hover:ring-blue-500/40'
         },
         green: {
            bg: isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-gray-50",
            border: isDarkMode ? "border-green-600/40" : "border-green-200/60",
            icon: "text-green-600",
            iconBg: isDarkMode ? "bg-gradient-to-br from-green-900 to-green-800" : "bg-gradient-to-br from-green-50 to-green-100",
            badge: isDarkMode ? "bg-green-900/90 text-green-200 border border-green-700/60" : "bg-green-50 text-green-800 border border-green-200",
            accent: "from-green-500 to-green-600",
            button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg ring-1 ring-green-500/20 hover:ring-green-500/40'
         },
         purple: {
            bg: isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-gray-50",
            border: isDarkMode ? "border-purple-600/40" : "border-purple-200/60",
            icon: "text-purple-600",
            iconBg: isDarkMode ? "bg-gradient-to-br from-purple-900 to-purple-800" : "bg-gradient-to-br from-purple-50 to-purple-100",
            badge: isDarkMode ? "bg-purple-900/90 text-purple-200 border border-purple-700/60" : "bg-purple-50 text-purple-800 border border-purple-200",
            accent: "from-purple-500 to-purple-600",
            button: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg ring-1 ring-purple-500/20 hover:ring-purple-500/40'
         },
         orange: {
            bg: isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-white to-gray-50",
            border: isDarkMode ? "border-orange-600/40" : "border-orange-200/60",
            icon: "text-orange-600",
            iconBg: isDarkMode ? "bg-gradient-to-br from-orange-900 to-orange-800" : "bg-gradient-to-br from-orange-50 to-orange-100",
            badge: isDarkMode ? "bg-orange-900/90 text-orange-200 border border-orange-700/60" : "bg-orange-50 text-orange-800 border border-orange-200",
            accent: "from-orange-500 to-orange-600",
            button: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg ring-1 ring-orange-500/20 hover:ring-orange-500/40'
         }
      };

      const colors = colorMap[program.color] || colorMap.blue;
      
      return {
         baseClasses,
         selectedClasses,
         colors
      };
   }, [program.color, isSelected, isDarkMode]);

   const getColorClasses = () => {
      return `${colorScheme.baseClasses} ${colorScheme.selectedClasses} ${colorScheme.colors.bg} ${colorScheme.colors.border}`;
   };

   const getButtonClasses = () => {
      if (isSelected) {
         return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl ring-2 ring-green-500/40';
      }
      return colorScheme.colors.button;
   };

   // Optimized event handlers with useCallback
   const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      onMouseEnter?.(program.id);
   }, [onMouseEnter, program.id]);

   const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      onMouseLeave?.();
   }, [onMouseLeave]);

   const handleCardClick = useCallback(async () => {
      if (isLoading) return;
      
      try {
         setIsLoading(true);
         await onClick?.(program);
      } catch (error) {
         console.error('Error selecting program:', error);
      } finally {
         setIsLoading(false);
      }
   }, [onClick, program, isLoading]);

   const handleKeyDown = useCallback((e) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleCardClick();
      }
   }, [handleCardClick]);

   const toggleBenefits = useCallback((e) => {
      e.stopPropagation();
      setShowAllBenefits(prev => !prev);
   }, []);

   // Memoized benefits list
   const displayedBenefits = useMemo(() => {
      return showAllBenefits ? program.benefits : program.benefits.slice(0, 3);
   }, [program.benefits, showAllBenefits]);

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
            @keyframes fadeIn {
               from {
                  opacity: 0;
                  transform: translateY(8px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            .animate-fadeIn {
               animation: fadeIn 0.2s ease-out forwards;
            }
            .program-card {
               will-change: transform, box-shadow;
               min-height: 400px;
            }
            @media (max-width: 768px) {
               .program-card {
                  min-height: 350px;
               }
            }
            @media (min-width: 1024px) {
               .program-card {
                  min-height: 420px;
               }
            }
         `}</style>
         <div
            className={`program-card group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 ease-out h-full flex flex-col ${getColorClasses()} ${isHovered ? 'ring-2 ring-blue-500/30' : ''} ${isLoading ? 'opacity-75 pointer-events-none' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`${program.name} program - ${program.description}`}
            aria-pressed={isSelected}
            aria-describedby={`program-${program.id}-description`}
            style={{
               animationDelay: `${index * 100}ms`,
               animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
         >
         {/* Animated Background Gradient */}
         <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
            program.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
            program.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
            program.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
            'bg-gradient-to-br from-orange-500 to-orange-600'
         }`} />
         
         {/* Compact Selection Indicator */}
         {isSelected && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center z-20 shadow-md">
               <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
               </svg>
            </div>
         )}
         
         {/* Card Content Container with Flexbox */}
         <div className="relative p-4 flex flex-col h-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
               <div className="flex items-start space-x-3 flex-1">
                  {/* Icon Container */}
                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorScheme.colors.iconBg} group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                     <div className={`${colorScheme.colors.icon} text-lg transition-transform duration-300 group-hover:rotate-6`}>
                        {program.icon}
                     </div>
                     {/* Enhanced glow effect */}
                     <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                        program.color === 'blue' ? 'bg-blue-500' :
                        program.color === 'green' ? 'bg-green-500' :
                        program.color === 'purple' ? 'bg-purple-500' :
                        'bg-orange-500'
                     }`} />
                  </div>
                  
                  {/* Title and Code Section */}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-bold transition-colors duration-300 leading-tight ${
                           isDarkMode ? 'text-white group-hover:text-gray-100' : 'text-gray-900 group-hover:text-gray-800'
                        }`}>
                           {program.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${colorScheme.colors.badge} shadow-sm`}>
                           {program.code}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Description */}
            <p 
               id={`program-${program.id}-description`}
               className={`text-sm leading-relaxed mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
               }`}
            >
               {program.description}
            </p>
            
            {/* Benefits Section - Flexible Content */}
            <div className="flex-1 mb-4">
               <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-bold flex items-center transition-colors duration-300 ${
                     isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                     <svg className="w-3 h-3 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                     </svg>
                     Key Benefits
                  </h4>
                  {program.benefits.length > 3 && (
                     <button
                        onClick={toggleBenefits}
                        className={`text-xs font-medium transition-all duration-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 py-0.5 ${
                           isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}
                        aria-label={showAllBenefits ? 'Show fewer benefits' : 'Show all benefits'}
                        aria-expanded={showAllBenefits}
                     >
                        {showAllBenefits ? 'Less' : `+${program.benefits.length - 3}`}
                     </button>
                  )}
               </div>
               
               <div className="space-y-1.5">
                  {displayedBenefits.map((benefit, index) => (
                     <div key={index} className={`flex items-start text-xs transition-all duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                     } ${showAllBenefits && index >= 3 ? 'animate-fadeIn' : ''}`}>
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                           <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                           </svg>
                        </div>
                        <span className="leading-relaxed font-medium">{benefit}</span>
                     </div>
                  ))}
               </div>
            </div>
            
            {/* Action Button - Always at Bottom */}
            <div className="mt-auto">
               <button
                  className={`w-full group relative overflow-hidden rounded-lg font-semibold py-2.5 px-3 transition-all duration-300 transform ${getButtonClasses()} hover:scale-[1.02] active:scale-98 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={(e) => {
                     e.stopPropagation();
                     handleCardClick();
                  }}
                  disabled={isLoading}
                  aria-label={isSelected ? `Selected ${program.name}` : `Apply for ${program.name}`}
                  aria-describedby={isLoading ? 'loading-state' : undefined}
               >
                  {/* Button Background Animation */}
                  <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                     program.color === 'blue' ? 'from-blue-500 to-blue-600' :
                     program.color === 'green' ? 'from-green-500 to-green-600' :
                     program.color === 'purple' ? 'from-purple-500 to-purple-600' :
                     'from-orange-500 to-orange-600'
                  }`} />
                  
                  <span className="relative z-10 flex items-center justify-center">
                     {isLoading ? (
                        <>
                           <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                           </svg>
                           <span className="font-semibold">Processing...</span>
                        </>
                     ) : isSelected ? (
                        <>
                           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                           </svg>
                           <span className="font-bold">Selected</span>
                        </>
                     ) : (
                        <>
                           <span className="hidden sm:inline font-semibold">Apply for {program.code}</span>
                           <span className="sm:hidden font-semibold">Apply</span>
                           <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                           </svg>
                        </>
                     )}
                  </span>
               </button>
            </div>
         </div>
         </div>
      </>
   );
};

export default ProgramCard;
