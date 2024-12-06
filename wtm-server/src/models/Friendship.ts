import { Schema, Document, model } from 'mongoose';
import {FriendshipStatusEnum} from '../shared';
import { randomUUID } from 'crypto';

export interface IFriendship extends Document {
    friendship_id: string;
    user1_id: string;
    user2_id: string;
    status: FriendshipStatusEnum;
    created_at?: Date;
}

const FriendshipSchema: Schema = new Schema(
    {
        friendship_id: {type: String, required: true, default: () => randomUUID()},
        user1_id: { type: String, required: true },
        user2_id: { type: String, required: true },
        status: { type: String, enum: Object.values(FriendshipStatusEnum) },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// reorders for save operation, makes sure that biderctional entries 
// are not recorded due to consistent order each time
FriendshipSchema.pre('save', function (this: IFriendship, next) {
    if (this.user1_id > this.user2_id) {
        const temp = this.user1_id;
        this.user1_id = this.user2_id;
        this.user2_id = temp;
    }
    next();
});

FriendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default model<IFriendship>('Friendship', FriendshipSchema);