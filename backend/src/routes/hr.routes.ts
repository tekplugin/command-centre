import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/employees', (_req, res) => {
  res.json({ message: 'Employee list' });
});

router.get('/attendance', (_req, res) => {
  res.json({ message: 'Attendance records' });
});

router.get('/payroll', (_req, res) => {
  res.json({ message: 'Payroll data' });
});

export default router;
