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

      const pstoId = req.user.id;
      console.log('Extracted data:', {
         applicationId,
         proponentId,
         scheduledDate,
         scheduledTime,
         location,
         pstoId
      });

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
         enterpriseName: application.enterpriseName
      });

      // Create TNA data
      const tnaData = {
         applicationId: applicationId,
         proponentId: proponentId,
         programName: application.programName || 'SETUP',
         scheduledDate: new Date(scheduledDate),
         scheduledTime: scheduledTime,
         location: location,
         contactPerson: contactPerson || application.proponentId?.firstName + ' ' + application.proponentId?.lastName,
         position: 'Proponent',
         phone: contactPhone || application.proponentId?.phone || '',
         email: application.proponentId?.email || '',
         assessmentTeam: assessors || [],
         notes: notes || '',
         scheduledBy: pstoId,
         status: 'scheduled'
      };

      console.log('Creating TNA with data:', tnaData);

      // Create TNA
      const tna = new TNA(tnaData);
      await tna.save();

      console.log('TNA created successfully:', tna._id);

      // Update application status
      application.status = 'tna_scheduled';
      await application.save();

      console.log('Application status updated to tna_scheduled');

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
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
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

      // For PSTO users, filter by province
      if (req.user.role === 'psto') {
         const psto = await PSTO.findOne({ userId: pstoId });
         if (psto) {
            query['proponentId.province'] = psto.province;
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
         return res.status(404).json({
            success: false,
            message: 'Report file not found on server'
         });
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

      const tnas = await TNA.find({ status: 'forwarded_to_dost_mimaropa' })
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

module.exports = {
   scheduleTNA,
   listTNAs,
   markTNAAsCompleted,
   markTNAAsInProgress,
   uploadTNAReport,
   downloadTNAReport,
   forwardTNAToDostMimaropa,
   getTNAReportsForDostMimaropa,
   reviewTNAReport
};