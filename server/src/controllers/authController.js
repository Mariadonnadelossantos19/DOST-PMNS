const User = require('../models/User');

// Register new user
const register = async (req, res) => {
   try {
      console.log('Registration request body:', req.body);
      const { firstName, lastName, email, password, role, department, position, province } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !password || !role || !department || !position) {
         return res.status(400).json({
            success: false,
            message: 'Missing required fields: firstName, lastName, email, password, role, department, position'
         });
      }

      // Validate role
      const validRoles = ['psto', 'dost_mimaropa', 'super_admin'];
      if (!validRoles.includes(role)) {
         return res.status(400).json({
            success: false,
            message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
         });
      }

      // Validate province for PSTO role
      if (role === 'psto' && !province) {
         return res.status(400).json({
            success: false,
            message: 'Province is required for PSTO role'
         });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
         });
      }

   // Generate user ID based on role
   let userId;
   if (role === 'psto') {
      // Check if province already has a PSTO user
      const existingPSTO = await User.findOne({ role: 'psto', province });
      if (existingPSTO) {
         return res.status(400).json({ 
            success: false, 
            message: `Only one PSTO user allowed per province. ${province} already has a PSTO user.` 
         });
      }
      
      userId = `PSTO_${province.replace(/\s+/g, '')}`;
   } else if (role === 'dost_mimaropa') {
      userId = 'DOST_MIMAROPA';
   } else if (role === 'super_admin') {
      userId = 'Super_Admin';
   } else {
      userId = `USER_${Date.now()}`;
   }

      // Create new user
      const newUser = new User({
         userId,
         firstName,
         lastName,
         email,
         password, // In production, hash this password
         role,
         department,
         position,
         province: role === 'psto' ? province : undefined,
         status: 'active',
         createdBy: null // Will be set by super admin when creating users
      });

      await newUser.save();

      res.json({
         success: true,
         message: 'Registration successful',
         user: {
            id: newUser._id,
            userId: newUser.userId,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            position: newUser.position,
            province: newUser.province,
            status: newUser.status
         }
      });
   } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Login user
const login = async (req, res) => {
   try {
      const { email, password, rememberMe } = req.body;
      
      // Basic validation
      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: 'Email and password are required'
         });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
         });
      }

      // Check password (in production, use bcrypt to compare hashed passwords)
      if (user.password !== password) {
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
         });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
         success: true,
         message: 'Login successful',
         token: 'jwt_token_' + Date.now(), // In production, use JWT
         user: {
            id: user._id,
            userId: user.userId,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
            department: user.department,
            position: user.position,
            province: user.province
         }
      });
   } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Forgot password
const forgotPassword = async (req, res) => {
   try {
      const { email } = req.body;
      
      if (!email) {
         return res.status(400).json({
            success: false,
            message: 'Email is required'
         });
      }

      res.json({
         success: true,
         message: 'Password reset instructions sent to your email'
      });
   } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

module.exports = {
   register,
   login,
   forgotPassword
};
