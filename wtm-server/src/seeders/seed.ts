// src/seeders/enhanced-seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Venue from '../models/Venue';
import Friendship from '../models/Friendship';
import { FriendshipStatusEnum } from '../shared';
import { randomUUID } from 'crypto';

dotenv.config();

// Princeton area coordinates (approximation)
const PRINCETON_CENTER = [-74.6551, 40.3431];

// Generate a point within radius km of center
const generateRandomLocation = (center: [number, number], radiusKm: number): [number, number] => {
  // Earth's radius in km
  const earthRadius = 6371;
  
  // Convert radius from km to radians
  const radiusRadians = radiusKm / earthRadius;
  
  // Random angle
  const angle = Math.random() * Math.PI * 2;
  
  // Random distance within the radius
  const distance = Math.random() * radiusRadians;
  
  // Convert to lat/lng offsets
  const latOffset = distance * Math.cos(angle);
  const lngOffset = distance * Math.sin(angle) / Math.cos(center[1] * Math.PI / 180);
  
  return [
    center[0] + lngOffset * 180 / Math.PI,
    center[1] + latOffset * 180 / Math.PI
  ];
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: 'wtm',
    });

    console.log('Database connected. Starting enhanced seeding');

    // Clear existing data
    await User.deleteMany({});
    await Venue.deleteMany({});
    await Friendship.deleteMany({});

    // Create users
    const userIds: string[] = [];
    const colleges = ['Princeton University', 'Rutgers', 'TCNJ', 'Rider University', 'None'];
    const userCount = 50;
    
    console.log('Creating users...');
    
    for (let i = 0; i < userCount; i++) {
      const userId = randomUUID();
      userIds.push(userId);
      
      await User.create({
        user_id: userId,
        username: `user${i}`,
        email: `user${i}@example.com`,
        age: 18 + Math.floor(Math.random() * 15), // Ages 18-33
        college: colleges[Math.floor(Math.random() * colleges.length)],
        last_location: {
          type: 'Point',
          coordinates: generateRandomLocation([-74.6551, 40.3431], 5)
        },
        last_seen: new Date()
      });
    }
    
    console.log(`Created ${userCount} users`);

    // Create venues
    const venueCategories = ['Bar', 'Club', 'Restaurant', 'Cafe', 'Study Spot'];
    const venueCount = 20;
    const venueIds: string[] = [];
    
    console.log('Creating venues...');
    
    for (let i = 0; i < venueCount; i++) {
      const venueId = randomUUID();
      venueIds.push(venueId);
      
      // Randomly select 0-10 users as current visitors
      const currentVisitorCount = Math.floor(Math.random() * 11);
      const currentVisitors = [];
      
      for (let j = 0; j < currentVisitorCount; j++) {
        const randomUserIndex = Math.floor(Math.random() * userIds.length);
        currentVisitors.push(userIds[randomUserIndex]);
      }
      
      await Venue.create({
        venue_id: venueId,
        name: `Venue ${i}`,
        address: `${100 + i} Nassau St, Princeton, NJ`,
        location: {
          type: 'Point',
          coordinates: generateRandomLocation([-74.6551, 40.3431], 3)
        },
        category: venueCategories[Math.floor(Math.random() * venueCategories.length)],
        current_visitors: currentVisitors
      });
    }
    
    console.log(`Created ${venueCount} venues`);

    // Create friendship network
    // Each user will have 1-10 friends with different statuses
    console.log('Creating friendships...');
    let friendshipCount = 0;
    
    for (let i = 0; i < userIds.length; i++) {
      const friendCount = 1 + Math.floor(Math.random() * 10);
      
      for (let j = 0; j < friendCount; j++) {
        const randomUserIndex = Math.floor(Math.random() * userIds.length);
        
        // Skip self-friendships and already created ones
        if (i === randomUserIndex) continue;
        
        const requester = userIds[i];
        const recipient = userIds[randomUserIndex];
        
        // Random status with bias toward accepted
        const randomValue = Math.random();
        let status;
        
        if (randomValue < 0.7) {
          status = FriendshipStatusEnum.ACCEPTED;
        } else if (randomValue < 0.9) {
          status = FriendshipStatusEnum.REQUESTED;
        } else {
          status = FriendshipStatusEnum.BLOCKED;
        }
        
        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
          $or: [
            { user1_id: requester, user2_id: recipient },
            { user1_id: recipient, user2_id: requester }
          ]
        });
        
        if (!existingFriendship) {
          await Friendship.create({
            friendship_id: randomUUID(),
            user1_id: requester,
            user2_id: recipient,
            requester_id: requester,
            status
          });
          friendshipCount++;
        }
      }
    }
    
    console.log(`Created ${friendshipCount} friendships`);
    console.log('Seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();