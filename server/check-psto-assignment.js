const mongoose = require('mongoose');
const SETUPApplication = require('./src/models/SETUPApplication');
const User = require('./src/models/User');
const PSTO = require('./src/models/PSTO');

async function checkAndFixPSTOAssignment() {
   try {
      await mongoose.connect('mongodb://localhost:27017/pmns');
      console.log('✅ Connected to database');

      // Find the application
      const application = await SETUPApplication.findById('68c91494b78939fe24fda26f');
      if (!application) {
         console.log('❌ Application not found');
         return;
      }

      console.log('📋 Application found:', application.applicationId);
      console.log('👤 Proponent ID:', application.proponentId);

      // Find the proponent
      const proponent = await User.findById(application.proponentId);
      if (!proponent) {
         console.log('❌ Proponent not found');
         return;
      }

      console.log('👤 Proponent details:');
      console.log('  - Name:', proponent.firstName, proponent.lastName);
      console.log('  - Province:', proponent.province);
      console.log('  - Role:', proponent.role);

      // Check if application is already assigned to PSTO
      console.log('🔍 Current PSTO assignment:');
      console.log('  - assignedPSTO:', application.assignedPSTO);
      console.log('  - forwardedToPSTO:', application.forwardedToPSTO);
      console.log('  - pstoStatus:', application.pstoStatus);

      // Find PSTOs
      const pstos = await PSTO.find();
      console.log('🏢 Available PSTOs:');
      pstos.forEach(psto => {
         console.log(`  - ${psto.province} (${psto.status}) - ${psto._id}`);
      });

      // If proponent has a province, find matching PSTO
      if (proponent.province) {
         const matchingPSTO = await PSTO.findOne({ 
            province: proponent.province,
            status: 'active'
         });

         if (matchingPSTO) {
            console.log('✅ Found matching PSTO:', matchingPSTO.province);
            
            // Update application with PSTO assignment
            application.assignedPSTO = matchingPSTO._id;
            application.forwardedToPSTO = true;
            application.forwardedAt = new Date();
            application.pstoStatus = 'pending';
            
            await application.save();
            console.log('✅ Application assigned to PSTO successfully!');
         } else {
            console.log('❌ No active PSTO found for province:', proponent.province);
         }
      } else {
         console.log('❌ Proponent has no province set');
         console.log('💡 Setting default province to "Palawan" for testing...');
         
         // Set default province for testing
         proponent.province = 'Palawan';
         await proponent.save();
         
         // Find Palawan PSTO
         const palawanPSTO = await PSTO.findOne({ 
            province: 'Palawan',
            status: 'active'
         });

         if (palawanPSTO) {
            application.assignedPSTO = palawanPSTO._id;
            application.forwardedToPSTO = true;
            application.forwardedAt = new Date();
            application.pstoStatus = 'pending';
            
            await application.save();
            console.log('✅ Application assigned to Palawan PSTO for testing!');
         } else {
            console.log('❌ No Palawan PSTO found');
         }
      }

      // Show final status
      const updatedApp = await SETUPApplication.findById('68c91494b78939fe24fda26f')
         .populate('assignedPSTO', 'province status');
      
      console.log('📋 Final application status:');
      console.log('  - assignedPSTO:', updatedApp.assignedPSTO?.province);
      console.log('  - forwardedToPSTO:', updatedApp.forwardedToPSTO);
      console.log('  - pstoStatus:', updatedApp.pstoStatus);

   } catch (error) {
      console.error('❌ Error:', error.message);
   } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database');
   }
}

checkAndFixPSTOAssignment();
