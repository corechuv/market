import "react"
import styles from "./DeliveryBadge.module.scss"

/**
 * DeliveryBadge — standalone React + TS component without external UI libs.
 * Styling is via SCSS Module (DeliveryBadge.module.scss).
 *
 * Features:
 * - Shows "Free delivery" when price is 0/undefined/null, otherwise shows price (e.g., €6)
 * - English dates like: Wed, 26 Apr — Fri, 28 Apr
 * - Business days by default (skip weekends); switch to calendar days via businessDays={false}
 */

export type DeliveryBadgeProps = {
    /** price in currency units; 0/null/undefined => Free */
    price?: number | null;
    /** ISO 4217 currency, e.g. 'EUR' */
    currency?: string;
    /** BCP 47 locale for formatting, default 'en-GB' */
    locale?: string;
    /** earliest delivery offset from fromDate */
    minDays: number;
    /** latest delivery offset from fromDate */
    maxDays: number;
    /** anchor date (default: today) */
    fromDate?: Date;
    /** use business days (skip Sat/Sun) when true (default), calendar days when false */
    businessDays?: boolean;
    /** optional extra className that will be appended */
    className?: string;
    /** i18n-able labels (English by default) */
    freeLabel?: string; // default: 'Free delivery'
    paidLabel?: string; // default: 'Delivery'
    betweenLabel?: string; // default: 'Delivery between'
    andLabel?: string; // default: 'and'
};

const formatDate = (date: Date, locale = "en-GB") =>
    new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "2-digit",
        month: "short",
    }).format(date);

const formatMoney = (
    amount: number,
    currency = "EUR",
    locale = "en-GB"
) =>
    new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

function addDays(start: Date, days: number, businessDays = true) {
    const d = new Date(start);
    if (!Number.isFinite(days) || days < 0) return d; // basic guard
    let added = 0;
    while (added < days) {
        d.setDate(d.getDate() + 1);
        const day = d.getDay(); // 0 Sun .. 6 Sat
        if (!businessDays || (day !== 0 && day !== 6)) {
            added++;
        }
    }
    return d;
}

export default function DeliveryBadge({
    price = 0,
    currency = "EUR",
    locale = "en-GB",
    minDays,
    maxDays,
    fromDate = new Date(),
    businessDays = true,
    className = "",
    freeLabel = "Versandkostenfrei",
    paidLabel = "Versand",
    betweenLabel = "Lieferung zwischen",
    andLabel = "und",
}: DeliveryBadgeProps) {
    const start = addDays(fromDate, minDays, businessDays);
    const end = addDays(fromDate, maxDays, businessDays);
    const isFree = !price || price <= 0;

    return (
        <div className={`${styles.badge} ${className}`}>
            <div className={styles.topLine}>
                {isFree
                    ? freeLabel
                    : `${paidLabel} ${formatMoney(price!, currency, locale)}`}
            </div>
            <div className={styles.bottomLine}>
                {betweenLabel} {formatDate(start, locale)} {andLabel} {formatDate(end, locale)}
            </div>
        </div>
    );
}
