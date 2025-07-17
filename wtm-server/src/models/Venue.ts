import { Schema, Document, model } from 'mongoose';
import { randomUUID } from 'crypto';
import User from './User';

export interface IVenue extends Document {
    venue_id: string;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
    category: string;
    avg_age?: number;
    current_visitors: string[];
    last_updated?: Date;
}

const VenueSchema: Schema = new Schema(
    {
        venue_id: { type: String, required: true, unique: true, default: () => randomUUID() },
        name: { type: String, required: true },
        address: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        category: { type: String, required: true },
        avg_age: { type: Number },
        current_visitors: [{ type: String }],
        last_updated: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

VenueSchema.pre('save', async function (this: IVenue, next) {
    if (this.isModified('current_visitors')) {
        try {
            // Clean up visitors who haven't been seen recently (30 minutes)
            const cutoffTime = new Date(Date.now() - 30 * 60 * 1000);
            const activeUsers = await User.find({ 
                user_id: { $in: this.current_visitors },
                last_seen: { $gte: cutoffTime }
            }).distinct('user_id');

            // Update current_visitors to only include active users
            this.current_visitors = this.current_visitors.filter(visitor => 
                activeUsers.includes(visitor)
            );

            // Recalculate avg_age based on active visitors
            if (this.current_visitors.length > 0) {
                const users = await User.find({ user_id: { $in: this.current_visitors } });
                const totalAge = users.reduce((sum, user) => sum + (user.age || 0), 0);
                this.avg_age = Math.round(totalAge / users.length);
            } else {
                this.avg_age = undefined;
            }

            this.last_updated = new Date();
        } catch (error) {
            console.error('Error updating venue visitors:', error);
        }
    }
    next();
});

// Index for geospatial queries
VenueSchema.index({ location: '2dsphere' });
VenueSchema.index({ category: 1 });
VenueSchema.index({ current_visitors: 1 });

export default model<IVenue>('Venue', VenueSchema);