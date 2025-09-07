// FILE: src/pages/CheckoutPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import "./Checkout.scss";
import { useCart } from "../../context/CartContext";
import { formatMoney } from "../../utils/money";
import { detectBrand, luhnCheck, formatCardNumber, formatExpiryInput, expiryValid, lengthOkForBrand, BRAND_RULES, type CardBrand } from "../../utils/paymentCard";
import Logo from "../../components/logo/Logo";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { CheckboxField } from "../../components/UI/CheckboxField";
import MinusIcon from "../../components/Icons/MinusIcon";
import PlusIcon from "../../components/Icons/PlusIcon";

// --- Types used locally
export type Address = {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
};

export type ShippingMethod = {
    id: string;
    label: string;
    eta: string;
    priceCents: number; // incl. VAT
};

// --- Config (tune here)
const VAT_RATE = 0.19; // 19% (Germany)
const PRICES_INCLUDE_VAT = true; // our catalog prices are gross (inkl. MwSt.)

const SHIPPING_METHODS: ShippingMethod[] = [
    { id: "standard", label: "Standard Versand", eta: "2–4 Tage", priceCents: 0 },
    { id: "express", label: "Express", eta: "1–2 Tage", priceCents: 990 },
    { id: "overnight", label: "Overnight", eta: "Nächster Tag", priceCents: 1990 },
];

const FREE_SHIPPING_THRESHOLD_CENTS = 50_00; // free standard shipping from €50

// --- Helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// --- Component
const CheckoutPage: React.FC = () => {
    const { lines, inc, setQty, clear } = useCart();

    const [shipping, setShipping] = useState<ShippingMethod>(() => SHIPPING_METHODS[0]);
    const [promo, setPromo] = useState<string>("");
    const [promoApplied, setPromoApplied] = useState<string | null>(null);

    const [address, setAddress] = useState<Address>(() => {
        const cached = localStorage.getItem("checkout_address");
        return (
            (cached && (JSON.parse(cached) as Address)) || {
                fullName: "",
                email: "",
                phone: "",
                street: "",
                city: "",
                postalCode: "",
                country: "Deutschland",
            }
        );
    });

    const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0 Cart, 1 Address, 2 Payment, 3 Success
    const [isPaying, setIsPaying] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    useEffect(() => {
        localStorage.setItem("checkout_address", JSON.stringify(address));
    }, [address]);

    // ---- Totals (gross pricing model)
    const subtotal = useMemo(() => lines.reduce((s, l) => s + l.priceCents * l.qty, 0), [lines]);

    const shippingCents = useMemo(() => {
        if (shipping.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
        return shipping.priceCents;
    }, [shipping, subtotal]);

    const discount = useMemo(() => {
        if (!promoApplied) return 0;
        if (promoApplied.toLowerCase() === "save10") return Math.round(subtotal * 0.1);
        if (promoApplied.toLowerCase() === "freeexp") return shipping.id !== "standard" ? shippingCents : 0;
        return 0;
    }, [promoApplied, subtotal, shipping.id, shippingCents]);

    const total = useMemo(() => clamp(subtotal - discount + shippingCents, 0, Number.MAX_SAFE_INTEGER), [subtotal, discount, shippingCents]);

    // VAT portion from a gross total: VAT = total - total / (1 + rate)
    const vat = useMemo(() => (PRICES_INCLUDE_VAT ? Math.round(total - total / (1 + VAT_RATE)) : Math.round(total * VAT_RATE)), [total]);

    const applyPromo = () => {
        const code = promo.trim();
        if (!code) return;
        setPromoApplied(code);
        setPromo("");
    };

    // --- Validation (simple)
    const addressValid = useMemo(() => {
        const emailOk = /.+@.+\..+/.test(address.email.trim());
        const phoneOk = address.phone.trim().length >= 6;
        const requiredOk = [address.fullName, address.street, address.city, address.postalCode, address.country].every((x) => x.trim().length > 1);
        return emailOk && phoneOk && requiredOk;
    }, [address]);

    const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!acceptTerms) return alert("Подтвердите согласие с условиями.");
        setIsPaying(true);
        // TODO: replace with your payment API (Stripe/Adyen/etc.)
        await new Promise((r) => setTimeout(r, 1200));
        setIsPaying(false);
        setStep(3);
        clear(); // empty cart
    };

    return (
        <div className="checkout">
            <header className="checkout__header">
                <div className="checkout__brand">
                    <Logo size="32px" />
                </div>
                <div className="checkout__secure">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" fill="currentColor" />
                    </svg>
                    <span>SSL Secure Checkout</span>
                </div>
            </header>

            <nav className="checkout__steps" aria-label="Шаги оформления">
                {[
                    { k: 0, label: "Cart" },
                    { k: 1, label: "Delivery" },
                    { k: 2, label: "Pay" },
                    { k: 3, label: "Complete" },
                ].map((s, i) => (
                    <div key={s.k} className={`steps__item ${step === i ? "is-active" : step > i ? "is-done" : ""}`}>
                        <span className="steps__index">{i + 1}</span>
                        <span className="steps__label">{s.label}</span>
                    </div>
                ))}
            </nav>

            <main className="checkout__main">
                <section className="checkout__content">
                    {step === 0 && (
                        <CartSection
                            lines={lines}
                            inc={inc}
                            setQty={setQty}
                            onNext={() => setStep(1)}
                        />
                    )}

                    {step === 1 && (
                        <AddressSection
                            address={address}
                            setAddress={setAddress}
                            shipping={shipping}
                            setShipping={setShipping}
                            onPrev={() => setStep(0)}
                            onNext={() => setStep(2)}
                            canContinue={addressValid}
                            subtotal={subtotal}
                        />
                    )}

                    {step === 2 && (
                        <PaymentSection
                            total={total}
                            acceptTerms={acceptTerms}
                            setAcceptTerms={setAcceptTerms}
                            onPrev={() => setStep(1)}
                            onSubmit={handlePay}
                        />
                    )}

                    {step === 3 && <SuccessSection />}
                </section>

                <aside className="checkout__sidebar" aria-label="Итог заказа">
                    <OrderSummary
                        lines={lines}
                        subtotal={subtotal}
                        shipping={shipping}
                        vat={vat}
                        discount={discount}
                        total={total}
                        promo={promo}
                        setPromo={setPromo}
                        promoApplied={promoApplied}
                        applyPromo={applyPromo}
                        freeThresholdCents={FREE_SHIPPING_THRESHOLD_CENTS}
                        shippingCents={shippingCents}
                    />
                </aside>
            </main>

            {isPaying && (
                <div className="checkout__overlay" role="alert" aria-live="polite">
                    <div className="spinner" />
                    <p>Обработка платежа…</p>
                </div>
            )}

            <footer className="checkout__footer">
                <div className="corp">
                    © {new Date().getFullYear()} dashedo.com
                </div>
                <ul>
                    <li>Политика возврата</li>
                    <li>Условия обслуживания</li>
                    <li>Конфиденциальность</li>
                </ul>
            </footer>
        </div>
    );
};

export default CheckoutPage;

// ---- Sections

type CartSectionProps = {
    lines: import("../../context/CartContext").CartLine[];
    inc: (id: string, delta: number) => void;
    setQty: (id: string, qty: number) => void;
    onNext: () => void;
};

const CartSection: React.FC<CartSectionProps> = ({ lines, inc, onNext }) => {
    const itemsCount = lines.reduce((s, l) => s + l.qty, 0);
    return (
        <div className="card">
            <div className="card__head">
                <h2 className="checkout__title">Cart</h2>
                <span className="muted">{itemsCount} items</span>
            </div>
            {lines.length === 0 ? (
                <div className="">
                    <p>Your cart is empty.</p>
                    <a className="btn--ghost" href="/">Return to shopping</a>
                </div>
            ) : (
                <ul className="cart-list">
                    {lines.map((it) => (
                        <li key={it.id} className="cart-item">
                            {it.image && <img src={it.image} alt="" loading="lazy" />}
                            <div className="cart-item__meta">
                                <h3>{it.title}</h3>
                                <div className="qty">
                                    <button aria-label="Уменьшить" onClick={() => inc(it.id, -1)}>
                                        <MinusIcon />
                                    </button>
                                    <output aria-live="polite">{it.qty}</output>
                                    <button aria-label="Увеличить" onClick={() => inc(it.id, +1)}>
                                        <PlusIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="cart-item__price">{formatMoney(it.priceCents * it.qty)}</div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="card__foot">
                <Button className="btn" size="large" disabled={lines.length === 0} onClick={onNext}>
                    Proceed to delivery
                </Button>
            </div>
        </div>
    );
};

type AddressSectionProps = {
    address: Address;
    setAddress: (a: Address) => void;
    shipping: ShippingMethod;
    setShipping: (s: ShippingMethod) => void;
    onPrev: () => void;
    onNext: () => void;
    canContinue: boolean;
    subtotal: number;
};

const AddressSection: React.FC<AddressSectionProps> = ({ address, setAddress, shipping, setShipping, onPrev, onNext, canContinue, subtotal }) => {
    const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, [k]: e.target.value });

    return (
        <div className="grid-2">
            <div className="card">
                <div className="card__head"><h2>Address</h2></div>
                <form className="form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form__row">
                        <TextField label="Full Name" value={address.fullName} onChange={set("fullName")} placeholder="John Doe" required />
                        <TextField label="Email" type="email" value={address.email} onChange={set("email")} placeholder="name@mail.com" required />
                    </div>
                    <div className="form__row">
                        <TextField label="Phone" value={address.phone} onChange={set("phone")} placeholder="+49 170 000000" required />
                        <TextField label="Postal Code" value={address.postalCode} onChange={set("postalCode")} placeholder="10115" required />
                    </div>
                    <div className="form__row">
                        <TextField label="Street Address" value={address.street} onChange={set("street")} placeholder="Unter den Linden 1" required />
                    </div>
                    <div className="form__row">
                        <TextField label="City" value={address.city} onChange={set("city")} placeholder="Berlin" required />
                        <TextField label="Country" value={address.country} onChange={set("country")} placeholder="Deutschland" required />
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card__head"><h2>Shipping Method</h2></div>
                <div className="shipping">
                    {SHIPPING_METHODS.map((m) => {
                        const freeByThreshold = m.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD_CENTS;
                        const effectivePrice = freeByThreshold ? 0 : m.priceCents;
                        return (
                            <label key={m.id} className={`ship ${shipping.id === m.id ? "is-selected" : ""}`}>
                                <input type="radio" name="shipping" checked={shipping.id === m.id} onChange={() => setShipping(m)} />
                                <div className="ship__body">
                                    <div className="ship__label">
                                        <strong>{m.label}</strong>
                                        <span className="muted">{m.eta}</span>
                                    </div>
                                    <div className="ship__price">{effectivePrice === 0 ? "Free" : formatMoney(effectivePrice)}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="actions">
                <Button className="btn btn--ghost" size="large" onClick={onPrev}>Back</Button>
                <Button className="btn" size="large" onClick={onNext} disabled={!canContinue}>Proceed to Payment</Button>
            </div>
        </div>
    );
};

const PaymentSection: React.FC<{
    total: number;
    acceptTerms: boolean;
    setAcceptTerms: (b: boolean) => void;
    onPrev: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}> = ({ total, acceptTerms, setAcceptTerms, onPrev, onSubmit }) => {
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [exp, setExp] = useState("");
    const [cvc, setCvc] = useState("");
    const [brand, setBrand] = useState<CardBrand>("unknown");

    const digits = cardNumber.replace(/\s+/g, "");
    const rule = BRAND_RULES[brand];
    const cardLenOk = lengthOkForBrand(brand, digits.length);
    const luhnOk = digits.length >= 12 && luhnCheck(digits);
    const cardOk = cardLenOk && luhnOk;

    const expOk = expiryValid(exp);
    const cvcMax = rule.cvc;
    const cvcOk = new RegExp(`^\\d{${cvcMax}}$`).test(cvc);

    // --- Тексты ошибок для TextField
    const nameError =
        cardName.trim().length === 0 ? "Укажите имя как на карте" :
            cardName.trim().length < 3 ? "Слишком короткое имя" : undefined;

    let numberError: string | undefined;
    if (digits.length > 0 && !cardLenOk) {
        numberError = `Неверная длина для ${rule.label}`;
    } else if (digits.length > 0 && !luhnOk) {
        numberError = "Проверьте номер карты (Луна)";
    }

    const expError =
        exp.length > 0 && !expOk ? "Неверная дата или карта просрочена" : undefined;

    const cvcError =
        cvc.length > 0 && !cvcOk ? `CVC должен быть из ${cvcMax} цифр` : undefined;

    const formOk = !nameError && cardOk && expOk && cvcOk && acceptTerms;

    return (
        <div className="grid-2">
            <div className="card">
                <div className="card__head"><h2>Payment</h2></div>

                <form className="form" onSubmit={onSubmit} noValidate>
                    <TextField
                        label="Cardholder"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="IVAN IVANOV"
                        required
                        autoComplete="cc-name"
                        error={nameError}
                    />

                    <TextField
                        label={`Card Number${brand !== "unknown" ? ` (${rule.label})` : ""}`}
                        value={cardNumber}
                        onChange={(e) => {
                            const raw = e.target.value;
                            const onlyDigits = raw.replace(/\D/g, "");
                            const b = detectBrand(onlyDigits);
                            setBrand(b);
                            setCardNumber(formatCardNumber(raw, b));
                            // подрежем CVC под бренд
                            const cvcLen = BRAND_RULES[b].cvc;
                            setCvc((prev) => prev.replace(/\D/g, "").slice(0, cvcLen));
                        }}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        pattern="[0-9\s]*"
                        autoComplete="cc-number"
                        error={numberError}
                        hint="Мы не сохраняем данные карты"
                    />

                    <div className="form__row">
                        <TextField
                            label="Expiration Date (MM/YY)"
                            value={exp}
                            onChange={(e) => setExp(formatExpiryInput(e.target.value))}
                            placeholder="08/28"
                            inputMode="numeric"
                            maxLength={5}
                            autoComplete="cc-exp"
                            error={expError}
                        />

                        <TextField
                            label={`CVC${brand === "amex" ? " (4 digits)" : ""}`}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, cvcMax))}
                            placeholder={brand === "amex" ? "1234" : "123"}
                            inputMode="numeric"
                            pattern={brand === "amex" ? "\\d{4}" : "\\d{3}"}
                            maxLength={cvcMax}
                            autoComplete="cc-csc"
                            error={cvcError}
                            hint={brand === "amex" ? "Для AmEx — 4 цифры" : "Для остальных — 3 цифры"}
                        />
                    </div>

                    <div className="card__head"><h2>Secure Payment</h2></div>

                    <div className="col-row card__section">
                        <div aria-hidden>
                            <div className="cc">
                                <div className="cc__chip" />
                                <div className="cc__num">{cardNumber || "•••• •••• •••• ••••"}</div>
                                <div className="cc__row">
                                    <span>{cardName || "CARDHOLDER"}</span>
                                    <span>{exp || "MM/YY"}</span>
                                </div>
                            </div>
                        </div>
                        <ul className="bullets">
                            <li>TLS 1.2 encryption</li>
                            <li>Two-step transaction verification</li>
                            <li>We do not store card data</li>
                        </ul>
                    </div>

                    <CheckboxField
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        label={<>I <a href="#terms">accept the terms and conditions</a></>}
                    />

                    <div className="actions">
                        <Button className="btn btn--ghost" onClick={onPrev}>Back</Button>
                        <Button className="btn btn--xl" type="submit" disabled={!formOk}>
                            Pay {formatMoney(total)}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SuccessSection: React.FC = () => (
    <div className="success card">
        <div className="success__icon" aria-hidden>
            <svg width="56" height="56" viewBox="0 0 24 24">
                <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z" fill="currentColor" />
            </svg>
        </div>
        <h2>Thanks! Your order has been placed</h2>
        <p className="muted">We have sent a confirmation to your email.</p>
        <a className="btn" href="/">Continue Shopping</a>
    </div>
);

// ---- Sidebar
const OrderSummary: React.FC<{
    lines: import("../../context/CartContext").CartLine[];
    subtotal: number;
    shipping: ShippingMethod;
    vat: number;
    discount: number;
    total: number;
    promo: string;
    setPromo: (s: string) => void;
    promoApplied: string | null;
    applyPromo: () => void;
    freeThresholdCents: number;
    shippingCents: number;
}> = ({ lines, subtotal, vat, discount, total, promo, setPromo, promoApplied, applyPromo, freeThresholdCents, shippingCents }) => {
    return (
        <div className="summary">
            <h3>Total</h3>
            <ul className="summary__list">
                <li><span>Items</span><span>{formatMoney(subtotal)}</span></li>
                <li><span>Shipping</span><span>{shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</span></li>
                {discount > 0 && <li className="good"><span>Discount{promoApplied ? ` (${promoApplied})` : ""}</span><span>-{formatMoney(discount)}</span></li>}
                <li><span>Including VAT (19%)</span><span>{formatMoney(vat)}</span></li>
                <li className="sum"><span>To pay</span><span>{formatMoney(total)}</span></li>
            </ul>

            <div className="promo">
                <TextField label="Promo code" className="promo__input" id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code: SAVE10" />
                <Button className="btn btn--ghost" size="small" disabled={!promo.trim()} onClick={applyPromo}>Apply</Button>
            </div>

            <div className="muted" style={{ marginTop: 8 }}>
                Free shipment from {formatMoney(freeThresholdCents)}
            </div>

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
                            <div className="mini-item__price">{formatMoney(it.priceCents * it.qty)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
