import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', (_req, res) => {
  res.json({ message: 'Financial dashboard data' });
});

router.get('/transactions', (_req, res) => {
  res.json({ message: 'Transactions list' });
});

router.get('/analytics', (_req, res) => {
  res.json({ message: 'Financial analytics' });
});

export default router;
