// src/controllers/venue.controller.ts
import { Request, Response } from 'express';
import Venue from '../models/Venue';

/**
 * Create a new venue
 */
export const createVenue = async (req: Request, res: Response) => {
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
export const getAllVenues = async (_req: Request, res: Response) => {
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
export const getVenueById = async (req: Request, res: Response) => {
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
export const updateVenue = async (req: Request, res: Response) => {
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
export const deleteVenue = async (req: Request, res: Response) => {
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