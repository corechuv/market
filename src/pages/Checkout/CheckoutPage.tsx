// src/pages/Checkout/CheckoutPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import "./Checkout.scss";
import styles from "./Checkout.module.scss";
import {
  quoteTotals,
  listShippingOptions,
  type ShippingOption,
} from "../../services/checkoutApi";
import { useCart } from "../../context/CartContext";
import { formatMoney } from "../../utils/money";

import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { SelectField } from "../../components/UI/SelectField";

import { toISO2 } from "../../utils/country";
import { vatRateFor } from "../../utils/vat";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { RadioField } from "../../components/UI/RadioField";

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
import { Summary } from "../../components/Checkout/Order/Summary";
import Accordion from "../../components/UI/Accordion";
import RadioLabel from "../../components/UI/Radio/RadioLabel";
import Footer from "../../components/Footer/Footer";

const CARRIER_LOGOS = { dhl, hermes, dpd, gls } as const;

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
export type ShippingUi = {
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
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

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

  const alt =
    option.label?.split("•")[0]?.trim() || option.carrierCode || "Carrier";
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
        title: "Card payment",
        icon: (
          <>
            <img loading="lazy" src={theme === "dark" ? visa : visa} alt="" />
            <img
              loading="lazy"
              src={theme === "dark" ? mastercard : mastercard}
              alt=""
            />
            <img loading="lazy" src={theme === "dark" ? amex : amex} alt="" />
          </>
        ),
      },
      {
        id: "paypal",
        title: "PayPal",
        icon: <img loading="lazy" src={paypal} alt="" />,
      },
      {
        id: "invoice",
        title: "Bank transfer / Invoice",
        caption: "We’ll send payment instructions by email",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3l9 5v2H3V8l9-5zM4 11h16v8H4z" fill="currentColor" />
          </svg>
        ),
      },
    ];

  const { lines } = useCart();

  const selectedLines = useMemo(
    () => lines.filter((l) => l.selected),
    [lines]
  );

  // Информация о пользователе (для адреса и customerId)
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | "manual">(
    "manual"
  );
  const [manualDraft] = useState<FormAddress>(() => readCheckoutDraft());

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      setCustomerId(user?.id ?? null);

      // всегда проставляем базовые поля из аккаунта (не оставляем старый LS-мусор)
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
      // гость — возвращаемся к черновику
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
    } catch { }
  }, [address]);

  // Totals
  const subtotal = useMemo(
    () => selectedLines.reduce((s, l) => s + l.priceCents * l.qty, 0),
    [selectedLines]
  );

  // страна доставки (для VAT и тарифов)
  const countryISO2 = useMemo(
    () => toISO2(address.country || "DE"),
    [address.country]
  );

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
          lines: selectedLines,
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
  }, [selectedLines, baseShippingCents, promoApplied, countryISO2, customerId]);

  // Локальный фоллбэк промо
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
        if (pct >= 1 && pct <= 27) return `Including VAT ${pct}%`;
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

  const canPay = useMemo(
    () =>
      addressValid &&
      !!shipping &&
      !shipLoading &&
      !shipError &&
      shippingOptions.length > 0 &&
      selectedLines.length > 0,
    [
      addressValid,
      shipping,
      shipLoading,
      shipError,
      shippingOptions.length,
      selectedLines.length,
    ]
  );

  const handleBack = () => {
    navigate(`/identity-gate?next=${encodeURIComponent("/checkout")}`);
  };

  const handleGoToPayment = () => {
    if (!canPay || !shipping) return;

    navigate("/checkout/payment", {
      state: {
        provider,
        address,
        shipping,
        promoApplied,
      },
    });
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

  return (
    <Page padding={false}>
      <div className={styles.mastbar}>
        <div className={styles.mastbar__left}>
          <h2 className={styles.title}>Checkout</h2>
        </div>
      </div>
      <div className={styles.main}>
        <section className={styles.section}>
          <AddressSection
            address={address}
            setAddress={setAddress}
            shipping={shipping}
            setShipping={setShipping}
            shippingOptions={shippingOptions}
            shipLoading={shipLoading}
            shipError={shipError}
            isAuthed={isAuthenticated}
            savedAddresses={savedAddresses}
            selectedAddrId={selectedAddressId}
            onSelectSavedAddr={handleSelectSavedAddr}
            fieldsDisabled={selectedAddressId !== "manual"}
          />

          <Accordion title="Payment Method" defaultOpen>

            <div className={styles.radio__list}>
              {pmOptions.map((o) => (
                <RadioField
                  key={o.id}
                  name="pm"
                  value={o.id}
                  checked={provider === o.id}
                  onChange={() => setProvider(o.id)}
                  label={
                    <RadioLabel
                      icon={o.icon}
                      title={o.title}
                      caption={o.caption}
                    />
                  }
                />
              ))}
            </div>
          </Accordion>

          <div className={styles.checkout__actions}>
            <Button
              size="small"
              className="btn btn--xl"
              type="button"
              disabled={!canPay || qLoading}
              onClick={handleGoToPayment}
            >
              Continue to payment — {formatMoney(displayTotal)}
            </Button>
            <Button size="small" variant="link" onClick={handleBack}>
              Back
            </Button>
          </div>
        </section>

        <Summary
          lines={selectedLines}
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
      </div>

      <Footer />
    </Page>
  );
};

export default CheckoutPage;

// ---- Sections

type AddressSectionProps = {
  address: FormAddress;
  setAddress: (a: FormAddress) => void;

  shipping: ShippingUi | null;
  setShipping: (s: ShippingUi) => void;
  shippingOptions: ShippingUi[];
  shipLoading: boolean;
  shipError: string | null;

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

  const addrOptions = [
    { value: "manual", label: "Enter a new address" },
    ...savedAddresses.map((a) => ({
      value: a.id,
      label: `${a.isDefault ? "Default • " : ""}${a.firstName} ${a.lastName
        }, ${a.city}, ${a.country}`,
    })),
  ];

  const selectedSavedAddr =
    selectedAddrId !== "manual"
      ? savedAddresses.find((a) => a.id === selectedAddrId)
      : null;

  return (
    <div>
      <div>
        <div style={{ marginBottom: 30 }}>
          <Accordion title="Address" defaultOpen>
            {isAuthed && savedAddresses.length > 0 && (
              <div className="form" style={{ marginBottom: 20 }}>
                <SelectField
                  label="Saved address"
                  value={selectedAddrId}
                  onChange={(v) =>
                    onSelectSavedAddr((v as any) || "manual")
                  }
                  options={addrOptions}
                  minWidth="100%"
                  dropdownMinWidth="100%"
                />
              </div>
            )}
            {selectedSavedAddr && (
              <>
                <div>
                  <strong>
                    {selectedSavedAddr.firstName}{" "}
                    {selectedSavedAddr.lastName}
                  </strong>
                </div>
                {selectedSavedAddr.company && (
                  <div>{selectedSavedAddr.company}</div>
                )}
                <div>{selectedSavedAddr.line1}</div>
                {selectedSavedAddr.line2 && (
                  <div>{selectedSavedAddr.line2}</div>
                )}
                <div>
                  {selectedSavedAddr.postalCode}{" "}
                  {selectedSavedAddr.city}
                </div>
                <div>{selectedSavedAddr.country}</div>
              </>
            )}

            {/* Форма показывается только когда выбран "manual" или нет валидного сохранённого адреса */}
            {(!selectedSavedAddr || selectedSavedAddr === null || selectedAddrId === "manual") && (
              <form
                className="form"
                onSubmit={(e) => e.preventDefault()}
              >
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
                    label="City"
                    value={address.city}
                    onChange={set("city")}
                    placeholder="Berlin"
                    required
                    disabled={fieldsDisabled}
                  />
                </div>
                <div className="form__row">
                  <TextField
                    label="Country"
                    value={address.country}
                    onChange={set("country")}
                    placeholder="Deutschland"
                    required
                    disabled={fieldsDisabled}
                  />
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
            )}
          </Accordion>
        </div>
      </div>

      <Accordion title="Shipping Method" defaultOpen>
        {shipLoading && (
          <div
            className="muted"
            style={{
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              className={styles.checkout__spinner}
              style={{ width: 16, height: 16 }}
            />
            Loading options…
          </div>
        )}
        {shipError && (
          <div className="warn" style={{ marginBottom: 8 }}>
            Failed to load shipping options. Try again later.
          </div>
        )}
        {!shipLoading && !shipError && shippingOptions.length === 0 && (
          <div className="muted">
            No shipping methods available for your country.
          </div>
        )}

        <div className={styles.radio__list}>
          {shippingOptions.map((m) => (
            <RadioField
              key={m.id}
              name="shipping"
              value={m.id}
              checked={shipping?.id === m.id}
              onChange={() => setShipping(m)}
              label={
                <RadioLabel
                  icon={carrierIconFor(m)}
                  title={m.label}
                  meta={
                    <span>
                      {m.effectivePriceCents === 0
                        ? "Free"
                        : formatMoney(m.effectivePriceCents)}
                    </span>
                  }
                  caption={
                    m.eta && <span className="muted">{m.eta}</span>
                  }
                />
              }
            />
          ))}
        </div>
      </Accordion>
    </div>
  );
};
