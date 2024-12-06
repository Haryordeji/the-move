import { Request, Response } from 'express';
import Friendship from '../models/Friendship';
import User from '../models/User';

/**
 * Create a new friendship between two users
 */
export const createFriendship = async (req: Request, res: Response) => {
    const { user1_id, user2_id, status } = req.body;

    try {
        if (user1_id === user2_id) {
            return res.status(400).json({ message: 'A user cannot befriend themselves' });
        }

        const user1 = await User.findById(user1_id);
        const user2 = await User.findById(user2_id);

        if (!user1 || !user2) {
            return res.status(404).json({ message: 'One or both users not found' });
        }

        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1: user1_id, user2: user2_id },
                { user1: user2_id, user2: user1_id },
            ],
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Friendship already exists' });
        }

        const friendship = new Friendship({
            user1: user1_id,
            user2: user2_id,
            status: status || 'Pending',
        });

        await friendship.save();
        res.status(201).json({ message: 'Friendship created', friendship });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get all friendships for a given user
 */
export const getFriendships = async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        const friendships = await Friendship.find({
            $or: [{ user1: user_id }, { user2: user_id }],
        })
            .populate('user1', 'username email')
            .populate('user2', 'username email');

        res.status(200).json({ friendships });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Check if two users are friends
 */
export const checkFriendshipStatus = async (req: Request, res: Response) => {
    const { user1_id, user2_id } = req.body;

    try {
        const friendship = await Friendship.findOne({
            $or: [
                { user1: user1_id, user2: user2_id },
                { user1: user2_id, user2: user1_id },
            ],
        });

        if (friendship) {
            res.status(200).json({ message: 'Users are friends', status: friendship.status });
        } else {
            res.status(404).json({ message: 'Users are not friends' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Update the status of a friendship
 */
export const updateFriendshipStatus = async (req: Request, res: Response) => {
    const { friendship_id, status } = req.body;

    try {
        const friendship = await Friendship.findByIdAndUpdate(
            friendship_id,
            { status },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json({ message: 'Friendship status updated', friendship });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Delete a friendship
 */
export const deleteFriendship = async (req: Request, res: Response) => {
    const { friendship_id } = req.params;

    try {
        const friendship = await Friendship.findByIdAndDelete(friendship_id);

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json({ message: 'Friendship deleted', friendship });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};