const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
   try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      console.log('Auth middleware - Token received:', token ? 'Token present' : 'No token');
      
      if (!token) {
         return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
         });
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      console.log('Auth middleware - JWT_SECRET:', JWT_SECRET);
      
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Auth middleware - Decoded token:', decoded);
      
      const user = await User.findById(decoded.id).select('-password');
      console.log('Auth middleware - User found:', user ? 'Yes' : 'No');
      
      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Invalid token. User not found.'
         });
      }

      req.user = user;
      next();
   } catch (error) {
      console.error('Auth middleware error:', error.message);
      res.status(401).json({
         success: false,
         message: 'Invalid token.'
      });
   }
};

module.exports = auth;
