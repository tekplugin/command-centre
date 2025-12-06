import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  getUserStats
} from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

// Get user statistics (executives and admins)
router.get(
  '/stats',
  authorize(UserRole.EXECUTIVE, UserRole.ADMIN),
  getUserStats
);

// Get all users in company
router.get(
  '/',
  authorize(UserRole.EXECUTIVE, UserRole.ADMIN),
  getAllUsers
);

// Get single user by ID
router.get(
  '/:id',
  authorize(UserRole.EXECUTIVE, UserRole.ADMIN),
  getUserById
);

// Create new user (admin only)
router.post(
  '/',
  authorize(UserRole.ADMIN),
  createUser
);

// Update user (admin only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  updateUser
);

// Delete/deactivate user (admin only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  deleteUser
);

// Change user role (admin only)
router.patch(
  '/:id/role',
  authorize(UserRole.ADMIN),
  changeUserRole
);

// Legacy team endpoint
router.get('/team', authorize(UserRole.EXECUTIVE, UserRole.ADMIN), getAllUsers);

export default router;
