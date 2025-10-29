const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

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

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
         userId,
         firstName,
         lastName,
         email,
         password: hashedPassword,
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
      const { email, password, rememberMe } = req.body || {};
      console.log('[AUTH] /login request', {
         hasBody: !!req.body,
         emailProvided: !!email,
         mongooseState: require('mongoose').connection.readyState
      });
      
      // Basic validation
      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: 'Email and password are required'
         });
      }

      // Find user by email (case-insensitive)
      const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
      console.log('[AUTH] user lookup', { found: !!user });
      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
         });
      }

      // Check password - handle both hashed and plain text passwords
      let isPasswordValid = false;
      
      // Check if password is hashed (starts with $2a$ or $2b$)
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
         // Password is hashed, use bcrypt to compare
         isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
         // Password is plain text, compare directly (for backward compatibility)
         isPasswordValid = user.password === password;
      }
      console.log('[AUTH] password valid?', isPasswordValid);
      
      if (!isPasswordValid) {
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
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

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      if (!process.env.JWT_SECRET) {
         console.warn('[AUTH] JWT_SECRET not set, using default fallback');
      }
      const token = jwt.sign(
         { 
            id: user._id,
            userId: user.userId,
            email: user.email,
            role: user.role
         },
         JWT_SECRET,
         { expiresIn: '24h' }
      );

      res.json({
         success: true,
         message: 'Login successful',
         token: token,
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

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
         // For security, don't reveal if email exists or not
         return res.json({
            success: true,
            message: 'If an account with that email exists, password reset instructions have been sent.'
         });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Send password reset email
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      // Try to send email, but don't fail if it doesn't work
      try {
         const emailResult = await sendPasswordResetEmail(
            user.email, 
            user.firstName, 
            resetUrl
         );

         if (emailResult.success) {
            console.log('Password reset email sent successfully to:', user.email);
         } else {
            console.error('Failed to send password reset email:', emailResult.error);
         }
      } catch (emailError) {
         console.error('Email service error:', emailError.message);
      }

      // Always return success with reset URL for testing
      res.json({
         success: true,
         message: 'Password reset instructions have been sent. Check your email or use the link below for testing.',
         resetUrl: resetUrl // Always return URL for testing
      });
   } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Reset password
const resetPassword = async (req, res) => {
   try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
         return res.status(400).json({
            success: false,
            message: 'Token and new password are required'
         });
      }

      if (newPassword.length < 6) {
         return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
         });
      }

      // Find user with valid reset token
      const user = await User.findOne({
         resetPasswordToken: token,
         resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
         return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
         });
      }

      // Update password and clear reset token
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
 
      res.json({
         success: true,
         message: 'Password has been reset successfully'
      });
   } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
   try {
      const { token } = req.params;
      
      if (!token) {
         return res.status(400).json({
            success: false,
            message: 'Token is required'
         });
      }

      // Find user with valid reset token
      const user = await User.findOne({
         resetPasswordToken: token,
         resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
         return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
         });
      }

      res.json({
         success: true,
         message: 'Token is valid',
         user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
         }
      });
   } catch (error) {
      console.error('Verify reset token error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

module.exports = {
   register,
   login,
   forgotPassword,
   resetPassword,
   verifyResetToken
};
