import express from 'express';
import { Request, Response } from 'express';

import {
    createFriendship,
    getFriendships,
    checkFriendshipStatus,
    updateFriendshipStatus,
    deleteFriendship,
} from "../controllers/friendship.controller"

const router = express.Router();

router.post('/friendship', async (req: Request, res: Response) => {
    await createFriendship(req, res);
});
router.get('/friendships/:user_id', async (req: Request, res: Response) => {
    await getFriendships(req, res);
});
router.post('/friendship/check', async (req: Request, res: Response) => {
    await checkFriendshipStatus(req, res);
});
router.put('/friendship', async (req: Request, res: Response) => {
    await updateFriendshipStatus(req, res);
});
router.delete('/friendship/:friendship_id', async (req: Request, res: Response) => {
    await deleteFriendship(req, res);
});

export default router;
