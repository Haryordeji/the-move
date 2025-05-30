// src/models/Recommendation.ts
import { Schema, Document, model } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IRecommendation extends Document {
    recommendation_id: string;
    user_id: string;
    recommended_venues: string[];
    timestamp: Date;
}

const RecommendationSchema: Schema = new Schema(
    {
        recommendation_id: { type: String, required: true, unique: true, default: () => randomUUID() },
        user_id: { type: String, required: true },
        recommended_venues: [{ type: String }],
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default model<IRecommendation>('Recommendation', RecommendationSchema);