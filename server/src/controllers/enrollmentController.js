const Enrollment = require('../models/Enrollment');

// Service options configuration
const serviceOptions = {
   SETUP: {
      name: 'Small Enterprise Technology Upgrading Program',
      description: 'Technology upgrading program for small enterprises',
      stages: [
         { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
         { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
         { id: 'funding', name: 'Funding', required: true, completed: false },
         { id: 'training', name: 'Technology Training', required: true, completed: false },
         { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
         { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
      ]
   },
   GIA: {
      name: 'Grants-in-Aid',
      description: 'Research and development grants for innovative projects',
      stages: [
         { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
         { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
         { id: 'funding', name: 'Funding', required: true, completed: false },
         { id: 'training', name: 'Technology Training', required: true, completed: false },
         { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
         { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
      ]
   },
   CEST: {
      name: 'Community Empowerment through Science and Technology',
      description: 'Community-based technology programs and initiatives',
      stages: [
         { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
         { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
         { id: 'funding', name: 'Funding', required: true, completed: false },
         { id: 'training', name: 'Technology Training', required: true, completed: false },
         { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
         { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
      ]
   },
   SSCP: {
      name: 'Small and Medium Enterprise Development Program',
      description: 'Comprehensive support for SME development and growth',
      stages: [
         { id: 'tna', name: 'Technology Needs Assessment (TNA)', required: true, completed: false },
         { id: 'rtec', name: 'Review and Technical Evaluation Committee', required: true, completed: false },
         { id: 'funding', name: 'Funding', required: true, completed: false },
         { id: 'training', name: 'Technology Training', required: true, completed: false },
         { id: 'consultancy', name: 'Productivity Consultancy', required: true, completed: false },
         { id: 'liquidation', name: 'Liquidation', required: true, completed: false }
      ]
   }
};

// Get all enrollments
const getAllEnrollments = async (req, res) => {
   try {
      const { province, status, service } = req.query;
      
      // Build filter object
      const filter = {};
      if (province) filter.province = province;
      if (status) filter.status = status;
      if (service) filter.service = service;
      
      const enrollments = await Enrollment.find(filter)
         .populate('enrolledBy', 'firstName lastName email role')
         .sort({ enrolledDate: -1 });
      
      res.json({
         success: true,
         enrollments: enrollments
      });
   } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get enrollment by ID
const getEnrollmentById = async (req, res) => {
   try {
      const { id } = req.params;
      
      const enrollment = await Enrollment.findById(id)
         .populate('enrolledBy', 'firstName lastName email role');
      
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      res.json({
         success: true,
         enrollment: enrollment
      });
   } catch (error) {
      console.error('Get enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Create new enrollment (draft)
const createEnrollment = async (req, res) => {
   try {
      const { customer, service, province, enrolledBy, notes, tnaInfo } = req.body;
      
      // Validate required fields
      if (!customer || !service || !province) {
         return res.status(400).json({
            success: false,
            message: 'Missing required fields: customer, service, province'
         });
      }
      
      // Validate service
      if (!serviceOptions[service]) {
         return res.status(400).json({
            success: false,
            message: `Invalid service. Must be one of: ${Object.keys(serviceOptions).join(', ')}`
         });
      }
      
      // Validate customer data
      if (!customer.name || !customer.email) {
         return res.status(400).json({
            success: false,
            message: 'Customer name and email are required'
         });
      }
      
      // Check if customer already enrolled for the same service
      const existingEnrollment = await Enrollment.findOne({
         'customer.email': customer.email,
         service: service,
         status: { $in: ['draft', 'submitted', 'under_review', 'approved', 'in_progress'] }
      });
      
      if (existingEnrollment) {
         return res.status(400).json({
            success: false,
            message: 'Customer is already enrolled for this service'
         });
      }
      
      // Generate enrollment ID
      const count = await Enrollment.countDocuments();
      const enrollmentId = `ENR-${String(count + 1).padStart(6, '0')}`;

      // Create new enrollment as draft
      const newEnrollment = new Enrollment({
         enrollmentId: enrollmentId,
         customer: customer,
         service: service,
         serviceData: serviceOptions[service],
         province: province,
         enrolledBy: enrolledBy || null,
         notes: notes || '',
         tnaInfo: tnaInfo || null,
         status: 'draft',
         tnaStatus: 'pending',
         stages: serviceOptions[service].stages.map(stage => ({ ...stage }))
      });
      
      await newEnrollment.save();
      
      // Populate the enrolledBy field
      await newEnrollment.populate('enrolledBy', 'firstName lastName email role');
      
      res.status(201).json({
         success: true,
         message: 'Enrollment draft created successfully',
         enrollment: newEnrollment
      });
   } catch (error) {
      console.error('Create enrollment error:', error);
      console.error('Error details:', {
         message: error.message,
         stack: error.stack,
         name: error.name
      });
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
      const { customer, notes, status } = req.body;
      
      const enrollment = await Enrollment.findById(id);
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      // Update fields
      if (customer) enrollment.customer = { ...enrollment.customer, ...customer };
      if (notes !== undefined) enrollment.notes = notes;
      if (status) enrollment.status = status;
      
      await enrollment.save();
      await enrollment.populate('enrolledBy', 'firstName lastName email role');
      
      res.json({
         success: true,
         message: 'Enrollment updated successfully',
         enrollment: enrollment
      });
   } catch (error) {
      console.error('Update enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Update stage status
const updateStageStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { stageId, completed, notes } = req.body;
      
      const enrollment = await Enrollment.findById(id);
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      // Update stage status using the model method
      await enrollment.updateStageStatus(stageId, completed, notes);
      await enrollment.populate('enrolledBy', 'firstName lastName email role');
      
      res.json({
         success: true,
         message: 'Stage status updated successfully',
         enrollment: enrollment
      });
   } catch (error) {
      console.error('Update stage status error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Delete enrollment
const deleteEnrollment = async (req, res) => {
   try {
      const { id } = req.params;
      
      const enrollment = await Enrollment.findByIdAndDelete(id);
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      res.json({
         success: true,
         message: 'Enrollment deleted successfully',
         enrollmentId: enrollment.enrollmentId
      });
   } catch (error) {
      console.error('Delete enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get enrollment statistics
const getEnrollmentStats = async (req, res) => {
   try {
      const { province } = req.query;
      
      const filter = province ? { province } : {};
      
      const stats = await Enrollment.aggregate([
         { $match: filter },
         {
            $group: {
               _id: null,
               totalEnrollments: { $sum: 1 },
               enrolled: { $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] } },
               inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
               completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
               cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
            }
         }
      ]);
      
      const serviceStats = await Enrollment.aggregate([
         { $match: filter },
         {
            $group: {
               _id: '$service',
               count: { $sum: 1 }
            }
         }
      ]);
      
      res.json({
         success: true,
         stats: stats[0] || {
            totalEnrollments: 0,
            enrolled: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0
         },
         serviceStats: serviceStats
      });
   } catch (error) {
      console.error('Get enrollment stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Submit TNA enrollment for review
const submitTnaEnrollment = async (req, res) => {
   try {
      const { id } = req.params;
      const { tnaInfo } = req.body;
      
      const enrollment = await Enrollment.findById(id);
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      // Validate TNA info is complete
      if (!tnaInfo || !tnaInfo.affiliation || !tnaInfo.contactPerson || !tnaInfo.position || 
          !tnaInfo.officeAddress || !tnaInfo.contactNumber || !tnaInfo.emailAddress) {
         return res.status(400).json({
            success: false,
            message: 'All TNA information fields are required'
         });
      }
      
      // Update enrollment with TNA info and submit
      enrollment.tnaInfo = tnaInfo;
      enrollment.status = 'submitted';
      enrollment.tnaStatus = 'under_review';
      enrollment.submittedAt = new Date();
      
      await enrollment.save();
      await enrollment.populate('enrolledBy', 'firstName lastName email role');
      
      res.json({
         success: true,
         message: 'TNA enrollment submitted for review',
         enrollment: enrollment
      });
   } catch (error) {
      console.error('Submit TNA enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Review TNA enrollment (DOST MIMAROPA)
const reviewTnaEnrollment = async (req, res) => {
   try {
      const { id } = req.params;
      const { action, reviewNotes, reviewedBy } = req.body; // action: 'approve' or 'reject'
      
      const enrollment = await Enrollment.findById(id);
      if (!enrollment) {
         return res.status(404).json({
            success: false,
            message: 'Enrollment not found'
         });
      }
      
      if (enrollment.tnaStatus !== 'under_review') {
         return res.status(400).json({
            success: false,
            message: 'Enrollment is not under review'
         });
      }
      
      // Update enrollment based on review action
      if (action === 'approve') {
         enrollment.tnaStatus = 'approved';
         enrollment.status = 'approved';
         enrollment.reviewNotes = reviewNotes || '';
         enrollment.reviewedBy = reviewedBy;
         enrollment.reviewedAt = new Date();
      } else if (action === 'reject') {
         enrollment.tnaStatus = 'rejected';
         enrollment.status = 'rejected';
         enrollment.reviewNotes = reviewNotes || '';
         enrollment.reviewedBy = reviewedBy;
         enrollment.reviewedAt = new Date();
      } else {
         return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be "approve" or "reject"'
         });
      }
      
      await enrollment.save();
      await enrollment.populate('enrolledBy', 'firstName lastName email role');
      await enrollment.populate('reviewedBy', 'firstName lastName email role');
      
      res.json({
         success: true,
         message: `TNA enrollment ${action}d successfully`,
         enrollment: enrollment
      });
   } catch (error) {
      console.error('Review TNA enrollment error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get TNA enrollments for review (DOST MIMAROPA)
const getTnaEnrollmentsForReview = async (req, res) => {
   try {
      const { status } = req.query;
      
      const filter = { tnaStatus: status || 'under_review' };
      
      const enrollments = await Enrollment.find(filter)
         .populate('enrolledBy', 'firstName lastName email role')
         .populate('reviewedBy', 'firstName lastName email role')
         .sort({ submittedAt: -1 });
      
      res.json({
         success: true,
         enrollments: enrollments
      });
   } catch (error) {
      console.error('Get TNA enrollments for review error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get service options
const getServiceOptions = async (req, res) => {
   try {
      res.json({
         success: true,
         serviceOptions: serviceOptions
      });
   } catch (error) {
      console.error('Get service options error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

module.exports = {
   getAllEnrollments,
   getEnrollmentById,
   createEnrollment,
   updateEnrollment,
   updateStageStatus,
   deleteEnrollment,
   getEnrollmentStats,
   getServiceOptions,
   submitTnaEnrollment,
   reviewTnaEnrollment,
   getTnaEnrollmentsForReview
};
