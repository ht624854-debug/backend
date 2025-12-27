const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

// Admin routes
router.get('/admin/users', protect, authorize('admin'), authController.getAllUsers);
router.put('/admin/users/:id/role', protect, authorize('admin'), authController.updateUserRole);
router.delete('/admin/users/:id', protect, authorize('admin'), authController.deleteUser);

module.exports = router; 
