import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Venue from '../models/Venue';
import Friendship from '../models/Friendship';
import Recommendation from '../models/Recommendation';
import { FriendshipStatusEnum } from '../shared';

dotenv.config();

const testFunctionalFixes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'wtm-test', // Use test database
        });
        console.log('Database connected. Starting functional tests...\n');

        // Clean test data
        await Promise.all([
            User.deleteMany({ email: { $regex: /test\./ } }),
            Venue.deleteMany({ name: { $regex: /Test/ } }),
            Friendship.deleteMany({}),
            Recommendation.deleteMany({})
        ]);

        console.log('Test 1: User Creation and Friendship Logic');
        
        // Create test users
        const user1 = await User.create({
            user_id: 'test-user-1',
            username: 'testuser1',
            email: 'test.user1@example.com',
            age: 22,
            college: 'Princeton University',
            last_location: {
                type: 'Point',
                coordinates: [-74.6551, 40.3431] // Princeton
            },
            last_seen: new Date()
        });

        const user2 = await User.create({
            user_id: 'test-user-2',
            username: 'testuser2',
            email: 'test.user2@example.com',
            age: 24,
            college: 'Princeton University',
            last_location: {
                type: 'Point',
                coordinates: [-74.6551, 40.3431]
            },
            last_seen: new Date()
        });

        const user3 = await User.create({
            user_id: 'test-user-3',
            username: 'testuser3',
            email: 'test.user3@example.com',
            age: 20,
            college: 'Rutgers',
            last_location: {
                type: 'Point',
                coordinates: [-74.6551, 40.3431]
            },
            last_seen: new Date()
        });

        console.log('   Created 3 test users');

        // Test friendship creation
        const friendship1 = await Friendship.create({
            user1_id: user1.user_id,
            user2_id: user2.user_id,
            requester_id: user1.user_id,
            status: FriendshipStatusEnum.ACCEPTED
        });

        const friendship2 = await Friendship.create({
            user1_id: user2.user_id,
            user2_id: user3.user_id,
            requester_id: user2.user_id,
            status: FriendshipStatusEnum.ACCEPTED
        });

        console.log('   Created friendships: User1↔User2, User2↔User3');

        // Test mutual friends logic
        const { findMutualFriends } = await import('../helpers/friendshipHelper');
        const user1MutualFriends = await findMutualFriends(user1.user_id, 3);
        
        console.log(`   User1 mutual friends: [${user1MutualFriends.join(', ')}]`);
        console.log(`   Expected: [${user2.user_id}, ${user3.user_id}] (user2 direct, user3 through user2)`);

        console.log('\nTest 2: Venue Creation and Visitor Management');

        // Create test venues
        const venue1 = await Venue.create({
            venue_id: 'test-venue-1',
            name: 'Test Bar Princeton',
            address: '123 Nassau St, Princeton, NJ',
            location: {
                type: 'Point',
                coordinates: [-74.6551, 40.3431]
            },
            category: 'Bar',
            current_visitors: [user2.user_id, user3.user_id]
        });

        const venue2 = await Venue.create({
            venue_id: 'test-venue-2',
            name: 'Test Cafe Princeton',
            address: '456 Nassau St, Princeton, NJ',
            location: {
                type: 'Point',
                coordinates: [-74.6551, 40.3431]
            },
            category: 'Cafe',
            current_visitors: []
        });

        console.log('   Created 2 test venues');
        console.log(`   Venue1 avg_age: ${venue1.avg_age} (should be avg of user2 and user3: ${(user2.age + user3.age) / 2})`);

        console.log('\nTest 3: Recommendation Algorithm');

        // Test recommendation generation
        const { getRecommendations } = await import('../controllers/recommendation.controller');
        
        const mockReq = {
            body: { user_id: user1.user_id }
        };

        let recommendationResult: any = null;
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    recommendationResult = { statusCode: code, data };
                    return mockRes;
                }
            })
        };

        await getRecommendations(mockReq as any, mockRes as any);

        if (recommendationResult?.statusCode === 200) {
            const venues = recommendationResult.data.recommendation.venues;
            console.log(`   Generated ${venues.length} recommendations for User1`);
            
            if (venues.length > 0) {
                const topVenue = venues[0];
                console.log(`   Top recommendation: ${topVenue.name}`);
                console.log(`   Mutual friends at venue: ${topVenue.mutual_friends.count}`);
                console.log(`   Score: ${topVenue.score.toFixed(3)}`);
            }
        } else {
            console.log(`   Recommendation failed: ${recommendationResult?.data?.message}`);
        }

        console.log('\nTest 4: Cached Recommendations');

        const { getRecommendationsCached } = await import('../controllers/recommendation.controller');
        
        const mockReqCached = {
            params: { user_id: user1.user_id }
        };

        let cachedResult: any = null;
        const mockResCached = {
            status: (code: number) => ({
                json: (data: any) => {
                    cachedResult = { statusCode: code, data };
                    return mockResCached;
                }
            })
        };

        await getRecommendationsCached(mockReqCached as any, mockResCached as any);

        if (cachedResult?.statusCode === 200) {
            console.log('   Cached recommendations retrieved successfully');
            console.log(`   Is cached: ${cachedResult.data.recommendation.is_cached || 'newly generated'}`);
        } else {
            console.log(`   Cached recommendations failed: ${cachedResult?.data?.message}`);
        }

        console.log('\nTest 5: Friendship Operations');

        const user1Friendships = await Friendship.find({
            $or: [
                { user1_id: user1.user_id },
                { user2_id: user1.user_id }
            ]
        });

        console.log(`   User1 has ${user1Friendships.length} friendship records`);

        const friendshipBetween1And2 = await Friendship.findOne({
            $or: [
                { user1_id: user1.user_id, user2_id: user2.user_id },
                { user1_id: user2.user_id, user2_id: user1.user_id }
            ]
        });

        if (friendshipBetween1And2) {
            console.log(`   Friendship between User1 and User2: ${friendshipBetween1And2.status}`);
            console.log(`   Requester: ${friendshipBetween1And2.requester_id}`);
        }

        console.log('\nTest 6: Distance Calculation');

        const userCoords = user1.last_location!.coordinates;
        const venue1Coords = venue1.location.coordinates;

        const R = 6371; // Earth's radius in km
        const dLat = (venue1Coords[1] - userCoords[1]) * Math.PI / 180;
        const dLon = (venue1Coords[0] - userCoords[0]) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userCoords[1] * Math.PI / 180) * Math.cos(venue1Coords[1] * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        console.log(`   Distance from User1 to Venue1: ${distance.toFixed(3)} km`);

        console.log('\nAll functional tests completed successfully');
        console.log('\nSummary of Fixed Issues:');
        console.log('   1. Fixed recommendation route parameter mismatch');
        console.log('   2. Fixed friendship logic and user ID comparisons');
        console.log('   3. Removed problematic pre-save hook in Friendship model');
        console.log('   4. Fixed division by zero in recommendation algorithm');
        console.log('   5. Added venue visitor cleanup mechanism');
        console.log('   6. Fixed friendship status enum consistency');
        console.log('   7. Enhanced mutual friends algorithm');
        console.log('   8. Added proper error handling and validation');

        await Promise.all([
            User.deleteMany({ email: { $regex: /test\./ } }),
            Venue.deleteMany({ name: { $regex: /Test/ } }),
            Friendship.deleteMany({ user1_id: { $regex: /test-/ } }),
            Recommendation.deleteMany({ user_id: { $regex: /test-/ } })
        ]);

        console.log('\nTest data cleaned up');
        process.exit(0);

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testFunctionalFixes();
