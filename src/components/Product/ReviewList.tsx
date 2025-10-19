// ReviewList.tsx
// A production-ready, accessible review list component using SCSS modules — без внешних зависимостей.

import React from "react";
import cls from "./ReviewList.module.scss";

/** Simple utility to join class names without pulling in an external library */
const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/** A single user review. */
export interface Review {
  /** Stable, unique identifier – required for list rendering */
  id: string;
  /** Display name of the reviewer (optional, falls back to i18n.anonymous) */
  reviewerName?: string;
  /** ISO-8601 date string (e.g. 2024-12-31T10:00:00Z or 2024-12-31) */
  date: string;
  /** Star rating (0-5) */
  rating: number;
  /** Free-form review body */
  comment: string;
  /** Product ID this review belongs to */
  productId: string;

  /** OPTIONAL FIELDS — used by ProductPlainReviews */
  verified?: boolean;
  /** List of image URLs attached to the review */
  photos?: string[];
  /** “Helpful” counter */
  helpfulCount?: number;
}

export interface ReviewListProps {
  /** Collection of reviews to show */
  reviews: Review[];
  /** Optional external className to extend styling */
  className?: string;

  /** Show a small "verified" badge when review.verified === true */
  showVerifiedBadge?: boolean;

  /** i18n strings & formatters */
  i18n?: {
    ratingLabel?: (rating: number) => string;
    verified?: string;
    helpful?: (count: number) => string;
    anonymous?: string;
    /** Format function for date in header (receives JS Date) */
    formatDate?: (d: Date) => string;
  };

  /** Optional aria-label for the whole list */
  ariaLabel?: string;
}

/** Clamp rating to [0, 5] and floor to integer for solid stars */
const clampRating = (r: number) => Math.max(0, Math.min(5, Math.floor(r ?? 0)));

/**
 * ReviewList – shows a list of customer reviews.
 *
 * Accessibility notes:
 *  – <time> element gives assistive tech proper temporal context.
 *  – Rating group has role="img" and aria-label for screen readers.
 *  – Photos are considered decorative by default (empty alt) to avoid noise for SR.
 */
const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  className,
  showVerifiedBadge = true,
  ariaLabel,
  i18n,
}) => {
  const t = {
    ratingLabel: (r: number) => `Rating: ${r} out of 5`,
    verified: "Verified",
    helpful: (n: number) => `Helpful: ${n}`,
    anonymous: "Anonymous",
    formatDate: (d: Date) =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(d),
    ...i18n,
  };

  return (
    <ul
      className={cx(cls.reviewList, className)}
      aria-label={ariaLabel || "Customer reviews"}
    >
      {reviews.map(
        ({
          id,
          reviewerName,
          date,
          rating,
          comment,
          verified,
          photos,
          helpfulCount,
        }) => {
          const safeRating = clampRating(rating);
          const dateObj = new Date(date);
          const name = reviewerName?.trim() || t.anonymous;

          return (
            <li key={id} className={cls.reviewList__item}>
              <div
                className={cls.reviewRating}
                role="img"
                aria-label={t.ratingLabel(safeRating)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const filled = i < safeRating;
                  return (
                    <svg
                      key={i}
                      className={filled ? cx(cls.star, cls.starFilled) : cls.star}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.399 8.153L12 18.896l-7.333 3.855 1.399-8.153L.132 9.211l8.2-1.193z" />
                    </svg>
                  );
                })}
              </div>

              <header className={cls.reviewHeader}>
                <span className={cls.reviewerName}>{name}</span>

                {showVerifiedBadge && verified && (
                  <span
                    className={cls.verifiedBadge}
                    title={t.verified}
                    aria-label={t.verified}
                  >
                    ✅
                  </span>
                )}

                <time
                  className={cls.reviewDate}
                  dateTime={dateObj.toISOString()}
                  title={dateObj.toLocaleString()}
                >
                  {t.formatDate(dateObj)}
                </time>
              </header>

              {comment && <p className={cls.reviewText}>{comment}</p>}

              {!!photos?.length && (
                <div className={cls.photoGrid} role="list">
                  {photos.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt=""
                      loading="lazy"
                      className={cls.photoGrid__img}
                      role="listitem"
                    />
                  ))}
                </div>
              )}

              <footer className={cls.reviewFooter} style={{display: "none"}}>
                {typeof helpfulCount === "number" && (
                  <span className={cls.helpful}>{t.helpful(helpfulCount)}</span>
                )}
              </footer>
            </li>
          );
        }
      )}
    </ul>
  );
};

export default ReviewList;
