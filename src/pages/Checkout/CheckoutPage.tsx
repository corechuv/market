// src/pages/Checkout/CheckoutPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import "./Checkout.scss";
import styles from "./Checkout.module.scss";
import {
  quoteTotals,
  upsertCustomer,
  toOrderItems,
  toAddressIn,
  createOrder,
  createPaymentIntent,
  confirmPayment,
  listShippingOptions,
  type ShippingOption,
} from "../../services/checkoutApi";
import { useCart } from "../../context/CartContext";
import { formatMoney } from "../../utils/money";

import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { SelectField } from "../../components/UI/SelectField";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { toISO2 } from "../../utils/country";
import { vatRateFor } from "../../utils/vat";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { CheckboxField } from "../../components/UI/CheckboxField";
import RadioCard from "../../components/UI/RadioCard";

import dpd from "/dpd.png";
import dhl from "/dhl.png";
import gls from "@/assets/gls.png";
import hermes from "@/assets/svg/hermes.svg";
import mastercard from "/mastercard.png";
import paypal from "/paypal.png";
import visa from "/visa.png";
import amex from "@/assets/svg/amex.svg";
import Page from "../../components/UI/Page/Page";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/Checkout/User/Wrapper";
import { buildAvatarSrc } from "../../utils/avatar";
import WrapperSkeleton from "../../components/Checkout/User/Wrapper.Skeleton";
import { Summary } from "../../components/Checkout/Order/Summary";

const CARRIER_LOGOS = { dhl, hermes, dpd, gls } as const;

// === Stripe init
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK as string);

// === Тип адреса для формы (без обязательных id/label)
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

type AccountAddress = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  country: string; // ISO-2
  postalCode: string;
  region?: string | null;
  city: string;
  line1: string;
  line2?: string | null;
  phone?: string | null;
  email?: string | null;
  isDefault: boolean;
  createdAt: string;
};

const accountToForm = (a: AccountAddress, u?: any): FormAddress => ({
  firstName: a.firstName || u?.firstName || "",
  lastName: a.lastName || u?.lastName || "",
  email: a.email || u?.email || "",
  phone: a.phone || u?.phone || "",
  line1: a.line1 || "",
  line2: a.line2 || "",
  city: a.city || "",
  postalCode: a.postalCode || "",
  country: a.country || "DE",
});

// Вариант доставки для UI
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

// --- Config
const PRICES_INCLUDE_VAT = true; // цены каталога — брутто

// === Account sync (LS) ===
const CHECKOUT_ADDR_LS_KEY = "checkout_address";

function readCheckoutDraft(): FormAddress {
  const defaults: FormAddress = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "Deutschland",
  };
  try {
    const raw = localStorage.getItem(CHECKOUT_ADDR_LS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<FormAddress>;
    return {
      ...defaults,
      ...parsed,
      firstName: String(parsed.firstName ?? ""),
      lastName: String(parsed.lastName ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      line1: String(parsed.line1 ?? ""),
      line2: parsed.line2 ? String(parsed.line2) : "",
      city: String(parsed.city ?? ""),
      postalCode: String(parsed.postalCode ?? ""),
      country: String(parsed.country ?? "Deutschland"),
    };
  } catch {
    return defaults;
  }
}

// --- Helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function etaToStr(min?: number | null, max?: number | null) {
  if (!min && !max) return "";
  if (min && max && min !== max) return `${min}–${max} Tage`;
  return `${min || max} Tag${(min || max) === 1 ? "" : "e"}`;
}

function normalizeCarrier(code?: string) {
  return (code || "").toLowerCase().replace(/[^a-z]/g, "");
}

function carrierIconFor(option: ShippingUi) {
  const key = normalizeCarrier(option.carrierCode) as keyof typeof CARRIER_LOGOS;
  const src = CARRIER_LOGOS[key];

  if (!src) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M3 7h11v7h-1.5a2.5 2.5 0 0 0-5 0H6a2.5 2.5 0 0 0-5 0H0V9a2 2 0 0 1 2-2h1z"
          fill="currentColor"
          opacity=".5"
        />
        <path
          d="M14 7h4l4 4v3h-2.5a2.5 2.5 0 0 0-5 0H14V7z"
          fill="currentColor"
        />
      </svg>
    );
  }

  const alt = option.label?.split("•")[0]?.trim() || option.carrierCode || "Carrier";
  return <img loading="lazy" src={src} alt={`${alt} logo`} height={18} />;
}

// --- Component
const CheckoutPage: React.FC = () => {
  type ProviderId = "stripe" | "paypal" | "invoice";
  const [provider, setProvider] = useState<ProviderId>("stripe");

  const navigate = useNavigate();

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

  const pmOptions: Array<{
    id: ProviderId;
    title: React.ReactNode;
    caption?: React.ReactNode;
    icon?: React.ReactNode;
  }> = [
    {
      id: "stripe",
      title: <strong>Card payment</strong>,
      icon: (
        <>
          <img loading="lazy" src={theme === "dark" ? visa : visa} alt="" />
          <img loading="lazy" src={theme === "dark" ? mastercard : mastercard} alt="" />
          <img loading="lazy" src={theme === "dark" ? amex : amex} alt="" />
        </>
      ),
    },
    {
      id: "paypal",
      title: <strong>PayPal</strong>,
      icon: <img loading="lazy" src={theme === "dark" ? paypal : paypal} alt="" />,
    },
    {
      id: "invoice",
      title: <strong>Bank transfer / Invoice</strong>,
      caption: <span className="muted">We’ll send payment instructions by email</span>,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3l9 5v2H3V8l9-5zM4 11h16v8H4z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const { lines, clear } = useCart();

  // ACCOUNT step
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);

  // доставка
  const [shippingOptions, setShippingOptions] = useState<ShippingUi[]>([]);
  const [shipping, setShipping] = useState<ShippingUi | null>(null);
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState<string | null>(null);

  const [promo, setPromo] = useState<string>("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);

  // форма адреса
  const [address, setAddress] = useState<FormAddress>(() => readCheckoutDraft());
  const [savedAddresses, setSavedAddresses] = useState<AccountAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "manual">("manual");
  const [manualDraft] = useState<FormAddress>(() => readCheckoutDraft());

  // 0 Account, 1 Address, 2 Payment
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isPaying, setIsPaying] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      setCustomerId(user?.id ?? null);

      // ← всегда проставляем базовые поля из аккаунта (не оставляем старый LS-мусор)
      setAddress((a) => ({
        ...a,
        email: (user as any)?.email || "",
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        phone: (user as any)?.phone || "",
      }));

      // подтягиваем адреса из /addresses/my и выбираем дефолтный
      (async () => {
        try {
          const { data } = await api.get<AccountAddress[]>("/addresses/my");
          const list = Array.isArray(data) ? data : [];
          setSavedAddresses(list);

          const def = list.find((x) => x.isDefault) || list[0];
          if (def) {
            setSelectedAddressId(def.id);
            setAddress(accountToForm(def, user));
          } else {
            setSelectedAddressId("manual");
            // чистый ручной ввод, но с ФИО/email/phone из аккаунта:
            setAddress((a) => ({
              ...a,
              line1: "",
              line2: "",
              city: "",
              postalCode: "",
              country: a.country || "Deutschland",
            }));
          }
        } catch {
          // при ошибке загрузки адресов — просто ручной ввод
          setSavedAddresses([]);
          setSelectedAddressId("manual");
        }
      })();
    } else {
      // logout/гость — возвращаемся к черновику
      setCustomerId(null);
      setSavedAddresses([]);
      setSelectedAddressId("manual");
      setAddress(readCheckoutDraft());
    }
  }, [authLoading, isAuthenticated, user]);

  const handleSelectSavedAddr = (id: string | "manual") => {
    setSelectedAddressId(id);
    if (id === "manual") {
      setAddress(manualDraft);
    } else {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) setAddress(accountToForm(found, user));
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_ADDR_LS_KEY, JSON.stringify(address));
    } catch {}
  }, [address]);

  // Totals
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.priceCents * l.qty, 0),
    [lines]
  );

  // страна доставки (для VAT и тарифов)
  const countryISO2 = useMemo(() => toISO2(address.country || "DE"), [address.country]);

  // Загрузка вариантов доставки
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setShipLoading(true);
      setShipError(null);
      try {
        const raw: ShippingOption[] = await listShippingOptions({
          country: countryISO2,
          subtotalCents: subtotal,
        });
        if (cancelled) return;
        const ui: ShippingUi[] = raw.map((o) => ({
          id: o.id,
          label: o.label,
          eta: etaToStr(o.etaMinDays ?? undefined, o.etaMaxDays ?? undefined),
          priceCents: o.priceCents,
          effectivePriceCents: o.effectivePriceCents,
          carrierCode: o.carrierCode,
          serviceCode: o.serviceCode,
          freeFromCents: o.freeFromCents ?? undefined,
        }));
        setShippingOptions(ui);
        setShipping((cur) => {
          if (cur && ui.find((x) => x.id === cur.id)) return cur;
          return ui[0] || null;
        });
      } catch (e: any) {
        if (!cancelled) {
          setShipError(e?.message || "Failed to load shipping options");
          setShippingOptions([]);
          setShipping(null);
        }
      } finally {
        if (!cancelled) setShipLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [countryISO2, subtotal]);

  // базовая стоимость доставки
  const baseShippingCents = useMemo(() => {
    if (!shipping) return 0;
    return shipping.effectivePriceCents ?? shipping.priceCents ?? 0;
  }, [shipping]);

  // --- серверный квот
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState<string | null>(null);
  const [serverQuote, setServerQuote] = useState<null | {
    subtotal: number;
    shipping: number;
    discount: number;
    vat: number;
    total: number;
    reason?: string | null;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setQLoading(true);
      setQError(null);
      try {
        const q = await quoteTotals({
          lines,
          shippingCents: baseShippingCents,
          promoCode: promoApplied,
          country: countryISO2,
          customerId: customerId,
        });
        if (!cancelled) {
          setServerQuote({
            subtotal: q.finalSubtotalCents,
            shipping: q.finalShippingCents,
            discount: q.discountCents,
            vat: q.finalVatCents,
            total: q.finalTotalCents,
            reason: q.valid ? null : q.reason,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setServerQuote(null);
          setQError(e?.message || "Failed to calculate totals on server");
        }
      } finally {
        if (!cancelled) setQLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lines, baseShippingCents, promoApplied, countryISO2, customerId]);

  // Локальный фоллбэк промо
  const discount = useMemo(() => {
    if (!promoApplied) return 0;
    if (promoApplied.toLowerCase() === "save10") return Math.round(subtotal * 0.1);
    if (promoApplied.toLowerCase() === "freeexp") return baseShippingCents;
    return 0;
  }, [promoApplied, subtotal, baseShippingCents]);

  const total = useMemo(
    () => clamp(subtotal - discount + baseShippingCents, 0, Number.MAX_SAFE_INTEGER),
    [subtotal, discount, baseShippingCents]
  );

  // VAT
  const fallbackVatRate = vatRateFor(countryISO2);
  const vat = useMemo(() => {
    if (serverQuote?.vat != null) return serverQuote.vat;
    return PRICES_INCLUDE_VAT
      ? Math.round(total - total / (1 + fallbackVatRate))
      : Math.round(total * fallbackVatRate);
  }, [serverQuote, total, fallbackVatRate]);

  const vatLabel = useMemo(() => {
    if (serverQuote) {
      const net = Math.max(0, serverQuote.total - serverQuote.vat);
      if (net > 0) {
        const eff = serverQuote.vat / net;
        const pct = Math.round(eff * 100);
        if (pct >= 1 && pct <= 27) return `Including VAT (~${pct}%)`;
      }
      return "Including VAT";
    }
    return `Including VAT (${Math.round(fallbackVatRate * 100)}%)`;
  }, [serverQuote, fallbackVatRate]);

  const applyPromo = () => {
    const code = promo.trim();
    if (!code) return;
    setPromoApplied(code.toUpperCase());
    setPromo("");
  };

  // --- Validation (simple)
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

  // ==== SUBMITTERS ====

  // Manual — без карточной формы
  const handlePayManual = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) return alert("Подтвердите согласие с условиями.");
    if (lines.length === 0) return alert("Корзина пуста.");
    if (!shipping) return alert("Выберите способ доставки.");

    setIsPaying(true);
    try {
      const customer =
        customerId ||
        (
          await upsertCustomer({
            email: address.email,
            phone: address.phone,
            firstName: address.firstName,
            lastName: address.lastName,
          }).catch(() => ({ id: undefined } as any))
        )?.id ||
        null;

      const clientSubtotal = subtotal;
      const clientDiscount = serverQuote?.discount ?? discount;
      const clientShipping = serverQuote?.shipping ?? baseShippingCents;
      const clientVat = serverQuote?.vat ?? vat;
      const clientTotal = serverQuote?.total ?? clientSubtotal - clientDiscount + clientShipping;

      const order = await createOrder({
        customerId: customer,
        items: toOrderItems(lines),
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
      clear();
      navigate("/checkout/success", {
        replace: true,
        state: { orderNo: order.number },
      });
    } catch (err: any) {
      console.error(err);
      alert(`Оплата не прошла: ${err?.message ?? err}`);
    } finally {
      setIsPaying(false);
    }
  };

  // Stripe
  const handlePayStripe = async (
    e: React.FormEvent<HTMLFormElement>,
    args: { stripe: any; elements: any; holder: string }
  ) => {
    e.preventDefault();
    if (!acceptTerms) return alert("Подтвердите согласие с условиями.");
    if (lines.length === 0) return alert("Корзина пуста.");
    if (!shipping) return alert("Выберите способ доставки.");

    setIsPaying(true);
    try {
      const customer =
        customerId ||
        (
          await upsertCustomer({
            email: address.email,
            phone: address.phone,
            firstName: address.firstName,
            lastName: address.lastName,
          }).catch(() => ({ id: undefined } as any))
        )?.id ||
        null;

      const clientSubtotal = subtotal;
      const clientDiscount = serverQuote?.discount ?? discount;
      const clientShipping = serverQuote?.shipping ?? baseShippingCents;
      const clientVat = serverQuote?.vat ?? vat;
      const clientTotal = serverQuote?.total ?? clientSubtotal - clientDiscount + clientShipping;

      const order = await createOrder({
        customerId: customer,
        items: toOrderItems(lines),
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

      const intent = await createPaymentIntent(order.id, order.totalCents, "stripe");
      if (!intent?.clientSecret) throw new Error("Stripe client secret not returned from server");

      const numberEl = args.elements.getElement(CardNumberElement);
      if (!numberEl) throw new Error("Stripe card element not ready");

      const result = await args.stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card: numberEl,
          billing_details: {
            name: args.holder || `${address.firstName} ${address.lastName}`.trim(),
          },
        },
      });

      if (result.error) throw new Error(result.error.message || "Stripe confirmation failed");

      await confirmPayment(intent.id);

      clear();
      navigate("/checkout/success", {
        replace: true,
        state: { orderNo: order.number },
      });
    } catch (err: any) {
      console.error(err);
      alert(`Оплата не прошла: ${err?.message ?? err}`);
    } finally {
      setIsPaying(false);
    }
  };

  // PayPal
  const preparePayPalPayment = async () => {
    if (!acceptTerms) throw new Error("Подтвердите согласие с условиями.");
    if (lines.length === 0) throw new Error("Корзина пуста.");
    if (!shipping) throw new Error("Выберите способ доставки.");

    const customer =
      customerId ||
      (
        await upsertCustomer({
          email: address.email,
          phone: address.phone,
          firstName: address.firstName,
          lastName: address.lastName,
        }).catch(() => ({ id: undefined } as any))
      )?.id ||
      null;

    const clientSubtotal = subtotal;
    const clientDiscount = serverQuote?.discount ?? discount;
    const clientShipping = serverQuote?.shipping ?? baseShippingCents;
    const clientVat = serverQuote?.vat ?? vat;
    const clientTotal = serverQuote?.total ?? clientSubtotal - clientDiscount + clientShipping;

    const order = await createOrder({
      customerId: customer,
      items: toOrderItems(lines),
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
    if (!payment?.providerPaymentId) throw new Error("PayPal order id не получен от сервера");

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
      clear();
      navigate("/checkout/success", {
        replace: true,
        state: { orderNo },
      });
    } catch (err: any) {
      console.error(err);
      alert(`Оплата не прошла: ${err?.message ?? err}`);
    } finally {
      setIsPaying(false);
    }
  };

  const displaySubtotal = serverQuote?.subtotal ?? subtotal;
  const displayShipping = serverQuote?.shipping ?? baseShippingCents;
  const displayDiscount = serverQuote?.discount ?? discount;
  const displayVat = serverQuote?.vat ?? vat;
  const displayTotal = serverQuote?.total ?? total;

  const minFreeThreshold = useMemo(() => {
    const vals = shippingOptions
      .map((o) => o.freeFromCents ?? 0)
      .filter((v) => v && v > 0) as number[];
    return vals.length ? Math.min(...vals) : undefined;
  }, [shippingOptions]);

  const renderSteps = () => {
    const steps = [
      { k: 0, label: "Account" },
      { k: 1, label: "Delivery" },
      { k: 2, label: "Pay" },
    ];

    return (
      <nav className={styles.steps} aria-label="Steps to place an order">
        {steps.map((s, i) => (
          <div
            key={s.k}
            className={`${styles.steps__item} ${
              step === i
                ? styles["steps__item--active"]
                : step > i
                ? styles["steps__item--done"]
                : ""
            }`}
          >
            <span className={styles.steps__index}>{i + 1}</span>
            <span className={styles.steps__label}>{s.label}</span>
          </div>
        ))}
      </nav>
    );
  };

  return (
    <Page>
      <div className={styles.checkout}>
        {renderSteps()}

        <main className={styles.checkout__main}>
          <section className={styles.checkout__content}>
            {step === 0 && (
              <AccountSection
                onAuthedContinue={() => {
                  setStep(1);
                }}
                onSwitchAccount={async () => {
                  await logout();
                  setCustomerId(null);
                  setAddress((a) => ({ ...a, email: "" })); // опционально очистить e-mail
                }}
                onGuestContinue={() => {
                  setCustomerId(null);
                  setStep(1);
                }}
                onBack={() => navigate("/cart")}
              />
            )}

            {step === 1 && (
              <AddressSection
                address={address}
                setAddress={setAddress}
                shipping={shipping}
                setShipping={setShipping}
                shippingOptions={shippingOptions}
                shipLoading={shipLoading}
                shipError={shipError}
                onPrev={() => setStep(0)}
                onNext={() => setStep(2)}
                canContinue={addressValid}
                isAuthed={isAuthenticated}
                savedAddresses={savedAddresses}
                selectedAddrId={selectedAddressId}
                onSelectSavedAddr={handleSelectSavedAddr}
                fieldsDisabled={selectedAddressId !== "manual"}
              />
            )}

            {step === 2 && (
              <>
                <div className="card" style={{ marginBottom: 12 }}>
                  <div className="card__head">
                    <h2>Payment Method</h2>
                  </div>
                  <RadioCard
                    name="pm"
                    value={provider}
                    onChangeValue={(id) => setProvider(id as ProviderId)}
                    items={pmOptions.map((o) => ({
                      id: o.id,
                      title: o.title,
                      caption: o.caption,
                      icon: o.icon,
                    }))}
                  />
                </div>

                <PaymentSection
                  displayTotal={displayTotal}
                  acceptTerms={acceptTerms}
                  setAcceptTerms={setAcceptTerms}
                  onPrev={() => setStep(1)}
                  onSubmitManual={handlePayManual}
                  onSubmitStripe={handlePayStripe}
                  disablePay={qLoading || isPaying}
                  provider={provider}
                  preparePayPalPayment={preparePayPalPayment}
                  onPayPalApproved={onPayPalApproved}
                />
              </>
            )}
          </section>

          {/* Summary НЕ показываем на шаге Account (step === 0) */}
          {step !== 0 && (
            <aside className={styles.checkout__sidebar} aria-label="Итог заказа">
              <Summary
                lines={lines}
                subtotal={displaySubtotal}
                vat={displayVat}
                vatLabel={vatLabel}
                discount={displayDiscount}
                total={displayTotal}
                promo={promo}
                setPromo={setPromo}
                promoApplied={promoApplied}
                applyPromo={applyPromo}
                freeThresholdCents={minFreeThreshold}
                shippingCents={displayShipping}
                loading={qLoading}
                quoteError={qError}
                quoteReason={serverQuote?.reason ?? null}
                spinnerClassName={styles.checkout__spinner}
              />
            </aside>
          )}
        </main>

        {isPaying && (
          <div className={styles.checkout__overlay} role="alert" aria-live="polite">
            <div className={styles.spinner} />
            <p>Processing payment…</p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default CheckoutPage;

// ---- Sections

const AccountSection: React.FC<{
  onBack: () => void;
  onAuthedContinue: () => void;
  onSwitchAccount: () => void | Promise<void>;
  onGuestContinue: () => void;
}> = ({ onBack, onAuthedContinue, onSwitchAccount, onGuestContinue }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="card">
        <div className="card__head">
          <h2>Account</h2>
        </div>
        <WrapperSkeleton />
        <div className="actions" style={{ marginTop: 20 }}>
          <Button size="small" variant="secondary" onClick={onBack} type="button">
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const nameOrEmail =
      (user as any)?.firstName || (user as any)?.lastName
        ? `${(user as any)?.firstName ?? ""} ${(user as any)?.lastName ?? ""}`.trim()
        : (user as any)?.email ?? "Account";

    const username = (user as any)?.username;

    const avatarUrl = buildAvatarSrc(
      user.avatarUrl,
      `${user.id}-${user.avatarUrl || ""}`
    );

    return (
      <div className="card">
        <div className="card__head">
          <h2>Account</h2>
        </div>
        <Wrapper
          photoUrl={avatarUrl}
          fullname={nameOrEmail}
          username={username}
          action={
            <Button
              size="small"
              variant="secondary"
              onClick={async () => {
                await onSwitchAccount();
                navigate(`/auth/login?next=${encodeURIComponent("/checkout?from=auth")}`);
              }}
            >
              Switch account
            </Button>
          }
        />
        <div
          className="actions"
          style={{ gap: 8, display: "flex", flexWrap: "wrap", marginTop: 20 }}
        >
          <Button size="small" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button size="small" onClick={onAuthedContinue}>
            Continue to delivery
          </Button>
        </div>
      </div>
    );
  }

  // Не авторизован — гость: только кнопки, без форм
  return (
    <div className="card">
      <div className="card__head">
        <h2>Account</h2>
      </div>
      <p className="muted" style={{ marginBottom: 16 }}>
        You can checkout as a guest or sign in / register for a faster experience.
      </p>
      <div className="actions" style={{ gap: 8, display: "flex", flexWrap: "wrap" }}>
        <Button
          size="small"
          className="btn"
          type="button"
          onClick={onGuestContinue}
        >
          Continue as guest
        </Button>
        <Button
          size="small"
          className="btn btn--ghost"
          type="button"
          onClick={() =>
            navigate(`/auth/login?next=${encodeURIComponent("/checkout?from=auth")}`)
          }
        >
          Login
        </Button>
        <Button
          size="small"
          className="btn btn--ghost"
          type="button"
          onClick={() =>
            navigate(`/auth/register?next=${encodeURIComponent("/checkout?from=auth")}`)
          }
        >
          Register
        </Button>
        <Button size="small" variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

type AddressSectionProps = {
  address: FormAddress;
  setAddress: (a: FormAddress) => void;

  shipping: ShippingUi | null;
  setShipping: (s: ShippingUi) => void;
  shippingOptions: ShippingUi[];
  shipLoading: boolean;
  shipError: string | null;

  onPrev: () => void;
  onNext: () => void;
  canContinue: boolean;

  // + новое
  isAuthed?: boolean;
  savedAddresses: AccountAddress[];
  selectedAddrId: string | "manual";
  onSelectSavedAddr: (id: string | "manual") => void;
  fieldsDisabled?: boolean;
};

const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  setAddress,
  shipping,
  setShipping,
  shippingOptions,
  shipLoading,
  shipError,
  onPrev,
  onNext,
  canContinue,
  isAuthed = false,
  savedAddresses,
  selectedAddrId,
  onSelectSavedAddr,
  fieldsDisabled = false,
}) => {
  const set =
    (k: keyof FormAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress({ ...address, [k]: e.target.value });

  const canProceed =
    canContinue && !!shipping && !shipLoading && !shipError && shippingOptions.length > 0;

  const addrOptions = [
    { value: "manual", label: "— Enter a new address —" },
    ...savedAddresses.map((a) => ({
      value: a.id,
      label: `${a.isDefault ? "Default • " : ""}${a.firstName} ${a.lastName}, ${a.city}, ${
        a.country
      }`,
    })),
  ];

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card__head">
          <h2>Address</h2>
        </div>

        {isAuthed && savedAddresses.length > 0 && (
          <div className="form" style={{ marginBottom: 8 }}>
            <SelectField
              label="Saved address"
              value={selectedAddrId}
              onChange={(v) => onSelectSavedAddr((v as any) || "manual")}
              options={addrOptions}
              minWidth="100%"
              dropdownMinWidth="100%"
            />
            {selectedAddrId !== "manual" && (
              <div className="muted" style={{ marginTop: 6 }}>
                This address comes from your account. Edit it in{" "}
                <a href="/account?tab=addresses">Addresses</a>.
              </div>
            )}
          </div>
        )}

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="form__row">
            <TextField
              label="First Name"
              value={address.firstName}
              onChange={set("firstName")}
              placeholder="John"
              required
              disabled={fieldsDisabled}
            />
            <TextField
              label="Last Name"
              value={address.lastName}
              onChange={set("lastName")}
              placeholder="Doe"
              required
              disabled={fieldsDisabled}
            />
          </div>
          <div className="form__row">
            <TextField
              label="Email"
              type="email"
              value={address.email}
              onChange={set("email")}
              placeholder="name@mail.com"
              required
              disabled={fieldsDisabled}
            />
            <TextField
              label="Phone"
              value={address.phone}
              onChange={set("phone")}
              placeholder="+49 170 000000"
              required
              disabled={fieldsDisabled}
            />
          </div>
          <div className="form__row">
            <TextField
              label="Address 1"
              value={address.line1}
              onChange={set("line1")}
              placeholder="Unter den Linden 1"
              required
              disabled={fieldsDisabled}
            />
            <TextField
              label="Address 2 (optional)"
              value={address.line2 ?? ""}
              onChange={set("line2")}
              placeholder="Apt, suite, etc."
              disabled={fieldsDisabled}
            />
          </div>
          <div className="form__row">
            <TextField
              label="City"
              value={address.city}
              onChange={set("city")}
              placeholder="Berlin"
              required
              disabled={fieldsDisabled}
            />
            <TextField
              label="Country"
              value={address.country}
              onChange={set("country")}
              placeholder="Deutschland"
              required
              disabled={fieldsDisabled}
            />
          </div>
          <div className="form__row">
            <TextField
              label="Postal Code"
              value={address.postalCode}
              onChange={set("postalCode")}
              placeholder="10115"
              required
              disabled={fieldsDisabled}
            />
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card__head">
          <h2>Shipping Method</h2>
        </div>

        {shipLoading && (
          <div
            className="muted"
            style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}
          >
            <div className={styles.checkout__spinner} style={{ width: 16, height: 16 }} />
            Loading options…
          </div>
        )}
        {shipError && (
          <div className="warn" style={{ marginBottom: 8 }}>
            Failed to load shipping options. Try again later.
          </div>
        )}
        {!shipLoading && !shipError && shippingOptions.length === 0 && (
          <div className="muted">No shipping methods available for your country.</div>
        )}

        <RadioCard
          name="shipping"
          value={shipping?.id ?? ""}
          onChangeValue={(id) => {
            const found = shippingOptions.find((o) => o.id === id);
            if (found) setShipping(found);
          }}
          items={shippingOptions.map((m) => ({
            id: m.id,
            title: <strong>{m.label}</strong>,
            subtitle: (
              <span>
                ({m.effectivePriceCents === 0 ? "Free" : formatMoney(m.effectivePriceCents)})
              </span>
            ),
            caption: m.eta && <span className="muted">{m.eta}</span>,
            icon: carrierIconFor(m),
          }))}
        />
      </div>

      <div className="actions">
        <Button size="small" variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button className="btn" size="small" onClick={onNext} disabled={!canProceed}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

// ---------- Payment
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
}) => {
  const [cardName, setCardName] = useState("");

  if (provider === "stripe") {
    return (
      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h2>Payment</h2>
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
              nameError={cardName.trim().length === 0 ? "Укажите имя как на карте" : undefined}
            />
          </Elements>
        </div>
      </div>
    );
  }

  if (provider === "paypal") {
    return (
      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h2>Payment</h2>
          </div>

          <PayPalForm
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            onPrev={onPrev}
            disablePay={disablePay}
            preparePayPalPayment={preparePayPalPayment}
            onPayPalApproved={onPayPalApproved}
            displayTotal={displayTotal}
          />
        </div>
      </div>
    );
  }

  // Manual — «Оплата по счёту / банковский перевод»
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card__head">
          <h2>Payment</h2>
        </div>

        <form className="form" onSubmit={onSubmitManual} noValidate>
          <div className="info" style={{ marginBottom: 12 }}>
            Мы оформим заказ и вышлем вам на e-mail инструкции по оплате (счёт/реквизиты).
            Обработка может занять 1–2 рабочих дня.
          </div>

          <CheckboxField
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            label={
              <>
                I <a href="#terms">accept the terms and conditions</a>
              </>
            }
          />

          <div className="actions">
            <Button size="small" variant="secondary" onClick={onPrev} type="button">
              Back
            </Button>
            <Button
              size="small"
              className="btn btn--xl"
              type="submit"
              disabled={!!disablePay || !acceptTerms}
            >
              Place order — {formatMoney(displayTotal)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Внутренняя форма для Stripe (под <Elements>)
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
  nameError?: string;
}> = ({
  cardName,
  setCardName,
  acceptTerms,
  setAcceptTerms,
  onPrev,
  onSubmitStripe,
  disablePay,
  displayTotal,
  nameError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const stripeFormOk = !!stripe && !!elements && cardName.trim().length >= 3 && acceptTerms;
  const payDisabled = !!disablePay || !stripeFormOk;

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

  return (
    <form
      className="form"
      onSubmit={(e) => {
        if (!stripe || !elements) return e.preventDefault();
        return onSubmitStripe(e, { stripe, elements, holder: cardName.trim() });
      }}
      noValidate
    >
      <TextField
        label="Cardholder"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        placeholder="IVAN IVANOV"
        required
        autoComplete="cc-name"
        error={nameError}
      />

      <div className="field">
        <label className="label">Card Number</label>
        <div className="stripe-input">
          <CardNumberElement
            options={{
              placeholder: "1234 1234 1234 1234",
              style: { base: inputStyle },
            }}
          />
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label className="label">Expiration (MM/YY)</label>
          <div className="stripe-input">
            <CardExpiryElement
              options={{
                placeholder: "MM/YY",
                style: { base: inputStyle },
              }}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">CVC</label>
          <div className="stripe-input">
            <CardCvcElement
              options={{
                placeholder: "CVC",
                style: { base: inputStyle },
              }}
            />
          </div>
        </div>
      </div>

      <CheckboxField
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
        label={
          <>
            I <a href="#terms">accept the terms and conditions</a>
          </>
        }
      />

      <div className="actions">
        <Button size="small" variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button size="small" className="btn btn--xl" type="submit" disabled={payDisabled}>
          Pay {formatMoney(displayTotal)}
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
}> = ({
  acceptTerms,
  setAcceptTerms,
  onPrev,
  disablePay,
  displayTotal,
  preparePayPalPayment,
  onPayPalApproved,
}) => {
  const [busy, setBusy] = useState(false);
  const paymentIdRef = React.useRef<string | null>(null);
  const orderNoRef = React.useRef<string | null>(null);
  const chRef = React.useRef<BroadcastChannel | null>(null);

  const openInNewTab = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Подтвердите согласие с условиями.");
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
      } catch {}
      window.removeEventListener("message", onMessage);
      try {
        tab && tab.close();
      } catch {}
      setBusy(false);
    };

    try {
      chRef.current = new BroadcastChannel("pp-redirect");
      chRef.current.onmessage = async (ev) => {
        const data = ev?.data || {};
        if (data?.type !== "paypal-approved") return;
        try {
          if (!paymentIdRef.current || !orderNoRef.current)
            throw new Error("Нет paymentId/orderNo");
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
          throw new Error("Нет paymentId/orderNo");
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

      tab = window.open(href, "_blank");
      if (!tab) {
        window.location.assign(href);
        return;
      }

      closePoll = window.setInterval(() => {
        if (tab && tab.closed) cleanup();
      }, 700);
    } catch (err: any) {
      console.error(err);
      alert(`PayPal: не удалось начать оплату. ${err?.message ?? err}`);
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={openInNewTab} noValidate>
      <div className="info" style={{ marginBottom: 12 }}>
        You will be redirected to PayPal to complete your purchase — total{" "}
        {formatMoney(displayTotal)}.
      </div>
      <CheckboxField
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
        label={
          <>
            I <a href="#terms">accept the terms and conditions</a>
          </>
        }
      />
      <div className="actions">
        <Button size="small" variant="secondary" onClick={onPrev} type="button">
          Back
        </Button>
        <Button
          size="small"
          className="btn btn--xl"
          type="submit"
          disabled={!!disablePay || busy}
        >
          Pay with PayPal
        </Button>
      </div>
    </form>
  );
};
