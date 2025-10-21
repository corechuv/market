import React, { useEffect, useMemo, useState, useId } from "react";
import styles from "./Preloader.module.scss";

export interface Props {
    /** Diameter in px */
    size?: number;
    /** Any CSS color */
    color?: string;
    /** Animation speed in seconds */
    speedSec?: number;
    /** Ring thickness in px (defaults to size/10) */
    thickness?: number;
    /** Arc length in degrees (0..360) */
    sweepDeg?: number;
    /** Screen-reader text (visually hidden) */
    label?: string;
    /** Fullscreen centered overlay backdrop */
    overlay?: boolean;
    /** Delay (ms) before showing to avoid flicker */
    delayMs?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const Preloader: React.FC<Props> = ({
    size = 26,
    color = "#797979",
    speedSec = 0.9,
    thickness,
    sweepDeg = 160,
    label = "Processing\u2026",
    overlay = false,
    delayMs = 0,
    className,
    style,
}) => {
    const id = useId();
    const [visible, setVisible] = useState(delayMs === 0);
    useEffect(() => {
        if (delayMs > 0) {
            const t = setTimeout(() => setVisible(true), delayMs);
            return () => clearTimeout(t);
        }
    }, [delayMs]);
    if (!visible) return null;

    const clampedSweep = Math.max(0, Math.min(360, Math.round(sweepDeg)));
    const vars: React.CSSProperties = useMemo(
        () => ({
            ...(style || {}),
            ["--mc-size" as any]: `${size}px`,
            ["--mc-color" as any]: color,
            ["--mc-speed" as any]: `${speedSec}s`,
            ["--mc-thickness" as any]: `${typeof thickness === "number" ? thickness : Math.max(2, Math.round(size / 10))
                }px`,
            ["--mc-sweep" as any]: `${clampedSweep}deg`,
        }),
        [size, color, speedSec, thickness, clampedSweep, style]
    );

    const core = (
        <div
            className={[styles.root, className].filter(Boolean).join(" ")}
            style={vars}
            role="status"
            aria-live="polite"
            aria-labelledby={id}
        >
            <div className={styles.ring} aria-hidden />
            <span id={id} className={styles.sr}>
                {label}
            </span>
        </div>
    );

    if (!overlay) return core;
    return <div className={styles.overlay}>{core}</div>;
};

export default Preloader;
