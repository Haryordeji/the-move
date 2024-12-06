import { Request, Response } from 'express';
import User from '../models/User';
import Friendship from '../models/Friendship';

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, age, college, last_location } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }

        const user = new User({
            username,
            email,
            age,
            college,
            last_location,
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req.params;

    try {
        const user = await User.findOne({ user_id: user_id })

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get all users
 */
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Update user by ID
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req.params;
    const updates = req.body;

    try {
        const user = await User.findOneAndUpdate({user_id: user_id}, updates, { new: true });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req.params;

    try {
        const user = await User.findOneAndDelete({user_id: user_id});

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get full user profile, including friends
 */

export const getFullUserProfile = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req.params;

    try {
        // Fetch user details
        const user = await User.findOne({user_id: user_id});

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Fetch friendships for the user
        const friendships = await Friendship.find({
            $or: [{ user1_id: user_id }, { user2_id: user_id }],
        })
            .populate('user1_id', 'status')
            .populate('user2_id', 'status');

        const friends = friendships.map((friendship) => {
            if (friendship.user1_id === user_id) {
                return { user_id: friendship.user2_id, status: friendship.status };
            } else {
                return {user_id: friendship.user1_id, status: friendship.status}; 
            }
        });

        res.status(200).json({
            user,
            friends,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

