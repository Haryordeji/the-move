import express from 'express';
import { getRecommendations, getRecommendationsCached } from '../controllers/recommendation.controller';

const router = express.Router();

router.get('/recommendations/new', getRecommendations);
router.get('/recommendations/current', getRecommendationsCached);

export default router;