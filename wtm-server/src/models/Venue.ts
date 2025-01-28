// src/models/Venue.ts
import { Schema, Document, model } from 'mongoose';
import { randomUUID } from 'crypto';

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
    },
    { timestamps: true }
);

// Index for geospatial queries
VenueSchema.index({ location: '2dsphere' });

export default model<IVenue>('Venue', VenueSchema);