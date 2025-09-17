const mongoose = require('mongoose');
const User = require('./src/models/User');
const SETUPApplication = require('./src/models/SETUPApplication');
const PSTO = require('./src/models/PSTO');

// Connect to MongoDB
async function connectDB() {
   try {
      await mongoose.connect('mongodb://localhost:27017/pmns2', {
         useNewUrlParser: true,
         useUnifiedTopology: true
      });
      console.log('✅ Connected to MongoDB');
   } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
   }
}

async function fixProvinceAssignments() {
   try {
      console.log('🔧 Starting province assignment fixes...\n');

      // 1. Fix PSTO users - ensure they have proper province assignments
      console.log('1. Fixing PSTO users...');
      const pstoUsers = await User.find({ role: 'psto' });
      
      for (const psto of pstoUsers) {
         if (!psto.province) {
            // Extract province from userId if possible
            const userId = psto.userId;
            if (userId.includes('Romblon')) {
               psto.province = 'Romblon';
            } else if (userId.includes('Palawan')) {
               psto.province = 'Palawan';
            } else if (userId.includes('Marinduque')) {
               psto.province = 'Marinduque';
            } else if (userId.includes('OccidentalMindoro')) {
               psto.province = 'Occidental Mindoro';
            } else if (userId.includes('OrientalMindoro')) {
               psto.province = 'Oriental Mindoro';
            } else {
               // Default to Palawan for testing
               psto.province = 'Palawan';
            }
            
            await psto.save();
            console.log(`   ✅ Fixed PSTO ${psto.firstName} ${psto.lastName} - Province: ${psto.province}`);
         } else {
            console.log(`   ✅ PSTO ${psto.firstName} ${psto.lastName} already has province: ${psto.province}`);
         }
      }

      // 2. Fix proponents - ensure they have proper province assignments
      console.log('\n2. Fixing proponents...');
      const proponents = await User.find({ role: 'proponent' });
      
      for (const proponent of proponents) {
         if (!proponent.province) {
            // Set default province to Palawan for testing
            proponent.province = 'Palawan';
            await proponent.save();
            console.log(`   ✅ Fixed proponent ${proponent.firstName} ${proponent.lastName} - Province: ${proponent.province}`);
         } else {
            console.log(`   ✅ Proponent ${proponent.firstName} ${proponent.lastName} already has province: ${proponent.province}`);
         }
      }

      // 3. Create PSTO records for each province if they don't exist
      console.log('\n3. Creating PSTO records...');
      const provinces = ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan'];
      
      for (const province of provinces) {
         let psto = await PSTO.findOne({ province });
         
         if (!psto) {
            psto = new PSTO({
               province,
               status: 'active',
               name: `PSTO ${province}`,
               address: `${province}, Philippines`,
               contactNumber: '000-000-0000',
               email: `psto.${province.toLowerCase().replace(/\s+/g, '')}@dost.gov.ph`
            });
            await psto.save();
            console.log(`   ✅ Created PSTO record for ${province}`);
         } else {
            console.log(`   ✅ PSTO record already exists for ${province}`);
         }
      }

      // 4. Fix application PSTO assignments
      console.log('\n4. Fixing application PSTO assignments...');
      const applications = await SETUPApplication.find({}).populate('proponentId');
      
      for (const app of applications) {
         if (!app.assignedPSTO && app.proponentId) {
            const proponent = app.proponentId;
            const psto = await PSTO.findOne({ 
               province: proponent.province,
               status: 'active'
            });
            
            if (psto) {
               app.assignedPSTO = psto._id;
               app.forwardedToPSTO = true;
               app.forwardedAt = new Date();
               app.pstoStatus = 'pending';
               await app.save();
               console.log(`   ✅ Fixed application ${app.applicationId} - Assigned to PSTO ${psto.province}`);
            } else {
               console.log(`   ❌ No PSTO found for province: ${proponent.province}`);
            }
         } else if (app.assignedPSTO) {
            console.log(`   ✅ Application ${app.applicationId} already has PSTO assignment`);
         }
      }

      // 5. Summary
      console.log('\n📊 Summary:');
      const pstoCount = await User.countDocuments({ role: 'psto' });
      const proponentCount = await User.countDocuments({ role: 'proponent' });
      const applicationCount = await SETUPApplication.countDocuments({});
      const pstoRecordCount = await PSTO.countDocuments({});
      
      console.log(`   - PSTO Users: ${pstoCount}`);
      console.log(`   - Proponents: ${proponentCount}`);
      console.log(`   - Applications: ${applicationCount}`);
      console.log(`   - PSTO Records: ${pstoRecordCount}`);

      console.log('\n✅ Province assignment fixes completed!');
      
   } catch (error) {
      console.error('❌ Error fixing province assignments:', error);
   } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
   }
}

// Run the fix
connectDB().then(() => {
   fixProvinceAssignments();
});
