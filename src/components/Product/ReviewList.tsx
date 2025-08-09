// ReviewList.tsx
// A production‑ready, accessible review list component using SCSS modules — **без внешней зависимости clsx**.

import React from "react";
import cls from "./ReviewList.module.scss";

/** Simple utility to join class names without pulling in an external library */
const cx = (...classes: (string | false | null | undefined)[]) =>
    classes.filter(Boolean).join(" ");

/** A single user review. */
export interface Review {
    /** Stable, unique identifier – required for list rendering */
    id: string;
    /** Display name of the reviewer */
    reviewerName: string;
    /** ISO‑8601 date string (yyyy‑mm‑dd) */
    reviewDate: string;
    /** Star rating (1‑5) */
    rating: number;
    /** Free‑form review body */
    text: string;
}

export interface ReviewListProps {
    /** Collection of reviews to show */
    reviews: Review[];
    /** Optional external className to extend styling */
    className?: string;
}

/**
 * ReviewList – shows a list of customer reviews.
 *
 * Accessibility notes:
 *  – <time> element gives assistive tech proper temporal context.
 *  – Rating group has role="img" and aria‑label for screen readers.
 */
const ReviewList: React.FC<ReviewListProps> = ({ reviews, className }) => {
    return (
        <ul className={cx(cls.reviewList, className)}>
            {reviews.map(({ id, reviewerName, reviewDate, rating, text }) => (
                <li key={id} className={cls.reviewList__item}>
                    <div
                        className={cls.reviewRating}
                        role="img"
                        aria-label={`Rating: ${rating} out of 5`}
                    >
                        {Array.from({ length: 5 }, (_, i) => {
                            const filled = i < rating;
                            return (
                                <svg
                                    key={i}
                                    className={filled ? `${cls.star} ${cls.starFilled}` : cls.star}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.399 8.153L12 18.896l-7.333 3.855 1.399-8.153L.132 9.211l8.2-1.193z" />
                                </svg>
                            );
                        })}
                    </div>

                    <header className={cls.reviewHeader}>
                        <span className={cls.reviewerName}>{reviewerName}</span>
                        <time
                            className={cls.reviewDate}
                            dateTime={reviewDate}
                            title={new Date(reviewDate).toLocaleDateString()}
                        >
                            {new Intl.DateTimeFormat(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            }).format(new Date(reviewDate))}
                        </time>
                    </header>

                    <p className={cls.reviewText}>{text}</p>
                </li>
            ))}
        </ul>
    );
};

export default ReviewList;