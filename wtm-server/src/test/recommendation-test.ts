// src/test/recommendation-test.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Venue from '../models/Venue';
import Friendship from '../models/Friendship';
import { getRecommendations } from '../controllers/recommendation.controller';
import { Request, Response } from 'express';

dotenv.config();

const testRecommendations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: 'wtm',
    });
    console.log('Database connected. Starting recommendation test');

    // Get a sample user
    const user = await User.findOne({});
    if (!user) {
      console.error('No users found in database. Run seed script first.');
      process.exit(1);
    }

    console.log(`Testing recommendations for user: ${user.username} (${user.user_id})`);
    console.log(`User age: ${user.age}, College: ${user.college || 'N/A'}`);
    console.log(`User location: ${JSON.stringify(user.last_location || 'Not set')}`);
    
    // Get mutual friends for diagnostic purposes
    const friendships = await Friendship.find({
      $or: [
        { user1_id: user.user_id },
        { user2_id: user.user_id }
      ],
      status: 'accepted'
    });
    console.log(`User has ${friendships.length} friends`);

    // Create a mock request/response
    const mockRequest = {
      body: { user_id: user.user_id }
    } as Request;

    let responseData: any = null;
    const mockResponse = {
      status: (code: number) => ({
        json: (data: any) => {
          responseData = data;
          console.log(`Response status: ${code}`);
          return mockResponse;
        }
      })
    } as unknown as Response;

    // Call the recommendation controller
    await getRecommendations(mockRequest, mockResponse);

    // If we got recommendations, get the details of recommended venues
    if (responseData && responseData.recommendation) {
      const venues = responseData.recommendation.venues || [];
      
      console.log('\n==== TOP 4 RECOMMENDED VENUES ====');
      console.log(`Total venues recommended: ${venues.length}`);
      
      if (venues.length === 0) {
        console.log("WARNING: No venues were recommended. Check filtering criteria.");
        
        // Additional diagnostics
        const allVenues = await Venue.find({});
        console.log(`Total venues in database: ${allVenues.length}`);
        
        if (allVenues.length > 0 && user.last_location) {
          console.log("Checking venue distances from user:");
          for (let i = 0; i < Math.min(3, allVenues.length); i++) {
            const venue = allVenues[i];
            const userCoords = user.last_location.coordinates;
            const venueCoords = venue.location.coordinates;
            
            // Simple distance calculation
            const distance = Math.sqrt(
              Math.pow(userCoords[0] - venueCoords[0], 2) + 
              Math.pow(userCoords[1] - venueCoords[1], 2)
            ) * 111; // rough conversion to km
            
            console.log(`- ${venue.name}: ~${distance.toFixed(2)} km`);
          }
        }
      } else {
        venues.forEach((venue: any, index: number) => {
          console.log(`\n${index + 1}. ${venue.name} (${venue.category})`);
          console.log(`   ID: ${venue.venue_id}`);
          console.log(`   Address: ${venue.address}`);
          console.log(`   Distance: ${venue.distance} km`);
          console.log(`   Visitors: ${venue.visitor_count}`);
          console.log(`   Average age: ${venue.avg_age}`);
          console.log(`   Mutual friends: ${venue.mutual_friends.count}`);
          if (venue.mutual_friends.count > 0) {
            console.log(`   Friend IDs: ${venue.mutual_friends.ids.join(', ')}`);
          }
          console.log(`   Score: ${venue.score.toFixed(4)}`);
          if (venue.score_breakdown) {
            console.log(`   Score breakdown: Age(${venue.score_breakdown.age_score.toFixed(2)}) + Friends(${venue.score_breakdown.mutual_friends_score.toFixed(2)})`);
          }
        });
      }
    } else {
      console.log('No recommendations returned or unexpected response structure.');
      console.log('Response data:', responseData);
    }

    console.log('\nTest complete!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testRecommendations();