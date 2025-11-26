// src/components/Checkout/Order/Summary.tsx
import React from "react";
import type { CartLine } from "../../../context/CartContext";
import Button from "../../../components/UI/Button";
import { TextField } from "../../../components/UI/TextField";
import { formatMoney } from "../../../utils/money";
import c from "./Summary.module.scss";
import Accordion from "../../UI/Accordion";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("summary");

  const promoMsg =
    promoApplied
      ? discount > 0
        ? {
            kind: "ok" as const,
            text: t("promo.applied", { code: promoApplied }),
          }
        : {
            kind: "warn" as const,
            text: quoteReason
              ? t("promo.notAppliedWithReason", { reason: quoteReason })
              : t("promo.notApplicable"),
          }
      : null;

  const showPromoInput =
    typeof promo === "string" && !!setPromo && !!applyPromo;

  const discountLabel = promoApplied
    ? `${t("lines.discount")} (${promoApplied})`
    : t("lines.discount");

  return (
    <div className={c.summary}>
      <h3 className={c.summary__title}>{t("title")}</h3>

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
          {t("recalculating")}
        </div>
      )}

      {quoteError && (
        <div className="warn" role="status" style={{ marginBottom: 8 }}>
          {t("quoteError")}
        </div>
      )}

      <ul className={c.summary__list}>
        <li className={c["summary__list--item"]}>
          <span>{t("lines.items")}</span>
          <span>{formatMoney(subtotal)}</span>
        </li>
        <li className={c["summary__list--item"]}>
          <span>{t("lines.shipping")}</span>
          <span>
            {shippingCents === 0
              ? t("lines.free")
              : formatMoney(shippingCents)}
          </span>
        </li>
        <li className={c["summary__list--item"]}>
          <span>{vatLabel}</span>
          <span>{formatMoney(vat)}</span>
        </li>
        <div className={c["item--discount"]}>
          {discount > 0 && (
            <li className={c["summary__list--item"]}>
              <span>{discountLabel}</span>
              <span>-{formatMoney(discount)}</span>
            </li>
          )}
        </div>
        <li
          className={`${c["summary__list--item"]} ${c["summary__list--sum"]}`}
        >
          <span>{t("lines.toPay")}</span>
          <span>{formatMoney(total)}</span>
        </li>
      </ul>

      {hint && (
        <p className={c.hint}>
          {t("hint.checkout")}
        </p>
      )}

      {typeof freeThresholdCents === "number" && freeThresholdCents > 0 && (
        <p className={c.hint}>
          {t("hint.freeFrom", { amount: formatMoney(freeThresholdCents) })}
        </p>
      )}

      <div className={c.listAccodrion}>
        {/* Блок промокода показываем только если передали все нужные пропсы */}
        {showPromoInput && (
          <Accordion title={t("promo.accordionTitle")}>
            <div className={c.promo}>
              <TextField
                label={t("promo.label")}
                className="promo__input"
                id="promo"
                value={promo}
                onChange={(e) => setPromo!(e.target.value)}
                placeholder={t("promo.placeholder")}
              />
              <Button
                className="btn btn--ghost"
                size="small"
                disabled={!promo!.trim()}
                onClick={applyPromo}
              >
                {t("promo.apply")}
              </Button>
            </div>
            {promoMsg && (
              <div
                className={promoMsg.kind === "ok" ? "good" : "warn"}
                style={{ marginTop: 6 }}
              >
                {promoMsg.text}
              </div>
            )}
          </Accordion>
        )}
        <Accordion title={t("selected.accordionTitle")} defaultOpen>
          <div className={c.summary__mini}>
            {lines.length === 0 ? (
              <p className="muted">{t("selected.empty")}</p>
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
        </Accordion>
      </div>
    </div>
  );
};
