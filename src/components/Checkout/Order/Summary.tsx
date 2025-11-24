// src/components/Checkout/Order/Summary.tsx
import React from "react";
import type { CartLine } from "../../../context/CartContext";
import Button from "../../../components/UI/Button";
import { TextField } from "../../../components/UI/TextField";
import { formatMoney } from "../../../utils/money";
import c from "./Summary.module.scss";
import Accordion from "../../UI/Accordion";

export type SummaryProps = {
    lines: CartLine[];
    subtotal: number;
    vat: number;
    vatLabel: string;
    discount: number;
    total: number;

    /** Блок промокода теперь необязателен */
    promo?: string;
    setPromo?: (s: string) => void;
    promoApplied?: string | null;
    applyPromo?: () => void;

    freeThresholdCents?: number;
    shippingCents: number;
    loading?: boolean;
    quoteError?: string | null;
    quoteReason?: string | null;
    hint?: boolean;

    /** Позволяет передать класс спиннера извне (например, styles.checkout__spinner) */
    spinnerClassName?: string;
};

export const Summary: React.FC<SummaryProps> = ({
    lines,
    subtotal,
    vat,
    vatLabel,
    discount,
    total,
    promo,
    setPromo,
    promoApplied,
    applyPromo,
    freeThresholdCents,
    shippingCents,
    loading,
    quoteError,
    quoteReason,
    hint = false,
    spinnerClassName,
}) => {
    const promoMsg =
        promoApplied
            ? discount > 0
                ? { kind: "ok" as const, text: `Promo applied: ${promoApplied}` }
                : {
                    kind: "warn" as const,
                    text: quoteReason
                        ? `Promo not applied: ${quoteReason}`
                        : `Promo not applicable`,
                }
            : null;

    const showPromoInput =
        typeof promo === "string" && !!setPromo && !!applyPromo;

    return (
        <div className={c.summary}>
            <h3 className={c.summary__title}>Total</h3>

            {loading && (
                <div
                    className="muted"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                    }}
                >
                    {spinnerClassName ? (
                        <div
                            className={spinnerClassName}
                            style={{ width: 16, height: 16 }}
                        />
                    ) : (
                        // простой фоллбек, если класс не передали
                        <div
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: "999px",
                                border: "2px solid currentColor",
                                borderTopColor: "transparent",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                    )}
                    Recalculating totals…
                </div>
            )}

            {quoteError && (
                <div className="warn" role="status" style={{ marginBottom: 8 }}>
                    Pricing service unavailable — totals are estimated.
                </div>
            )}

            <ul className={c.summary__list}>
                <li className={c["summary__list--item"]}>
                    <span>Items</span>
                    <span>{formatMoney(subtotal)}</span>
                </li>
                <li className={c["summary__list--item"]}>
                    <span>Shipping</span>
                    <span>{shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</span>
                </li>
                <li className={c["summary__list--item"]}>
                    <span>{vatLabel}</span>
                    <span>{formatMoney(vat)}</span>
                </li>
                <div className={`${c["item--discount"]}`}>
                    {discount > 0 && (
                        <li className={`${c["summary__list--item"]}`}>
                            <span>
                                Discount{promoApplied ? ` (${promoApplied})` : ""}
                            </span>
                            <span>-{formatMoney(discount)}</span>
                        </li>
                    )}
                </div>
                <li
                    className={`${c["summary__list--item"]} ${c["summary__list--sum"]}`}
                >
                    <span>To pay</span>
                    <span>{formatMoney(total)}</span>
                </li>
            </ul>

            {hint && (
                <p className={c.hint}>
                    Shipping costs and final discounts will be calculated during
                    checkout.
                </p>
            )}

            {typeof freeThresholdCents === "number" && freeThresholdCents > 0 && (
                <p className={c.hint}>
                    Free shipment from {formatMoney(freeThresholdCents)}
                </p>
            )}

            {/* Блок промокода показываем только если передали все нужные пропсы */}
            {showPromoInput && (
                <Accordion title="Add promocode">
                    <div className="promo">
                        <TextField
                            label="Promo code"
                            className="promo__input"
                            id="promo"
                            value={promo}
                            onChange={(e) => setPromo!(e.target.value)}
                            placeholder="Promo code"
                        />
                        <Button
                            className="btn btn--ghost"
                            size="small"
                            disabled={!promo!.trim()}
                            onClick={applyPromo}
                        >
                            Apply
                        </Button>
                    </div>
                </Accordion>
            )}

            {promoMsg && (
                <div
                    className={promoMsg.kind === "ok" ? "good" : "warn"}
                    style={{ marginTop: 6 }}
                >
                    {promoMsg.text}
                </div>
            )}

            <div className="summary__mini">
                {lines.length === 0 ? (
                    <p className="muted">Cart is empty</p>
                ) : (
                    lines.map((it) => (
                        <div key={it.id} className="mini-item">
                            {it.image && <img src={it.image} alt="" />}
                            <div>
                                <div className="mini-item__title">{it.title}</div>
                                <div className="muted">×{it.qty}</div>
                            </div>
                            <div className="mini-item__price">
                                {formatMoney(it.priceCents * it.qty)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
