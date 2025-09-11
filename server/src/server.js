const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Server error:', err);
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
      
      app.listen(PORT, () => {
         console.log(`🚀 Server running on port ${PORT}`);
         console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
         console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
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
