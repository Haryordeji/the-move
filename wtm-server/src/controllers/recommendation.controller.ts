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
        const venues = user.last_location && 
                      Array.isArray(user.last_location.coordinates) && 
                      user.last_location.coordinates.length === 2
            ? await Venue.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: user.last_location.coordinates,
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
            const ageScore = 1 / (1 + ageDiff); // normalization 

            // Mutual friends score (more is better)
            // Fixed division by zero risk
            const mutualFriendsInVenue = venue.current_visitors.filter((visitor) =>
                mutualFriends.includes(visitor)
            ).length;
            const mutualFriendsScore = mutualFriends.length > 0 
                ? mutualFriendsInVenue / mutualFriends.length 
                : 0; // Prevent division by zero

            // Calculate distance from user to venue
            let distance = 0;
            if (user.last_location && venue.location) {
                const userCoords = user.last_location.coordinates;
                const venueCoords = venue.location.coordinates;
                
                // Calculate distance using Haversine formula
                const R = 6371; // Earth's radius in km
                const dLat = (venueCoords[1] - userCoords[1]) * Math.PI / 180;
                const dLon = (venueCoords[0] - userCoords[0]) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userCoords[1] * Math.PI / 180) * Math.cos(venueCoords[1] * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance = R * c; // Distance in km
            }

            // Weighted scoring (giving more weight to mutual friends)
            const combinedScore = 0.3 * ageScore + 0.7 * mutualFriendsScore;

            return {
                venue_id: venue.venue_id,
                name: venue.name,
                category: venue.category,
                address: venue.address,
                distance: distance.toFixed(1), // Distance in km, one decimal place
                avg_age: venue.avg_age || 'N/A',
                visitor_count: venue.current_visitors.length,
                mutual_friends: {
                    count: mutualFriendsInVenue,
                    // You could potentially expand this to include names of mutual friends
                    ids: venue.current_visitors.filter(visitor => mutualFriends.includes(visitor))
                },
                score: combinedScore,
                // Include scores for transparency during testing
                score_breakdown: {
                    age_score: ageScore,
                    mutual_friends_score: mutualFriendsScore
                }
            };
        });

        // Sort venues by combined score
        const sortedVenues = scoredVenues.sort((a, b) => b.score - a.score);

        // Get top 4 venues
        const top4Venues = sortedVenues.slice(0, 4);

        // Save the recommendation (storing only venue IDs)
        const recommendation = new Recommendation({
            user_id,
            recommended_venues: top4Venues.map((venue) => venue.venue_id),
            timestamp: new Date(),
        });

        await recommendation.save();

        res.status(200).json({ 
            message: 'Recommendations generated', 
            recommendation: {
                recommendation_id: recommendation.recommendation_id,
                user_id: recommendation.user_id,
                timestamp: recommendation.timestamp,
                venues: top4Venues // Return detailed venue information
            }
        });
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