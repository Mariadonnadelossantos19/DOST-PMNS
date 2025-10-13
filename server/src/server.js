require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const programRoutes = require('./routes/programRoutes');
const tnaRoutes = require('./routes/tnaRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const rtecMeetingRoutes = require('./routes/rtecMeetingRoutes');

// Import seed functions
const seedPSTOData = require('./utils/seedPSTO');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files with proper headers for viewing
app.use('/uploads', (req, res, next) => {
   // Set headers to allow viewing instead of downloading
   res.setHeader('Content-Disposition', 'inline');
   res.setHeader('X-Content-Type-Options', 'nosniff');
   next();
}, express.static('uploads'));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/tna', tnaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rtec-documents', require('./routes/rtecDocumentsRoutes'));
app.use('/api/funding-documents', require('./routes/fundingDocumentsRoutes'));
app.use('/api/rtec-meetings', rtecMeetingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Server error:', err);
   
   // Handle multer errors
   if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
         status: 'ERROR',
         message: 'File too large. Maximum size is 10MB.'
      });
   }
   
   if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
         status: 'ERROR',
         message: 'Unexpected field in file upload.'
      });
   }
   
   if (err.message && err.message.includes('Malformed part header')) {
      return res.status(400).json({
         status: 'ERROR',
         message: 'Invalid form data format. Please check your request.',
         error: process.env.NODE_ENV === 'development' ? err.message : 'Form data error'
      });
   }
   
   res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
   });
});

// 404 handler
app.use((req, res) => {
   res.status(404).json({
      status: 'ERROR',
      message: 'Route not found',
      path: req.originalUrl
   });
});

// MongoDB connection
const connectDB = async () => {
   try {
      const mongoURI = 'mongodb://localhost:27017/pmns';
      const conn = await mongoose.connect(mongoURI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
   } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
   }
};

// Start server
const startServer = async () => {
   try {
      // Connect to MongoDB
      console.log('🔄 Connecting to MongoDB...');
      await connectDB();
      
      // Seed PSTO data
      console.log('🌱 Seeding PSTO data...');
      await seedPSTOData();
      
      app.listen(PORT, () => {
         console.log(`🚀 Server running on port ${PORT}`);
         console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
         console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
         console.log(`📝 Enrollments API: http://localhost:${PORT}/api/enrollments`);
         console.log(`📋 Programs API: http://localhost:${PORT}/api/programs`);
         console.log(`   - SETUP: http://localhost:${PORT}/api/programs/setup`);
         console.log(`   - GIA: http://localhost:${PORT}/api/programs/gia`);
         console.log(`   - CEST: http://localhost:${PORT}/api/programs/cest`);
         console.log(`   - SSCP: http://localhost:${PORT}/api/programs/sscp`);
      });
   } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
   }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
   console.log('\n🛑 Shutting down server...');
   process.exit(0);
});

process.on('SIGTERM', () => {
   console.log('\n🛑 Shutting down server...');
   process.exit(0);
});

// Start the server
startServer();

module.exports = app;
