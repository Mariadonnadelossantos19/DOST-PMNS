const SETUPApplication = require('../models/SETUPApplication');
const PSTO = require('../models/PSTO');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Submit SETUP application
const submitApplication = async (req, res) => {
   try {
      console.log('SETUP Application submission - Body:', req.body);
      console.log('SETUP Application submission - Files:', req.files);

      // Extract all form data from MultiStepForm
      const {
         // Basic required fields
         enterpriseName,
         contactPerson,
         officeAddress,
         position,
         
         // Contact information
         contactPersonTel,
         contactPersonEmail,
         contactPersonFax,
         factoryAddress,
         factoryTel,
         factoryFax,
         factoryEmail,
         website,
         
         // Enterprise details
         yearEstablished,
         initialCapital,
         organizationType,
         profitType,
         registrationNo,
         yearRegistered,
         capitalClassification,
         employmentClassification,
         
         // Employment details
         directWorkers,
         productionWorkers,
         nonProductionWorkers,
         contractWorkers,
         totalWorkers,
         
         // Business information
         businessActivity,
         specificProduct,
         enterpriseBackground,
         technologyNeeds,
         currentTechnologyLevel,
         desiredTechnologyLevel,
         expectedOutcomes,
         
         // Program information
         programCode,
         programName,
         submissionDate
      } = req.body;

      // Validate required fields
      const requiredFields = {
         enterpriseName,
         contactPerson,
         officeAddress,
         position,
         contactPersonTel,
         contactPersonEmail,
         yearEstablished,
         organizationType,
         profitType,
         registrationNo,
         yearRegistered,
         capitalClassification,
         employmentClassification
      };

      const missingFields = Object.entries(requiredFields)
         .filter(([key, value]) => !value || value.trim() === '')
         .map(([key]) => key);

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            missingFields
         });
      }

      // Handle file uploads
      let letterOfIntent = null;
      let enterpriseProfile = null;

      if (req.files && req.files.length > 0) {
         req.files.forEach(file => {
            if (file.fieldname === 'letterOfIntent') {
               letterOfIntent = file.filename;
            } else if (file.fieldname === 'enterpriseProfile') {
               enterpriseProfile = file.filename;
            }
         });
      }

      // Generate unique application ID
      const applicationId = `SETUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Find the appropriate PSTO for this proponent's province
      let assignedPSTO = null;
      if (req.user.province) {
         const psto = await PSTO.findOne({ 
            province: req.user.province,
            status: 'active'
         });
         if (psto) {
            assignedPSTO = psto._id;
            console.log(`Application will be assigned to PSTO: ${psto.province} (${psto._id})`);
         } else {
            console.log(`No active PSTO found for province: ${req.user.province}`);
         }
      }

      // Create application with all form data
      const application = new SETUPApplication({
         applicationId,
         proponentId: req.user._id,
         
         // Basic required fields
         enterpriseName,
         contactPerson,
         officeAddress,
         position,
         
         // Contact information
         contactPersonTel,
         contactPersonEmail,
         contactPersonFax: contactPersonFax || '',
         factoryAddress: factoryAddress || '',
         factoryTel: factoryTel || '',
         factoryFax: factoryFax || '',
         factoryEmail: factoryEmail || '',
         website: website || '',
         
         // Enterprise details
         yearEstablished: parseInt(yearEstablished) || new Date().getFullYear(),
         initialCapital: initialCapital || '',
         organizationType,
         profitType,
         registrationNo,
         yearRegistered: parseInt(yearRegistered) || new Date().getFullYear(),
         capitalClassification,
         employmentClassification,
         
         // Employment details
         directWorkers: directWorkers || '0',
         productionWorkers: productionWorkers || '0',
         nonProductionWorkers: nonProductionWorkers || '0',
         contractWorkers: contractWorkers || '0',
         totalWorkers: totalWorkers || '0',
         
         // Business information
         businessActivity: businessActivity || '',
         specificProduct: specificProduct || '',
         enterpriseBackground: enterpriseBackground || '',
         technologyNeeds: technologyNeeds || '',
         currentTechnologyLevel: currentTechnologyLevel || 'Basic',
         desiredTechnologyLevel: desiredTechnologyLevel || 'Advanced',
         expectedOutcomes: expectedOutcomes || '',
         
         // File uploads
         letterOfIntent,
         enterpriseProfile,
         
         // Status and PSTO assignment
         status: 'pending',
         pstoStatus: 'pending',
         assignedPSTO: assignedPSTO,
         forwardedToPSTO: assignedPSTO ? true : false,
         forwardedAt: assignedPSTO ? new Date() : null
      });

      await application.save();

      console.log('SETUP application saved successfully:', {
         applicationId: application.applicationId,
         id: application._id,
         enterpriseName: application.enterpriseName,
         contactPerson: application.contactPerson,
         assignedPSTO: assignedPSTO,
         forwardedToPSTO: application.forwardedToPSTO
      });

      const message = assignedPSTO 
         ? 'SETUP application submitted successfully and forwarded to PSTO for review'
         : 'SETUP application submitted successfully (PSTO assignment pending)';

      res.json({
         success: true,
         message: message,
         data: {
            applicationId: application.applicationId,
            id: application._id,
            status: application.status,
            pstoStatus: application.pstoStatus,
            enterpriseName: application.enterpriseName,
            contactPerson: application.contactPerson,
            assignedPSTO: assignedPSTO,
            forwardedToPSTO: application.forwardedToPSTO,
            forwardedAt: application.forwardedAt
         }
      });

   } catch (error) {
      console.error('SETUP application error:', error);
      
      // Handle specific MongoDB errors
      if (error.code === 11000) {
         return res.status(400).json({
            success: false,
            message: 'Application ID already exists. Please try again.',
            error: 'Duplicate application ID'
         });
      }
      
      if (error.name === 'ValidationError') {
         const validationErrors = Object.values(error.errors).map(err => err.message);
         return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: validationErrors
         });
      }

      res.status(500).json({
         success: false,
         message: 'Error submitting SETUP application',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Get user's applications
const getMyApplications = async (req, res) => {
   try {
      console.log('Fetching applications for user:', req.user._id);
      
      const applications = await SETUPApplication.find({ proponentId: req.user._id })
         .sort({ createdAt: -1 })
         .select('-__v');

      console.log('Found applications:', applications.length);

      res.json({
         success: true,
         data: applications
      });
   } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching applications'
      });
   }
};

// Get application by ID
const getApplicationById = async (req, res) => {
   try {
      const application = await SETUPApplication.findOne({
         _id: req.params.id,
         proponentId: req.user._id
      });

      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      res.json({
         success: true,
         data: application
      });
   } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching application'
      });
   }
};

// Update application status (PSTO only)
const updateApplicationStatus = async (req, res) => {
   try {
      const { status, comments } = req.body;

      if (!['approved', 'returned', 'rejected'].includes(status)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be approved, returned, or rejected'
         });
      }

      const application = await SETUPApplication.findById(req.params.id);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      application.pstoStatus = status;
      application.pstoComments = comments || '';
      application.pstoReviewedAt = new Date();
      application.pstoAssigned = req.user._id;

      await application.save();

      res.json({
         success: true,
         message: 'Application status updated successfully',
         data: application
      });
   } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating application status'
      });
   }
};

// Download file
const downloadFile = async (req, res) => {
   try {
      const { id, fileType } = req.params;
      
      const application = await SETUPApplication.findOne({
         _id: id,
         proponentId: req.user._id
      });

      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      let filename;
      if (fileType === 'letterOfIntent' && application.letterOfIntent) {
         filename = application.letterOfIntent;
      } else if (fileType === 'enterpriseProfile' && application.enterpriseProfile) {
         filename = application.enterpriseProfile;
      } else {
         return res.status(404).json({
            success: false,
            message: 'File not found'
         });
      }

      const filePath = path.join(__dirname, '../../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({
            success: false,
            message: 'File not found on server'
         });
      }

      res.download(filePath);
   } catch (error) {
      console.error('Download file error:', error);
      res.status(500).json({
         success: false,
         message: 'Error downloading file'
      });
   }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
   try {
      const stats = await SETUPApplication.aggregate([
         { $match: { proponentId: req.user._id } },
         {
            $group: {
               _id: '$pstoStatus',
               count: { $sum: 1 }
            }
         }
      ]);

      const total = await SETUPApplication.countDocuments({ proponentId: req.user._id });

      res.json({
         success: true,
         data: {
            total,
            byStatus: stats.reduce((acc, stat) => {
               acc[stat._id] = stat.count;
               return acc;
            }, {})
         }
      });
   } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching statistics'
      });
   }
};

// Get all applications for PSTO review
const getPSTOApplications = async (req, res) => {
   try {
      console.log('Fetching applications for PSTO review by user:', req.user._id);
      console.log('PSTO User province:', req.user.province);
      
      // Check if user has PSTO role
      if (req.user.role !== 'psto' && req.user.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. PSTO role required.'
         });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const filter = {};
      
      if (status) filter.pstoStatus = status;
      
      // For PSTO users, only show applications from their province
      if (req.user.role === 'psto') {
         // First, get all proponents from the same province as the PSTO
         const proponentsInProvince = await mongoose.model('User').find({ 
            province: req.user.province,
            role: 'proponent'
         }).select('_id');
         
         const proponentIds = proponentsInProvince.map(p => p._id);
         console.log(`Found ${proponentIds.length} proponents in ${req.user.province}`);

         // Find applications from proponents in the same province
         const applications = await SETUPApplication.find({
            ...filter,
            proponentId: { $in: proponentIds }
         })
         .populate('proponentId', 'firstName lastName email userId province')
         .sort({ createdAt: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);

         const total = await SETUPApplication.countDocuments({
            ...filter,
            proponentId: { $in: proponentIds }
         });

         console.log(`Found ${applications.length} applications for PSTO review in ${req.user.province}`);

         res.json({
            success: true,
            data: applications,
            pagination: {
               current: parseInt(page),
               pages: Math.ceil(total / limit),
               total
            }
         });
      } else {
         // For admin users, show all applications
         const applications = await SETUPApplication.find(filter)
            .populate('proponentId', 'firstName lastName email userId province')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

         const total = await SETUPApplication.countDocuments(filter);

         console.log('Found applications for admin review:', applications.length);

         res.json({
            success: true,
            data: applications,
            pagination: {
               current: parseInt(page),
               pages: Math.ceil(total / limit),
               total
            }
         });
      }
   } catch (error) {
      console.error('Get PSTO applications error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching applications for review'
      });
   }
};

// Get specific application for PSTO review
const getPSTOApplicationById = async (req, res) => {
   try {
      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'firstName lastName email userId phone address');

      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      res.json({
         success: true,
         data: application
      });
   } catch (error) {
      console.error('Get PSTO application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching application for review'
      });
   }
};

// Review application (PSTO only)
const reviewApplication = async (req, res) => {
   try {
      const { status, comments } = req.body;

      // Check if user has PSTO role
      if (req.user.role !== 'psto' && req.user.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. PSTO role required.'
         });
      }

      if (!['approved', 'returned', 'rejected'].includes(status)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be approved, returned, or rejected'
         });
      }

      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'province');
      
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // For PSTO users, verify they can review this application (same province)
      if (req.user.role === 'psto' && application.proponentId.province !== req.user.province) {
         return res.status(403).json({
            success: false,
            message: 'Access denied. You can only review applications from your province.'
         });
      }

      // Find the appropriate PSTO for this province
      let assignedPSTO = null;
      if (application.proponentId.province) {
         const psto = await mongoose.model('PSTO').findOne({ 
            province: application.proponentId.province,
            status: 'active'
         });
         if (psto) {
            assignedPSTO = psto._id;
         }
      }

      // Update application with PSTO review
      application.pstoStatus = status;
      application.pstoComments = comments || '';
      application.pstoReviewedAt = new Date();
      application.pstoAssigned = req.user._id;
      
      if (assignedPSTO) {
         application.assignedPSTO = assignedPSTO;
      }

      // Update main status based on PSTO decision
      if (status === 'approved') {
         application.status = 'under_review';
         application.currentStage = 'tna_assessment';
      } else if (status === 'rejected') {
         application.status = 'tna_rejected';
      } else if (status === 'returned') {
         application.status = 'pending';
         application.currentStage = 'tna_application';
      }

      await application.save();

      console.log('Application reviewed by PSTO:', {
         applicationId: application.applicationId,
         status: status,
         reviewedBy: req.user._id,
         proponentProvince: application.proponentId.province,
         pstoProvince: req.user.province
      });

      res.json({
         success: true,
         message: 'Application reviewed successfully',
         data: {
            applicationId: application.applicationId,
            pstoStatus: application.pstoStatus,
            status: application.status,
            currentStage: application.currentStage,
            pstoComments: application.pstoComments,
            pstoReviewedAt: application.pstoReviewedAt,
            assignedPSTO: assignedPSTO
         }
      });
   } catch (error) {
      console.error('Review application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error reviewing application'
      });
   }
};

// Fix PSTO assignment for existing applications
const fixPSTOAssignment = async (req, res) => {
   try {
      const applicationId = req.params.id;
      
      const application = await SETUPApplication.findById(applicationId);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Find the proponent
      const proponent = await User.findById(application.proponentId);
      if (!proponent) {
         return res.status(404).json({
            success: false,
            message: 'Proponent not found'
         });
      }

      // Set default province if none exists
      if (!proponent.province) {
         proponent.province = 'Palawan';
         await proponent.save();
      }

      // Find or create PSTO for the province
      let psto = await PSTO.findOne({ 
         province: proponent.province,
         status: 'active'
      });

      if (!psto) {
         // Create a default PSTO for the province
         psto = new PSTO({
            province: proponent.province,
            status: 'active',
            name: `PSTO ${proponent.province}`,
            address: `${proponent.province}, Philippines`,
            contactNumber: '000-000-0000',
            email: `psto.${proponent.province.toLowerCase()}@dost.gov.ph`
         });
         await psto.save();
      }

      // Assign application to PSTO
      application.assignedPSTO = psto._id;
      application.forwardedToPSTO = true;
      application.forwardedAt = new Date();
      application.pstoStatus = 'pending';

      await application.save();

      res.json({
         success: true,
         message: 'PSTO assignment fixed successfully',
         data: {
            applicationId: application.applicationId,
            assignedPSTO: psto.province,
            forwardedToPSTO: application.forwardedToPSTO,
            pstoStatus: application.pstoStatus
         }
      });

   } catch (error) {
      console.error('Fix PSTO assignment error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fixing PSTO assignment'
      });
   }
};

module.exports = {
   submitApplication,
   getMyApplications,
   getApplicationById,
   updateApplicationStatus,
   downloadFile,
   getApplicationStats,
   getPSTOApplications,
   getPSTOApplicationById,
   reviewApplication,
   fixPSTOAssignment
};
