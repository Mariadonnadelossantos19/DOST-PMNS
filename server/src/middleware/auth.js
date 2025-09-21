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

      // Check for mock token for testing
      if (token === 'mock-token-for-testing') {
         console.log('Using mock token for testing');
         // Create a mock user object for testing
         const mockUser = {
            _id: '68ceb300289e363622ed1d64',
            id: '68ceb300289e363622ed1d64',
            userId: '68ceb300289e363622ed1d64',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'proponent',
            status: 'active',
            province: 'Marinduque'
         };
         req.user = mockUser;
         return next();
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

      // Check if user is active (for all users)
      if (user.status !== 'active') {
         return res.status(403).json({
            success: false,
            message: 'Account is not active. Please contact your administrator.'
         });
      }

      // For proponents, check if they have been activated by PSTO
      if (user.role === 'proponent' && !user.activatedAt) {
         return res.status(403).json({
            success: false,
            message: 'Your account is pending activation by your Provincial Science and Technology Office (PSTO). Please contact your PSTO for activation.'
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
