import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getClosedClients,
  getAllLeads,
  createLead,
  updateLead
} from '../controllers/sales.controller';

const router = Router();
router.use(authenticate);

// Get closed clients for project dropdown
router.get('/closed-clients', getClosedClients);

// Sales CRUD
router.get('/', getAllLeads);
router.post('/', createLead);
router.put('/:id', updateLead);

// Legacy routes
router.get('/pipeline', (_req, res) => {
  res.json({ message: 'Sales pipeline' });
});

router.get('/leads', getAllLeads);

router.get('/analytics', (_req, res) => {
  res.json({ message: 'Sales analytics' });
});

export default router;
