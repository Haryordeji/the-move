import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { randomUUID } from 'crypto';
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
            { user_id: randomUUID(), username: 'john_doe', email: 'john@example.com', age: 25, college: 'Princeton University' },
            { user_id: randomUUID(),username: 'jane_doe', email: 'jane@example.com', age: 22, college: 'Harvard University' },
        ]);

        console.log('Seeding done.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
