import React, { useState, useEffect } from 'react';

const ProgressAnimation = ({ 
   current = 0, 
   total = 100, 
   label = "Progress", 
   color = "blue",
   animated = true,
   showPercentage = true 
}) => {
   const [displayValue, setDisplayValue] = useState(0);
   const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

   useEffect(() => {
      if (animated) {
         const duration = 1000; // 1 second
         const steps = 60;
         const increment = percentage / steps;
         let step = 0;

         const timer = setInterval(() => {
            step++;
            setDisplayValue(Math.min(increment * step, percentage));
            
            if (step >= steps) {
               clearInterval(timer);
            }
         }, duration / steps);

         return () => clearInterval(timer);
      } else {
         setDisplayValue(percentage);
      }
   }, [percentage, animated]);

   const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
   };

   const bgColorClasses = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      red: 'bg-red-100'
   };

   return (
      <div className="w-full">
         <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {showPercentage && (
               <span className="text-sm font-bold text-gray-900">
                  {Math.round(displayValue)}%
               </span>
            )}
         </div>
         
         <div className={`w-full h-3 rounded-full ${bgColorClasses[color]} overflow-hidden`}>
            <div
               className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out relative`}
               style={{ width: `${displayValue}%` }}
            >
               {/* Shimmer effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
         </div>
         
         <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{current}</span>
            <span>{total}</span>
         </div>
      </div>
   );
};

// Circular Progress Component
export const CircularProgress = ({ 
   current = 0, 
   total = 100, 
   size = 120,
   strokeWidth = 8,
   color = "blue",
   animated = true 
}) => {
   const [displayValue, setDisplayValue] = useState(0);
   const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
   const radius = (size - strokeWidth) / 2;
   const circumference = radius * 2 * Math.PI;
   const strokeDasharray = circumference;
   const strokeDashoffset = circumference - (percentage / 100) * circumference;

   useEffect(() => {
      if (animated) {
         const duration = 1500;
         const steps = 60;
         const increment = percentage / steps;
         let step = 0;

         const timer = setInterval(() => {
            step++;
            const newValue = Math.min(increment * step, percentage);
            setDisplayValue(newValue);
            
            if (step >= steps) {
               clearInterval(timer);
            }
         }, duration / steps);

         return () => clearInterval(timer);
      } else {
         setDisplayValue(percentage);
      }
   }, [percentage, animated]);

   const colorClasses = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444'
   };

   return (
      <div className="relative inline-block">
         <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
               cx={size / 2}
               cy={size / 2}
               r={radius}
               stroke="#E5E7EB"
               strokeWidth={strokeWidth}
               fill="transparent"
            />
            {/* Progress circle */}
            <circle
               cx={size / 2}
               cy={size / 2}
               r={radius}
               stroke={colorClasses[color]}
               strokeWidth={strokeWidth}
               fill="transparent"
               strokeDasharray={strokeDasharray}
               strokeDashoffset={circumference - (displayValue / 100) * circumference}
               strokeLinecap="round"
               className="transition-all duration-1000 ease-out"
            />
         </svg>
         
         {/* Center text */}
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
               <div className="text-2xl font-bold text-gray-900">
                  {Math.round(displayValue)}%
               </div>
               <div className="text-xs text-gray-500">
                  {current}/{total}
               </div>
            </div>
         </div>
      </div>
   );
};

// Animated Counter Component
export const AnimatedCounter = ({ 
   value = 0, 
   duration = 1000,
   prefix = "",
   suffix = "",
   className = ""
}) => {
   const [displayValue, setDisplayValue] = useState(0);

   useEffect(() => {
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;

      const timer = setInterval(() => {
         const elapsed = Date.now() - startTime;
         const progress = Math.min(elapsed / duration, 1);
         
         // Easing function for smooth animation
         const easeOutCubic = 1 - Math.pow(1 - progress, 3);
         const currentValue = startValue + (endValue - startValue) * easeOutCubic;
         
         setDisplayValue(Math.round(currentValue));
         
         if (progress >= 1) {
            clearInterval(timer);
         }
      }, 16); // ~60fps

      return () => clearInterval(timer);
   }, [value, duration]);

   return (
      <span className={className}>
         {prefix}{displayValue.toLocaleString()}{suffix}
      </span>
   );
};

export default ProgressAnimation;
