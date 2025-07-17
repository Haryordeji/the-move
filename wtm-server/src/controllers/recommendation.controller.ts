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
                        $maxDistance: 2500, // 2.5km
                    },
                },
            })
            : [];

        // Find mutual friends up to 3 degrees
        const mutualFriends = await findMutualFriends(user_id, 3);

        // Calculate scores for each venue
        const scoredVenues = venues.map((venue) => {
            // Age similarity score (closer is better)
            const venueAvgAge = venue.avg_age ?? 25; // Default age if not set
            const ageDiff = Math.abs(venueAvgAge - user.age);
            const ageScore = 1 / (1 + ageDiff);

            // Mutual friends score (more is better)
            const mutualFriendsInVenue = venue.current_visitors.filter((visitor) =>
                mutualFriends.includes(visitor)
            ).length;
            
            // Fix: Prevent division by zero
            const mutualFriendsScore = mutualFriends.length > 0 
                ? mutualFriendsInVenue / mutualFriends.length 
                : 0;

            // Calculate distance from user to venue
            let distance = 0;
            if (user.last_location && venue.location) {
                const userCoords = user.last_location.coordinates;
                const venueCoords = venue.location.coordinates;
                
                // Haversine formula for distance calculation
                const R = 6371; // Earth's radius in km
                const dLat = (venueCoords[1] - userCoords[1]) * Math.PI / 180;
                const dLon = (venueCoords[0] - userCoords[0]) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userCoords[1] * Math.PI / 180) * Math.cos(venueCoords[1] * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance = R * c;
            }

            // Weighted scoring
            const combinedScore = 0.3 * ageScore + 0.7 * mutualFriendsScore;

            return {
                venue_id: venue.venue_id,
                name: venue.name,
                category: venue.category,
                address: venue.address,
                distance: parseFloat(distance.toFixed(1)),
                avg_age: venue.avg_age || 'N/A',
                visitor_count: venue.current_visitors.length,
                mutual_friends: {
                    count: mutualFriendsInVenue,
                    ids: venue.current_visitors.filter(visitor => mutualFriends.includes(visitor))
                },
                score: combinedScore,
                score_breakdown: {
                    age_score: ageScore,
                    mutual_friends_score: mutualFriendsScore
                }
            };
        });

        // Sort venues by combined score (highest first)
        const sortedVenues = scoredVenues.sort((a, b) => b.score - a.score);
        const top4Venues = sortedVenues.slice(0, 4);

        // Save the recommendation
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
                venues: top4Venues
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getRecommendationsCached = async (req: Request, res: Response) => {
    const { user_id } = req.params; // Fixed: Now correctly gets from params

    try {
        // Check if user exists first
        const user = await User.findOne({ user_id });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find the most recent recommendation for this user
        const lastRecommendation = await Recommendation.findOne({ user_id })
            .sort({ timestamp: -1 });

        // Check if recommendation is less than 25 minutes old
        const now = new Date();
        const twentyFiveMinutesAgo = new Date(now.getTime() - 25 * 60 * 1000);

        if (lastRecommendation && lastRecommendation.timestamp > twentyFiveMinutesAgo) {
            // Return cached recommendation with venue details
            const venueDetails = await Promise.all(
                lastRecommendation.recommended_venues.map(async (venueId) => {
                    const venue = await Venue.findOne({ venue_id: venueId });
                    if (!venue) return null;
                    
                    // Calculate current distance and mutual friends for display
                    let distance = 0;
                    if (user.last_location && venue.location) {
                        const userCoords = user.last_location.coordinates;
                        const venueCoords = venue.location.coordinates;
                        const R = 6371;
                        const dLat = (venueCoords[1] - userCoords[1]) * Math.PI / 180;
                        const dLon = (venueCoords[0] - userCoords[0]) * Math.PI / 180;
                        const a = 
                            Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(userCoords[1] * Math.PI / 180) * Math.cos(venueCoords[1] * Math.PI / 180) * 
                            Math.sin(dLon/2) * Math.sin(dLon/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        distance = R * c;
                    }

                    return {
                        venue_id: venue.venue_id,
                        name: venue.name,
                        category: venue.category,
                        address: venue.address,
                        distance: parseFloat(distance.toFixed(1)),
                        visitor_count: venue.current_visitors.length,
                        avg_age: venue.avg_age
                    };
                })
            );

            const validVenues = venueDetails.filter(venue => venue !== null);

            res.status(200).json({ 
                message: 'Cached recommendations found', 
                recommendation: {
                    recommendation_id: lastRecommendation.recommendation_id,
                    user_id: lastRecommendation.user_id,
                    timestamp: lastRecommendation.timestamp,
                    venues: validVenues,
                    is_cached: true
                }
            });
            return;
        }

        // No valid cached recommendation, generate new one
        // Create a new request object with user_id in body for getRecommendations
        const newReq = {
            ...req,
            body: { user_id }
        } as Request;

        await getRecommendations(newReq, res);
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};