const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const PSTO = require('../models/PSTO');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Schedule TNA
const scheduleTNA = async (req, res) => {
   try {
      console.log('=== TNA SCHEDULING DEBUG ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);
      
      const {
         applicationId,
         proponentId,
         scheduledDate,
         scheduledTime,
         location,
         contactPerson,
         contactPhone,
         notes,
         assessors
      } = req.body;

      const pstoId = req.user._id || req.user.id;
      console.log('Extracted data:', {
         applicationId,
         proponentId,
         scheduledDate,
         scheduledTime,
         location,
         pstoId,
         pstoIdType: typeof pstoId,
         pstoIdValid: mongoose.Types.ObjectId.isValid(pstoId)
      });

      // Validate PSTO ID
      if (!pstoId || !mongoose.Types.ObjectId.isValid(pstoId)) {
         console.log('Invalid PSTO ID:', pstoId);
         return res.status(400).json({
            success: false,
            message: 'Invalid PSTO user ID'
         });
      }

      // Validate required fields
      console.log('Validating required fields...');
      const missingFields = [];
      if (!applicationId) missingFields.push('applicationId');
      if (!proponentId) missingFields.push('proponentId');
      if (!scheduledDate) missingFields.push('scheduledDate');
      if (!scheduledTime) missingFields.push('scheduledTime');
      if (!location) missingFields.push('location');
      
      if (missingFields.length > 0) {
         console.log('Missing fields:', missingFields);
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
         });
      }

      // Validate ObjectIds
      if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
         console.log('Invalid applicationId:', applicationId);
         return res.status(400).json({
            success: false,
            message: 'Invalid or missing application ID'
         });
      }

      if (!proponentId || !mongoose.Types.ObjectId.isValid(proponentId)) {
         console.log('Invalid proponentId:', proponentId);
         return res.status(400).json({
            success: false,
            message: 'Invalid or missing proponent ID'
         });
      }

      // Get application details
      console.log('Fetching application details...');
      const application = await SETUPApplication.findById(applicationId).populate('proponentId');
      if (!application) {
         console.log('Application not found');
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      console.log('Application found:', {
         id: application._id,
         programName: application.programName,
         enterpriseName: application.enterpriseName,
         proponentId: application.proponentId,
         proponentType: typeof application.proponentId
      });

      // Verify application has valid proponent
      if (!application.proponentId) {
         console.log('Application has no proponentId');
         return res.status(400).json({
            success: false,
            message: 'Application is missing proponent information'
         });
      }

      // Validate date
      const parsedDate = new Date(scheduledDate);
      if (isNaN(parsedDate.getTime())) {
         console.log('Invalid date provided:', scheduledDate);
         return res.status(400).json({
            success: false,
            message: 'Invalid scheduled date provided'
         });
      }

      // Create TNA data
      const tnaData = {
         applicationId: applicationId,
         proponentId: proponentId,
         programName: application.programName || 'SETUP',
         scheduledDate: parsedDate,
         scheduledTime: scheduledTime,
         location: location,
         contactPerson: contactPerson || (application.proponentId?.firstName + ' ' + application.proponentId?.lastName) || 'Not provided',
         position: 'Proponent',
         phone: contactPhone || application.contactPersonTel || application.proponentId?.proponentInfo?.phone || 'Not provided',
         email: application.contactPersonEmail || application.proponentId?.email || 'not-provided@example.com',
         assessmentTeam: (() => {
            console.log('Processing assessmentTeam:', { assessors, isArray: Array.isArray(assessors) });
            if (Array.isArray(assessors) && assessors.length > 0) {
               const validAssessors = assessors.filter(assessor => 
                  assessor && assessor.name && assessor.name.trim() && 
                  assessor.position && assessor.position.trim() && 
                  assessor.department && assessor.department.trim()
               );
               console.log('Valid assessors found:', validAssessors.length);
               return validAssessors.length > 0 ? validAssessors : [{ name: 'TNA Team', position: 'Assessor', department: 'PSTO' }];
            }
            console.log('No valid assessors, using default');
            return [{ name: 'TNA Team', position: 'Assessor', department: 'PSTO' }];
         })(),
         notes: notes || '',
         scheduledBy: new mongoose.Types.ObjectId(pstoId),
         status: 'scheduled'
      };

      console.log('Creating TNA with data:', tnaData);

      // Verify TNA model is available
      console.log('TNA model:', typeof TNA);
      console.log('TNA constructor:', TNA.name);

      // Create TNA
      const tna = new TNA(tnaData);
      console.log('TNA instance created, attempting to save...');
      
      // Validate the TNA data before saving
      try {
         await tna.validate();
         console.log('TNA validation passed');
      } catch (validationError) {
         console.error('TNA validation failed:', validationError.message);
         console.error('Validation errors:', validationError.errors);
         return res.status(400).json({
            success: false,
            message: 'TNA validation failed',
            errors: validationError.errors
         });
      }
      
      await tna.save();
      console.log('TNA saved successfully with ID:', tna._id);

      console.log('TNA created successfully:', tna._id);

      // Update application status
      console.log('Updating application status to tna_scheduled...');
      try {
         application.status = 'tna_scheduled';
         await application.save();
         console.log('Application status updated to tna_scheduled successfully');
      } catch (appUpdateError) {
         console.error('Error updating application status:', appUpdateError);
         // Don't fail the TNA creation if application update fails
         // The TNA is already created successfully at this point
      }

      // Create notification
      try {
         await Notification.createNotification({
            title: 'TNA Scheduled',
            message: `Technology Needs Assessment has been scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${location}.`,
            recipientId: proponentId,
            recipientType: 'proponent',
            type: 'tna_scheduled',
            relatedEntityType: 'tna',
            relatedEntityId: tna._id,
            actionUrl: '/applications',
            priority: 'medium'
         });
         console.log('Notification created successfully');
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
         // Don't fail the request if notification creation fails
      }

      res.status(201).json({
         success: true,
         message: 'TNA scheduled successfully',
         data: tna
      });

   } catch (error) {
      console.error('Error scheduling TNA:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error details:', {
         message: error.message,
         name: error.name,
         stack: error.stack
      });

      // Handle specific error types
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'TNA validation failed',
            error: error.message,
            details: error.errors
         });
      }

      if (error.name === 'CastError') {
         return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: error.message
         });
      }

      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
   }
};

// List TNAs
const listTNAs = async (req, res) => {
   try {
      const { applicationId, status, proponentId } = req.query;
      const pstoId = req.user.id;

      // Build query
      let query = {};
      
      if (applicationId) {
         query.applicationId = applicationId;
      }
      
      if (status) {
         query.status = status;
      }
      
      if (proponentId) {
         query.proponentId = proponentId;
      }

         // For PSTO users, filter by province via proponent IDs (cannot query populated fields)
         if (req.user.role === 'psto') {
            const psto = await PSTO.findOne({ userId: pstoId });
            if (psto && psto.province) {
               const proponentsInProvince = await mongoose.model('User')
                  .find({ role: 'proponent', province: psto.province })
                  .select('_id');
               const proponentIds = proponentsInProvince.map(p => p._id);
               query.proponentId = query.proponentId
                  ? query.proponentId
                  : { $in: proponentIds };
            }
         }

      console.log('TNA query:', query);

         const tnas = await TNA.find(query)
         .populate('applicationId', 'applicationId programName enterpriseName businessActivity status')
         .populate('proponentId', 'firstName lastName email province phone')
         .populate('scheduledBy', 'firstName lastName')
         .populate('completedBy', 'firstName lastName')
         .populate('updatedBy', 'firstName lastName')
         .populate('forwardedBy', 'firstName lastName')
         .sort({ createdAt: -1 });

      console.log('Found TNAs:', tnas.length);

      res.json({
         success: true,
         data: tnas
      });

   } catch (error) {
      console.error('Error listing TNAs:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Mark TNA as completed
const markTNAAsCompleted = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('=== MARK TNA AS COMPLETED DEBUG ===');
      console.log('TNA ID:', id);
      console.log('User ID:', userId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const tna = await TNA.findById(id);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName
      });

      // Check if TNA can be marked as completed
      if (tna.status !== 'in_progress') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be in progress to be marked as completed'
         });
      }

      // Preserve programName or set default
      const programName = tna.programName || tna.applicationId?.programName || 'SETUP';

      // Update TNA status
      tna.status = 'completed';
      tna.completedBy = userId;
      tna.completedAt = new Date();
      tna.updatedBy = userId;
      tna.programName = programName; // Ensure programName is preserved

      await tna.save();

      console.log('TNA marked as completed successfully');

      // Create notification
      try {
         await Notification.createNotification({
            title: 'TNA Completed',
            message: `Technology Needs Assessment has been completed. The report is being prepared.`,
            recipientId: tna.proponentId,
            recipientType: 'proponent',
            type: 'tna_completed',
            relatedEntityType: 'tna',
            relatedEntityId: tna._id,
            actionUrl: '/applications',
            priority: 'medium'
         });
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
      }

      res.json({
         success: true,
         message: 'TNA marked as completed successfully',
         data: tna
      });

   } catch (error) {
      console.error('Error marking TNA as completed:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Mark TNA as in progress
const markTNAAsInProgress = async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('=== MARK TNA AS IN PROGRESS DEBUG ===');
      console.log('TNA ID:', id);
      console.log('User ID:', userId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const tna = await TNA.findById(id);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName
      });

      // Check if TNA can be marked as in progress
      if (tna.status !== 'scheduled') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be scheduled to be marked as in progress'
         });
      }

      // Preserve programName or set default
      const programName = tna.programName || tna.applicationId?.programName || 'SETUP';

      // Update TNA status
      tna.status = 'in_progress';
      tna.updatedBy = userId;
      tna.programName = programName; // Ensure programName is preserved

      await tna.save();

      console.log('TNA marked as in progress successfully');

      res.json({
         success: true,
         message: 'TNA marked as in progress successfully',
         data: tna
      });

   } catch (error) {
      console.error('Error marking TNA as in progress:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Upload TNA Report
const uploadTNAReport = async (req, res) => {
   try {
      console.log('=== UPLOAD TNA REPORT DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Files:', req.files);

      const { tnaId, reportSummary, reportRecommendations } = req.body;
      const userId = req.user.id;

      if (!tnaId) {
         return res.status(400).json({
            success: false,
            message: 'TNA ID is required'
         });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const tna = await TNA.findById(tnaId);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName
      });

      // Check if TNA is completed
      if (tna.status !== 'completed') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be completed before uploading report'
         });
      }

      // Handle file upload
      let reportData = {};
      if (req.file) {
         const file = req.file;
         reportData = {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date(),
            uploadedBy: userId
         };
      } else if (tna.tnaReport && tna.tnaReport.filename) {
         // Keep existing file if no new file uploaded
         reportData = tna.tnaReport;
      } else {
         return res.status(400).json({
            success: false,
            message: 'Report file is required'
         });
      }

      // Update TNA with report data
      tna.tnaReport = reportData;
      tna.reportSummary = reportSummary || tna.reportSummary;
      tna.reportRecommendations = reportRecommendations || tna.reportRecommendations;
      tna.status = 'report_uploaded';
      tna.updatedBy = userId;

      await tna.save();

      console.log('TNA report uploaded successfully');

      res.json({
         success: true,
         message: 'TNA report uploaded successfully',
         data: tna
      });

   } catch (error) {
      console.error('Error uploading TNA report:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Download TNA Report
const downloadTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== DOWNLOAD TNA REPORT DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      const tna = await TNA.findById(tnaId).populate('proponentId', 'firstName lastName email province');
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName,
         proponentId: tna.proponentId,
         tnaReport: tna.tnaReport
      });

      // Check if report exists
      if (!tna.tnaReport || !tna.tnaReport.filename) {
         return res.status(404).json({
            success: false,
            message: 'TNA report not found'
         });
      }

      // For PSTO users, check province access
      if (req.user.role === 'psto') {
         const psto = await PSTO.findOne({ userId: userId });
         if (psto && tna.proponentId && tna.proponentId.province && tna.proponentId.province !== psto.province) {
            console.log('Province check failed:', {
               pstoProvince: psto.province,
               tnaProvince: tna.proponentId.province
            });
            return res.status(403).json({
               success: false,
               message: 'Access denied. TNA does not belong to your province'
            });
         }
      }

      // Use the same path construction as upload middleware
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadsDir, tna.tnaReport.filename);
      console.log('Uploads directory:', uploadsDir);
      console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
      console.log('File path:', filePath);
      console.log('File exists:', fs.existsSync(filePath));
      
      // List files in uploads directory for debugging
      if (fs.existsSync(uploadsDir)) {
         const files = fs.readdirSync(uploadsDir);
         console.log('Files in uploads directory:', files);
      }

      if (!fs.existsSync(filePath)) {
         console.log('File not found at constructed path:', filePath);
         console.log('TNA report data:', tna.tnaReport);
         
         // Try using the stored path as fallback
         if (tna.tnaReport.path && fs.existsSync(tna.tnaReport.path)) {
            console.log('Using stored path as fallback:', tna.tnaReport.path);
            filePath = tna.tnaReport.path;
         } else {
            console.log('Stored path also does not exist:', tna.tnaReport.path);
            return res.status(404).json({
               success: false,
               message: 'Report file not found on server. The file may have been deleted or moved.',
               debug: {
                  expectedPath: filePath,
                  storedPath: tna.tnaReport.path,
                  filename: tna.tnaReport.filename
               }
            });
         }
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${tna.tnaReport.originalName}"`);
      res.setHeader('Content-Type', tna.tnaReport.mimetype || 'application/octet-stream');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
         console.error('Error streaming file:', error);
         res.status(500).json({
            success: false,
            message: 'Error streaming file'
         });
      });

   } catch (error) {
      console.error('Error downloading TNA report:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Forward TNA to DOST MIMAROPA
const forwardTNAToDostMimaropa = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const userId = req.user.id;

      console.log('=== FORWARD TNA TO DOST MIMAROPA DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('User ID:', userId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Verify user is PSTO
      if (req.user.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. Only PSTO users can forward TNAs'
         });
      }

      const tna = await TNA.findById(tnaId).populate('proponentId', 'province');
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName,
         proponentId: tna.proponentId
      });

      // Check if TNA has a report
      if (!tna.tnaReport || !tna.tnaReport.filename) {
         return res.status(400).json({
            success: false,
            message: 'TNA report must be uploaded before forwarding to DOST MIMAROPA'
         });
      }

      // Check PSTO province access
      const psto = await PSTO.findOne({ userId: userId });
      if (psto && tna.proponentId && tna.proponentId.province && tna.proponentId.province !== psto.province) {
         return res.status(403).json({
            success: false,
            message: 'Access denied. TNA does not belong to your province'
         });
      }

      // Preserve programName or set default
      const programName = tna.programName || tna.applicationId?.programName || 'SETUP';

      // Update TNA status
      tna.status = 'forwarded_to_dost_mimaropa';
      tna.forwardedToDostMimaropaAt = new Date();
      tna.forwardedBy = userId;
      tna.updatedBy = userId;
      tna.programName = programName; // Ensure programName is preserved

      await tna.save();

      console.log('TNA forwarded to DOST MIMAROPA successfully');

      // Create notifications for all DOST MIMAROPA users
      try {
         const dostMimaropaUsers = await User.find({ role: 'dost_mimaropa' });
         for (const user of dostMimaropaUsers) {
            await Notification.createNotification({
               title: 'New TNA Report for Review',
               message: `A TNA report has been forwarded for review: ${programName} - ${tna.applicationId?.enterpriseName || 'N/A'}`,
               recipientId: user._id,
               recipientType: 'dost_mimaropa',
               type: 'tna_report_review',
               relatedEntityType: 'tna',
               relatedEntityId: tna._id,
               actionUrl: '/tna-management',
               priority: 'high'
            });
         }
         console.log('Notifications created for DOST MIMAROPA users');
      } catch (notificationError) {
         console.error('Error creating notifications:', notificationError);
      }

      res.json({
         success: true,
         message: 'TNA successfully forwarded to DOST MIMAROPA',
         data: tna
      });

   } catch (error) {
      console.error('Error forwarding TNA to DOST MIMAROPA:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get TNA Reports for DOST MIMAROPA
const getTNAReportsForDostMimaropa = async (req, res) => {
   try {
      console.log('=== GET TNA REPORTS FOR DOST MIMAROPA DEBUG ===');

      const tnas = await TNA.find({ 
         status: { 
            $in: [
               'forwarded_to_dost_mimaropa', 
               'dost_mimaropa_approved', 
               'dost_mimaropa_rejected', 
               'returned_to_psto'
            ] 
         } 
      })
         .populate('applicationId', 'applicationId enterpriseName proponentId programName businessActivity')
         .populate('proponentId', 'firstName lastName email province phone')
         .populate('scheduledBy', 'firstName lastName')
         .populate('completedBy', 'firstName lastName')
         .populate('updatedBy', 'firstName lastName')
         .populate('forwardedBy', 'firstName lastName')
         .sort({ forwardedToDostMimaropaAt: -1 });

      console.log('Found TNA reports for DOST MIMAROPA:', tnas.length);

      res.json({
         success: true,
         data: tnas
      });

   } catch (error) {
      console.error('Error getting TNA reports for DOST MIMAROPA:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Review TNA Report (DOST MIMAROPA)
const reviewTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { status, comments } = req.body;
      const userId = req.user.id;

      console.log('=== REVIEW TNA REPORT DEBUG ===');
      console.log('TNA ID:', tnaId);
      console.log('Status:', status);
      console.log('Comments:', comments);
      console.log('User ID:', userId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tnaId)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid TNA ID'
         });
      }

      // Verify user is DOST MIMAROPA
      if (req.user.role !== 'dost_mimaropa') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. Only DOST MIMAROPA users can review TNA reports'
         });
      }

      const tna = await TNA.findById(tnaId);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      console.log('TNA found:', {
         id: tna._id,
         status: tna.status,
         programName: tna.programName
      });

      // Check if TNA is forwarded to DOST MIMAROPA
      if (tna.status !== 'forwarded_to_dost_mimaropa') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be forwarded to DOST MIMAROPA before review'
         });
      }

      // Update TNA status based on review
      let newStatus = tna.status;
      if (status === 'approved') {
         newStatus = 'dost_mimaropa_approved';
      } else if (status === 'rejected') {
         newStatus = 'dost_mimaropa_rejected';
      } else if (status === 'returned') {
         newStatus = 'returned_to_psto';
      }

      tna.status = newStatus;
      tna.updatedBy = userId;
      if (comments) {
         tna.notes = comments;
      }
      
      // Set approval timestamp if approved
      if (status === 'approved') {
         tna.dostMimaropaApprovedAt = new Date();
      }

      await tna.save();

      console.log('TNA review completed successfully');

      // Create notification for PSTO
      try {
         await Notification.createNotification({
            title: 'TNA Report Review Completed',
            message: `Your TNA report has been ${status} by DOST MIMAROPA. ${comments ? 'Comments: ' + comments : ''}`,
            recipientId: tna.scheduledBy,
            recipientType: 'psto',
            type: 'tna_review_completed',
            relatedEntityType: 'tna',
            relatedEntityId: tna._id,
            actionUrl: '/tna-management',
            priority: 'medium'
         });
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
      }

      res.json({
         success: true,
         message: 'TNA report review completed successfully',
         data: tna
      });

   } catch (error) {
      console.error('Error reviewing TNA report:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get approved TNAs for DOST MIMAROPA
const getApprovedTNAs = async (req, res) => {
   try {
      console.log('=== GET APPROVED TNAS ===');
      console.log('User:', req.user);

      // Verify user is DOST MIMAROPA or super admin
      if (req.user.role !== 'dost_mimaropa' && req.user.role !== 'super_admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied. Only DOST MIMAROPA users can view approved TNAs'
         });
      }

      // Find TNAs that are approved by DOST MIMAROPA (including those already signed by RD)
      const approvedTNAs = await TNA.find({ 
         status: { 
            $in: ['dost_mimaropa_approved', 'signed_by_rd'] 
         } 
      })
      .populate('applicationId', 'applicationId enterpriseName status')
      .populate('proponentId', 'firstName lastName email province')
      .populate('scheduledBy', 'firstName lastName')
      .sort({ dostMimaropaApprovedAt: -1, updatedAt: -1 });

      console.log('Found approved TNAs:', approvedTNAs.length);

      res.json({
         success: true,
         message: 'Approved TNAs retrieved successfully',
         data: approvedTNAs
      });

   } catch (error) {
      console.error('Error fetching approved TNAs:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Upload signed TNA report by DOST MIMAROPA
const uploadSignedTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const signedTnaReport = req.file;

      if (!signedTnaReport) {
         return res.status(400).json({
            success: false,
            message: 'Signed TNA report file is required'
         });
      }

      // Find the TNA
      const tna = await TNA.findById(tnaId);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA is approved by DOST MIMAROPA
      console.log(`TNA ${tnaId} current status: ${tna.status}`);
      if (tna.status !== 'dost_mimaropa_approved') {
         return res.status(400).json({
            success: false,
            message: `TNA must be approved by DOST MIMAROPA before uploading signed report. Current status: ${tna.status}`,
            currentStatus: tna.status,
            requiredStatus: 'dost_mimaropa_approved'
         });
      }

      // Update TNA with signed report
      tna.signedTnaReport = {
         filename: signedTnaReport.filename,
         originalName: signedTnaReport.originalname,
         path: signedTnaReport.path,
         size: signedTnaReport.size,
         mimetype: signedTnaReport.mimetype
      };
      tna.status = 'signed_by_rd';
      tna.rdSignedAt = new Date();
      tna.forwardedToPSTOAt = new Date();

      await tna.save();

      // Update application status to reflect RD signature
      // Application status remains 'dost_mimaropa_approved' - the TNA status is what changes to 'signed_by_rd'
      // No need to update application status here since TNA signing is a separate process

      console.log(`Signed TNA report uploaded for TNA ${tnaId} by DOST MIMAROPA`);

      res.json({
         success: true,
         message: 'Signed TNA report uploaded successfully and forwarded to PSTO',
         data: {
            tnaId: tna.tnaId,
            status: tna.status,
            rdSignedAt: tna.rdSignedAt,
            forwardedToPSTOAt: tna.forwardedToPSTOAt
         }
      });

   } catch (error) {
      console.error('Error uploading signed TNA report:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
   }
};

// Download signed TNA report
const downloadSignedTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;

      // Find the TNA
      const tna = await TNA.findById(tnaId);
      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if signed TNA report exists
      if (!tna.signedTnaReport || !tna.signedTnaReport.path) {
         return res.status(404).json({
            success: false,
            message: 'Signed TNA report not found'
         });
      }

      // Check if file exists
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../uploads', tna.signedTnaReport.filename);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({
            success: false,
            message: 'Signed TNA report file not found on server'
         });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', tna.signedTnaReport.mimetype || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${tna.signedTnaReport.originalName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      console.log(`Signed TNA report downloaded for TNA ${tnaId}`);

   } catch (error) {
      console.error('Error downloading signed TNA report:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
   }
};

module.exports = {
   scheduleTNA,
   listTNAs,
   markTNAAsCompleted,
   markTNAAsInProgress,
   uploadTNAReport,
   downloadTNAReport,
   forwardTNAToDostMimaropa,
   getTNAReportsForDostMimaropa,
   reviewTNAReport,
   getApprovedTNAs,
   uploadSignedTNAReport,
   downloadSignedTNAReport
};