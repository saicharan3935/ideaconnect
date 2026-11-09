import { Router } from 'express';
import {
  getIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  getMyCuratedIdeas,
  toggleSaveIdea,
  toggleInterestIdea,
  getSimilarIdeas,
  getPeopleForIdea
} from '../controllers/ideaController.js';
import { authenticateJWT, optionalAuthJWT } from '../middleware/auth.js';

const router = Router();

// List & Discovery
router.get('/', optionalAuthJWT, getIdeas);
router.get('/my/curated', authenticateJWT, getMyCuratedIdeas);
router.get('/:id/similar', getSimilarIdeas);
router.get('/:id/people', getPeopleForIdea);
router.get('/:id', optionalAuthJWT, getIdeaById);

// Creation & Management
router.post('/', authenticateJWT, createIdea);
router.put('/:id', authenticateJWT, updateIdea);
router.delete('/:id', authenticateJWT, deleteIdea);

// Bookmarks & Interactions
router.post('/:id/save', authenticateJWT, toggleSaveIdea);
router.post('/:id/interest', authenticateJWT, toggleInterestIdea);

export default router;
