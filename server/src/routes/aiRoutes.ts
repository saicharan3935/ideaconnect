import { Router } from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import { optionalAuthJWT } from '../middleware/auth.js';

const router = Router();

router.post('/chat', optionalAuthJWT, handleAIChat);

export default router;
