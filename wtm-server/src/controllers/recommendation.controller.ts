// src/controllers/recommendation.controller.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Venue from '../models/Venue';
import Recommendation from '../models/Recommendation';
import { findMutualFriends } from '../helpers/friendshipHelper';

/**
 * Get recommendations for a user
 */
export const getRecommendations = async (req: Request, res: Response) => {
    const { user_id } = req.body; 

    try {
        const user = await User.findOne({ user_id });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find venues within the specified radius if user's last location is available
        const venues = user.last_location
            ? await Venue.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: user.last_location,
                        },
                        $maxDistance: 2500, // 2.5km placeholder
                    },
                },
            })
            : [];

        // Find mutual friends up to 3 degrees
        const mutualFriends = await findMutualFriends(user_id, 3);

        // Calculate scores for each venue
        const scoredVenues = venues.map((venue) => {
            // Age similarity score (closer is better)
            const ageDiff = venue.avg_age !== undefined ? Math.abs(venue.avg_age - user.age) : Math.abs(21 - user.age);
            const ageScore = 1 / (1 + ageDiff); // nomarlization 

            // Mutual friends score (more is better)
            const mutualFriendsInVenue = venue.current_visitors.filter((visitor) =>
                mutualFriends.includes(visitor)
            ).length;
            const mutualFriendsScore = mutualFriendsInVenue / mutualFriends.length; // Normalize to [0, 1]

            // equal weightage to both scores
            const combinedScore = 0.5 * ageScore + 0.5 * mutualFriendsScore;

            return {
                ...venue.toObject(),
                score: combinedScore,
            };
        });

        // Sort venues by combined score
        const sortedVenues = scoredVenues.sort((a, b) => b.score - a.score);

        // Get top 4 venues
        const top4Venues = sortedVenues.slice(0, 4);

        // Save the recommendation
        const recommendation = new Recommendation({
            user_id,
            recommended_venues: top4Venues.map((venue) => venue.venue_id),
            timestamp: new Date(),
        });

        await recommendation.save();

        res.status(200).json({ message: 'Recommendations generated', recommendation });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// return already saved recommendations for a given user_id, only recompute if the last recommendation is older than 25mins
export const getRecommendationsCached = async (req: Request, res: Response) => {
    const { user_id } = req.params;

    try {
        const lastRecommendation = await Recommendation.findOne({ user_id }).sort({ timestamp: -1 });

        if (lastRecommendation && Date.now() - lastRecommendation.timestamp.getTime() < 25 * 60 * 1000) {
            res.status(200).json({ message: 'Recommendations found', recommendation: lastRecommendation });
            return;
        }

        // If no recommendations found or the last recommendation is older than 25 mins, recompute
        getRecommendations(req, res);
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};