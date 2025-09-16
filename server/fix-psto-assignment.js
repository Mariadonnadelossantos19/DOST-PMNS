const mongoose = require('mongoose');
const SETUPApplication = require('./src/models/SETUPApplication');
const User = require('./src/models/User');
const PSTO = require('./src/models/PSTO');

async function fixPSTOAssignment() {
   try {
      await mongoose.connect('mongodb://localhost:27017/pmns');
      console.log('✅ Connected to database');

      // Find the application
      const application = await SETUPApplication.findById('68c91494b78939fe24fda26f');
      if (!application) {
         console.log('❌ Application not found');
         return;
      }

      console.log('📋 Found application:', application.applicationId);

      // Find the proponent
      const proponent = await User.findById(application.proponentId);
      if (!proponent) {
         console.log('❌ Proponent not found');
         return;
      }

      console.log('👤 Proponent:', proponent.firstName, proponent.lastName);
      console.log('🏢 Proponent province:', proponent.province);

      // Set a default province if none exists
      if (!proponent.province) {
         console.log('💡 Setting default province to "Palawan"');
         proponent.province = 'Palawan';
         await proponent.save();
      }

      // Find PSTO for the province
      const psto = await PSTO.findOne({ 
         province: proponent.province,
         status: 'active'
      });

      if (!psto) {
         console.log('❌ No active PSTO found for province:', proponent.province);
         console.log('💡 Creating a default Palawan PSTO...');
         
         // Create a default PSTO for Palawan
         const newPSTO = new PSTO({
            province: 'Palawan',
            status: 'active',
            name: 'PSTO Palawan',
            address: 'Palawan, Philippines',
            contactNumber: '000-000-0000',
            email: 'psto.palawan@dost.gov.ph'
         });
         
         await newPSTO.save();
         console.log('✅ Created Palawan PSTO:', newPSTO._id);
         
         // Assign application to this PSTO
         application.assignedPSTO = newPSTO._id;
         application.forwardedToPSTO = true;
         application.forwardedAt = new Date();
         application.pstoStatus = 'pending';
         
         await application.save();
         console.log('✅ Application assigned to Palawan PSTO!');
      } else {
         console.log('✅ Found PSTO:', psto.province);
         
         // Assign application to this PSTO
         application.assignedPSTO = psto._id;
         application.forwardedToPSTO = true;
         application.forwardedAt = new Date();
         application.pstoStatus = 'pending';
         
         await application.save();
         console.log('✅ Application assigned to PSTO!');
      }

      // Verify the update
      const updatedApp = await SETUPApplication.findById('68c91494b78939fe24fda26f')
         .populate('assignedPSTO', 'province status');
      
      console.log('📋 Updated application:');
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

fixPSTOAssignment();
