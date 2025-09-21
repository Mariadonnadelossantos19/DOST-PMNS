const TNA = require('../models/TNA');
const SETUPApplication = require('../models/SETUPApplication');
const PSTO = require('../models/PSTO');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

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
      console.log('All required fields present');

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can schedule TNA'
         });
      }

      // Find the application
      const application = await SETUPApplication.findById(applicationId)
         .populate('proponentId', 'province');
      
      if (!application) {
         return res.status(404).json({
            success: false,
            message: 'Application not found'
         });
      }

      // Verify application belongs to PSTO's province
      if (application.proponentId.province !== pstoUser.province) {
         return res.status(403).json({
            success: false,
            message: 'Application does not belong to your province'
         });
      }

      // Find PSTO record
      const psto = await PSTO.findOne({ province: pstoUser.province });
      if (!psto) {
         return res.status(404).json({
            success: false,
            message: 'PSTO record not found'
         });
      }

      // Check if TNA already exists for this application
      const existingTNA = await TNA.findOne({ applicationId });
      if (existingTNA) {
         return res.status(400).json({
            success: false,
            message: 'TNA already scheduled for this application'
         });
      }

      // Generate TNA ID
      const tnaId = `TNA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Map assessors to match schema
      const mappedAssessors = (assessors || []).map(assessor => ({
         name: assessor.name || 'Unnamed Assessor',
         position: assessor.position || 'Assessment Team Member',
         contact: assessor.email || assessor.phone || ''
      }));

      // Create TNA
      const tnaData = {
         tnaId,
         applicationId,
         proponentId,
         scheduledDate: new Date(scheduledDate),
         scheduledTime,
         location,
         contactPerson,
         contactPhone,
         assessors: mappedAssessors,
         notes,
         assignedPSTO: psto._id,
         scheduledBy: pstoId,
         status: 'scheduled'
      };

      console.log('Creating TNA with data:', JSON.stringify(tnaData, null, 2));

      const tna = new TNA(tnaData);

      console.log('TNA instance created, attempting to save...');
      await tna.save();
      console.log('TNA saved successfully:', tna._id);

      // Update application status
      console.log('Updating application status...');
      application.currentStage = 'tna_scheduled';
      application.status = 'tna_scheduled';
      console.log('Application status updated, saving...');
      
      try {
         await application.save();
         console.log('Application status saved successfully');
      } catch (saveError) {
         console.error('Error saving application status:', saveError);
         console.error('Save error details:', {
            message: saveError.message,
            name: saveError.name,
            errors: saveError.errors
         });
         throw saveError;
      }

      // Create notification for proponent
      console.log('Creating notification for proponent...');
      try {
         const notification = await Notification.createNotification({
            title: 'TNA Scheduled - Technology Needs Assessment',
            message: `Your Technology Needs Assessment (TNA) has been scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}. Location: ${location}. Please prepare for the assessment.`,
            recipientId: proponentId,
            recipientType: 'proponent',
            type: 'tna_scheduled',
            relatedEntityType: 'tna',
            relatedEntityId: tna._id,
            actionUrl: `/applications/${applicationId}`,
            actionText: 'View Application',
            priority: 'high',
            sentBy: pstoId
         });
         console.log('Notification created successfully:', notification._id);
      } catch (notificationError) {
         console.error('Error creating notification:', notificationError);
         // Don't fail the TNA scheduling if notification fails
      }

      res.json({
         success: true,
         message: 'TNA scheduled successfully',
         tna: {
            id: tna._id,
            tnaId: tna.tnaId,
            scheduledDate: tna.scheduledDate,
            scheduledTime: tna.scheduledTime,
            location: tna.location,
            status: tna.status
         }
      });

   } catch (error) {
      console.error('Schedule TNA error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
         const validationErrors = Object.values(error.errors).map(err => err.message);
         return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: validationErrors
         });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
         return res.status(400).json({
            success: false,
            message: 'TNA ID already exists'
         });
      }
      
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Get TNA list for PSTO
const getTNAList = async (req, res) => {
   try {
      const pstoId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can view TNA list'
         });
      }

      // Find PSTO record
      const psto = await PSTO.findOne({ province: pstoUser.province });
      if (!psto) {
         return res.status(404).json({
            success: false,
            message: 'PSTO record not found'
         });
      }

      const filter = { assignedPSTO: psto._id };
      if (status) filter.status = status;

      const tnas = await TNA.find(filter)
         .populate('applicationId', 'applicationId programName enterpriseName')
         .populate('proponentId', 'firstName lastName email')
         .sort({ scheduledDate: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit);

      const total = await TNA.countDocuments(filter);

      res.json({
         success: true,
         data: tnas,
         pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
         }
      });

   } catch (error) {
      console.error('Get TNA list error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get TNA details
const getTNADetails = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const pstoId = req.user.id;

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can view TNA details'
         });
      }

      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId', 'firstName lastName email province')
         .populate('assignedPSTO', 'officeName contactInfo');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Verify TNA belongs to PSTO's province
      if (tna.proponentId.province !== pstoUser.province) {
         return res.status(403).json({
            success: false,
            message: 'TNA does not belong to your province'
         });
      }

      res.json({
         success: true,
         data: tna
      });

   } catch (error) {
      console.error('Get TNA details error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Update TNA status
const updateTNAStatus = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { status, notes, pstoComments } = req.body;
      const pstoId = req.user.id;

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can update TNA status'
         });
      }

      const tna = await TNA.findById(tnaId)
         .populate('proponentId', 'province');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Verify TNA belongs to PSTO's province
      if (tna.proponentId.province !== pstoUser.province) {
         return res.status(403).json({
            success: false,
            message: 'TNA does not belong to your province'
         });
      }

      // Update TNA
      tna.status = status;
      if (notes) tna.notes = notes;
      if (pstoComments) tna.pstoComments = pstoComments;

      if (status === 'completed') {
         tna.assessmentDate = new Date();
      }

      await tna.save();

      // Update application status if TNA is completed
      if (status === 'completed') {
         const application = await SETUPApplication.findById(tna.applicationId);
         if (application) {
            application.currentStage = 'dost_mimaropa_review';
            application.status = 'tna_completed';
            application.tnaConducted = true;
            application.tnaConductedAt = new Date();
            await application.save();
         }

         // Create notification for proponent when TNA is completed
         try {
            const notification = await Notification.createNotification({
               title: 'TNA Completed - Technology Needs Assessment',
               message: `Your Technology Needs Assessment (TNA) has been completed successfully. The assessment was conducted on ${new Date().toLocaleDateString()}. Your application will now be reviewed by DOST MIMAROPA before proceeding to RTEC evaluation.`,
               recipientId: tna.proponentId._id,
               recipientType: 'proponent',
               type: 'tna_completed',
               relatedEntityType: 'tna',
               relatedEntityId: tna._id,
               actionUrl: `/applications/${tna.applicationId}`,
               actionText: 'View Application',
               priority: 'high',
               sentBy: pstoId
            });
            console.log('TNA completion notification created:', notification._id);
         } catch (notificationError) {
            console.error('Error creating TNA completion notification:', notificationError);
         }
      }

      res.json({
         success: true,
         message: 'TNA status updated successfully',
         tna: {
            id: tna._id,
            status: tna.status,
            assessmentDate: tna.assessmentDate
         }
      });

   } catch (error) {
      console.error('Update TNA status error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Upload TNA report
const uploadTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const pstoId = req.user.id;

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can upload TNA reports'
         });
      }

      const tna = await TNA.findById(tnaId)
         .populate('proponentId', 'province');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Verify TNA belongs to PSTO's province
      if (tna.proponentId.province !== pstoUser.province) {
         return res.status(403).json({
            success: false,
            message: 'TNA does not belong to your province'
         });
      }

      // Handle file upload
      const file = req.file;
      if (!file) {
         return res.status(400).json({
            success: false,
            message: 'TNA report file is required'
         });
      }

      // Update TNA with report
      tna.tnaReport = {
         filename: file.filename,
         originalName: file.originalname,
         path: file.path,
         size: file.size,
         mimetype: file.mimetype
      };

      await tna.save();

      // Update application status
      const application = await SETUPApplication.findById(tna.applicationId);
      if (application) {
         application.tnaReportSubmitted = true;
         application.tnaReportSubmittedAt = new Date();
         application.tnaReport = tna.tnaReport;
         await application.save();
      }

      res.json({
         success: true,
         message: 'TNA report uploaded successfully',
         report: tna.tnaReport
      });

   } catch (error) {
      console.error('Upload TNA report error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Submit TNA report to DOST MIMAROPA
const submitTNAReportToDostMimaropa = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const pstoId = req.user.id;

      // Verify PSTO user
      const pstoUser = await User.findById(pstoId);
      if (!pstoUser || pstoUser.role !== 'psto') {
         return res.status(403).json({
            success: false,
            message: 'Only PSTO users can submit TNA reports to DOST MIMAROPA'
         });
      }

      // Find the TNA
      const tna = await TNA.findById(tnaId)
         .populate('applicationId')
         .populate('proponentId');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA report is uploaded
      if (!tna.tnaReport || !tna.tnaReport.filename) {
         return res.status(400).json({
            success: false,
            message: 'TNA report must be uploaded before submitting to DOST MIMAROPA'
         });
      }

      // Check if TNA is completed
      if (tna.status !== 'completed') {
         return res.status(400).json({
            success: false,
            message: 'TNA must be completed before submitting report to DOST MIMAROPA'
         });
      }

      // Update TNA status
      tna.status = 'submitted_to_dost';
      tna.submittedToDostMimaropa = true;
      tna.submittedToDostMimaropaAt = new Date();
      await tna.save();

      // Update application status
      const application = await SETUPApplication.findById(tna.applicationId);
      if (application) {
         application.status = 'tna_report_submitted';
         application.currentStage = 'tna_report_submitted';
         application.tnaReportSubmitted = true;
         application.tnaReportSubmittedAt = new Date();
         application.forwardedToDostMimaropa = true;
         application.forwardedToDostMimaropaAt = new Date();
         await application.save();
      }

      res.json({
         success: true,
         message: 'TNA report submitted to DOST MIMAROPA successfully',
         tna: {
            id: tna._id,
            tnaId: tna.tnaId,
            status: tna.status,
            submittedAt: tna.submittedToDostMimaropaAt
         }
      });
   } catch (error) {
      console.error('Submit TNA report to DOST MIMAROPA error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get TNA reports for DOST MIMAROPA review
const getTNAReportsForDostMimaropa = async (req, res) => {
   try {
      const userId = req.user.id;

      // Verify DOST MIMAROPA user
      const user = await User.findById(userId);
      if (!user || (user.role !== 'dost_mimaropa' && user.role !== 'super_admin')) {
         return res.status(403).json({
            success: false,
            message: 'Only DOST MIMAROPA users can view TNA reports for review'
         });
      }

      // Get TNA reports submitted to DOST MIMAROPA
      const tnaReports = await TNA.find({
         status: 'submitted_to_dost',
         submittedToDostMimaropa: true
      })
      .populate('applicationId', 'applicationId enterpriseName proponentId')
      .populate('proponentId', 'firstName lastName email province')
      .populate('assignedPSTO', 'name province')
      .sort({ submittedToDostMimaropaAt: -1 });

      res.json({
         success: true,
         data: tnaReports
      });
   } catch (error) {
      console.error('Get TNA reports for DOST MIMAROPA error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Review TNA report by DOST MIMAROPA
const reviewTNAReport = async (req, res) => {
   try {
      const { tnaId } = req.params;
      const { status, comments } = req.body;
      const userId = req.user.id;

      // Verify DOST MIMAROPA user
      const user = await User.findById(userId);
      if (!user || (user.role !== 'dost_mimaropa' && user.role !== 'super_admin')) {
         return res.status(403).json({
            success: false,
            message: 'Only DOST MIMAROPA users can review TNA reports'
         });
      }

      // Validate status
      const validStatuses = ['approved', 'rejected', 'returned'];
      if (!validStatuses.includes(status)) {
         return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
         });
      }

      // Find the TNA
      const tna = await TNA.findById(tnaId)
         .populate('applicationId');

      if (!tna) {
         return res.status(404).json({
            success: false,
            message: 'TNA not found'
         });
      }

      // Check if TNA is submitted to DOST MIMAROPA
      if (!tna.submittedToDostMimaropa) {
         return res.status(400).json({
            success: false,
            message: 'TNA report must be submitted to DOST MIMAROPA before review'
         });
      }

      // Update TNA status
      tna.dostMimaropaStatus = status;
      tna.dostMimaropaComments = comments;
      tna.reviewedByDostMimaropa = userId;
      tna.reviewedByDostMimaropaAt = new Date();
      await tna.save();

      // Update application status
      const application = await SETUPApplication.findById(tna.applicationId);
      if (application) {
         if (status === 'approved') {
            application.status = 'dost_mimaropa_approved';
            application.currentStage = 'dost_mimaropa_review';
         } else if (status === 'rejected') {
            application.status = 'dost_mimaropa_rejected';
            application.currentStage = 'dost_mimaropa_review';
         } else if (status === 'returned') {
            application.status = 'tna_report_submitted'; // Return to previous status
            application.currentStage = 'tna_report_submitted';
         }
         await application.save();
      }

      res.json({
         success: true,
         message: `TNA report ${status} successfully`,
         tna: {
            id: tna._id,
            tnaId: tna.tnaId,
            dostMimaropaStatus: tna.dostMimaropaStatus,
            reviewedAt: tna.reviewedByDostMimaropaAt
         }
      });
   } catch (error) {
      console.error('Review TNA report error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

module.exports = {
   scheduleTNA,
   getTNAList,
   getTNADetails,
   updateTNAStatus,
   uploadTNAReport,
   submitTNAReportToDostMimaropa,
   getTNAReportsForDostMimaropa,
   reviewTNAReport
};
