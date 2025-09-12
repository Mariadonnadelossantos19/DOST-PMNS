// Dark mode utility functions for consistent styling
export const getDarkModeClasses = (isDarkMode, lightClasses, darkClasses) => {
   return isDarkMode ? darkClasses : lightClasses;
};

// Common dark mode class combinations
export const darkModeStyles = {
   // Backgrounds
   background: {
      primary: (isDark) => isDark ? 'bg-gray-900' : 'bg-gray-50',
      secondary: (isDark) => isDark ? 'bg-gray-800' : 'bg-white',
      tertiary: (isDark) => isDark ? 'bg-gray-700' : 'bg-gray-100',
   },
   
   // Text colors
   text: {
      primary: (isDark) => isDark ? 'text-white' : 'text-gray-900',
      secondary: (isDark) => isDark ? 'text-gray-300' : 'text-gray-600',
      muted: (isDark) => isDark ? 'text-gray-400' : 'text-gray-500',
   },
   
   // Borders
   border: {
      primary: (isDark) => isDark ? 'border-gray-700' : 'border-gray-200',
      secondary: (isDark) => isDark ? 'border-gray-600' : 'border-gray-300',
   },
   
   // Hover states
   hover: {
      primary: (isDark) => isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      secondary: (isDark) => isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50',
   },
   
   // Input fields
   input: (isDark) => isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600 focus:border-blue-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500',
   
   // Cards
   card: (isDark) => isDark 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
};

export default darkModeStyles;
