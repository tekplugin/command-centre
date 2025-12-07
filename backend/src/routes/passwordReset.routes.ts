import { Router } from 'express';
import { forgotPassword, resetPassword, verifyResetToken } from '../controllers/passwordReset.controller';

const router = Router();

// Request password reset
router.post('/forgot-password', forgotPassword);

// Reset password with token
router.post('/reset-password', resetPassword);

// Verify reset token
router.get('/verify-token/:token', verifyResetToken);

export default router;
