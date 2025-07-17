import { Request, Response } from 'express';
import Venue from '../models/Venue';
import User from '../models/User';

/**
 * Create a new venue
 */
export const createVenue = async (req: Request, res: Response): Promise<void> => {
    const { name, address, location, category, avg_age } = req.body;

    try {
        const venue = new Venue({
            name,
            address,
            location,
            category,
            avg_age,
        });

        await venue.save();
        res.status(201).json({ message: 'Venue created successfully', venue });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get all venues
 */
export const getAllVenues = async (_req: Request, res: Response): Promise<void> => {
    try {
        const venues = await Venue.find();
        res.status(200).json({ venues });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get venue by ID
 */
export const getVenueById = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;

    try {
        const venue = await Venue.findOne({ venue_id });

        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        res.status(200).json({ venue });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Update venue by ID
 */
export const updateVenue = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;
    const updates = req.body;

    try {
        const venue = await Venue.findOneAndUpdate({ venue_id }, updates, { new: true });

        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        res.status(200).json({ message: 'Venue updated successfully', venue });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Delete venue by ID
 */
export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;

    try {
        const venue = await Venue.findOneAndDelete({ venue_id });

        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        res.status(200).json({ message: 'Venue deleted successfully', venue });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Add a user to venue visitors
 */
export const addVisitorToVenue = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;
    const { user_id } = req.body;

    try {
        // Verify user exists
        const user = await User.findOne({ user_id });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update user's last_seen
        user.last_seen = new Date();
        await user.save();

        // Add user to venue if not already there
        const venue = await Venue.findOneAndUpdate(
            { venue_id },
            { 
                $addToSet: { current_visitors: user_id },
                $set: { last_updated: new Date() }
            },
            { new: true }
        );

        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        res.status(200).json({ 
            message: 'User added to venue', 
            venue: {
                venue_id: venue.venue_id,
                name: venue.name,
                visitor_count: venue.current_visitors.length,
                avg_age: venue.avg_age
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Remove a user from venue visitors
 */
export const removeVisitorFromVenue = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;
    const { user_id } = req.body;

    try {
        const venue = await Venue.findOneAndUpdate(
            { venue_id },
            { 
                $pull: { current_visitors: user_id },
                $set: { last_updated: new Date() }
            },
            { new: true }
        );

        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        res.status(200).json({ 
            message: 'User removed from venue', 
            venue: {
                venue_id: venue.venue_id,
                name: venue.name,
                visitor_count: venue.current_visitors.length,
                avg_age: venue.avg_age
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get current visitors of a venue
 */
export const getVenueVisitors = async (req: Request, res: Response): Promise<void> => {
    const { venue_id } = req.params;

    try {
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            res.status(404).json({ message: 'Venue not found' });
            return;
        }

        // Get visitor details
        const visitors = await User.find(
            { user_id: { $in: venue.current_visitors } },
            'user_id username age college last_seen'
        );

        res.status(200).json({
            venue_id: venue.venue_id,
            name: venue.name,
            visitor_count: visitors.length,
            avg_age: venue.avg_age,
            visitors: visitors
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
