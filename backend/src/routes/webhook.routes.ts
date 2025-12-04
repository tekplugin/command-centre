import { Router } from 'express';
import { handleIncomingEmail } from '../controllers/webhook.controller';

const router = Router();

/**
 * @route POST /api/v1/webhooks/resend/incoming
 * @desc Handle incoming emails from Resend
 * @access Public (Resend webhook signature verified)
 */
router.post('/resend/incoming', handleIncomingEmail);

export default router;
