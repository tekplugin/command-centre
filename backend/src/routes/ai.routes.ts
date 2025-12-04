import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/chat', (_req, res) => {
  res.json({ message: 'AI chat response' });
});

router.post('/analyze', (_req, res) => {
  res.json({ message: 'AI analysis' });
});

router.get('/insights', (_req, res) => {
  res.json({ message: 'AI-generated insights' });
});

export default router;
