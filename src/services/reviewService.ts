import { reviews } from "../data/reviews";
import type { Review } from "../types/review";

export function getReviewsById(productId: string): Review[] {
    return reviews.filter(review => review.productId === productId);
}
