const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
   try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pmns');
      console.log('MongoDB connected successfully');
   } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
   }
};

const TNA = require('./src/models/TNA');
const SETUPApplication = require('./src/models/SETUPApplication');

const debugTNAStatus = async () => {
   try {
      await connectDB();
      
      console.log('=== TNA STATUS DEBUG ===');
      
      // Get all TNAs
      const allTNAs = await TNA.find({})
         .populate('applicationId', 'applicationId enterpriseName status')
         .populate('proponentId', 'firstName lastName')
         .select('status forwardedToDostMimaropaAt tnaReport applicationId proponentId');
      
      console.log(`\nTotal TNAs in database: ${allTNAs.length}`);
      
      if (allTNAs.length === 0) {
         console.log('No TNAs found in database');
      } else {
         // Group by status
         const statusCounts = {};
         allTNAs.forEach(tna => {
            const status = tna.status || 'no_status';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
         });
         
         console.log('\nTNA Status Distribution:');
         Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
         });
         
         console.log('\nDetailed TNA List:');
         allTNAs.forEach((tna, index) => {
            console.log(`\n${index + 1}. TNA ID: ${tna._id}`);
            console.log(`   Status: ${tna.status || 'no_status'}`);
            console.log(`   Application: ${tna.applicationId?.applicationId || 'N/A'} (${tna.applicationId?.enterpriseName || 'N/A'})`);
            console.log(`   Proponent: ${tna.proponentId?.firstName || 'N/A'} ${tna.proponentId?.lastName || 'N/A'}`);
            console.log(`   Has Report: ${tna.tnaReport && tna.tnaReport.filename ? 'Yes' : 'No'}`);
            console.log(`   Forwarded to DOST: ${tna.forwardedToDostMimaropaAt ? 'Yes' : 'No'}`);
         });
      }
      
      // Also check applications that might need TNAs
      const approvedApps = await SETUPApplication.find({ pstoStatus: 'approved' })
         .select('applicationId enterpriseName pstoStatus tnaScheduled')
         .limit(10);
      
      console.log(`\n=== APPROVED APPLICATIONS ===`);
      console.log(`Approved applications that could have TNAs: ${approvedApps.length}`);
      
      if (approvedApps.length > 0) {
         approvedApps.forEach((app, index) => {
            console.log(`${index + 1}. ${app.applicationId} - ${app.enterpriseName} (TNA Scheduled: ${app.tnaScheduled ? 'Yes' : 'No'})`);
         });
      }
      
   } catch (error) {
      console.error('Error:', error);
   } finally {
      mongoose.connection.close();
   }
};

debugTNAStatus();
