// src/controllers/recommendation.controller.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Venue from '../models/Venue';
import Recommendation from '../models/Recommendation';

/**
 * Get recommendations for a user
 */
export const getRecommendations = async (req: Request, res: Response) => {
    const { user_id, radius } = req.body; // radius in meters

    try {
        const user = await User.findOne({ user_id });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find venues within the specified radius if user's last location is available
        let venues = [];
        if (user.last_location) {
            venues = await Venue.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: user.last_location.coordinates,
                        },
                        $maxDistance: radius,
                    },
                },
            });
        } else {
            venues = await Venue.find();
        }

        // Sort venues by some age similarity to user, arbitraty if avg_age is not available
        
        const sortedVenues = venues.sort((a, b) => {
            const userAge = user.age;
            const aAge = a.avg_age || 0;
            const bAge = b.avg_age || 0;

            const aDiff = Math.abs(userAge - aAge);
            const bDiff = Math.abs(userAge - bAge);

            return aDiff - bDiff;
        });

        // Get top 4 venues
        const top4Venues = sortedVenues.slice(0, 4);

        // Save the recommendation
        const recommendation = new Recommendation({
            user_id,
            recommended_venues: top4Venues.map((venue) => venue.venue_id),
        });

        await recommendation.save();

        res.status(200).json({ message: 'Recommendations generated', recommendation });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};