import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/link-token', (_req, res) => {
  res.json({ message: 'Plaid link token' });
});

router.post('/exchange-token', (_req, res) => {
  res.json({ message: 'Exchange public token' });
});

router.get('/accounts', (_req, res) => {
  res.json({ message: 'Bank accounts list' });
});

router.post('/sync', (_req, res) => {
  res.json({ message: 'Sync bank data' });
});

export default router;
