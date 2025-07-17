import { Request, Response } from 'express';
import Friendship from '../models/Friendship';
import User from '../models/User';
import { FriendshipStatusEnum } from '../shared';

/**
 * Create a new friendship between two users
 */
export const createFriendship = async (req: Request, res: Response): Promise<void> => {
    const { user1_id, user2_id } = req.body;

    try {
        if (user1_id === user2_id) {
            res.status(400).json({ message: 'A user cannot befriend themselves' });
            return;
        }

        // Check if both users exist
        const [user1, user2] = await Promise.all([
            User.findOne({ user_id: user1_id }),
            User.findOne({ user_id: user2_id })
        ]);

        if (!user1 || !user2) {
            res.status(404).json({ message: 'One or both users not found' });
            return;
        }

        // Check for existing friendship in either direction
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1_id: user1_id, user2_id: user2_id },
                { user1_id: user2_id, user2_id: user1_id },
            ],
        });

        if (existingFriendship) {
            res.status(400).json({ 
                message: 'Friendship already exists',
                current_status: existingFriendship.status,
                friendship_id: existingFriendship.friendship_id
            });
            return;
        }

        const friendship = new Friendship({
            user1_id: user1_id,
            user2_id: user2_id,
            requester_id: user1_id,
            status: FriendshipStatusEnum.REQUESTED,
        });

        await friendship.save();
        res.status(201).json({ message: 'Friendship request sent', friendship });
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

        if (friendships.length === 0) {
            return res.status(200).json({ message: 'No friendships found', friendships: [] });
        }

        // Transform friendships to include friend details
        const friendshipDetails = await Promise.all(
            friendships.map(async (friendship) => {
                const friendId = friendship.user1_id === user_id 
                    ? friendship.user2_id 
                    : friendship.user1_id;
                
                const friend = await User.findOne({ user_id: friendId }, 'user_id username email age college');
                
                return {
                    friendship_id: friendship.friendship_id,
                    friend: friend,
                    status: friendship.status,
                    is_requester: friendship.requester_id === user_id,
                    created_at: friendship.created_at
                };
            })
        );

        res.status(200).json({ 
            message: 'Friendships found', 
            friendships: friendshipDetails 
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Check friendship status between two users
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
            res.status(200).json({ 
                message: 'Friendship found',
                friendship_id: friendship.friendship_id,
                status: friendship.status,
                requester_id: friendship.requester_id,
                is_user1_requester: friendship.requester_id === user1_id
            });
        } else {
            res.status(404).json({ message: 'No friendship connection exists' });
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
        // Validate status
        if (!Object.values(FriendshipStatusEnum).includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status', 
                valid_statuses: Object.values(FriendshipStatusEnum) 
            });
        }

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

/**
 * Delete a friendship
 */
export const deleteFriendship = async (req: Request, res: Response) => {
    const { friendship_id } = req.params;

    try {
        const friendship = await Friendship.findOneAndDelete({ friendship_id: friendship_id });

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.status(200).json({ message: 'Friendship deleted', friendship });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};