// src/pages/Account/OrderDetails.tsx
import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import styles from "./AccountPage.module.scss";

import { useAccount } from "../../context/AccountContext";
import { exportInvoicePDF } from "../../types/helpers/invoiceConfig";
import { fmtMoney } from "../../types/helpers/fmtMoney";
import type { Address } from "../../types/address";
import type { Settings } from "../../types/settings";
import { statusLabel, type Order } from "../../types/order";
import ChevronRightIcon from "../../components/Icons/ChevronRightIcon";
import Button from "../../components/UI/Button";

/** helpers (локально, чтобы компонент был самодостаточным) */
const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());
const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (def && isGermany(def.country)) return "de-DE";
    return settings.language === "ru" ? "ru-RU" : "en-GB";
};
function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export default function OrderDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const backTo = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return sp.get("back") || "/account?tab=orders";
    }, [location.search]);

    const { account } = useAccount();
    const locale = getPreferredLocale(account.settings, account.addresses);

    const order: Order | undefined = account.orders.find((o) => o.id === id);
    const address: Address | undefined = order
        ? account.addresses.find((a) => a.id === order.deliveryAddressId) ||
        account.addresses.find((a) => a.isDefault)
        : undefined;

    if (!order) {
        return (
            <main className={styles.page}>
                <header className={styles.header}>
                    <div className={styles.headerMain}>
                        <button className={styles.ghostBtn} onClick={() => navigate(backTo)}>← Назад</button>
                        <h1 className={styles.title} style={{ marginLeft: 12 }}>Order not found</h1>
                    </div>
                    <div className={styles.headerActions}>
                        <Link to="/account?tab=orders" className={styles.ghostBtn}>К списку заказов</Link>
                    </div>
                </header>
                <section className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.titlePage}>Заказ не найден</h2>
                        </div>
                        <div className={styles.stack}>
                            <p>Возможно, он был удалён или ссылка некорректна.</p>
                            <ButtonLike onClick={() => navigate(backTo)}>Вернуться</ButtonLike>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    const totalItems = order.items.reduce((s, it) => s + (it.qty || 0), 0);

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerMainPage}>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => navigate(backTo)}
                        aria-label="Назад"
                    >
                        <ChevronRightIcon /> Back
                    </button>
                    <h1 className={styles.title}>
                        Заказ {order.number}
                    </h1>
                </div>
                <div className={styles.headerActions}>
                    <Link to="/account?tab=orders" className={styles.ghostBtn}>
                        Список заказов
                    </Link>
                </div>
            </header>

            <section className={styles.content}>
                <div className={styles.stack}>
                    <div className={styles.kv}>
                        <div>
                            <span className={styles.muted}>Дата:</span>{" "}
                            {new Date(order.createdAt).toLocaleString(locale)}
                        </div>
                        <div>
                            <span className={styles.muted}>Статус:</span>{" "}
                            <span className={classNames(styles.badge, styles[`st_${order.status}`])}>
                                {statusLabel(order.status)}
                            </span>
                        </div>
                        <div>
                            <span className={styles.muted}>Позиции:</span> {totalItems}
                        </div>
                        <div>
                            <span className={styles.muted}>Сумма:</span>{" "}
                            {fmtMoney(order.total / 100, account.settings.currency, locale)}
                        </div>
                    </div>
                    <section>
                        <h3>Items</h3>
                        <div className="summary__mini">
                            {order.items.map((it) => (
                                <div key={it.sku} className="mini-item">
                                    {it.image && <img src={it.image} alt="" />}
                                    <div>
                                        <div className="mini-item__sku">{it.sku}</div>
                                        <div className="mini-item__title">{it.name}</div>
                                        <div className="muted">×{it.qty}</div>
                                    </div>
                                    <div className="mini-item__price">
                                        {fmtMoney((it.price * it.qty) / 100, account.settings.currency, locale)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h3>Delivery address</h3>
                        {address && (
                            <div className={styles.addrBody}>
                                <div className={styles.muted}>{address.fullName}</div>
                                <div>{address.line1}</div>
                                {address.line2 && <div>{address.line2}</div>}
                                <div>
                                    {address.city}
                                    {address.region ? `, ${address.region}` : ""}, {address.postalCode}
                                </div>
                                <div>{address.country}</div>
                                {address.phone && <div className={styles.muted}>{address.phone}</div>}
                            </div>
                        )}
                    </section>
                    <section>
                        <h3>Delivery by</h3>
                        <div className={styles.addrBody}>
                            <div className={styles.deliveryIcon}>
                                <img src="/dhl.png" />
                                <div className={styles.muted}>D3534545454354354</div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h3>Summary</h3>
                        <ul className="summary__list">
                            {"subtotal" in order && typeof order.subtotal === "number" && (
                                <li>
                                    <span>Items</span>
                                    <span>{fmtMoney(order.subtotal / 100, account.settings.currency, locale)}</span>
                                </li>
                            )}
                            {"shippingCents" in order && typeof order.shippingCents === "number" && (
                                <li>
                                    <span>Доставка{order.shippingMethod ? ` (${order.shippingMethod})` : ""}</span>
                                    <span>{order.shippingCents === 0
                                        ? "Free"
                                        : fmtMoney(order.shippingCents / 100, account.settings.currency, locale)}</span>
                                </li>
                            )}
                            {"discountCents" in order && order.discountCents! > 0 && (
                                <li className="good">
                                    <span>Скидка{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                                    <span>-{fmtMoney(order.discountCents! / 100, account.settings.currency, locale)}</span>
                                </li>
                            )}
                            {"vatCents" in order && typeof order.vatCents === "number" && (
                                <li>
                                    <span>Including VAT (19%)</span>
                                    <span>{fmtMoney(order.vatCents! / 100, account.settings.currency, locale)}</span>
                                </li>
                            )}
                            <li className="sum">
                                <span>Итого</span>
                                <span>{fmtMoney(order.total / 100, account.settings.currency, locale)}</span>
                            </li>
                        </ul>
                    </section>

                    <div className={styles.orderActions}>
                        <Button
                            size="small"
                            variant="secondary"
                            onClick={() => alert("Повторить заказ (демо)")}
                        >
                            Повторить заказ
                        </Button>
                        <Button
                            size="small"
                            variant="ghost"
                            onClick={() =>
                                exportInvoicePDF({
                                    order,
                                    address,
                                    currency: account.settings.currency,
                                    locale,
                                    buyer: undefined,
                                })
                            }
                        >
                            Invoice
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}

/** простой «кнопкоподобный» элемент, чтобы не тянуть Button из UI */
function ButtonLike({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className={styles.ghostBtn} style={{ alignSelf: "flex-start" }}>
            {children}
        </button>
    );
}
