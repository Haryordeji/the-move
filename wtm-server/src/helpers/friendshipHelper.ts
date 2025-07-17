import Friendship from '../models/Friendship';
import { FriendshipStatusEnum } from '../shared';

/**
 * Find mutual friends up to specified degrees for a given user
 * Only includes ACCEPTED friendships
 */
export const findMutualFriends = async (user_id: string, depth: number = 3): Promise<string[]> => {
    const visited = new Set<string>();
    const queue: { user_id: string; depth: number }[] = [{ user_id, depth: 0 }];
    const mutualFriends = new Set<string>();

    // Add the original user to visited to prevent self-inclusion
    visited.add(user_id);

    while (queue.length > 0) {
        const { user_id: currentUserId, depth: currentDepth } = queue.shift()!;

        if (currentDepth >= depth) continue;

        try {
            // Find ACCEPTED friendships where the current user is involved
            const friendships = await Friendship.find({
                $or: [
                    { user1_id: currentUserId, status: FriendshipStatusEnum.ACCEPTED },
                    { user2_id: currentUserId, status: FriendshipStatusEnum.ACCEPTED },
                ],
            });

            for (const friendship of friendships) {
                const friendId = friendship.user1_id === currentUserId 
                    ? friendship.user2_id 
                    : friendship.user1_id;

                if (!visited.has(friendId)) {
                    visited.add(friendId);
                    
                    // Only add to mutual friends if not the original user
                    if (friendId !== user_id) {
                        mutualFriends.add(friendId);
                    }
                    
                    // Add to queue for next level if we haven't reached max depth
                    if (currentDepth + 1 < depth) {
                        queue.push({ user_id: friendId, depth: currentDepth + 1 });
                    }
                }
            }
        } catch (error) {
            console.error(`Error finding friends for user ${currentUserId}:`, error);
            // Continue processing other users even if one fails
        }
    }

    return Array.from(mutualFriends);
};