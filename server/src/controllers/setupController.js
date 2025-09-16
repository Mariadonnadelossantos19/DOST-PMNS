const SETUPApplication = require('../models/SETUPApplication');
const PSTO = require('../models/PSTO');
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
         
         // Status
         status: 'pending',
         pstoStatus: 'pending'
      });

      await application.save();

      console.log('SETUP application saved successfully:', {
         applicationId: application.applicationId,
         id: application._id,
         enterpriseName: application.enterpriseName,
         contactPerson: application.contactPerson
      });

      res.json({
         success: true,
         message: 'SETUP application submitted successfully',
         data: {
            applicationId: application.applicationId,
            id: application._id,
            status: application.status,
            enterpriseName: application.enterpriseName,
            contactPerson: application.contactPerson
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

module.exports = {
   submitApplication,
   getMyApplications,
   getApplicationById,
   updateApplicationStatus,
   downloadFile,
   getApplicationStats
};
