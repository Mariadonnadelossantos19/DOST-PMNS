import React from 'react';

const DocumentViewer = ({ document, documentType, documentName }) => {
   if (!document) {
      return (
         <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-dashed">
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
               </div>
               <div>
                  <div className="font-medium text-gray-500">{documentName}</div>
                  <div className="text-sm text-gray-400">No document uploaded</div>
               </div>
            </div>
         </div>
      );
   }

   const handleView = () => {
      const fileUrl = `http://localhost:4000/uploads/${document.filename}`;
      const fileExtension = document.originalName.split('.').pop().toLowerCase();
      
      // For PDFs, open directly in new tab
      if (fileExtension === 'pdf') {
         window.open(fileUrl, '_blank');
         return;
      }
      
      // For images, open directly in new tab
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
         window.open(fileUrl, '_blank');
         return;
      }
      
      // For other files, try iframe approach
      const newWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
      newWindow.document.write(`
         <html>
            <head>
               <title>${documentName} - ${document.originalName}</title>
               <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  .header { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                  .iframe-container { border: 1px solid #ccc; border-radius: 5px; overflow: hidden; }
                  iframe { width: 100%; height: 600px; border: none; }
                  .error { color: #dc3545; padding: 20px; text-align: center; }
               </style>
            </head>
            <body>
               <div class="header">
                  <h3>${documentName}</h3>
                  <p><strong>File:</strong> ${document.originalName}</p>
                  <p><strong>Uploaded:</strong> ${new Date(document.uploadedAt).toLocaleDateString()}</p>
               </div>
               <div class="iframe-container">
                  <iframe 
                     src="${fileUrl}" 
                     onerror="this.parentNode.innerHTML='<div class=\\"error\\">Unable to display this file type. Please download to view.</div>'"
                  ></iframe>
               </div>
            </body>
         </html>
      `);
   };

   const handleDownload = () => {
      const link = document.createElement('a');
      link.href = `http://localhost:4000/uploads/${document.filename}`;
      link.download = document.originalName;
      link.click();
   };

   const getIconColor = () => {
      switch (documentType) {
         case 'letterOfIntent': return 'bg-red-100 text-red-600';
         case 'dostTnaForm': return 'bg-green-100 text-green-600';
         case 'enterpriseProfile': return 'bg-blue-100 text-blue-600';
         default: return 'bg-gray-100 text-gray-600';
      }
   };

   return (
      <div className="flex items-center justify-between p-3 bg-white rounded border">
         <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${getIconColor()} rounded flex items-center justify-center`}>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            <div>
               <div className="font-medium text-gray-900">{documentName}</div>
               <div className="text-sm text-gray-500">{document.originalName}</div>
               <div className="text-xs text-gray-400">
                  Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
               </div>
            </div>
         </div>
         <div className="flex space-x-2">
            <button
               onClick={handleView}
               className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
            >
               View
            </button>
            <button
               onClick={handleDownload}
               className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded hover:bg-green-200 transition-colors"
            >
               Download
            </button>
         </div>
      </div>
   );
};

export default DocumentViewer;
