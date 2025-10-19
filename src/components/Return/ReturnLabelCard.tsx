// src/components/Return/ReturnLabelCard.tsx
import "react";
import styles from "../Order/OrderTrackingCard.module.scss"; // можно свой .scss
import Button from "../UI/Button";
import type { ReturnRequest } from "../../types/return";

import dpd from '/dpd.png';
import dhl from '/dhl.png';
import gls from '@/assets/gls.png';
import hermes from '@/assets/svg/hermes.svg';

const carrierLogos: Record<string, { src: string; alt: string }> = {
    dhl: { src: (dhl as unknown as string), alt: 'DHL' },
    hermes: { src: (hermes as unknown as string), alt: 'Hermes' },
    dpd: { src: (dpd as unknown as string), alt: 'DPD' },
    gls: { src: (gls as unknown as string), alt: 'GLS' },
};

function renderCarrierLogo(name?: string) {
    if (!name) return null;
    const key = name.trim().toLowerCase();
    const logo = carrierLogos[key];
    if (!logo) {
        // Неизвестный перевозчик — показываем текстовый бейдж
        return <span className={styles.badge}>{name}</span>;
    }
    return (
        <span className={styles.carrierLogo} title={name}>
            {/* img универсально работает и с png, и с svg-импортами */}
            <img src={logo.src} alt={logo.alt} className={styles.logoImg} />
        </span>
    );
}

export default function ReturnLabelCard({ req }: { req: ReturnRequest }) {
    const label = req.label;
    if (!label) return null;

    const expires =
        label.expiresAt ? new Date(label.expiresAt).toLocaleString() : null;

    const handleCopy = (value?: string) => {
        if (!value) return;
        navigator.clipboard?.writeText(value).catch(() => { });
    };

    return (
        <section className={styles.card} aria-live="polite">
            <div className={styles.top} style={{ alignItems: "center" }}>
                <div className={styles.left}>
                    <div className={styles.statusBlock}>
                        <div className={styles.statusText}>
                            {label.kind === "qr" ? "QR code for return" : "Return label"}
                        </div>
                        <div className={styles.subtle}>
                            {expires ? `Действует до ${expires}` : ""}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    {renderCarrierLogo(label.carrier)}
                </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
                {label.kind === "qr" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <div className={styles.qr__container}>
                            {label.qrDataUrl && (
                                <img
                                    src={label.qrDataUrl}
                                    alt="QR code for return"
                                />
                            )}
                        </div>
                        <div style={{ maxWidth: 420 }}>
                            <div style={{ marginBottom: 8 }}>
                                Show this QR code at the change point {label.carrier}. The employee will print out a label.
                            </div>
                            <code style={{ wordBreak: "break-all", fontSize: 12 }}>
                                {label.qrPayload}
                            </code>
                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        handleCopy(label.qrPayload)
                                    }}
                                >
                                    Copy payload
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {label.labelUrl && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <a href={label.labelUrl} download={`return_${req.rma}.png`}>
                            <Button size="small">Скачать этикетку</Button>
                        </a>
                        <img
                            src={label.labelUrl}
                            alt="Превью этикетки"
                            style={{ width: 220, height: "auto", border: "1px solid #eee", borderRadius: 8 }}
                        />
                    </div>
                )}
            </div>

            <div className={styles.metaRow}>
                {label.trackingNumber && (
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>
                            Tracking #
                        </span>
                        <button className={styles.copyBtn} onClick={() => handleCopy(label.trackingNumber)}>
                            {label.trackingNumber}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
