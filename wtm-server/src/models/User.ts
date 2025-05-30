import { Schema, Document, model } from 'mongoose';
import { randomUUID } from 'crypto';


export interface IUser extends Document {
    user_id: string; 
    username: string;
    email: string;
    age: number;
    college?: string;
    last_location?: {
        type: string;
        coordinates: [number, number];
    };
    last_seen?: Date;
}

const UserSchema: Schema = new Schema(
    {
        user_id: { type: String, required: true, unique: true, default: () => randomUUID() }, 
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        age: { type: Number },
        college: { type: String },
        last_location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        last_seen: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default model<IUser>('User', UserSchema);