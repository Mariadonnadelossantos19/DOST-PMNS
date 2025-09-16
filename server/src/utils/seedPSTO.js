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
            name: 'PSTO Marinduque',
            region: 'MIMAROPA',
            province: 'Marinduque',
            contactPerson: 'Dr. Maria Santos',
            email: 'psto.marinduque@dost.gov.ph',
            phone: '(042) 332-1234',
            address: 'Provincial Capitol, Boac, Marinduque',
            status: 'active'
         },
         {
            name: 'PSTO Occidental Mindoro',
            region: 'MIMAROPA',
            province: 'Occidental Mindoro',
            contactPerson: 'Engr. Juan Dela Cruz',
            email: 'psto.occidental.mindoro@dost.gov.ph',
            phone: '(043) 457-8901',
            address: 'Provincial Capitol, Mamburao, Occidental Mindoro',
            status: 'active'
         },
         {
            name: 'PSTO Oriental Mindoro',
            region: 'MIMAROPA',
            province: 'Oriental Mindoro',
            contactPerson: 'Dr. Ana Rodriguez',
            email: 'psto.oriental.mindoro@dost.gov.ph',
            phone: '(043) 288-4567',
            address: 'Provincial Capitol, Calapan City, Oriental Mindoro',
            status: 'active'
         },
         {
            name: 'PSTO Palawan',
            region: 'MIMAROPA',
            province: 'Palawan',
            contactPerson: 'Engr. Carlos Mendoza',
            email: 'psto.palawan@dost.gov.ph',
            phone: '(048) 433-2345',
            address: 'Provincial Capitol, Puerto Princesa City, Palawan',
            status: 'active'
         },
         {
            name: 'PSTO Romblon',
            region: 'MIMAROPA',
            province: 'Romblon',
            contactPerson: 'Dr. Sofia Garcia',
            email: 'psto.romblon@dost.gov.ph',
            phone: '(042) 567-8901',
            address: 'Provincial Capitol, Romblon, Romblon',
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
