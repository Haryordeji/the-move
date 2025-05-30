import { Request, Response } from 'express';
import Friendship from '../models/Friendship';
import User from '../models/User';
import { FriendshipStatusEnum } from '../shared';

/**
 * Create a new friendship between two users
 * New friendship status is 'Pending' by default
 * Requesting friend is user1_id by default
 */
export const createFriendship = async (req: Request, res: Response) => {
    const { user1_id, user2_id } = req.body;

    try {
        if (user1_id === user2_id) {
            return res.status(400).json({ message: 'A user cannot befriend themselves' });
        }

        const user1 = await User.findOne({ user_id: user1_id });        
        const user2 = await User.findOne({user_id: user2_id});

        if (!user1 || !user2) {
            return res.status(404).json({ message: 'One or both users not found' });
        }

        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1_id: user1_id, user2_id: user2_id },
                { user1_id: user2_id, user2_id: user1_id },
            ],
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Friendship already exists' });
        }

        const friendship = new Friendship({
            user1_id: user1_id,
            user2_id: user2_id,
            requester_id: user1_id, // User1 is the requester
            status: FriendshipStatusEnum.REQUESTED, // Fixed enum reference
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
            $or: [
                { user1_id: user_id },
                { user2_id: user_id },
            ],
        });

        if (!friendships) {
            return res.status(404).json({ message: 'No friendships found' });
        }

        res.status(200).json({ message: 'Friendships found', friendships });
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
                { user1_id: user1_id, user2_id: user2_id },
                { user1_id: user2_id, user2_id: user1_id },
            ],
        });

        if (friendship) {
            res.status(200).json({ message: 'Current Friendship status', status: friendship.status });
        } else {
            res.status(404).json({ message: 'No Frienship Connection' });
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
        // Fixed query to find by friendship_id field, not _id
        const friendship = await Friendship.findOneAndUpdate(
            { friendship_id: friendship_id },
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

export const deleteFriendship = async (req: Request, res: Response) => {
    const { friendship_id } = req.params;

    try {
        // Fixed query to find by friendship_id field
        const friendship = await Friendship.findOneAndDelete({ friendship_id: friendship_id });

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json({ message: 'Friendship deleted', friendship });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
