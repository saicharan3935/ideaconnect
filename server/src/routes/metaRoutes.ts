import { Router } from 'express';
import { getPlatformStats, getTaxonomy } from '../controllers/statsController.js';

const router = Router();

router.get('/stats', getPlatformStats);
router.get('/taxonomy', getTaxonomy);

export default router;
