import { Router } from 'express';
import { register, login, getMe, forgotPassword, checkUsername } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/check-username', checkUsername);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
