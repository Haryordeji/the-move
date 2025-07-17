import express from 'express';
import { getRecommendations, getRecommendationsCached } from '../controllers/recommendation.controller';

const router = express.Router();

router.post('/recommendations/new', getRecommendations);
router.get('/recommendations/:user_id', getRecommendationsCached);

export default router;