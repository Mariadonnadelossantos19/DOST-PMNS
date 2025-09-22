const mongoose = require('mongoose');
const TNA = require('./src/models/TNA');

mongoose.connect('mongodb://localhost:27017/pmns')
  .then(async () => {
    console.log('Connected to database');
    
    // Find the TNA with the problematic report
    const tna = await TNA.findById('68cf85aa4611518b11bfe10a');
    if (tna) {
      console.log('Current TNA report data:', tna.tnaReport);
      
      // Clear the invalid report data
      tna.tnaReport = undefined;
      tna.status = 'completed'; // Reset to completed status
      tna.reportSummary = undefined;
      tna.reportRecommendations = undefined;
      
      // Use updateOne to bypass validation
      await TNA.updateOne(
        { _id: tna._id },
        { 
          $unset: { 
            tnaReport: 1,
            reportSummary: 1,
            reportRecommendations: 1
          },
          $set: { 
            status: 'completed'
          }
        }
      );
      console.log('TNA report data cleared. You can now re-upload the report.');
    } else {
      console.log('TNA not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
