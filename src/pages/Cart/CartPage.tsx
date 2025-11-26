// src/pages/Cart/CartPage.tsx
import React, { useMemo, useCallback } from "react";
import "../Checkout/Checkout.scss";
import c from "./CartPage.module.scss";

import { useCart } from "../../context/CartContext";
import { formatMoney } from "../../utils/money";
import QtyStepper from "../../components/UI/QtyStepper";
import Button from "../../components/UI/Button";
import { useNavigate } from "react-router-dom";
import { vatRateFor } from "../../utils/vat";
import { Summary } from "../../components/Checkout/Order/Summary";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";
import { CheckboxField } from "../../components/UI/CheckboxField";

const PRICES_INCLUDE_VAT = true as const;

const CartPage: React.FC = () => {
    const { lines, inc, setSelected, setSelectedAll } = useCart();
    const navigate = useNavigate();

    // --- ВСЕ хуки наверху ---

    // выбранные позиции
    const selectedLines = useMemo(
        () => lines.filter((l) => l.selected),
        [lines]
    );

    // количество выбранных товаров
    const itemsCount = useMemo(
        () => selectedLines.reduce((s, l) => s + l.qty, 0),
        [selectedLines]
    );

    // количество всех товаров в корзине (для информации/бейджа)
    const totalItemsCount = useMemo(
        () => lines.reduce((s, l) => s + l.qty, 0),
        [lines]
    );

    const subtotal = useMemo(
        () => selectedLines.reduce((s, l) => s + l.priceCents * l.qty, 0),
        [selectedLines]
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
        if (selectedLines.length === 0) return;
        navigate(`/identity-gate?next=${encodeURIComponent("/checkout")}`);
    };

    const allSelected = lines.length > 0 && lines.every((l) => l.selected);

    const handleToggleAll = useCallback(() => {
        setSelectedAll(!allSelected);
    }, [allSelected, setSelectedAll]);

    // --- РАННИЙ RETURN ПОСЛЕ ВСЕХ ХУКОВ ---
    // Пустота корзины определяем по lines, а не по выбранным
    if (lines.length === 0) {
        return (
            <Page>
                <div className={c.cart}>
                    <h1 className={c.cart__empty}>Cart is empty</h1>
                    <div className={c.cart__actions}>
                        <a onClick={() => navigate("/")}>Home</a>
                        <a onClick={() => navigate(-1)}>Return to shopping</a>
                    </div>
                </div>
            </Page>
        );
    }

    return (
        <Page padding={false}>
            <div className={c.mastbar}>
                <div className={c.mastbar__left}>
                    <h2 className={c.title}>
                        Cart{" "}
                        <span className={c.count}>
                            ({itemsCount}/{totalItemsCount})
                        </span>
                    </h2>
                </div>
                <div className={c.mastbar__right}>
                    <CheckboxField
                        checked={allSelected}
                        onChange={handleToggleAll}
                        label="Select all"
                    />
                </div>
            </div>

            <div className={c.main}>
                <section className={c.section}>
                    {lines.length > 0 && (
                        <ul className={c.section__list}>
                            {lines.map((it) => (
                                <li key={it.id} className={c["section__list--item"]}>
                                    <CheckboxField
                                        checked={!!it.selected}
                                        onChange={(e) => setSelected(it.id, e.target.checked)}
                                        aria-label={`Включить/исключить ${it.title} из заказа`}
                                    />

                                    {it.image && (
                                        <img
                                            src={it.image}
                                            className={c["section__list--item--img"]}
                                            alt=""
                                            loading="lazy"
                                        />
                                    )}

                                    <div className={c["section__list--item--meta"]}>
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

                                    <div className={c["section__list--item--meta--price"]}>
                                        {formatMoney(it.priceCents * it.qty)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className={c.section__actions}>
                        <Button
                            size="small"
                            disabled={selectedLines.length === 0}
                            onClick={handleProceed}
                        >
                            Proceed to checkout
                        </Button>
                    </div>
                </section>

                <Summary
                    lines={selectedLines}
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
                    hint={true}
                    spinnerClassName={undefined}
                />
            </div>

            <Footer />
        </Page>
    );
};

export default CartPage;
