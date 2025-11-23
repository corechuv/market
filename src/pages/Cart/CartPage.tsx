// src/pages/Cart/CartPage.tsx
import React, { useMemo } from "react";
import "../Checkout/Checkout.scss";
import styles from "../Checkout/Checkout.module.scss";

import { useCart } from "../../context/CartContext";
import { formatMoney } from "../../utils/money";
import QtyStepper from "../../components/UI/QtyStepper";
import Button from "../../components/UI/Button";
import { useNavigate } from "react-router-dom";
import { vatRateFor } from "../../utils/vat";
import { Summary } from "../../components/Checkout/Order/Summary";
import Page from "../../components/UI/Page/Page";

const PRICES_INCLUDE_VAT = true as const;

const CartPage: React.FC = () => {
    const { lines, inc } = useCart();
    const navigate = useNavigate();

    const itemsCount = useMemo(
        () => lines.reduce((s, l) => s + l.qty, 0),
        [lines]
    );

    const subtotal = useMemo(
        () => lines.reduce((s, l) => s + l.priceCents * l.qty, 0),
        [lines]
    );

    // На странице корзины нет доставки — считаем 0,
    // а реальная доставка посчитается на checkout.
    const shippingCents = 0;

    const discount = 0;

    const total = useMemo(
        () => Math.max(0, subtotal - discount + shippingCents),
        [subtotal, discount, shippingCents]
    );

    const vatRate = vatRateFor("DE");
    const vat = useMemo(() => {
        if (!subtotal) return 0;
        return PRICES_INCLUDE_VAT
            ? Math.round(total - total / (1 + vatRate))
            : Math.round(total * vatRate);
    }, [total, vatRate, subtotal]);

    const vatLabel = `Including VAT (${Math.round(vatRate * 100)}%)`;

    const handleProceed = () => {
        if (lines.length === 0) return;
        navigate("/checkout");
    };

    return (
        <Page>
            <div className={styles.checkout}>
                <main className={styles.checkout__main}>
                    {/* Левая колонка — сама корзина (как CartSection было) */}
                    <section className={styles.checkout__content}>
                        <div className="card">
                            <div className="card__head">
                                <h2>Cart</h2>
                                <span className="muted">{itemsCount} items</span>
                            </div>

                            {lines.length === 0 ? (
                                <div>
                                    <p>Your cart is empty.</p>
                                    <a className="btn" href="/">
                                        Return to shopping
                                    </a>
                                </div>
                            ) : (
                                <ul className="cart-list">
                                    {lines.map((it) => (
                                        <li key={it.id} className="cart-item">
                                            {it.image && (
                                                <img src={it.image} alt="" loading="lazy" />
                                            )}
                                            <div className="cart-item__meta">
                                                <h3>{it.title}</h3>
                                                <QtyStepper
                                                    value={it.qty}
                                                    min={0}
                                                    size="sm"
                                                    showMax={false}
                                                    ariaLabel={`Количество для ${it.title}`}
                                                    onChange={(q) => inc(it.id, q - it.qty)}
                                                    max={99}
                                                />
                                            </div>
                                            <div className="cart-item__price">
                                                {formatMoney(it.priceCents * it.qty)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="card__foot">
                                <Button
                                    className="btn"
                                    size="small"
                                    disabled={lines.length === 0}
                                    onClick={handleProceed}
                                >
                                    Proceed to checkout
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Правая колонка — Summary без промокода */}
                    <aside
                        className={styles.checkout__sidebar}
                        aria-label="Order summary"
                    >
                        <Summary
                            lines={lines}
                            subtotal={subtotal}
                            vat={vat}
                            vatLabel={vatLabel}
                            discount={discount}
                            total={total}
                            shippingCents={shippingCents}
                            freeThresholdCents={undefined}
                            loading={false}
                            quoteError={null}
                            quoteReason={null}
                            spinnerClassName={undefined}
                        />
                        <p className="muted" style={{ marginTop: 8 }}>
                            Shipping costs and final discounts will be calculated during
                            checkout.
                        </p>
                    </aside>
                </main>
            </div>
        </Page>
    );
};

export default CartPage;
