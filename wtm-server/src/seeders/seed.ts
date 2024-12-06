import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { randomUUID } from 'crypto';
import Friendship from '../models/Friendship';
dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'wtm',
        });

        console.log('Database connected. Seeding');

        // I am adding fake users here
        await User.deleteMany(); 
        await User.insertMany([
            { user_id: "3b70650e-1894-4875-a3a4-34d66a6881e6", username: 'john_doe', email: 'john@example.com', age: 25, college: 'Princeton University' },
            { user_id: "d2c554a8-611f-43a6-aacc-9cdeb3d56b10",username: 'jane_doe', email: 'jane@example.com', age: 22, college: 'Harvard University' },
        ]);

        await Friendship.deleteMany();
        await Friendship.insertMany([
            { user1_id: 'd2c554a8-611f-43a6-aacc-9cdeb3d56b10', user2_id: "3b70650e-1894-4875-a3a4-34d66a6881e6", status: 'accepted' },
        ]);

        console.log('Seeding done.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
