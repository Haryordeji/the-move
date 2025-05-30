import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import friendshipRoutes from './routes/friendshipRoutes';
import venueRoutes from './routes/venueRoutes';
import recommendationRoutes from './routes/recommendationRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/recommendations', recommendationRoutes);

export default app;
