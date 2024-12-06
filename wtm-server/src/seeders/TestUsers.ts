import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { UUID } from 'mongodb';

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
            { id: new UUID(), username: 'john_doe', email: 'john@example.com', age: 25, college: 'Princeton University', friends: [] },
            { username: 'jane_doe', email: 'jane@example.com', age: 22, college: 'Harvard University', friends: [] },
        ]);

        console.log('Seeding done.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
