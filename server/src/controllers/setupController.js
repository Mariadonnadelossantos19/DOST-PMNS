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
      console.log('SETUP Application submission - generalAgreement from body:', req.body.generalAgreement);
      console.log('SETUP Application submission - generalAgreement type:', typeof req.body.generalAgreement);

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
         
        
   
         // Program information
         programCode,
         programName,
         submissionDate,
         
         // General Agreement
         generalAgreement
      } = req.body;

      // Validate required fields for simplified form
      const requiredFields = {
         enterpriseName,
         contactPerson,
         officeAddress,
         position,
         contactPersonTel,
         contactPersonEmail
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

      // General agreement validation removed since step 7 was removed from the form

      // Handle file uploads (only letterOfIntent for simplified form)
      let letterOfIntent = null;

      if (req.files && req.files.length > 0) {
         console.log('Processing uploaded files:', req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename, originalname: f.originalname })));
         
         req.files.forEach(file => {
            const fileInfo = {
               filename: file.filename,
               originalName: file.originalname,
               path: file.path,
               size: file.size,
               mimetype: file.mimetype
            };

            if (file.fieldname === 'letterOfIntent') {
               letterOfIntent = fileInfo;
               console.log('Letter of Intent file processed:', fileInfo);
            }
         });
      } else {
         console.log('No files uploaded');
      }

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

      // Create application with simplified form data
      const application = new SETUPApplication({
         proponentId: req.user._id,
         programCode: 'SETUP',
         programName: 'Small Enterprise Technology Upgrading Program',
         
         // Basic required fields (Step 2)
         enterpriseName,
         contactPerson,
         contactPersonTel,
         contactPersonEmail,
         officeAddress,
         position,
         
         // Optional fields (Step 2)
         factoryAddress: factoryAddress || '',
         website: website || '',
         
         // File uploads (Step 6)
         letterOfIntent,
         
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
         forwardedToPSTO: application.forwardedToPSTO,
         letterOfIntent: application.letterOfIntent
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
      
      // Log file information for debugging
      applications.forEach((app, index) => {
         console.log(`Application ${index + 1} (${app.applicationId}):`, {
            letterOfIntent: app.letterOfIntent
         });
      });

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

// Update application (Proponent only)
const updateApplication = async (req, res) => {
   try {
      const { id } = req.params;
      const updateData = req.body;

      // Find the application
      const application = await SETUPApplication.findById(id);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Check if the user owns this application
      if (application.proponentId.toString() !== req.user._id.toString()) {
         return res.status(403).json({
            success: false,
            message: 'Access denied. You can only update your own applications.'
         });
      }

      // Check if application can be updated (only if returned for revision)
      if (application.pstoStatus !== 'returned') {
         return res.status(400).json({
            success: false,
            message: 'Application can only be updated if it has been returned for revision.'
         });
      }

      // Update the application fields
      Object.keys(updateData).forEach(key => {
         if (updateData[key] !== undefined && updateData[key] !== null) {
            application[key] = updateData[key];
         }
      });

      application.updatedAt = new Date();
      await application.save();

      res.json({
         success: true,
         message: 'Application updated successfully',
         data: application
      });
   } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating application'
      });
   }
};

// Upload documents (Proponent only)
const uploadDocuments = async (req, res) => {
   try {
      const { id } = req.params;
      const files = req.files;

      // Find the application
      const application = await SETUPApplication.findById(id);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Check if the user owns this application
      if (application.proponentId.toString() !== req.user._id.toString()) {
         return res.status(403).json({
            success: false,
            message: 'Access denied. You can only update your own applications.'
         });
      }

      // Check if application can be updated (only if returned for revision)
      if (application.pstoStatus !== 'returned') {
         return res.status(400).json({
            success: false,
            message: 'Application can only be updated if it has been returned for revision.'
         });
      }

      // Update file information (only letterOfIntent for simplified form)
      if (files) {
         files.forEach(file => {
            const fileInfo = {
               filename: file.filename,
               originalName: file.originalname,
               path: file.path,
               size: file.size,
               mimetype: file.mimetype
            };

            if (file.fieldname === 'letterOfIntent') {
               application.letterOfIntent = fileInfo;
            }
         });
      }

      application.updatedAt = new Date();
      await application.save();

      res.json({
         success: true,
         message: 'Documents uploaded successfully',
         data: application
      });
   } catch (error) {
      console.error('Upload documents error:', error);
      res.status(500).json({
         success: false,
         message: 'Error uploading documents'
      });
   }
};

// Resubmit application (Proponent only)
const resubmitApplication = async (req, res) => {
   try {
      const { id } = req.params;
      console.log('=== RESUBMIT APPLICATION DEBUG ===');
      console.log('Resubmit application - ID:', id);
      console.log('Resubmit application - ID type:', typeof id);
      console.log('Resubmit application - User:', req.user);
      console.log('Resubmit application - User ID:', req.user?._id);
      console.log('Resubmit application - User ID type:', typeof req.user?._id);

      // Validate ID format
      if (!id || typeof id !== 'string') {
         console.log('Invalid ID format:', id);
         return res.status(400).json({
            success: false,
            message: 'Invalid application ID format'
         });
      }

      // Find the application
      console.log('Searching for application with ID:', id);
      const application = await SETUPApplication.findById(id);
      if (!application) {
         console.log('Application not found for ID:', id);
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }
      
      console.log('Application found:', application._id);
      console.log('Application proponentId:', application.proponentId);
      console.log('Application proponentId type:', typeof application.proponentId);
      console.log('User ID:', req.user._id);
      console.log('User ID type:', typeof req.user._id);

      // Check if the user owns this application
      console.log('Checking ownership...');
      console.log('Application proponentId (string):', application.proponentId.toString());
      console.log('User ID (string):', req.user._id.toString());
      console.log('Ownership check result:', application.proponentId.toString() === req.user._id.toString());
      
      if (application.proponentId.toString() !== req.user._id.toString()) {
         console.log('Access denied - user does not own this application');
         return res.status(403).json({
            success: false,
            message: 'Access denied. You can only update your own applications.'
         });
      }

      // Check if application can be resubmitted (only if returned for revision or pending)
      console.log('Checking PSTO status...');
      console.log('Current PSTO status:', application.pstoStatus);
      console.log('Can resubmit:', application.pstoStatus === 'returned' || application.pstoStatus === 'pending');
      
      if (application.pstoStatus !== 'returned' && application.pstoStatus !== 'pending') {
         console.log('Cannot resubmit - application not in returned or pending status');
         return res.status(400).json({
            success: false,
            message: 'Application can only be resubmitted if it has been returned for revision or is pending.'
         });
      }

      // Reset status for resubmission
      console.log('Resetting application status for resubmission...');
      application.pstoStatus = 'pending';
      application.pstoComments = '';
      application.pstoReviewedAt = null;
      application.pstoAssigned = null;
      application.status = 'pending';
      application.currentStage = 'tna_application';
      application.updatedAt = new Date();

      console.log('Saving application...');
      await application.save();
      console.log('Application saved successfully');

      console.log('Sending success response...');
      res.json({
         success: true,
         message: 'Application resubmitted successfully',
         data: application
      });
      console.log('=== RESUBMIT APPLICATION SUCCESS ===');
   } catch (error) {
      console.error('Resubmit application error:', error);
      console.error('Error details:', {
         message: error.message,
         stack: error.stack,
         name: error.name
      });
      res.status(500).json({
         success: false,
         message: 'Error resubmitting application',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

      let fileInfo;
      if (fileType === 'letterOfIntent' && application.letterOfIntent?.filename) {
         fileInfo = application.letterOfIntent;
      } else {
         return res.status(404).json({
            success: false,
            message: 'File not found'
         });
      }

      const filePath = path.join(__dirname, '../../uploads', fileInfo.filename);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({
            success: false,
            message: 'File not found on server'
         });
      }

      res.download(filePath, fileInfo.originalName || fileInfo.filename);
   } catch (error) {
      console.error('Download file error:', error);
      res.status(500).json({
         success: false,
         message: 'Error downloading file'
      });
   }
};

// View file in browser
const viewFile = async (req, res) => {
   try {
      const { id, fileType } = req.params;
      
      // Check if user is proponent (can view their own files) or PSTO/admin (can view any files)
      let application;
      
      if (req.user.role === 'proponent') {
         // Proponents can only view their own files
         application = await SETUPApplication.findOne({
            _id: id,
            proponentId: req.user._id
         });
      } else if (req.user.role === 'psto' || req.user.role === 'admin' || req.user.role === 'dost_mimaropa') {
         // PSTO, admin, and DOST MIMAROPA can view any application files
         application = await SETUPApplication.findById(id).populate('proponentId', 'province');
         
         // For PSTO users, verify they can review this application (same province)
         if (req.user.role === 'psto' && application && application.proponentId.province !== req.user.province) {
            return res.status(403).json({
               success: false,
               message: 'Access denied. You can only view files from applications in your province.'
            });
         }
      } else {
         return res.status(403).json({
            success: false,
            message: 'Access denied. Invalid role.'
         });
      }

      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      let fileInfo;
      if (fileType === 'letterOfIntent' && application.letterOfIntent?.filename) {
         fileInfo = application.letterOfIntent;
      } else {
         return res.status(404).json({
            success: false,
            message: 'File not found'
         });
      }

      const filePath = path.join(__dirname, '../../uploads', fileInfo.filename);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({
            success: false,
            message: 'File not found on server'
         });
      }

      // Set appropriate headers for viewing
      res.setHeader('Content-Type', fileInfo.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${fileInfo.originalName || fileInfo.filename}"`);
      
      // Send the file
      res.sendFile(filePath);
   } catch (error) {
      console.error('View file error:', error);
      res.status(500).json({
         success: false,
         message: 'Error viewing file'
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
         .populate('proponentId', 'firstName lastName email userId province proponentInfo.phone')
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
            .populate('proponentId', 'firstName lastName email userId province proponentInfo.phone')
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

// Test endpoint to check application access
const testApplicationAccess = async (req, res) => {
   try {
      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'province');
      
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      res.json({
         success: true,
         data: {
            _id: application._id,
            applicationId: application.applicationId,
            proponentId: application.proponentId,
            status: application.status,
            pstoStatus: application.pstoStatus
         }
      });
   } catch (error) {
      console.error('Test application access error:', error);
      res.status(500).json({
         success: false,
         message: 'Error accessing application',
         error: error.message
      });
   }
};

// Review application (PSTO only)
const reviewApplication = async (req, res) => {
   try {
      console.log('=== REVIEW APPLICATION START ===');
      console.log('Review application request:', {
         applicationId: req.params.id,
         userId: req.user._id,
         userRole: req.user.role,
         userProvince: req.user.province,
         body: req.body
      });

      const { status, comments } = req.body;

      // Check if user has PSTO role
      if (req.user.role !== 'psto' && req.user.role !== 'admin') {
         console.log('Access denied - Invalid role:', req.user.role);
         return res.status(403).json({
            success: false,
            message: 'Access denied. PSTO role required.'
         });
      }

      if (!['approved', 'returned', 'rejected'].includes(status)) {
         console.log('Invalid status:', status);
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be approved, returned, or rejected'
         });
      }

      console.log('Looking for application with ID:', req.params.id);
      
      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'province');
      
      if (!application) {
         console.log('Application not found:', req.params.id);
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Validate application document
      if (!application._id) {
         console.log('Application has no _id - corrupted document');
         return res.status(400).json({
            success: false,
            message: 'Application data is corrupted'
         });
      }

      console.log('Found application:', {
         applicationId: application.applicationId,
         proponentId: application.proponentId,
         proponentProvince: application.proponentId?.province,
         currentStatus: application.status
      });

      // Check if proponentId is properly populated
      if (!application.proponentId) {
         console.log('Application has no proponentId - this might be the issue');
         return res.status(400).json({
            success: false,
            message: 'Application data is incomplete - missing proponent information'
         });
      }

      // For PSTO users, verify they can review this application (same province)
      if (req.user.role === 'psto' && application.proponentId.province !== req.user.province) {
         console.log('Access denied - Province mismatch:', {
            userProvince: req.user.province,
            proponentProvince: application.proponentId.province
         });
         return res.status(403).json({
            success: false,
            message: 'Access denied. You can only review applications from your province.'
         });
      }

      // Find the appropriate PSTO for this province
      let assignedPSTO = null;
      try {
         if (application.proponentId.province) {
            console.log('Looking for PSTO in province:', application.proponentId.province);
            const psto = await PSTO.findOne({ 
               province: application.proponentId.province,
               status: 'active'
            });
            if (psto) {
               assignedPSTO = psto._id;
               console.log('Found PSTO:', psto._id);
            } else {
               console.log('No active PSTO found for province:', application.proponentId.province);
            }
         }
      } catch (pstoError) {
         console.error('Error finding PSTO:', pstoError);
         // Continue without PSTO assignment
      }

      // Update application with PSTO review
      try {
         console.log('Updating application fields...');
         
         // Ensure required fields exist
         if (!application.pstoStatus) {
            application.pstoStatus = status;
         } else {
            application.pstoStatus = status;
         }
         
         application.pstoComments = comments || '';
         application.pstoReviewedAt = new Date();
         application.pstoAssigned = req.user._id;
         
         if (assignedPSTO) {
            application.assignedPSTO = assignedPSTO;
         }

         // Update main status based on PSTO decision - Correct DOST PMNS Workflow
         if (status === 'approved') {
            application.status = 'psto_approved';
            application.currentStage = 'psto_approved';
            // TNA will be scheduled after PSTO approval, not forwarded to DOST MIMAROPA yet
         } else if (status === 'rejected') {
            application.status = 'psto_rejected';
            application.currentStage = 'psto_review';
         } else if (status === 'returned') {
            application.status = 'pending';
            application.currentStage = 'application_submitted';
         }

         console.log('Application fields before save:', {
            _id: application._id,
            applicationId: application.applicationId,
            pstoStatus: application.pstoStatus,
            status: application.status,
            currentStage: application.currentStage,
            pstoComments: application.pstoComments,
            pstoReviewedAt: application.pstoReviewedAt,
            pstoAssigned: application.pstoAssigned
         });

         console.log('Attempting to save application...');
         const savedApplication = await application.save();
         console.log('Application saved successfully:', savedApplication._id);
      } catch (saveError) {
         console.error('Error saving application:', saveError);
         console.error('Save error details:', {
            message: saveError.message,
            name: saveError.name,
            code: saveError.code,
            errors: saveError.errors
         });
         throw saveError;
      }

      console.log('Application reviewed by PSTO:', {
         applicationId: application.applicationId,
         status: status,
         reviewedBy: req.user._id,
         proponentProvince: application.proponentId.province,
         pstoProvince: req.user.province
      });

      const responseData = {
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
      };

      console.log('Sending response:', responseData);
      console.log('=== REVIEW APPLICATION SUCCESS ===');
      
      res.json(responseData);
   } catch (error) {
      console.error('=== REVIEW APPLICATION ERROR ===');
      console.error('Review application error:', error);
      console.error('Error details:', {
         message: error.message,
         stack: error.stack,
         name: error.name,
         code: error.code
      });
      
      // Ensure response hasn't been sent already
      if (!res.headersSent) {
         res.status(500).json({
            success: false,
            message: 'Error reviewing application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
         });
      } else {
         console.error('Response already sent, cannot send error response');
      }
   }
};

// Delete application (PSTO only)
const deleteApplication = async (req, res) => {
   try {
      console.log('Delete application request:', {
         applicationId: req.params.id,
         userId: req.user._id,
         userRole: req.user.role
      });

      // Check if user has PSTO role
      if (req.user.role !== 'psto' && req.user.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. PSTO role required.'
         });
      }

      const application = await SETUPApplication.findById(req.params.id);
      
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // For PSTO users, verify they can delete this application (same province)
      if (req.user.role === 'psto' && application.proponentId) {
         const proponent = await mongoose.model('User').findById(application.proponentId);
         if (proponent && proponent.province !== req.user.province) {
            return res.status(403).json({
               success: false,
               message: 'Access denied. You can only delete applications from your province.'
            });
         }
      }

      // Delete the application
      await SETUPApplication.findByIdAndDelete(req.params.id);

      console.log('Application deleted successfully:', {
         applicationId: application.applicationId,
         deletedBy: req.user._id
      });

      res.json({
         success: true,
         message: 'Application deleted successfully'
      });
   } catch (error) {
      console.error('Delete application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error deleting application',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

// Forward application to DOST MIMAROPA (manual forwarding)
const forwardToDostMimaropa = async (req, res) => {
   try {
      console.log('=== FORWARD TO DOST MIMAROPA START ===');
      console.log('Forward application request:', {
         applicationId: req.params.id,
         userId: req.user._id,
         userRole: req.user.role
      });

      // Check if user has PSTO role
      if (req.user.role !== 'psto' && req.user.role !== 'admin') {
         console.log('Access denied - Invalid role:', req.user.role);
         return res.status(403).json({
            success: false,
            message: 'Access denied. PSTO role required.'
         });
      }

      console.log('Looking for application with ID:', req.params.id);
      
      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'province');
      
      if (!application) {
         console.log('Application not found:', req.params.id);
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Check if application is approved by PSTO
      if (application.pstoStatus !== 'approved') {
         return res.status(400).json({
            success: false,
            message: 'Application must be approved by PSTO before forwarding to DOST MIMAROPA'
         });
      }

      // Allow re-forwarding - no need to check if already forwarded

      console.log('Found application:', {
         applicationId: application.applicationId,
         pstoStatus: application.pstoStatus,
         forwardedToDostMimaropa: application.forwardedToDostMimaropa
      });

      // Check if this is a re-forward
      const isReForward = application.forwardedToDostMimaropa;

      // Update application to forward to DOST MIMAROPA
      try {
         console.log('Updating application fields...');
         
         application.forwardedToDostMimaropa = true;
         application.forwardedToDostMimaropaAt = new Date();
         application.dostMimaropaStatus = 'pending';
         application.status = 'psto_approved';
         application.currentStage = 'dost_mimaropa_review';

         console.log('Application fields before save:', {
            _id: application._id,
            applicationId: application.applicationId,
            forwardedToDostMimaropa: application.forwardedToDostMimaropa,
            forwardedToDostMimaropaAt: application.forwardedToDostMimaropaAt,
            dostMimaropaStatus: application.dostMimaropaStatus,
            status: application.status,
            currentStage: application.currentStage
         });

         console.log('Attempting to save application...');
         const savedApplication = await application.save();
         console.log('Application saved successfully:', savedApplication._id);

         res.json({
            success: true,
            message: isReForward ? 'Application re-forwarded to DOST MIMAROPA successfully' : 'Application forwarded to DOST MIMAROPA successfully',
            data: savedApplication
         });
      } catch (saveError) {
         console.error('Error saving application:', saveError);
         return res.status(500).json({
            success: false,
            message: 'Error forwarding application to DOST MIMAROPA'
         });
      }
   } catch (error) {
      console.error('Forward to DOST MIMAROPA error:', error);
      res.status(500).json({
         success: false,
         message: 'Error forwarding application to DOST MIMAROPA'
      });
   }
};

// Get all applications for DOST MIMAROPA review
const getDostMimaropaApplications = async (req, res) => {
   try {
      console.log('Fetching applications for DOST MIMAROPA review by user:', req.user._id);
      
      // Check if user has DOST MIMAROPA role
      if (req.user.role !== 'dost_mimaropa' && req.user.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. DOST MIMAROPA role required.'
         });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const filter = {
         forwardedToDostMimaropa: true
      };
      
      if (status) filter.dostMimaropaStatus = status;

      const applications = await SETUPApplication.find(filter)
         .populate('proponentId', 'firstName lastName email userId province proponentInfo.phone')
         .populate('assignedPSTO', 'name province')
         .sort({ forwardedToDostMimaropaAt: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);

      const total = await SETUPApplication.countDocuments(filter);

      console.log(`Found ${applications.length} applications for DOST MIMAROPA review`);

      res.json({
         success: true,
         data: applications,
         pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total: total
         }
      });
   } catch (error) {
      console.error('Get DOST MIMAROPA applications error:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching applications'
      });
   }
};

// Review application (DOST MIMAROPA only)
const reviewDostMimaropaApplication = async (req, res) => {
   try {
      console.log('=== DOST MIMAROPA REVIEW APPLICATION START ===');
      console.log('Review application request:', {
         applicationId: req.params.id,
         userId: req.user._id,
         userRole: req.user.role,
         body: req.body
      });

      const { status, comments } = req.body;

      // Check if user has DOST MIMAROPA role
      if (req.user.role !== 'dost_mimaropa' && req.user.role !== 'admin') {
         console.log('Access denied - Invalid role:', req.user.role);
         return res.status(403).json({
            success: false,
            message: 'Access denied. DOST MIMAROPA role required.'
         });
      }

      if (!['approved', 'returned', 'rejected'].includes(status)) {
         console.log('Invalid status:', status);
         return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be approved, returned, or rejected'
         });
      }

      console.log('Looking for application with ID:', req.params.id);
      
      const application = await SETUPApplication.findById(req.params.id)
         .populate('proponentId', 'province');
      
      if (!application) {
         console.log('Application not found:', req.params.id);
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Check if application is forwarded to DOST MIMAROPA
      if (!application.forwardedToDostMimaropa) {
         return res.status(400).json({
            success: false,
            message: 'Application not forwarded to DOST MIMAROPA'
         });
      }

      console.log('Found application:', {
         applicationId: application.applicationId,
         currentStatus: application.status,
         dostMimaropaStatus: application.dostMimaropaStatus
      });

      // Update application with DOST MIMAROPA review
      try {
         console.log('Updating application fields...');
         
         application.dostMimaropaStatus = status;
         application.dostMimaropaComments = comments || '';
         application.dostMimaropaReviewedAt = new Date();
         application.dostMimaropaAssigned = req.user._id;

         // Update main status based on DOST MIMAROPA decision
         if (status === 'approved') {
            application.status = 'dost_mimaropa_approved';
            application.currentStage = 'tna_assessment';
         } else if (status === 'rejected') {
            application.status = 'dost_mimaropa_rejected';
         } else if (status === 'returned') {
            application.status = 'psto_approved';
            application.currentStage = 'dost_mimaropa_review';
         }

         console.log('Application fields before save:', {
            _id: application._id,
            applicationId: application.applicationId,
            dostMimaropaStatus: application.dostMimaropaStatus,
            status: application.status,
            currentStage: application.currentStage,
            dostMimaropaComments: application.dostMimaropaComments,
            dostMimaropaReviewedAt: application.dostMimaropaReviewedAt,
            dostMimaropaAssigned: application.dostMimaropaAssigned
         });

         console.log('Attempting to save application...');
         const savedApplication = await application.save();
         console.log('Application saved successfully:', savedApplication._id);

         res.json({
            success: true,
            message: 'Application reviewed successfully',
            data: savedApplication
         });
      } catch (saveError) {
         console.error('Error saving application:', saveError);
         return res.status(500).json({
            success: false,
            message: 'Error saving application review'
         });
      }
   } catch (error) {
      console.error('DOST MIMAROPA review application error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Validate application documents by PSTO
const validateApplication = async (req, res) => {
   try {
      const { id: applicationId } = req.params;
      const { status, comments, validatedBy, validatedAt } = req.body;

      // Validate required fields
      if (!status) {
         return res.status(400).json({
            success: false,
            message: 'Status is required'
         });
      }

      // Find the application
      const application = await SETUPApplication.findById(applicationId);
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Update application status
      application.pstoStatus = status;
      application.pstoComments = comments;
      application.validatedBy = validatedBy;
      application.validatedAt = new Date(validatedAt);
      application.updatedAt = new Date();
      
      // Update main application status based on PSTO decision
      if (status === 'approved') {
         application.status = 'psto_approved';
         application.currentStage = 'psto_approved';
      } else if (status === 'rejected') {
         application.status = 'psto_rejected';
         application.currentStage = 'psto_review';
      } else if (status === 'returned') {
         application.status = 'pending';
         application.currentStage = 'application_submitted';
      }

      await application.save();

      // Create notification for proponent
      const Notification = require('../models/Notification');
      const notificationMessage = comments 
         ? `Your ${application.programName} application has been ${status === 'approved' ? 'approved' : 'returned for revision'}. ${comments}`
         : `Your ${application.programName} application has been ${status === 'approved' ? 'approved' : 'returned for revision'}.`;
      
      await Notification.create({
         recipientId: application.proponentId,
         recipientType: 'proponent',
         type: status === 'approved' ? 'application_approved' : 'application_returned',
         title: 'Application Status Update',
         message: notificationMessage,
         relatedEntityType: 'application',
         relatedEntityId: application._id,
         actionUrl: `/applications/${application._id}`,
         actionText: 'View Application',
         priority: 'high',
         sentBy: req.user._id
      });

      res.json({
         success: true,
         message: `Application ${status === 'approved' ? 'approved' : 'returned for revision'} successfully`,
         data: application
      });
   } catch (error) {
      console.error('Validate application error:', error);
      res.status(500).json({
         success: false,
         message: 'Error validating application'
      });
   }
};

module.exports = {
   submitApplication,
   getMyApplications,
   getApplicationById,
   updateApplication,
   updateApplicationStatus,
   uploadDocuments,
   resubmitApplication,
   downloadFile,
   viewFile,
   getApplicationStats,
   getPSTOApplications,
   getPSTOApplicationById,
   testApplicationAccess,
   reviewApplication,
   deleteApplication,
   validateApplication,
   fixPSTOAssignment,
   forwardToDostMimaropa,
   getDostMimaropaApplications,
   reviewDostMimaropaApplication
};
