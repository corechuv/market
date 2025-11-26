// src/pages/Checkout/PaymentPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import "./Checkout.scss";
import styles from "./Checkout.module.scss";
import c from "./PaymentPage.module.scss";

import Page from "../../components/UI/Page/Page";

import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

import {
    upsertCustomer,
    toOrderItems,
    toAddressIn,
    createOrder,
    createPaymentIntent,
    confirmPayment,
} from "../../services/checkoutApi";

import { toISO2 } from "../../utils/country";
import { vatRateFor } from "../../utils/vat";
import { formatMoney } from "../../utils/money";

import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import mastercard from "/mastercard.png";
import visa from "/visa.png";
import amex from "@/assets/svg/amex.svg";

import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { CheckboxField } from "../../components/UI/CheckboxField";
import { useTranslation, Trans } from "react-i18next";

// --- Stripe init
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK as string);
const PRICES_INCLUDE_VAT = true;

// Типы такие же, как в CheckoutPage
type ProviderId = "stripe" | "paypal" | "invoice";

type FormAddress = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
};

type ShippingUi = {
    id: string;
    label: string;
    eta: string;
    priceCents: number;
    effectivePriceCents: number;
    carrierCode: string;
    serviceCode: string;
    freeFromCents?: number | null;
};

type PaymentLocationState = {
    provider: ProviderId;
    address: FormAddress;
    shipping: ShippingUi;
    promoApplied: string | null;
};

const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

// ===================== PAGE =====================

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as PaymentLocationState | undefined;

    const { lines, removeSelected } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation("payment");

    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    const selectedLines = useMemo(
        () => lines.filter((l) => l.selected),
        [lines]
    );

    // Редиректы, если зашли "криво"
    useEffect(() => {
        if (!state || !state.address || !state.shipping) {
            navigate("/checkout", { replace: true });
        }
    }, [state, navigate]);

    useEffect(() => {
        if (state && selectedLines.length === 0) {
            navigate("/cart", { replace: true });
        }
    }, [selectedLines.length, state, navigate]);

    if (!state || !state.address || !state.shipping || selectedLines.length === 0) {
        return null;
    }

    const { provider, address, shipping, promoApplied } = state;

    const subtotal = useMemo(
        () => selectedLines.reduce((s, l) => s + l.priceCents * l.qty, 0),
        [selectedLines]
    );

    const baseShippingCents =
        shipping.effectivePriceCents ?? shipping.priceCents ?? 0;

    const discount = useMemo(() => {
        if (!promoApplied) return 0;
        if (promoApplied.toLowerCase() === "save10")
            return Math.round(subtotal * 0.1);
        if (promoApplied.toLowerCase() === "freeexp") return baseShippingCents;
        return 0;
    }, [promoApplied, subtotal, baseShippingCents]);

    const total = useMemo(
        () =>
            clamp(
                subtotal - discount + baseShippingCents,
                0,
                Number.MAX_SAFE_INTEGER
            ),
        [subtotal, discount, baseShippingCents]
    );

    const countryISO2 = useMemo(
        () => toISO2(address.country || "DE"),
        [address.country]
    );
    const fallbackVatRate = vatRateFor(countryISO2);
    const vat = useMemo(
        () =>
            PRICES_INCLUDE_VAT
                ? Math.round(total - total / (1 + fallbackVatRate))
                : Math.round(total * fallbackVatRate),
        [total, fallbackVatRate]
    );

    const addressValid = useMemo(() => {
        const emailOk = /.+@.+\..+/.test(address.email.trim());
        const requiredOk = [
            address.firstName,
            address.lastName,
            address.line1,
            address.city,
            address.postalCode,
            address.country,
        ].every((x) => x.trim().length > 1);
        const phoneLen = address.phone.trim().length;
        const phoneOk = phoneLen === 0 || phoneLen >= 6;
        return emailOk && requiredOk && phoneOk;
    }, [address]);

    const canPay = addressValid && !!shipping;

    const handleBack = () => {
        navigate("/checkout", { replace: true });
    };

    const resolveCustomerId = async (): Promise<string | null> => {
        if (isAuthenticated && (user as any)?.id) return (user as any).id as string;
        const created = await upsertCustomer({
            email: address.email,
            phone: address.phone,
            firstName: address.firstName,
            lastName: address.lastName,
        }).catch(() => ({ id: undefined } as any));
        return created?.id ?? null;
    };

    // --- Invoice / bank transfer
    const handlePayManual = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!acceptTerms) {
            alert(t("terms.acceptRequired"));
            return;
        }
        if (!canPay) return;

        setIsPaying(true);
        try {
            const customer = await resolveCustomerId();

            const clientSubtotal = subtotal;
            const clientDiscount = discount;
            const clientShipping = baseShippingCents;
            const clientVat = vat;
            const clientTotal = total;

            const order = await createOrder({
                customerId: customer,
                items: toOrderItems(selectedLines),
                currency: "EUR",
                shippingCents: clientShipping,
                shippingMethod: shipping.label,
                selectedCarrierCode: shipping.carrierCode,
                selectedServiceCode: shipping.serviceCode,
                deliveryAddress: toAddressIn(address),
                billingAddress: null,
                promoCode: promoApplied,
                subtotalCents: clientSubtotal,
                discountCents: clientDiscount,
                vatCents: clientVat,
                totalCents: clientTotal,
                serverCalculate: true,
            });

            await createPaymentIntent(order.id, order.totalCents, "invoice");

            removeSelected();
            navigate("/checkout/success", {
                replace: true,
                state: { orderNo: order.number },
            });
        } catch (err: any) {
            console.error(err);
            alert(
                t("errors.paymentFailed", {
                    message: err?.message ?? String(err),
                })
            );
        } finally {
            setIsPaying(false);
        }
    };

    // --- Stripe
    const handlePayStripe = async (
        e: React.FormEvent<HTMLFormElement>,
        args: { stripe: any; elements: any; holder: string }
    ) => {
        e.preventDefault();
        if (!acceptTerms) {
            alert(t("terms.acceptRequired"));
            return;
        }
        if (!canPay) return;

        setIsPaying(true);
        try {
            const customer = await resolveCustomerId();

            const clientSubtotal = subtotal;
            const clientDiscount = discount;
            const clientShipping = baseShippingCents;
            const clientVat = vat;
            const clientTotal = total;

            const order = await createOrder({
                customerId: customer,
                items: toOrderItems(selectedLines),
                currency: "EUR",
                shippingCents: clientShipping,
                shippingMethod: shipping.label,
                selectedCarrierCode: shipping.carrierCode,
                selectedServiceCode: shipping.serviceCode,
                deliveryAddress: toAddressIn(address),
                billingAddress: null,
                promoCode: promoApplied,
                subtotalCents: clientSubtotal,
                discountCents: clientDiscount,
                vatCents: clientVat,
                totalCents: clientTotal,
                serverCalculate: true,
            });

            const intent = await createPaymentIntent(
                order.id,
                order.totalCents,
                "stripe"
            );
            if (!intent?.clientSecret)
                throw new Error("Stripe client secret not returned from server");

            const numberEl = args.elements.getElement(CardNumberElement);
            if (!numberEl) throw new Error("Stripe card element not ready");

            const result = await args.stripe.confirmCardPayment(intent.clientSecret, {
                payment_method: {
                    card: numberEl,
                    billing_details: {
                        name: args.holder,
                    },
                },
            });

            if (result.error)
                throw new Error(result.error.message || "Stripe confirmation failed");

            await confirmPayment(intent.id);

            removeSelected();
            navigate("/checkout/success", {
                replace: true,
                state: { orderNo: order.number },
            });
        } catch (err: any) {
            console.error(err);
            alert(
                t("errors.paymentFailed", {
                    message: err?.message ?? String(err),
                })
            );
        } finally {
            setIsPaying(false);
        }
    };

    // --- PayPal
    const preparePayPalPayment = async () => {
        if (!acceptTerms) {
            throw new Error(t("terms.acceptRequired"));
        }
        if (!canPay) {
            throw new Error(t("errors.orderInvalid"));
        }

        const customer = await resolveCustomerId();

        const clientSubtotal = subtotal;
        const clientDiscount = discount;
        const clientShipping = baseShippingCents;
        const clientVat = vat;
        const clientTotal = total;

        const order = await createOrder({
            customerId: customer,
            items: toOrderItems(selectedLines),
            currency: "EUR",
            shippingCents: clientShipping,
            shippingMethod: shipping.label,
            selectedCarrierCode: shipping.carrierCode,
            selectedServiceCode: shipping.serviceCode,
            deliveryAddress: toAddressIn(address),
            billingAddress: null,
            promoCode: promoApplied,
            subtotalCents: clientSubtotal,
            discountCents: clientDiscount,
            vatCents: clientVat,
            totalCents: clientTotal,
            serverCalculate: true,
        });

        const payment = await createPaymentIntent(order.id, order.totalCents, "paypal");
        if (!payment?.providerPaymentId) {
            throw new Error("PayPal order id not returned from server");
        }

        return {
            paypalOrderId: payment.providerPaymentId,
            paymentId: payment.id,
            orderNo: order.number,
            approvalUrl: payment.approvalUrl,
        };
    };

    const onPayPalApproved = async (paymentId: string, orderNo: string) => {
        setIsPaying(true);
        try {
            await confirmPayment(paymentId);
            removeSelected();
            navigate("/checkout/success", {
                replace: true,
                state: { orderNo },
            });
        } catch (err: any) {
            console.error(err);
            alert(
                t("errors.paymentFailed", {
                    message: err?.message ?? String(err),
                })
            );
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <Page>
            <div className={c.payment}>
                <div className={c.payment__summary}>
                    <h2 className={c.payment__title}>{formatMoney(total)}</h2>
                </div>

                <PaymentSection
                    displayTotal={total}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    onPrev={handleBack}
                    onSubmitManual={handlePayManual}
                    onSubmitStripe={handlePayStripe}
                    disablePay={isPaying}
                    provider={provider}
                    preparePayPalPayment={preparePayPalPayment}
                    onPayPalApproved={onPayPalApproved}
                    canPay={canPay}
                />
            </div>

            {isPaying && (
                <div className={styles.checkout__overlay} role="alert" aria-live="polite">
                    <div className={styles.checkout__spinner} />
                    <p>{t("overlay.processing")}</p>
                </div>
            )}
        </Page>
    );
};

export default PaymentPage;

// ---------- PaymentSection + StripeForm + PayPalForm

const PaymentSection: React.FC<{
    displayTotal: number;
    acceptTerms: boolean;
    setAcceptTerms: (b: boolean) => void;
    onPrev: () => void;
    onSubmitManual: (e: React.FormEvent<HTMLFormElement>) => void;
    onSubmitStripe: (
        e: React.FormEvent<HTMLFormElement>,
        args: { stripe: any; elements: any; holder: string }
    ) => void;
    disablePay?: boolean;
    provider: "stripe" | "paypal" | "invoice";
    preparePayPalPayment: () => Promise<{
        paypalOrderId: string;
        paymentId: string;
        orderNo: string;
        approvalUrl?: string;
    }>;
    onPayPalApproved: (paymentId: string, orderNo: string) => Promise<void>;
    canPay: boolean;
}> = ({
    displayTotal,
    acceptTerms,
    setAcceptTerms,
    onPrev,
    onSubmitManual,
    onSubmitStripe,
    disablePay,
    provider,
    preparePayPalPayment,
    onPayPalApproved,
    canPay,
}) => {
        const [cardName, setCardName] = useState("");
        const { t } = useTranslation("payment");

        const [theme, setTheme] = useState(
            () => document.documentElement.getAttribute("data-theme") || "light"
        );
        useEffect(() => {
            const observer = new MutationObserver(() => {
                setTheme(document.documentElement.getAttribute("data-theme") || "light");
            });
            observer.observe(document.documentElement, { attributes: true });
            return () => observer.disconnect();
        }, []);

        if (provider === "stripe") {
            return (
                <>
                    <div className={c.payment__icons}>
                        <img loading="lazy" src={theme === "dark" ? visa : visa} alt="" />
                        <img
                            loading="lazy"
                            src={theme === "dark" ? mastercard : mastercard}
                            alt=""
                        />
                        <img loading="lazy" src={theme === "dark" ? amex : amex} alt="" />
                    </div>
                    <Elements stripe={stripePromise}>
                        <StripeForm
                            cardName={cardName}
                            setCardName={setCardName}
                            acceptTerms={acceptTerms}
                            setAcceptTerms={setAcceptTerms}
                            onPrev={onPrev}
                            onSubmitStripe={onSubmitStripe}
                            disablePay={disablePay}
                            displayTotal={displayTotal}
                            canPay={canPay}
                        />
                    </Elements>
                </>
            );
        }

        if (provider === "paypal") {
            return (
                <div>
                    <PayPalForm
                        acceptTerms={acceptTerms}
                        setAcceptTerms={setAcceptTerms}
                        onPrev={onPrev}
                        disablePay={disablePay}
                        preparePayPalPayment={preparePayPalPayment}
                        onPayPalApproved={onPayPalApproved}
                        displayTotal={displayTotal}
                        canPay={canPay}
                    />
                </div>
            );
        }

        // Manual — invoice / банковский перевод
        return (
            <form
                className="form"
                onSubmit={(e) => {
                    if (!canPay) {
                        e.preventDefault();
                        return;
                    }
                    onSubmitManual(e);
                }}
                noValidate
            >
                <h2 className={c.payment__title}>{t("invoice.title")}</h2>
                <h2 className={c.payment__description}>{t("invoice.description")}</h2>

                <div className={c.payment__agree}>
                    <CheckboxField
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        label={
                            <Trans
                                i18nKey="terms.label"
                                ns="payment"
                                components={{
                                    a: <a href="#terms" />,
                                }}
                            />
                        }
                    />
                </div>

                <div className={c.payment__actions}>
                    <Button
                        size="small"
                        type="submit"
                        disabled={!!disablePay || !acceptTerms || !canPay}
                    >
                        {t("invoice.placeOrder")}
                    </Button>
                    <Button size="small" variant="link" onClick={onPrev} type="button">
                        {t("buttons.back")}
                    </Button>
                </div>
            </form>
        );
    };

// Внутренняя форма Stripe
const StripeForm: React.FC<{
    cardName: string;
    setCardName: (s: string) => void;
    acceptTerms: boolean;
    setAcceptTerms: (b: boolean) => void;
    onPrev: () => void;
    onSubmitStripe: (
        e: React.FormEvent<HTMLFormElement>,
        args: { stripe: any; elements: any; holder: string }
    ) => void;
    disablePay?: boolean;
    displayTotal: number;
    canPay: boolean;
}> = ({
    cardName,
    setCardName,
    acceptTerms,
    setAcceptTerms,
    onPrev,
    onSubmitStripe,
    disablePay,
    canPay,
}) => {
        const stripe = useStripe();
        const elements = useElements();
        const { t } = useTranslation("payment");

        const [nameTouched, setNameTouched] = useState(false);

        const nameError =
            nameTouched && cardName.trim().length < 3
                ? t("stripe.cardholderError")
                : undefined;

        const stripeFormOk =
            !!stripe && !!elements && cardName.trim().length >= 3 && acceptTerms;
        const payDisabled = !!disablePay || !stripeFormOk || !canPay;

        const inputStyle = {
            iconColor: "#c4f0ff",
            fontWeight: "400",
            lineHeight: "43px",
            fontFamily: "Inter, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": {
                color: "#fce883",
            },
            "::placeholder": {
                color: "#9CA3AF",
            },
        } as any;

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            if (!stripe || !elements || !canPay) {
                e.preventDefault();
                return;
            }

            if (!nameTouched) setNameTouched(true);

            if (cardName.trim().length < 3) {
                e.preventDefault();
                return;
            }

            return onSubmitStripe(e, { stripe, elements, holder: cardName.trim() });
        };

        return (
            <form
                style={{ maxWidth: "200ppx" }}
                className="form"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="field">
                    <label className="label">{t("stripe.cardNumberLabel")}</label>
                    <div className="stripe-input">
                        <CardNumberElement
                            options={{
                                placeholder: t("stripe.cardNumberPlaceholder"),
                                style: { base: inputStyle },
                            }}
                        />
                    </div>
                </div>

                <div className={c["payment__form--row"]}>
                    <div className="field">
                        <label className="label">{t("stripe.expiryLabel")}</label>
                        <div className="stripe-input">
                            <CardExpiryElement
                                options={{
                                    placeholder: t("stripe.expiryPlaceholder"),
                                    style: { base: inputStyle },
                                }}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">{t("stripe.cvcLabel")}</label>
                        <div className="stripe-input">
                            <CardCvcElement
                                options={{
                                    placeholder: t("stripe.cvcPlaceholder"),
                                    style: { base: inputStyle },
                                }}
                            />
                        </div>
                    </div>
                </div>

                <TextField
                    label={t("stripe.cardholderLabel")}
                    value={cardName}
                    onChange={(e) => {
                        setCardName(e.target.value);
                    }}
                    onBlur={() => setNameTouched(true)}
                    required
                    autoComplete="cc-name"
                    error={nameError}
                />

                <div className={c.payment__agree}>
                    <CheckboxField
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        label={
                            <Trans
                                i18nKey="terms.label"
                                ns="payment"
                                components={{
                                    a: <a href="#terms" />,
                                }}
                            />
                        }
                    />
                </div>

                <div className={c.payment__actions}>
                    <Button size="small" type="submit" disabled={payDisabled}>
                        {t("stripe.button")}
                    </Button>
                    <Button size="small" variant="link" onClick={onPrev}>
                        {t("buttons.back")}
                    </Button>
                </div>
            </form>
        );
    };

const PayPalForm: React.FC<{
    acceptTerms: boolean;
    setAcceptTerms: (b: boolean) => void;
    onPrev: () => void;
    disablePay?: boolean;
    displayTotal: number;
    preparePayPalPayment: () => Promise<{
        paypalOrderId: string;
        paymentId: string;
        orderNo: string;
        approvalUrl?: string;
    }>;
    onPayPalApproved: (paymentId: string, orderNo: string) => Promise<void>;
    canPay: boolean;
}> = ({
    acceptTerms,
    setAcceptTerms,
    onPrev,
    disablePay,
    preparePayPalPayment,
    onPayPalApproved,
    canPay,
}) => {
        const [busy, setBusy] = useState(false);
        const paymentIdRef = React.useRef<string | null>(null);
        const orderNoRef = React.useRef<string | null>(null);
        const chRef = React.useRef<BroadcastChannel | null>(null);
        const { t } = useTranslation("payment");

        const openInNewTab = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!acceptTerms) {
                alert(t("terms.acceptRequired"));
                return;
            }
            if (!canPay) {
                return;
            }
            if (disablePay || busy) return;

            setBusy(true);
            let tab: Window | null = null;
            let closePoll: number | null = null;

            const cleanup = () => {
                if (closePoll) window.clearInterval(closePoll);
                try {
                    chRef.current?.close();
                } catch { }
                window.removeEventListener("message", onMessage);
                try {
                    tab && tab.close();
                } catch { }
                setBusy(false);
            };

            try {
                chRef.current = new BroadcastChannel("pp-redirect");
                chRef.current.onmessage = async (ev) => {
                    const data = ev?.data || {};
                    if (data?.type !== "paypal-approved") return;
                    try {
                        if (!paymentIdRef.current || !orderNoRef.current)
                            throw new Error("Missing paymentId/orderNo");
                        await onPayPalApproved(paymentIdRef.current, orderNoRef.current);
                    } finally {
                        cleanup();
                    }
                };
            } catch {
                // старые браузеры — без BroadcastChannel
            }

            const onMessage = async (ev: MessageEvent) => {
                const data = ev?.data || {};
                if (data?.type !== "paypal-approved") return;
                try {
                    if (!paymentIdRef.current || !orderNoRef.current)
                        throw new Error("Missing paymentId/orderNo");
                    await onPayPalApproved(paymentIdRef.current, orderNoRef.current);
                } finally {
                    cleanup();
                }
            };
            window.addEventListener("message", onMessage);

            try {
                const { paypalOrderId, paymentId, orderNo, approvalUrl } =
                    await preparePayPalPayment();
                paymentIdRef.current = paymentId;
                orderNoRef.current = orderNo;

                const href =
                    approvalUrl ||
                    `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`;

                const tabWin = window.open(href, "_blank");
                tab = tabWin;
                if (!tabWin) {
                    window.location.assign(href);
                    return;
                }

                closePoll = window.setInterval(() => {
                    if (tab && tab.closed) cleanup();
                }, 700);
            } catch (err: any) {
                console.error(err);
                alert(
                    t("errors.paypalStartFailed", {
                        message: err?.message ?? String(err),
                    })
                );
                setBusy(false);
            }
        };

        return (
            <form className="form" onSubmit={openInNewTab} noValidate>
                <h2 className={c.payment__description}>{t("paypal.description")}</h2>
                <div className={c.payment__agree}>
                    <CheckboxField
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        label={
                            <Trans
                                i18nKey="terms.label"
                                ns="payment"
                                components={{
                                    a: <a href="#terms" />,
                                }}
                            />
                        }
                    />
                </div>
                <div className={c.payment__actions}>
                    <Button
                        size="small"
                        type="submit"
                        disabled={!!disablePay || busy || !canPay}
                    >
                        {t("paypal.button")}
                    </Button>
                    <Button size="small" variant="link" onClick={onPrev} type="button">
                        {t("buttons.back")}
                    </Button>
                </div>
            </form>
        );
    };
