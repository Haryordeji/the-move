import mongoose from 'mongoose';

mongoose.set('debug', true);
const connectDB = async () => {
    console.log(process.env.MONGO_URI)
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
