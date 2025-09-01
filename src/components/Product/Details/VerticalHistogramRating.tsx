import * as React from "react";
import styles from "./VerticalHistogramRating.module.scss";

export type VerticalHistogramRatingProps = {
  /** Current rating value. Fractional allowed, clamped to 0..max */
  value: number;
  /** Number of bars */
  max?: number;
  /** Height of bars in px */
  height?: number;
  /** Width of each bar in px */
  barWidth?: number;
  /** Gap between bars in px */
  gap?: number;
  /** Corner radius for bars in px */
  radius?: number;
  /** Color for empty part */
  background?: string;
  /** Color for filled part */
  fill?: string;
  /** Animate fill transitions */
  animate?: boolean;
  /** Accessible label override */
  ariaLabel?: string;
  /** Optional className for the root */
  className?: string;
};

/**
 * VerticalHistogramRating — a compact rating display using vertical bars.
 * Each bar fills from bottom to top; fractional values fill the next bar proportionally.
 * No external libraries required.
 */
export default function VerticalHistogramRating({
  value,
  max = 5,
  height = 48,
  barWidth = 12,
  gap = 6,
  radius = 4,
  background = "var(--bg)",
  fill = "var(--color-text-primary)",
  animate = true,
  ariaLabel,
  className,
}: VerticalHistogramRatingProps) {
  const v = Math.max(0, Math.min(value, max));
  const width = max * barWidth + (max - 1) * gap;

  // Per-bar fill ratios (0..1)
  const fills = React.useMemo(
    () =>
      Array.from({ length: max }, (_, i) => {
        const barIndex = i + 1; // bars are 1-indexed
        if (v >= barIndex) return 1;
        if (v <= barIndex - 1) return 0;
        return v - (barIndex - 1); // fractional remainder
      }),
    [v, max]
  );

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  // CSS variables for sizing/styling (no extra libs)
  const cssVars: React.CSSProperties & { [key: string]: string | number } = {
    ["--width"]: `${width}px`,
    ["--height"]: `${height}px`,
    ["--bar-width"]: `${barWidth}px`,
    ["--bar-gap"]: `${gap}px`,
    ["--radius"]: `${radius}px`,
    ["--bg"]: background,
    ["--fill"]: fill,
    ["--anim-duration"]: animate ? "240ms" : "0ms",
  };

  return (
    <div
      className={rootClass}
      role="img"
      aria-label={ariaLabel ?? `${v.toFixed(2)} out of ${max}`}
      style={cssVars}
    >
      {fills.map((ratio, i) => (
        <div key={i} className={styles.bar} aria-hidden>
          <div
            className={styles.fill}
            style={{ height: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
