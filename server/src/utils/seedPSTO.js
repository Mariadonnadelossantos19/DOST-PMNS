const mongoose = require('mongoose');
const PSTO = require('../models/PSTO');

const seedPSTOData = async () => {
   try {
      // Check if PSTO data already exists
      const existingPSTO = await PSTO.findOne();
      if (existingPSTO) {
         console.log('PSTO data already exists, skipping seed');
         return;
      }

      // Clear existing PSTO data
      await PSTO.deleteMany({});

      // Seed PSTO data for MIMAROPA region
      const pstoData = [
         {
            pstoId: 'PSTO-MAR-001',
            userId: new mongoose.Types.ObjectId(), // This will be updated when PSTO users are created
            programId: new mongoose.Types.ObjectId(), // This will be updated when programs are created
            officeName: 'PSTO Marinduque',
            contactInfo: {
               phone: '(042) 332-1234',
               address: 'Provincial Capitol, Boac, Marinduque',
               email: 'psto.marinduque@dost.gov.ph'
            },
            province: 'Marinduque',
            status: 'active'
         },
         {
            pstoId: 'PSTO-OCM-001',
            userId: new mongoose.Types.ObjectId(),
            programId: new mongoose.Types.ObjectId(),
            officeName: 'PSTO Occidental Mindoro',
            contactInfo: {
               phone: '(043) 457-8901',
               address: 'Provincial Capitol, Mamburao, Occidental Mindoro',
               email: 'psto.occidental.mindoro@dost.gov.ph'
            },
            province: 'Occidental Mindoro',
            status: 'active'
         },
         {
            pstoId: 'PSTO-ORM-001',
            userId: new mongoose.Types.ObjectId(),
            programId: new mongoose.Types.ObjectId(),
            officeName: 'PSTO Oriental Mindoro',
            contactInfo: {
               phone: '(043) 288-4567',
               address: 'Provincial Capitol, Calapan City, Oriental Mindoro',
               email: 'psto.oriental.mindoro@dost.gov.ph'
            },
            province: 'Oriental Mindoro',
            status: 'active'
         },
         {
            pstoId: 'PSTO-PAL-001',
            userId: new mongoose.Types.ObjectId(),
            programId: new mongoose.Types.ObjectId(),
            officeName: 'PSTO Palawan',
            contactInfo: {
               phone: '(048) 433-2345',
               address: 'Provincial Capitol, Puerto Princesa City, Palawan',
               email: 'psto.palawan@dost.gov.ph'
            },
            province: 'Palawan',
            status: 'active'
         },
         {
            pstoId: 'PSTO-ROM-001',
            userId: new mongoose.Types.ObjectId(),
            programId: new mongoose.Types.ObjectId(),
            officeName: 'PSTO Romblon',
            contactInfo: {
               phone: '(042) 567-8901',
               address: 'Provincial Capitol, Romblon, Romblon',
               email: 'psto.romblon@dost.gov.ph'
            },
            province: 'Romblon',
            status: 'active'
         }
      ];

      await PSTO.insertMany(pstoData);
      console.log('✅ PSTO data seeded successfully');
   } catch (error) {
      console.error('❌ Error seeding PSTO data:', error.message);
   }
};

module.exports = seedPSTOData;
