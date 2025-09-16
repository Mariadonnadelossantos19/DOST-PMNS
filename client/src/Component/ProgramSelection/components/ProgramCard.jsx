import React from 'react';

const ProgramCard = ({ 
   program, 
   isSelected, 
   isHovered, 
   onMouseEnter, 
   onMouseLeave, 
   onClick, 
   index 
}) => {
   const getColorClasses = (color, isSelected, isHovered) => {
      const baseClasses = "transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1";
      const selectedClasses = isSelected ? 'ring-2 ring-blue-500 ring-opacity-60 shadow-xl' : 'shadow-md hover:shadow-lg';

      const colorMap = {
         blue: {
            bg: "bg-white",
            border: "border-blue-100",
            icon: "text-blue-600",
            iconBg: "bg-blue-50",
            badge: "bg-blue-50 text-blue-700"
         },
         green: {
            bg: "bg-white",
            border: "border-green-100",
            icon: "text-green-600",
            iconBg: "bg-green-50",
            badge: "bg-green-50 text-green-700"
         },
         purple: {
            bg: "bg-white",
            border: "border-purple-100",
            icon: "text-purple-600",
            iconBg: "bg-purple-50",
            badge: "bg-purple-50 text-purple-700"
         },
         orange: {
            bg: "bg-white",
            border: "border-orange-100",
            icon: "text-orange-600",
            iconBg: "bg-orange-50",
            badge: "bg-orange-50 text-orange-700"
         }
      };

      const colors = colorMap[color] || colorMap.blue;
      
      return `${baseClasses} ${selectedClasses} ${colors.bg} ${colors.border}`;
   };

   const getButtonClasses = (color, isSelected) => {
      if (isSelected) {
         return 'bg-green-600 text-white shadow-md';
      }

      const colorMap = {
         blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
         green: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md',
         purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md',
         orange: 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md'
      };

      return colorMap[color] || colorMap.blue;
   };

   const colors = {
      blue: { icon: "text-blue-600", iconBg: "bg-blue-50", badge: "bg-blue-50 text-blue-700" },
      green: { icon: "text-green-600", iconBg: "bg-green-50", badge: "bg-green-50 text-green-700" },
      purple: { icon: "text-purple-600", iconBg: "bg-purple-50", badge: "bg-purple-50 text-purple-700" },
      orange: { icon: "text-orange-600", iconBg: "bg-orange-50", badge: "bg-orange-50 text-orange-700" }
   };

   const programColors = colors[program.color] || colors.blue;

   return (
      <div
         className={`group relative overflow-hidden rounded-xl border cursor-pointer ${getColorClasses(program.color, isSelected, isHovered)}`}
         onMouseEnter={() => onMouseEnter(program.id)}
         onMouseLeave={() => onMouseLeave()}
         onClick={() => onClick(program)}
         style={{
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
         }}
      >
         {/* Selection Indicator */}
         {isSelected && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
               </svg>
            </div>
         )}
         
         <div className="relative p-4">
            <div className="flex items-start space-x-3">
               {/* Icon Container */}
               <div className={`relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${programColors.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                  <div className={programColors.icon}>
                     {program.icon}
                  </div>
               </div>
               
               {/* Content */}
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {program.name}
                     </h3>
                     <span className={`px-2 py-1 rounded-md text-xs font-semibold ${programColors.badge}`}>
                        {program.code}
                     </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                     {program.description}
                  </p>
                  
                  {/* Benefits List */}
                  <div className="mb-4">
                     <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Key Benefits
                     </h4>
                     <div className="grid grid-cols-1 gap-1">
                        {program.benefits.map((benefit, index) => (
                           <div key={index} className="flex items-center text-xs text-gray-600">
                              <svg className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              {benefit}
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Apply Button */}
                  <button
                     className={`w-full group relative overflow-hidden rounded-lg font-medium py-2 px-3 transition-all duration-300 transform ${getButtonClasses(program.color, isSelected)} hover:scale-[1.02] active:scale-95`}
                     onClick={(e) => {
                        e.stopPropagation();
                        onClick(program);
                     }}
                  >
                     <span className="relative z-10 flex items-center justify-center">
                        {isSelected ? (
                           <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              Selected
                           </>
                        ) : (
                           <>
                              Apply for {program.code}
                              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                           </>
                        )}
                     </span>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ProgramCard;
