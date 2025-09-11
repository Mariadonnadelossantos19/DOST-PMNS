const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
   try {
      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
      
      res.json({
         success: true,
         users: users
      });
   } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Create new user (for super admin)
const createUser = async (req, res) => {
   try {
      console.log('Create user request body:', req.body);
      const { firstName, lastName, email, role, department, position, province, password, createdBy } = req.body;
      
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
         createdBy: null // Will be set when we have proper user authentication
      });

      await newUser.save();

      res.json({
         success: true,
         message: 'User created successfully',
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
            status: newUser.status,
            createdAt: newUser.createdAt,
            createdBy: newUser.createdBy
         }
      });
   } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
   }
};

// Delete user
const deleteUser = async (req, res) => {
   try {
      const { id } = req.params;
      
      const user = await User.findByIdAndDelete(id);
      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      res.json({
         success: true,
         message: 'User deleted successfully',
         userId: user.userId
      });
   } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Get user by ID
const getUserById = async (req, res) => {
   try {
      const { id } = req.params;
      
      const user = await User.findById(id, { password: 0 });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      res.json({
         success: true,
         user: user
      });
   } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Update user
const updateUser = async (req, res) => {
   try {
      const { id } = req.params;
      const { firstName, lastName, email, role, department, position, province, status } = req.body;
      
      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== existingUser.email) {
         const emailExists = await User.findOne({ email, _id: { $ne: id } });
         if (emailExists) {
            return res.status(400).json({
               success: false,
               message: 'Email already exists for another user'
            });
         }
      }

      // Prepare update data
      const updateData = {
         firstName: firstName || existingUser.firstName,
         lastName: lastName || existingUser.lastName,
         email: email || existingUser.email,
         role: role || existingUser.role,
         department: department || existingUser.department,
         position: position || existingUser.position,
         status: status || existingUser.status
      };

      // Add province for personnel role
      if (role === 'personnel' && province) {
         updateData.province = province;
      } else if (role !== 'personnel') {
         updateData.province = undefined;
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
         id,
         updateData,
         { new: true, runValidators: true }
      ).select('-password');

      res.json({
         success: true,
         message: 'User updated successfully',
         user: updatedUser
      });
   } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Toggle user status (activate/deactivate)
const toggleUserStatus = async (req, res) => {
   try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      // Toggle status between active and inactive
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const updatedUser = await User.findByIdAndUpdate(
         id,
         { status: newStatus },
         { new: true, runValidators: true }
      ).select('-password');

      res.json({
         success: true,
         message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
         user: updatedUser
      });
   } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Activate user
const activateUser = async (req, res) => {
   try {
      const { id } = req.params;
      
      const user = await User.findByIdAndUpdate(
         id,
         { status: 'active' },
         { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      res.json({
         success: true,
         message: 'User activated successfully',
         user: user
      });
   } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

// Deactivate user
const deactivateUser = async (req, res) => {
   try {
      const { id } = req.params;
      
      const user = await User.findByIdAndUpdate(
         id,
         { status: 'inactive' },
         { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      res.json({
         success: true,
         message: 'User deactivated successfully',
         user: user
      });
   } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

module.exports = {
   getAllUsers,
   createUser,
   deleteUser,
   getUserById,
   updateUser,
   toggleUserStatus,
   activateUser,
   deactivateUser
};
