// src/pages/Checkout/SuccessPage.tsx
import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Page from "../../components/UI/Page/Page";
import c from "./SuccessPage.module.scss";
import { useTranslation } from "react-i18next";

type LocationState = {
    orderNo?: string;
};

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;
    const orderNo = state?.orderNo;
    const { t } = useTranslation("success");

    // Если пришли на страницу напрямую (без state) — выкидываем на главную
    if (!orderNo) {
        return <Navigate to="/" replace />;
    }

    return (
        <Page>
            <div className={c.success}>
                <div className={c.success__icon}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="80"
                        height="80"
                        role="img"
                        aria-label={t("iconAria")}
                        style={{ "--w": 0.5, color: "#16a34a" } as React.CSSProperties}
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={0.5 as unknown as number}
                            opacity="0.25"
                        />
                        <path
                            d="M7 12.5l3 3L17 9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={0.5 as unknown as number}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div>
                    <h2 className={c.success__title}>{t("title")}</h2>
                    <h2 className={c.success__description}>{t("subtitle")}</h2>
                </div>
                <p className={c.success__order}>
                    {/* Если захочешь, можно добавить подпись:
              <span>{t("order.numberLabel")}: </span>
          */}
                    <strong className={c["success__order--number"]}>{orderNo}</strong>
                </p>
                <div className={c.success__actions}>
                    <a href="/">{t("actions.home")}</a>
                    <a href="/">{t("actions.continue")}</a>
                </div>
            </div>
        </Page>
    );
};

export default SuccessPage;
