import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/campaigns', (_req, res) => {
  res.json({ message: 'Marketing campaigns' });
});

router.get('/analytics', (_req, res) => {
  res.json({ message: 'Marketing analytics' });
});

export default router;
