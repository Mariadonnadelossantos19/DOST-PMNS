const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
   try {
      // Connect to MongoDB
      await mongoose.connect('mongodb://localhost:27017/pmns2', {
         useNewUrlParser: true,
         useUnifiedTopology: true
      });
      console.log('✅ Connected to MongoDB');

      // Check if super admin already exists
      const existingAdmin = await User.findOne({ role: 'super_admin' });
      if (existingAdmin) {
         console.log('⚠️  Super Admin already exists:');
         console.log(`   Email: ${existingAdmin.email}`);
         console.log(`   Password: admin123`);
         console.log(`   User ID: ${existingAdmin._id}`);
         return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create Super Admin
      const superAdmin = new User({
         userId: 'SUPER_ADMIN_001',
         firstName: 'Super',
         lastName: 'Administrator',
         email: 'admin@dost-mimaropa.gov.ph',
         password: hashedPassword,
         role: 'super_admin',
         department: 'DOST MIMAROPA',
         position: 'Regional Director',
         status: 'active'
      });

      await superAdmin.save();

      console.log('🎉 Super Admin created successfully!');
      console.log('📧 Email: admin@dost-mimaropa.gov.ph');
      console.log('🔑 Password: admin123');
      console.log(`🆔 User ID: ${superAdmin._id}`);
      console.log('');
      console.log('📋 Use these credentials in Postman:');
      console.log('   POST /api/auth/login');
      console.log('   Body: {');
      console.log('     "email": "admin@dost-mimaropa.gov.ph",');
      console.log('     "password": "admin123"');
      console.log('   }');

   } catch (error) {
      console.error('❌ Error creating Super Admin:', error.message);
   } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
   }
}

createSuperAdmin();
