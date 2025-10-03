const mongoose = require('mongoose');
const RTECDocuments = require('./src/models/RTECDocuments');
const SETUPApplication = require('./src/models/SETUPApplication');
const User = require('./src/models/User');
const TNA = require('./src/models/TNA');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function debugApprovedDocuments() {
   try {
      console.log('=== DEBUGGING APPROVED RTEC DOCUMENTS ===\n');
      
      // Get all RTEC documents
      const allDocs = await RTECDocuments.find({})
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('applicationId', 'enterpriseName projectTitle programName businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('requestedBy', 'firstName lastName')
         .populate('submittedBy', 'firstName lastName')
         .populate('reviewedBy', 'firstName lastName')
         .sort({ requestedAt: -1 });

      console.log(`Total RTEC Documents: ${allDocs.length}\n`);
      
      // Show all documents with their status
      allDocs.forEach((doc, index) => {
         console.log(`--- Document ${index + 1} ---`);
         console.log('ID:', doc._id);
         console.log('Status:', doc.status);
         console.log('ApplicationId:', doc.applicationId);
         console.log('ProponentId:', doc.proponentId);
         console.log('TnaId:', doc.tnaId);
         console.log('RequestedAt:', doc.requestedAt);
         console.log('DueDate:', doc.dueDate);
         console.log('');
      });
      
      // Filter for approved documents
      const approvedDocs = allDocs.filter(doc => doc.status === 'documents_approved');
      console.log(`Approved Documents: ${approvedDocs.length}\n`);
      
      if (approvedDocs.length > 0) {
         console.log('=== APPROVED DOCUMENTS DETAILS ===');
         approvedDocs.forEach((doc, index) => {
            console.log(`\n--- Approved Document ${index + 1} ---`);
            console.log('ID:', doc._id);
            console.log('Status:', doc.status);
            console.log('ApplicationId:', doc.applicationId);
            console.log('ProponentId:', doc.proponentId);
            console.log('TnaId:', doc.tnaId);
         });
      } else {
         console.log('No approved documents found. Available statuses:');
         const statuses = [...new Set(allDocs.map(doc => doc.status))];
         console.log('Statuses:', statuses);
      }
      
   } catch (error) {
      console.error('Error:', error);
   } finally {
      mongoose.connection.close();
   }
}

debugApprovedDocuments();
