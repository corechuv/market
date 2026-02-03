// src/types/review/review.ts
export type ReviewType = 'plain' | 'reel';

export type ReviewMedia = {
  kind: 'photo' | 'video';
  url: string;
  width?: number;
  height?: number;
  durationMs?: number;
};

export type ReviewOut = {
  id: string;
  productId: string;
  authorId: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  authorUpdatedAt?: string | null;
  type: ReviewType;
  rating: number;
  text?: string | null;
  verified: boolean;
  status: string;
  createdAt: string;
  media: ReviewMedia[];
  helpfulCount: number;
  helpfulByMe?: boolean | null;
  viewsCount: number;
};
