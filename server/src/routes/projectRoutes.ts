import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  createTask,
  updateTaskStatus,
  updateProjectStatus
} from '../controllers/projectController.js';
import { authenticateJWT, optionalAuthJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuthJWT, getProjects);
router.get('/:id', optionalAuthJWT, getProjectById);
router.post('/', authenticateJWT, createProject);
router.put('/:id/status', authenticateJWT, updateProjectStatus);

// Tasks
router.post('/:id/tasks', authenticateJWT, createTask);
router.put('/:id/tasks/:taskId', authenticateJWT, updateTaskStatus);

export default router;
