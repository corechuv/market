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

import type { ReturnRequest, ReturnStatus } from "../../types/return";
import { returnStatusLabel } from "../../types/return";

/** helpers */
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

    const returnsForOrder: ReturnRequest[] = (account.returns || []).filter((r) => r.orderId === order.id);

    // сколько уже возвращается по SKU
    const COUNT_STATUSES: ReturnStatus[] = [
        "submitted", "approved", "label_issued", "in_transit", "received", "refunded",
    ];
    const returnedQtyBySku = useMemo(() => {
        const m = new Map<string, number>();
        returnsForOrder.forEach((r) => {
            if (!COUNT_STATUSES.includes(r.status)) return;
            r.items.forEach((it) => m.set(it.sku, (m.get(it.sku) || 0) + it.qty));
        });
        return m;
    }, [returnsForOrder]);

    // список возвратов по каждому SKU (для «Открыть возврат» прямо из товара)
    const returnsBySku = useMemo(() => {
        const m = new Map<string, Array<{ req: ReturnRequest; qty: number }>>();
        returnsForOrder.forEach((req) => {
            req.items.forEach((line) => {
                const arr = m.get(line.sku) || [];
                arr.push({ req, qty: line.qty });
                m.set(line.sku, arr);
            });
        });
        return m;
    }, [returnsForOrder]);

    const hasAnyReturnable = order.items.some((it) => {
        const ordered = it.qty || 0;
        const returned = returnedQtyBySku.get(it.sku) || 0;
        return ordered - returned > 0;
    });

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerMainPage}>
                    <div>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => navigate(backTo)}
                            aria-label="Назад"
                        >
                            <ChevronRightIcon /> Back
                        </button>
                    </div>
                    <h1 className={styles.title}>{order.number}</h1>
                </div>
                <div className={styles.headerActions}>
                    <Link to="/account?tab=orders" className={styles.ghostBtn}>
                        Список заказов
                    </Link>
                </div>
            </header>

            <section className={styles.content}>
                <div className={styles.stack}>
                    <div>
                        <span className={styles.muted}>Статус:</span>{" "}
                        <span className={classNames(styles.badge, styles[`st_${order.status}`])}>
                            {statusLabel(order.status)}
                        </span>
                    </div>

                    <section>
                        <h3>Details</h3>
                        <div className={styles.addrBody}>
                            <div>
                                <span className={styles.muted}>Дата:</span>{" "}
                                {new Date(order.createdAt).toLocaleString(locale)}
                            </div>
                            <div>
                                <span className={styles.muted}>Позиции:</span> {totalItems}
                            </div>
                            <div>
                                <span className={styles.muted}>Сумма:</span>{" "}
                                {fmtMoney(order.total / 100, account.settings.currency, locale)}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3>Products</h3>
                        <div className="summary__mini">
                            {order.items.map((it) => {
                                const ordered = it.qty || 0;
                                // const returned = returnedQtyBySku.get(it.sku) || 0;
                                // const left = Math.max(0, ordered - returned);
                                const skuReturns = returnsBySku.get(it.sku) || [];

                                return (
                                    <div key={it.sku} className="mini-item">
                                        {it.image && <img src={it.image} alt="" />}
                                        <div>
                                            <div>
                                                <div className="mini-item__sku">{it.sku}</div>
                                                <div className="mini-item__title">{it.name}</div>
                                                <div className="muted">×{ordered}</div>
                                            </div>
                                            <div style={{margin: "20px 0"}}>
                                                {/* <div className="muted">Доступно к возврату: ×{left}</div> */}
                                                {/* Возвраты по этому SKU */}
                                                {skuReturns.length > 0 && (
                                                    <div style={{ marginTop: 6 }}>
                                                        <div className={styles.muted}>Returns for this item:</div>
                                                        <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                                                            {skuReturns.map(({ req, qty }) => (
                                                                <div key={`${req.id}-${it.sku}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                    <span className={styles.badge}>{returnStatusLabel(req.status)}</span>
                                                                    <span className={styles.muted}>×{qty} • {req.rma}</span>
                                                                    <Button
                                                                        size="small"
                                                                        variant="secondary"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/account/returns/${req.id}?back=${encodeURIComponent(
                                                                                    location.pathname + location.search
                                                                                )}&sku=${encodeURIComponent(it.sku)}`
                                                                            )
                                                                        }
                                                                    >
                                                                        Open
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mini-item__price">
                                            {fmtMoney((it.price * it.qty) / 100, account.settings.currency, locale)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <h3>Delivery address</h3>
                        {address && (
                            <div className={styles.addrBody}>
                                <div>{address.fullName}</div>
                                <div>{address.line1}</div>
                                {address.line2 && <div>{address.line2}</div>}
                                <div>
                                    {address.city}
                                    {address.region ? `, ${address.region}` : ""}, {address.postalCode}
                                </div>
                                <div>{address.country}</div>
                                {address.phone && <div>{address.phone}</div>}
                            </div>
                        )}
                    </section>

                    <section>
                        <h3>Delivery by</h3>
                        <div className={styles.addrBody}>
                            <div className={styles.deliveryIcon}>
                                <img src="/dhl.png" />
                                <div>D3534545454354354</div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3>Summary</h3>
                        <ul className="summary__list">
                            {"subtotal" in order && typeof order.subtotal === "number" && (
                                <li>
                                    <span>Products</span>
                                    <span>{fmtMoney(order.subtotal / 100, account.settings.currency, locale)}</span>
                                </li>
                            )}
                            {"shippingCents" in order && typeof order.shippingCents === "number" && (
                                <li>
                                    <span>Delivery{order.shippingMethod ? ` (${order.shippingMethod})` : ""}</span>
                                    <span>
                                        {order.shippingCents === 0
                                            ? "Free"
                                            : fmtMoney(order.shippingCents / 100, account.settings.currency, locale)}
                                    </span>
                                </li>
                            )}
                            {"discountCents" in order && order.discountCents! > 0 && (
                                <li className="good">
                                    <span>Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span>
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
                                <span>Total</span>
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

                        {hasAnyReturnable && (
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => navigate(`/account/returns/new?order=${order.id}`)}
                            >
                                Return items
                            </Button>
                        )}

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
