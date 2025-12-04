import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('companyName').trim().notEmpty(),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
