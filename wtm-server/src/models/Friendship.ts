import { Schema, Document, model } from 'mongoose';
import {FriendshipStatusEnum} from '../shared';
import { randomUUID } from 'crypto';

export interface IFriendship extends Document {
    friendship_id: string;
    user1_id: string;
    user2_id: string;
    requester_id: string;
    status: FriendshipStatusEnum;
    created_at?: Date;
}

const FriendshipSchema: Schema = new Schema(
    {
        friendship_id: {type: String, required: true, default: () => randomUUID()},
        user1_id: { type: String, required: true },
        user2_id: { type: String, required: true },
        requester_id: { type: String, required: true },
        status: { 
            type: String, 
            enum: Object.values(FriendshipStatusEnum),
            default: FriendshipStatusEnum.REQUESTED
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// Create compound index to prevent duplicate friendships regardless of order
FriendshipSchema.index({ 
    user1_id: 1, 
    user2_id: 1 
});

export default model<IFriendship>('Friendship', FriendshipSchema);