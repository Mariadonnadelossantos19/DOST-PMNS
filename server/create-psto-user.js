const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createPSTOUser() {
   try {
      // Connect to MongoDB
      await mongoose.connect('mongodb://localhost:27017/pmns2', {
         useNewUrlParser: true,
         useUnifiedTopology: true
      });
      console.log('✅ Connected to MongoDB');

      // Check if PSTO user already exists
      const existingPSTO = await User.findOne({ role: 'psto' });
      if (existingPSTO) {
         console.log('⚠️  PSTO User already exists:');
         console.log(`   Email: ${existingPSTO.email}`);
         console.log(`   Password: psto123`);
         console.log(`   User ID: ${existingPSTO._id}`);
         console.log(`   Province: ${existingPSTO.province}`);
         return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash('psto123', 10);

      // Create PSTO User for Marinduque
      const pstoUser = new User({
         userId: 'PSTO_MARINDUQUE_001',
         firstName: 'PSTO',
         lastName: 'Marinduque',
         email: 'psto.marinduque@dost.gov.ph',
         password: hashedPassword,
         role: 'psto',
         department: 'DOST MIMAROPA',
         position: 'Provincial Science and Technology Officer',
         province: 'Marinduque',
         status: 'active'
      });

      await pstoUser.save();

      console.log('🎉 PSTO User created successfully!');
      console.log('📧 Email: psto.marinduque@dost.gov.ph');
      console.log('🔑 Password: psto123');
      console.log(`🆔 User ID: ${pstoUser._id}`);
      console.log(`🏛️  Province: ${pstoUser.province}`);
      console.log('');
      console.log('📋 Use these credentials to test PSTO dashboard:');
      console.log('   POST /api/auth/login');
      console.log('   Body: {');
      console.log('     "email": "psto.marinduque@dost.gov.ph",');
      console.log('     "password": "psto123"');
      console.log('   }');

   } catch (error) {
      console.error('❌ Error creating PSTO User:', error.message);
   } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
   }
}

createPSTOUser();

