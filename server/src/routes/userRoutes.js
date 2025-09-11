const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, getUserById, updateUser, toggleUserStatus, activateUser, deactivateUser } = require('../controllers/userController');

// User management routes
router.get('/', getAllUsers);
router.post('/create', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User status management routes
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/activate', activateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
