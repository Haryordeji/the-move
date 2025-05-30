import mongoose from 'mongoose';

const isDevEnvironment = process.env.NODE_ENV !== 'production';
if (isDevEnvironment) {
  mongoose.set('debug', true);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'wtm',
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;