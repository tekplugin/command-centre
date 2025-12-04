import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

router.get('/team', authorize(UserRole.EXECUTIVE, UserRole.ADMIN), (_req, res) => {
  // Get team members logic
  res.json({ message: 'Team members list' });
});

export default router;
