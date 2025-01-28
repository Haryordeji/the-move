import Friendship from '../models/Friendship';

/**
 * Find mutual friends up to 3 degrees for a given user
 */
export const findMutualFriends = async (user_id: string, depth: number = 3): Promise<string[]> => {
    const visited = new Set<string>();
    const queue: { user_id: string; depth: number }[] = [{ user_id, depth: 0 }];
    const mutualFriends = new Set<string>();

    while (queue.length > 0) {
        const { user_id: currentUserId, depth: currentDepth } = queue.shift()!;

        if (currentDepth >= depth) continue;

        // Find friendships where the current user is involved
        const friendships = await Friendship.find({
            $or: [
                { user1_id: currentUserId },
                { user2_id: currentUserId },
            ],
        });

        for (const friendship of friendships) {
            const friendId = friendship.user1_id === currentUserId ? friendship.user2_id : friendship.user1_id;

            if (!visited.has(friendId)) {
                visited.add(friendId);
                mutualFriends.add(friendId);
                queue.push({ user_id: friendId, depth: currentDepth + 1 });
            }
        }
    }

    return Array.from(mutualFriends);
};