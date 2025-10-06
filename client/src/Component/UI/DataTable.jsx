import React from 'react';
import { Card, Button, Badge } from './index';

/**
 * Standardized Data Table Component
 * Provides consistent table structure across the application
 */
const DataTable = ({ 
   data = [], 
   columns = [], 
   loading = false, 
   emptyMessage = "No data available",
   onRowClick = null,
   actions = null,
   className = ""
}) => {
   if (loading) {
      return (
         <Card className="p-6">
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
         </Card>
      );
   }

   if (data.length === 0) {
      return (
         <Card className="p-8 text-center">
            <div className="text-gray-500">
               <div className="text-4xl mb-4">📋</div>
               <h3 className="text-lg font-medium mb-2">No Data</h3>
               <p>{emptyMessage}</p>
            </div>
         </Card>
      );
   }

   return (
      <Card className={`overflow-hidden ${className}`}>
         <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 table-fixed">
               <thead className="bg-gray-50">
                  <tr>
                     {columns.map((column, index) => (
                        <th
                           key={index}
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                           style={{ width: column.width }}
                        >
                           {column.header}
                        </th>
                     ))}
                     {actions && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Actions
                        </th>
                     )}
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, rowIndex) => (
                     <tr
                        key={rowIndex}
                        className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onRowClick && onRowClick(row, rowIndex)}
                     >
                        {columns.map((column, colIndex) => (
                           <td 
                              key={colIndex} 
                              className="px-6 py-4 text-sm text-gray-900"
                              style={{ width: column.width }}
                           >
                              {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                           </td>
                        ))}
                        {actions && (
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {actions(row, rowIndex)}
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
   );
};

export default DataTable;

