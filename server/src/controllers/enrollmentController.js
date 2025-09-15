const Proponent = require('../models/Proponent');
const TNA = require('../models/TNA');
const Program = require('../models/Program');
const PSTO = require('../models/PSTO');

// Get all enrollments (aggregated from Proponent and TNA)
const getAllEnrollments = async (req, res) => {
   try {
      const { status, program, province, page = 1, limit = 10 } = req.query;
      
      const filter = {};
      if (status) filter.status = status;
      if (province) filter.province = province;
      
      const skip = (page - 1) * limit;
      
      const proponents = await Proponent.find(filter)
         .populate('programId', 'programName code')
         .populate('enrolledBy', 'officeName province')
         .skip(skip)
         .limit(parseInt(limit))
         .sort({ createdAt: -1 });

      // Get TNA data for each proponent
      const enrollments = await Promise.all(proponents.map(async (proponent) => {
         const tna = await TNA.findOne({ proponentId: proponent._id });
         return {
            id: proponent._id,
            proponentId: proponent._id,
            programName: proponent.programId?.programName,
            programCode: proponent.programId?.code,
            businessName: proponent.businessName,
            proponentName: proponent.name,
            email: proponent.email,
            province: proponent.province,
            status: proponent.status,
            enrolledBy: proponent.enrolledBy?.officeName,
            tnaStatus: tna?.status || 'not_started',
            createdAt: proponent.createdAt,
            updatedAt: proponent.updatedAt
         };
      }));

      res.json({
         success: true,
         data: enrollments,
         pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: await Proponent.countDocuments(filter)
         }
      });
   } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Get enrollment by ID
const getEnrollmentById = async (req, res) => {
   try {
      const { id } = req.params;
      
      const proponent = await Proponent.findById(id)
         .populate('programId', 'programName code description')
         .populate('enrolledBy', 'officeName province contactInfo');
      
      if (!proponent) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }

      const tna = await TNA.findOne({ proponentId: id });
      
      const enrollment = {
         id: proponent._id,
         proponentId: proponent._id,
         programName: proponent.programId?.programName,
         programCode: proponent.programId?.code,
         programDescription: proponent.programId?.description,
         businessName: proponent.businessName,
         businessType: proponent.businessType,
         proponentName: proponent.name,
         email: proponent.email,
         phone: proponent.contactInfo?.phone,
         address: proponent.contactInfo?.address,
         province: proponent.province,
         type: proponent.type,
         status: proponent.status,
         enrolledBy: proponent.enrolledBy?.officeName,
         pstoProvince: proponent.enrolledBy?.province,
         tna: tna ? {
            id: tna._id,
            status: tna.status,
            enterpriseName: tna.enterpriseName,
            businessActivity: tna.businessActivity,
            expectedOutcomes: tna.expectedOutcomes,
            budgetRequirement: tna.budgetRequirement,
            timeline: tna.timeline,
            reviewStatus: tna.reviewStatus,
            reviewRemarks: tna.reviewRemarks
         } : null,
         createdAt: proponent.createdAt,
         updatedAt: proponent.updatedAt
      };

      res.json({
         success: true,
         data: enrollment
      });
   } catch (error) {
      console.error('Get enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Create new enrollment
const createEnrollment = async (req, res) => {
   try {
      const { customerData, tnaData, program, pstoId } = req.body;

      // Validate PSTO exists
      const psto = await PSTO.findById(pstoId);
      if (!psto) {
         return res.status(400).json({
            success: false,
            message: 'PSTO not found'
         });
      }

      // Find program
      const programDoc = await Program.findOne({ code: program });
      if (!programDoc) {
         return res.status(400).json({
            success: false,
            message: 'Program not found'
         });
      }

      // Create Proponent
      const newProponent = new Proponent({
         programId: programDoc._id,
         name: customerData.name,
         type: customerData.type,
         contactInfo: {
            phone: customerData.phone || '',
            address: customerData.address || ''
         },
         email: customerData.email,
         businessName: customerData.businessName || '',
         businessType: customerData.businessType || '',
         province: psto.province,
         enrolledBy: pstoId,
         status: 'active'
      });

      await newProponent.save();

      // Create TNA
      const newTNA = new TNA({
         proponentId: newProponent._id,
         programId: programDoc._id,
         enterpriseName: tnaData.enterpriseName || customerData.businessName,
         businessActivity: tnaData.businessActivity || '',
         expectedOutcomes: tnaData.expectedOutcomes || '',
         typeOfOrganization: tnaData.typeOfOrganization || customerData.type,
         technologyNeeds: tnaData.technologyNeeds || '',
         budgetRequirement: tnaData.budgetRequirement || 0,
         timeline: tnaData.timeline || '6 months',
         status: 'draft',
         submittedBy: req.user?.id || newProponent._id
      });

      await newTNA.save();

      await newProponent.populate('programId', 'programName code');
      await newProponent.populate('enrolledBy', 'officeName province');

      res.status(201).json({
         success: true,
         message: 'Enrollment created successfully',
         data: {
            id: newProponent._id,
            proponentId: newProponent._id,
            programName: newProponent.programId?.programName,
            programCode: newProponent.programId?.code,
            businessName: newProponent.businessName,
            proponentName: newProponent.name,
            email: newProponent.email,
            province: newProponent.province,
            status: newProponent.status,
            enrolledBy: newProponent.enrolledBy?.officeName,
            tnaId: newTNA._id,
            tnaStatus: newTNA.status,
            createdAt: newProponent.createdAt
         }
      });
   } catch (error) {
      console.error('Create enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Update enrollment
const updateEnrollment = async (req, res) => {
   try {
      const { id } = req.params;
      const updateData = req.body;

      const proponent = await Proponent.findByIdAndUpdate(id, updateData, { new: true });
      if (!proponent) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }

      res.json({
         success: true,
         message: 'Enrollment updated successfully',
         data: proponent
      });
   } catch (error) {
      console.error('Update enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Delete enrollment
const deleteEnrollment = async (req, res) => {
   try {
      const { id } = req.params;

      const proponent = await Proponent.findByIdAndDelete(id);
      if (!proponent) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }

      // Also delete associated TNA
      await TNA.deleteMany({ proponentId: id });

      res.json({
         success: true,
         message: 'Enrollment deleted successfully'
      });
   } catch (error) {
      console.error('Delete enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Get enrollment statistics
const getEnrollmentStats = async (req, res) => {
   try {
      const stats = await Proponent.aggregate([
         {
            $group: {
               _id: null,
               totalEnrollments: { $sum: 1 },
               activeEnrollments: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
               },
               pendingEnrollments: {
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
               }
            }
         }
      ]);

      const programStats = await Proponent.aggregate([
         {
            $group: {
               _id: '$programId',
               count: { $sum: 1 }
            }
         },
         {
            $lookup: {
               from: 'programs',
               localField: '_id',
               foreignField: '_id',
               as: 'program'
            }
         },
         {
            $unwind: '$program'
         },
         {
            $project: {
               programName: '$program.programName',
               programCode: '$program.code',
               count: 1
            }
         }
      ]);

      res.json({
         success: true,
         data: {
            totalEnrollments: stats[0]?.totalEnrollments || 0,
            activeEnrollments: stats[0]?.activeEnrollments || 0,
            pendingEnrollments: stats[0]?.pendingEnrollments || 0,
            programStats: programStats
         }
      });
   } catch (error) {
      console.error('Get enrollment stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Get enrollments for proponent
const getEnrollmentsForProponent = async (req, res) => {
   try {
      const { proponentId } = req.params;
      
      const proponents = await Proponent.find({ _id: proponentId })
         .populate('programId', 'programName code')
         .populate('enrolledBy', 'officeName province');

      const enrollments = await Promise.all(proponents.map(async (proponent) => {
         const tna = await TNA.findOne({ proponentId: proponent._id });
         return {
            id: proponent._id,
            proponentId: proponent._id,
            programName: proponent.programId?.programName,
            programCode: proponent.programId?.code,
            businessName: proponent.businessName,
            proponentName: proponent.name,
            email: proponent.email,
            province: proponent.province,
            status: proponent.status,
            enrolledBy: proponent.enrolledBy?.officeName,
            tnaStatus: tna?.status || 'not_started',
            createdAt: proponent.createdAt,
            updatedAt: proponent.updatedAt
         };
      }));

      res.json({
         success: true,
         data: enrollments
      });
   } catch (error) {
      console.error('Get proponent enrollments error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

module.exports = {
   getAllEnrollments,
   getEnrollmentById,
   createEnrollment,
   updateEnrollment,
   deleteEnrollment,
   getEnrollmentStats,
   getEnrollmentsForProponent
};