// src/types/user/profile.ts
export type Profile = {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    isMe: boolean;
};