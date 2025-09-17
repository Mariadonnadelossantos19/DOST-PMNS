const User = require('../models/User');
const Program = require('../models/Program');
const PSTO = require('../models/PSTO');
const bcrypt = require('bcryptjs');

// Seed initial data for the system
const seedInitialData = async () => {
   try {
      console.log('🌱 Starting data seeding...');

      // 1. Create Super Admin if not exists
      let superAdmin = await User.findOne({ role: 'super_admin' });
      if (!superAdmin) {
         const hashedPassword = await bcrypt.hash('admin123', 10);
         superAdmin = new User({
            userId: 'SUPER_ADMIN_001',
            firstName: 'System',
            lastName: 'Administrator',
            email: 'admin@dost-mimaropa.gov.ph',
            password: hashedPassword,
            role: 'super_admin',
            department: 'DOST MIMAROPA',
            position: 'Regional Director',
            status: 'active'
         });
         await superAdmin.save();
         console.log('✅ Super Admin created');
      }

      // 2. Create Programs if not exist
      const programs = [
         {
            programId: 'PROG_SETUP',
            programName: 'Small Enterprise Technology Upgrading Program',
            description: 'Technology upgrading program for small enterprises',
            code: 'SETUP',
            stages: [
               { id: 'tna', name: 'Technology Needs Assessment', description: 'Assessment of technology needs', required: true, order: 1 },
               { id: 'approval', name: 'Regional Office Approval', description: 'Approval by regional coordinator', required: true, order: 2 },
               { id: 'rtec', name: 'RTEC Review', description: 'Review by Regional Technical Evaluation Committee', required: true, order: 3 }
            ],
            createdBy: superAdmin._id
         },
         {
            programId: 'PROG_GIA',
            programName: 'Grants-in-Aid Program',
            description: 'Research and development grants for innovative projects',
            code: 'GIA',
            stages: [
               { id: 'proposal', name: 'Proposal Submission', description: 'Submit research proposal', required: true, order: 1 },
               { id: 'review', name: 'Technical Review', description: 'Review by technical committee', required: true, order: 2 },
               { id: 'approval', name: 'Approval', description: 'Final approval and funding', required: true, order: 3 }
            ],
            createdBy: superAdmin._id
         },
         {
            programId: 'PROG_CEST',
            programName: 'Community Empowerment through Science and Technology',
            description: 'Community-based science and technology programs',
            code: 'CEST',
            stages: [
               { id: 'community_assessment', name: 'Community Assessment', description: 'Assess community needs', required: true, order: 1 },
               { id: 'program_design', name: 'Program Design', description: 'Design community program', required: true, order: 2 },
               { id: 'implementation', name: 'Implementation', description: 'Implement community program', required: true, order: 3 }
            ],
            createdBy: superAdmin._id
         },
         {
            programId: 'PROG_SSCP',
            programName: 'Smart and Sustainable Communities Program',
            description: 'Commercialization support for small enterprises',
            code: 'SSCP',
            stages: [
               { id: 'market_research', name: 'Market Research', description: 'Conduct market research', required: true, order: 1 },
               { id: 'business_plan', name: 'Business Plan', description: 'Develop business plan', required: true, order: 2 },
               { id: 'commercialization', name: 'Commercialization', description: 'Support commercialization', required: true, order: 3 }
            ],
            createdBy: superAdmin._id
         }
      ];

      for (const programData of programs) {
         let program = await Program.findOne({ code: programData.code });
         if (!program) {
            program = new Program(programData);
            await program.save();
            console.log(`✅ Program ${programData.code} created`);
         }
      }

      // 3. Create PSTO Users and PSTO records for each province
      const provinces = ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Romblon', 'Palawan'];
      const setupProgram = await Program.findOne({ code: 'SETUP' });

      for (const province of provinces) {
         // Create PSTO User if not exists
         let pstoUser = await User.findOne({ role: 'psto', province });
         if (!pstoUser) {
            const hashedPassword = await bcrypt.hash('psto123', 10);
            pstoUser = new User({
               userId: `PSTO_${province.replace(/\s+/g, '')}_001`,
               firstName: 'PSTO',
               lastName: province,
               email: `psto.${province.toLowerCase().replace(/\s+/g, '')}@dost-mimaropa.gov.ph`,
               password: hashedPassword,
               role: 'psto',
               department: `PSTO ${province}`,
               position: 'PSTO Manager',
               province: province,
               status: 'active'
            });
            await pstoUser.save();
            console.log(`✅ PSTO User for ${province} created`);
         }

         // Create PSTO record if not exists
         let psto = await PSTO.findOne({ province });
         if (!psto) {
            psto = new PSTO({
               pstoId: `PSTO_${province.replace(/\s+/g, '')}_001`,
               userId: pstoUser._id,
               programId: setupProgram._id,
               officeName: `PSTO ${province}`,
               contactInfo: {
                  phone: '09123456789',
                  email: `psto.${province.toLowerCase().replace(/\s+/g, '')}@dost-mimaropa.gov.ph`,
                  address: `PSTO Office, ${province}`
               },
               province: province,
               status: 'active'
            });
            await psto.save();
            console.log(`✅ PSTO record for ${province} created`);
         }
      }

      console.log('🎉 Data seeding completed successfully!');
   } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
   }
};

module.exports = { seedInitialData };
