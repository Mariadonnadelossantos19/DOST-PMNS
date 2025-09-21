const express = require('express');
const router = express.Router();
const { getAllUsers, getProponentsByPSTO, createUser, deleteUser, getUserById, updateUser, toggleUserStatus, activateUser, deactivateUser, activateProponent, getPendingProponents, resetProponentPassword } = require('../controllers/userController');
const auth = require('../middleware/auth');

// User management routes
router.get('/', getAllUsers);
router.get('/psto/:province/proponents', getProponentsByPSTO);
router.post('/create', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User status management routes
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/activate', activateUser);
router.patch('/:id/deactivate', deactivateUser);

// PSTO proponent management routes
router.get('/psto/pending-proponents', auth, getPendingProponents);
router.patch('/psto/activate-proponent/:proponentId', auth, activateProponent);
router.patch('/psto/reset-password/:proponentId', auth, resetProponentPassword);

module.exports = router;
