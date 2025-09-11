import React from 'react';

const Card = ({ 
   children, 
   className = '', 
   padding = 'default',
   shadow = 'default',
   border = false,
   hover = false,
   ...props 
}) => {
   const paddingClasses = {
      none: '',
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8'
   };

   const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      default: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
   };

   const cardClasses = `
      bg-white rounded-lg
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${border ? 'border border-gray-200' : ''}
      ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
      ${className}
   `;

   return (
      <div className={cardClasses} {...props}>
         {children}
      </div>
   );
};

// Card sub-components
const CardHeader = ({ children, className = '', ...props }) => (
   <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
   </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
   <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
   </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
   <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
   </p>
);

const CardContent = ({ children, className = '', ...props }) => (
   <div className={className} {...props}>
      {children}
   </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
   <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
      {children}
   </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
