import { Router } from 'express';
import {
  getUserByUsername,
  updateProfile,
  getUsers,
  getConnections,
  handleConnection
} from '../controllers/userController.js';
import { authenticateJWT, optionalAuthJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuthJWT, getUsers);
router.get('/connections', authenticateJWT, getConnections);
router.post('/connections', authenticateJWT, handleConnection);
router.put('/profile', authenticateJWT, updateProfile);
router.get('/:username', optionalAuthJWT, getUserByUsername);

export default router;
