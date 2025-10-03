const SETUPApplication = require('../models/SETUPApplication');
const User = require('../models/User');
const PSTO = require('../models/PSTO');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const uploadDir = 'uploads/program-applications';
      if (!fs.existsSync(uploadDir)) {
         fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
   }
});

const fileFilter = (req, file, cb) => {
   const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
   }
});

// Middleware for file uploads
exports.uploadFiles = upload.fields([
   { name: 'letterOfIntent', maxCount: 1 },
   { name: 'enterpriseProfile', maxCount: 1 }
]);

// Submit new program application
exports.submitApplication = async (req, res) => {
   try {
      const proponentId = req.user.id;
      const applicationData = req.body;
      
      // Handle file uploads
      const files = req.files;
      let letterOfIntent = null;
      let enterpriseProfile = null;
      
      if (files.letterOfIntent && files.letterOfIntent[0]) {
         letterOfIntent = {
            filename: files.letterOfIntent[0].filename,
            originalName: files.letterOfIntent[0].originalname,
            path: files.letterOfIntent[0].path,
            size: files.letterOfIntent[0].size,
            mimetype: files.letterOfIntent[0].mimetype
         };
      }
      
      if (files.enterpriseProfile && files.enterpriseProfile[0]) {
         enterpriseProfile = {
            filename: files.enterpriseProfile[0].filename,
            originalName: files.enterpriseProfile[0].originalname,
            path: files.enterpriseProfile[0].path,
            size: files.enterpriseProfile[0].size,
            mimetype: files.enterpriseProfile[0].mimetype
         };
      }
      
      // Validate required fields
      const requiredFields = [
         'programCode', 'programName', 'enterpriseName', 'contactPerson',
         'officeAddress', 'position', 'contactPersonTel', 'contactPersonEmail',
         'yearEstablished', 'organizationType', 'profitType', 'registrationNo',
         'yearRegistered', 'capitalClassification', 'employmentClassification',
         'businessActivity', 'specificProduct', 'enterpriseBackground'
      ];
      
      for (const field of requiredFields) {
         if (!applicationData[field]) {
            return res.status(400).json({
               success: false,
               message: `${field} is required`
            });
         }
      }
      
      // Validate file uploads
      if (!letterOfIntent) {
         return res.status(400).json({
            success: false,
            message: 'Letter of Intent is required'
         });
      }
      
      if (!enterpriseProfile) {
         return res.status(400).json({
            success: false,
            message: 'Enterprise Profile is required'
         });
      }
      
      // Create application
      const application = new SETUPApplication({
         proponentId,
         programCode: applicationData.programCode,
         programName: applicationData.programName,
         enterpriseName: applicationData.enterpriseName,
         contactPerson: applicationData.contactPerson,
         officeAddress: applicationData.officeAddress,
         factoryAddress: applicationData.factoryAddress || '',
         website: applicationData.website || '',
         position: applicationData.position,
         contactPersonTel: applicationData.contactPersonTel,
         factoryTel: applicationData.factoryTel || '',
         contactPersonFax: applicationData.contactPersonFax || '',
         factoryFax: applicationData.factoryFax || '',
         contactPersonEmail: applicationData.contactPersonEmail,
         factoryEmail: applicationData.factoryEmail || '',
         yearEstablished: parseInt(applicationData.yearEstablished),
         initialCapital: parseInt(applicationData.initialCapital) || 0,
         organizationType: applicationData.organizationType,
         profitType: applicationData.profitType,
         registrationNo: applicationData.registrationNo,
         yearRegistered: parseInt(applicationData.yearRegistered),
         capitalClassification: applicationData.capitalClassification,
         employmentClassification: applicationData.employmentClassification,
         directWorkers: parseInt(applicationData.directWorkers) || 0,
         productionWorkers: parseInt(applicationData.productionWorkers) || 0,
         nonProductionWorkers: parseInt(applicationData.nonProductionWorkers) || 0,
         contractWorkers: parseInt(applicationData.contractWorkers) || 0,
         totalWorkers: parseInt(applicationData.totalWorkers) || 0,
         businessActivity: applicationData.businessActivity,
         specificProduct: applicationData.specificProduct,
         enterpriseBackground: applicationData.enterpriseBackground,
         letterOfIntent,
         enterpriseProfile,
         status: 'pending'
      });
      
      await application.save();
      
      // Assign to PSTO based on location (simplified logic)
      const pstos = await PSTO.find();
      if (pstos.length > 0) {
         // Simple round-robin assignment for now
         const randomPSTO = pstos[Math.floor(Math.random() * pstos.length)];
         application.assignedPSTO = randomPSTO._id;
         await application.save();
         
         // Create notification for PSTO about new application
         try {
            await Notification.create({
               recipientId: randomPSTO._id,
               recipientType: 'psto',
               type: 'application_submitted',
               title: 'New Application Submitted',
               message: `A new ${applicationData.programName} application has been submitted by ${applicationData.enterpriseName} and assigned to you for review.`,
               relatedEntityType: 'application',
               relatedEntityId: application._id,
               actionUrl: `/psto/applications/${application._id}`,
               actionText: 'Review Application',
               priority: 'high',
               sentBy: proponentId
            });
            console.log('✅ Notification created for PSTO about new application');
         } catch (notificationError) {
            console.error('❌ Error creating PSTO notification:', notificationError);
            // Don't fail the application submission if notification creation fails
         }
         
         // Create notification for proponent to confirm submission
         try {
            await Notification.create({
               recipientId: proponentId,
               recipientType: 'proponent',
               type: 'application_submitted',
               title: 'Application Submitted Successfully',
               message: `Your ${applicationData.programName} application has been submitted successfully and assigned to PSTO for review. Application ID: ${application.applicationId}`,
               relatedEntityType: 'application',
               relatedEntityId: application._id,
               actionUrl: `/applications/${application._id}`,
               actionText: 'View Application',
               priority: 'medium',
               sentBy: proponentId
            });
            console.log('✅ Notification created for proponent about application submission');
         } catch (notificationError) {
            console.error('❌ Error creating proponent notification:', notificationError);
            // Don't fail the application submission if notification creation fails
         }
      }
      
      res.status(201).json({
         success: true,
         message: 'Application submitted successfully',
         data: {
            applicationId: application.applicationId,
            status: application.status,
            submittedAt: application.submittedAt
         }
      });
      
   } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get applications by proponent
exports.getApplicationsByProponent = async (req, res) => {
   try {
      const proponentId = req.user.id;
      const applications = await SETUPApplication.find({ proponentId })
         .populate('assignedPSTO', 'name location')
         .sort({ submittedAt: -1 });
      
      res.json({
         success: true,
         data: applications
      });
   } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
   try {
      const { applicationId } = req.params;
      const application = await SETUPApplication.findById(applicationId)
         .populate('proponentId', 'firstName lastName email')
         .populate('assignedPSTO', 'name location')
         .populate('reviewedBy', 'firstName lastName email');
      
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
      console.error('Error fetching application:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get all applications (for PSTO/Admin)
exports.getAllApplications = async (req, res) => {
   try {
      const { status, programCode, page = 1, limit = 10 } = req.query;
      const filter = {};
      
      if (status) filter.status = status;
      if (programCode) filter.programCode = programCode;
      
      const applications = await SETUPApplication.find(filter)
         .populate('proponentId', 'firstName lastName email')
         .populate('assignedPSTO', 'name location')
         .populate('reviewedBy', 'firstName lastName email')
         .sort({ submittedAt: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);
      
      const total = await SETUPApplication.countDocuments(filter);
      
      res.json({
         success: true,
         data: applications,
         pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
         }
      });
   } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Update application status (for PSTO/Admin)
exports.updateApplicationStatus = async (req, res) => {
   try {
      const { applicationId } = req.params;
      const { status, reviewComments } = req.body;
      const reviewerId = req.user.id;
      
      const application = await SETUPApplication.findById(applicationId);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }
      
      application.status = status;
      application.reviewedBy = reviewerId;
      application.reviewedAt = new Date();
      if (reviewComments) {
         application.reviewComments = reviewComments;
      }
      
      await application.save();
      
      res.json({
         success: true,
         message: 'Application status updated successfully',
         data: application
      });
   } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Download file
exports.downloadFile = async (req, res) => {
   try {
      const { applicationId, fileType } = req.params;
      
      const application = await SETUPApplication.findById(applicationId);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }
      
      let fileInfo;
      if (fileType === 'letterOfIntent') {
         fileInfo = application.letterOfIntent;
      } else if (fileType === 'enterpriseProfile') {
         fileInfo = application.enterpriseProfile;
      } else {
         return res.status(400).json({
            success: false,
            message: 'Invalid file type'
         });
      }
      
      if (!fileInfo || !fileInfo.path) {
         return res.status(404).json({
            success: false,
            message: 'File not found'
         });
      }
      
      const filePath = path.join(__dirname, '../../', fileInfo.path);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({
            success: false,
            message: 'File not found on server'
         });
      }
      
      res.download(filePath, fileInfo.originalName);
   } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get application statistics
exports.getApplicationStats = async (req, res) => {
   try {
      const stats = await SETUPApplication.aggregate([
         {
            $group: {
               _id: '$status',
               count: { $sum: 1 }
            }
         }
      ]);
      
      const programStats = await SETUPApplication.aggregate([
         {
            $group: {
               _id: '$programCode',
               count: { $sum: 1 }
            }
         }
      ]);
      
      res.json({
         success: true,
         data: {
            statusStats: stats,
            programStats: programStats
         }
      });
   } catch (error) {
      console.error('Error fetching application stats:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};
