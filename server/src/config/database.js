const mongoose = require('mongoose');

// MongoDB connection configuration
const connectDB = async () => {
   try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
         throw new Error('MONGODB_URI environment variable is not defined');
      }
      
      const conn = await mongoose.connect(mongoURI);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
   } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
   }
};

// Test database connection
const testConnection = async () => {
   try {
      await connectDB();
      console.log('✅ Database connection test successful');
      return true;
   } catch (error) {
      console.error('❌ Database connection test failed:', error.message);
      return false;
   }
};

module.exports = {
   connectDB,
   testConnection
};