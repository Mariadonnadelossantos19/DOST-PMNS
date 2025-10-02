const mongoose = require('mongoose');
const RTECDocuments = require('./src/models/RTECDocuments');
const TNA = require('./src/models/TNA');
const SETUPApplication = require('./src/models/SETUPApplication');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pmns', {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

async function fetchRTECData() {
   try {
      console.log('=== FETCHING RTEC DOCUMENTS DATA ===\n');
      
      // Get all RTEC documents
      const rtecDocuments = await RTECDocuments.find({})
         .populate('tnaId', 'scheduledDate location programName status')
         .populate('applicationId', 'enterpriseName companyName projectTitle businessActivity')
         .populate('proponentId', 'firstName lastName email')
         .populate('requestedBy', 'firstName lastName');

      console.log(`Total RTEC Documents found: ${rtecDocuments.length}\n`);

      if (rtecDocuments.length === 0) {
         console.log('No RTEC documents found in database.');
         
         // Check for TNAs that could have RTEC documents requested
         const signedTNAs = await TNA.find({ status: 'signed_by_rd' })
            .populate('applicationId', 'enterpriseName companyName projectTitle')
            .populate('proponentId', 'firstName lastName');
            
         console.log(`\nTNAs with signed_by_rd status: ${signedTNAs.length}`);
         
         if (signedTNAs.length > 0) {
            console.log('\nSample signed TNA:');
            console.log({
               id: signedTNAs[0]._id,
               company: signedTNAs[0].applicationId?.enterpriseName || signedTNAs[0].applicationId?.companyName,
               project: signedTNAs[0].applicationId?.projectTitle,
               proponent: `${signedTNAs[0].proponentId?.firstName} ${signedTNAs[0].proponentId?.lastName}`,
               status: signedTNAs[0].status
            });
         }
      } else {
         // Display each RTEC document
         rtecDocuments.forEach((doc, index) => {
            console.log(`--- RTEC Document ${index + 1} ---`);
            console.log(`ID: ${doc._id}`);
            console.log(`Status: ${doc.status}`);
            console.log(`Company: ${doc.applicationId?.enterpriseName || doc.applicationId?.companyName || 'N/A'}`);
            console.log(`Project: ${doc.applicationId?.projectTitle || 'N/A'}`);
            console.log(`Proponent: ${doc.proponentId?.firstName} ${doc.proponentId?.lastName}`);
            console.log(`Requested At: ${doc.requestedAt}`);
            console.log(`Due Date: ${doc.dueDate}`);
            console.log(`Requested By: ${doc.requestedBy?.firstName} ${doc.requestedBy?.lastName}`);
            
            if (doc.partialdocsrtec && doc.partialdocsrtec.length > 0) {
               console.log('Documents:');
               doc.partialdocsrtec.forEach(partialDoc => {
                  console.log(`  - ${partialDoc.name}: ${partialDoc.documentStatus}`);
                  if (partialDoc.filename) {
                     console.log(`    File: ${partialDoc.originalName}`);
                  }
                  if (partialDoc.reviewComments) {
                     console.log(`    Comments: ${partialDoc.reviewComments}`);
                  }
               });
            }
            console.log('');
         });
      }
      
   } catch (error) {
      console.error('Error fetching RTEC data:', error);
   } finally {
      mongoose.connection.close();
   }
}

fetchRTECData();
