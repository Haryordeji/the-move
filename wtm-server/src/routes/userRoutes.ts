import express from 'express';
import { Request, Response } from 'express';

import {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getFullUserProfile,
} from '../controllers/user.controller';

const router = express.Router();

// Create a new user
router.post('/user', async (req: Request, res: Response) => {
    await createUser(req, res);
});

// Get a user by ID
router.get('/user/:user_id', async (req: Request, res: Response) => {
    await getUserById(req, res);
});

// Get all users
router.get('/users', async (_req: Request, res: Response) => {
    await getAllUsers(_req, res);
});

// Update a user by ID
router.put('/user/:user_id', async (req: Request, res: Response) => {
    await updateUser(req, res);
});

// Delete a user by ID
router.delete('/user/:user_id', async (req: Request, res: Response) => {
    await deleteUser(req, res);
});

// Get full user profile (with friends)
router.get('/user/:user_id/full-profile', async (req: Request, res: Response) => {
    await getFullUserProfile(req, res);
});

export default router;