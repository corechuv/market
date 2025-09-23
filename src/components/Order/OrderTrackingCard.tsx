// src/components/Order/OrderTrackingCard.tsx
'use client';
import React from 'react';
import styles from './OrderTrackingCard.module.scss';

export type NormalizedStatus =
    | 'CREATED'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'PICKUP_READY'
    | 'PICKED_UP'
    | 'DELIVERED'
    | 'DELAYED'
    | 'CANCELLED'
    | 'ERROR'
    | 'UNKNOWN';

export type Props = {
    trackingNumber?: string;
    carrierName?: string;
    currentStatus: NormalizedStatus;
    lastUpdate?: string | Date;
    trackingUrl?: string;
    locale?: 'ru' | 'de' | 'en';
    className?: string;
    /** если передан — добавляется завершённый шаг «Оплачено» перед Tracking */
    paidAt?: string | Date;
    onCopy?: (field: 'orderId' | 'trackingNumber') => void;
};

export function normalizeEUStatus(text?: string | null): NormalizedStatus {
    if (!text) return 'UNKNOWN';
    const s = String(text).toLowerCase();

    if (/(label|auftragsdaten|elektronische auftragsdaten|registered|erfasst|auftrag)/i.test(s)) return 'CREATED';
    if (/(out for delivery|in zustellung|wird heute zugestellt|zustellfahrt)/i.test(s)) return 'OUT_FOR_DELIVERY';
    if (/(delivered|zugestellt|abgestellt|empfangen)/i.test(s)) return 'DELIVERED';
    if (/(pickup ready|abholbereit|zur abholung|packstation|filiale)/i.test(s)) return 'PICKUP_READY';
    if (/(picked up|abgeholt)/i.test(s)) return 'PICKED_UP';
    if (/(delay|verzögert|verspätung)/i.test(s)) return 'DELAYED';
    if (/(in transit|unterwegs|im paketzentrum|verteilzentrum|processing|sorted|hub)/i.test(s)) return 'IN_TRANSIT';
    if (/(storniert|cancel|abgebrochen)/i.test(s)) return 'CANCELLED';
    if (/(error|fehler|failed)/i.test(s)) return 'ERROR';
    return 'UNKNOWN';
}

const labelsRU: Record<NormalizedStatus, string> = {
    CREATED: 'Этикетка создана',
    IN_TRANSIT: 'В пути',
    OUT_FOR_DELIVERY: 'Курьер в пути',
    PICKUP_READY: 'Готов к выдаче',
    PICKED_UP: 'Получено в пункте',
    DELIVERED: 'Доставлено',
    DELAYED: 'Задержка',
    CANCELLED: 'Отменено',
    ERROR: 'Ошибка',
    UNKNOWN: 'Статус неизвестен',
};
const labelsDE: Record<NormalizedStatus, string> = {
    CREATED: 'Auftragsdaten übermittelt',
    IN_TRANSIT: 'Unterwegs',
    OUT_FOR_DELIVERY: 'In Zustellung',
    PICKUP_READY: 'Zur Abholung bereit',
    PICKED_UP: 'Abgeholt',
    DELIVERED: 'Zugestellt',
    DELAYED: 'Verzögert',
    CANCELLED: 'Storniert',
    ERROR: 'Fehler',
    UNKNOWN: 'Unbekannt',
};
const labelsEN: Record<NormalizedStatus, string> = {
    CREATED: 'Label created',
    IN_TRANSIT: 'In transit',
    OUT_FOR_DELIVERY: 'Out for delivery',
    PICKUP_READY: 'Ready for pickup',
    PICKED_UP: 'Picked up',
    DELIVERED: 'Delivered',
    DELAYED: 'Delayed',
    CANCELLED: 'Cancelled',
    ERROR: 'Error',
    UNKNOWN: 'Unknown',
};

function getLabel(locale: 'ru' | 'de' | 'en', st: NormalizedStatus) {
    switch (locale) {
        case 'de': return labelsDE[st];
        case 'en': return labelsEN[st];
        default: return labelsRU[st];
    }
}

function cn(...x: Array<string | undefined | false>) {
    return x.filter(Boolean).join(' ');
}

function formatTime(ts?: string | Date, locale: 'ru' | 'de' | 'en' = 'ru') {
    if (!ts) return '';
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    const intl = locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'ru-RU';
    return d.toLocaleString(intl, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

/** локализованные названия шагов степпера */
const stepNames = {
    ru: { paid: 'Оплачено', tracking: 'Отслеживание', ready: 'Готов к выдаче', collect: 'Получено', delivered: 'Доставлено' },
    de: { paid: 'Bezahlt', tracking: 'Sendungsverfolgung', ready: 'Abholbereit', collect: 'Abgeholt', delivered: 'Zugestellt' },
    en: { paid: 'Paid', tracking: 'Tracking', ready: 'Ready', collect: 'Collected', delivered: 'Delivered' },
};
type StepKey = 'paid' | 'tracking' | 'ready' | 'collect' | 'delivered';

function pickFlow(status: NormalizedStatus, hasPaid: boolean): {
    variant: 'door' | 'pickup'; steps: StepKey[]; currentIdx: number
} {
    const isPickup = status === 'PICKUP_READY' || status === 'PICKED_UP';
    const variant: 'door' | 'pickup' = isPickup ? 'pickup' : 'door';

    const baseSteps: StepKey[] = variant === 'pickup'
        ? ['tracking', 'ready', 'collect']
        : ['tracking', 'delivered'];

    // индекс текущего шага в базовом флоу (без оплаты)
    let baseCurrent = 0;
    if (variant === 'pickup') {
        if (status === 'PICKUP_READY') baseCurrent = 1;
        else if (status === 'PICKED_UP') baseCurrent = 2;
    } else {
        baseCurrent = status === 'DELIVERED' ? 1 : 0;
    }

    const steps = hasPaid ? (['paid', ...baseSteps] as StepKey[]) : baseSteps;
    const currentIdx = hasPaid ? baseCurrent + 1 : baseCurrent;

    return { variant, steps, currentIdx };
}

export const OrderTrackingCompact: React.FC<Props> = ({
    trackingNumber,
    carrierName,
    currentStatus,
    lastUpdate,
    trackingUrl,
    locale = 'ru',
    className,
    paidAt,
    onCopy,
}) => {
    const label = getLabel(locale, currentStatus);
    const hasPaid = !!paidAt;
    const { steps, currentIdx } = pickFlow(currentStatus, hasPaid);

    const handleCopy = (value?: string, field?: 'orderId' | 'trackingNumber') => {
        if (!value) return;
        navigator.clipboard?.writeText(value).catch(() => { });
        onCopy?.(field!);
    };

    const t = stepNames[locale];

    return (
        <section className={cn(styles.card, className)} aria-live="polite">
            <div className={styles.top}>
                <div className={styles.left}>
                    <div className={styles.statusBlock}>
                        <div className={cn(styles.statusText, styles[`s_${currentStatus.toLowerCase()}`])}>
                            {label}
                        </div>
                        {lastUpdate && (
                            <div className={styles.subtle}>
                                {locale === 'de' ? 'Aktualisiert:' : locale === 'en' ? 'Updated:' : 'Обновлено:'} {formatTime(lastUpdate, locale)}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.right}>
                    {carrierName && <span className={styles.badge}>{carrierName}</span>}
                </div>
            </div>

            {/* Степпер */}
            <div
                className={styles.stepper}
                role="group"
                aria-label={locale === 'de' ? 'Sendungsverlauf' : locale === 'en' ? 'Order progress' : 'Ход доставки'}
            >
                {steps.map((key, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isReached = idx <= currentIdx;

                    const staticLabel =
                        key === 'paid' ? t.paid :
                            key === 'tracking' ? t.tracking :
                                key === 'ready' ? t.ready :
                                    key === 'collect' ? t.collect :
                                        t.delivered;

                    // под активным шагом — либо «Оплачено» (если активный paid), либо текущий статус доставки
                    const labelBelow = isCurrent ? (key === 'paid' ? t.paid : label) : staticLabel;

                    const dateForStep = key === 'paid' ? paidAt : lastUpdate;

                    return (
                        <div
                            key={key}
                            className={cn(
                                styles.step,
                                isCompleted && styles.completed,
                                isCurrent && styles.current,
                                isReached && styles.reached
                            )}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            <div className={styles.lineLeft} aria-hidden />
                            <div className={styles.bullet} aria-hidden>
                                {isCompleted && (
                                    <svg
                                        viewBox="0 0 24 24"
                                        className={styles.checkIcon}
                                        aria-hidden
                                    >
                                        <path
                                            d="M6 12l4 4 8-8"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div className={styles.lineRight} aria-hidden />
                            <div className={styles.stepText}>
                                <div className={cn(styles.stepLabel, isCurrent && styles.stepLabelActive)}>{labelBelow}</div>
                                {isCurrent && !!dateForStep && (
                                    <div className={styles.stepDate}>{formatTime(dateForStep, locale)}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.metaRow}>
                {trackingNumber && (
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>
                            {locale === 'de' ? 'Sendungsnr.' : locale === 'en' ? 'Tracking #' : 'Трек-номер'}
                        </span>
                        {trackingUrl ? (
                            <a className={styles.linkBtn} href={trackingUrl} target="_blank" rel="noreferrer" title="Открыть трекинг">
                                {trackingNumber}
                            </a>
                        ) : (
                            <button className={styles.copyBtn} onClick={() => handleCopy(trackingNumber, 'trackingNumber')}>
                                {trackingNumber}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default OrderTrackingCompact;
