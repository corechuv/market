// src/pages/Checkout/CheckoutPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import type { SeoConfig } from "../../types/seo/seoConfig";
import "./Checkout.scss";
import styles from "./Checkout.module.scss";
import {
  quoteTotals,
  listShippingOptionsForCart,
  type ShippingOption,
  type ShippingSplitGroup,
  type SplitShippingSelectionIn,
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
import { useTranslation } from "react-i18next";

const CARRIER_LOGOS = { dhl, hermes, dpd, gls } as const;

// === Тип адреса для формы (без обязательных id/label)
type FormAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  houseNo: string;
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
  houseNo?: string | null;
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
  houseNo: a.houseNo || "",
  line2: a.line2 || "",
  city: a.city || "",
  postalCode: a.postalCode || "",
  country: a.country || "DE",
});

// Вариант доставки для UI
export type ShippingUi = {
  serviceId?: string;
  id: string;
  label: string;
  eta: string;
  priceCents: number;
  effectivePriceCents: number;
  carrierCode: string;
  serviceCode: string;
  freeFromCents?: number | null;
};

type ShippingSplitGroupUi = {
  groupId: string;
  lineIndexes: number[];
  source: string;
  options: ShippingUi[];
};

type SplitSelectionUi = SplitShippingSelectionIn & {
  effectivePriceCents: number;
  label?: string | null;
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
    houseNo: "",
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
      houseNo: String(parsed.houseNo ?? ""),
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

function normalizeCarrier(code?: string) {
  return (code || "").toLowerCase().replace(/[^a-z]/g, "");
}

function carrierIconFor(option: ShippingUi) {
  const key = normalizeCarrier(option.carrierCode); // "dhl", "dpd", "gls", "hermes"
  const src = CARRIER_LOGOS[key as keyof typeof CARRIER_LOGOS];

  if (!src) {
    return <></>;
  }

  const alt =
    option.label?.split("•")[0]?.trim() || option.carrierCode || "Carrier";

  const carrierClass =
    `${styles.baseicon} ${(styles as Record<string, string>)[key] ?? ""}`;

  return (
    <img
      loading="lazy"
      className={carrierClass}
      src={src}
      alt={`${alt} logo`}
    />
  );
}

// --- Component
const CheckoutPage: React.FC = () => {
  const { t } = useTranslation("checkout");

  const seo: SeoConfig = useMemo(
    () => ({
      title: t("seo.title"),
      description: t("seo.description")
    }),
    [t]
  );


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
        title: t("payment.card.title"),
        icon: (
          <>
            <img loading="lazy" className={styles.amex} src={theme === "dark" ? amex : amex} alt="" />
            <img loading="lazy" className={styles.visa} src={theme === "dark" ? visa : visa} alt="" />
            <img loading="lazy" className={styles.mastercard} src={theme === "dark" ? mastercard : mastercard} alt="" />
          </>
        ),
      },
      {
        id: "paypal",
        title: t("payment.paypal.title"),
        icon: <img loading="lazy" className={styles.paypal} src={paypal} alt="" />,
      },
      {
        id: "invoice",
        title: t("payment.invoice.title"),
        caption: t("payment.invoice.caption"),
        icon: (
          <svg className={styles.bank} width="22" height="22" viewBox="0 0 24 24" aria-hidden>
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
  const [splitRequired, setSplitRequired] = useState(false);
  const [splitGroups, setSplitGroups] = useState<ShippingSplitGroupUi[]>([]);
  const [splitSelectedByGroup, setSplitSelectedByGroup] = useState<Record<string, ShippingUi>>({});

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
              houseNo: "",
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

  // форматирование ETA с i18n
  const etaToStr = React.useCallback(
    (min?: number | null, max?: number | null): string => {
      if (!min && !max) return "";
      if (min && max && min !== max) {
        return t("shipping.eta.range", { min, max });
      }
      const days = (min ?? max) ?? 0;
      return t("shipping.eta.exact", { count: days });
    },
    [t]
  );

  const toShippingUi = React.useCallback(
    (o: ShippingOption): ShippingUi => ({
      serviceId: o.serviceId,
      id: o.id,
      label: o.label,
      eta: etaToStr(o.etaMinDays ?? undefined, o.etaMaxDays ?? undefined),
      priceCents: o.priceCents,
      effectivePriceCents: o.effectivePriceCents,
      carrierCode: o.carrierCode,
      serviceCode: o.serviceCode,
      freeFromCents: o.freeFromCents ?? undefined,
    }),
    [etaToStr]
  );

  const toSplitGroupUi = React.useCallback(
    (g: ShippingSplitGroup): ShippingSplitGroupUi => ({
      groupId: g.groupId,
      lineIndexes: Array.isArray(g.lineIndexes) ? g.lineIndexes : [],
      source: g.source,
      options: Array.isArray(g.options) ? g.options.map(toShippingUi) : [],
    }),
    [toShippingUi]
  );

  // Загрузка вариантов доставки
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setShipLoading(true);
      setShipError(null);
      try {
        const payloadLines = selectedLines.map((line) => ({
          productId: line.productId || undefined,
          variantId: line.variantId || undefined,
          qty: Math.max(1, Number(line.qty) || 1),
        }));

        const result = await listShippingOptionsForCart({
          country: countryISO2,
          subtotalCents: subtotal,
          lines: payloadLines,
        });
        if (cancelled) return;
        setSplitRequired(Boolean(result.splitRequired));

        if (result.splitRequired) {
          const uiGroups = (Array.isArray(result.splitGroups) ? result.splitGroups : []).map(toSplitGroupUi);
          setSplitGroups(uiGroups);
          setSplitSelectedByGroup((current) => {
            const next: Record<string, ShippingUi> = {};
            for (const group of uiGroups) {
              const currentPick = current[group.groupId];
              const matched = currentPick
                ? group.options.find((x) => x.id === currentPick.id)
                : undefined;
              if (matched) {
                next[group.groupId] = matched;
              } else if (group.options[0]) {
                next[group.groupId] = group.options[0];
              }
            }
            return next;
          });
          setShippingOptions([]);
          setShipping(null);
          return;
        }

        setSplitGroups([]);
        setSplitSelectedByGroup({});
        const raw: ShippingOption[] = result.options || [];
        const ui: ShippingUi[] = raw.map(toShippingUi);
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
          setSplitRequired(false);
          setSplitGroups([]);
          setSplitSelectedByGroup({});
        }
      } finally {
        if (!cancelled) setShipLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [countryISO2, subtotal, selectedLines, toShippingUi, toSplitGroupUi]);

  const splitSelections = useMemo<SplitSelectionUi[]>(() => {
    if (!splitRequired || splitGroups.length === 0) return [];
    const out: SplitSelectionUi[] = [];
    for (const group of splitGroups) {
      const selected = splitSelectedByGroup[group.groupId];
      if (!selected || !group.lineIndexes.length) continue;
      out.push({
        groupId: group.groupId,
        lineIndexes: [...group.lineIndexes],
        serviceId: selected.serviceId || null,
        selectedCarrierCode: selected.carrierCode || null,
        selectedServiceCode: selected.serviceCode || null,
        effectivePriceCents:
          selected.effectivePriceCents ?? selected.priceCents ?? 0,
        label: selected.label || null,
      });
    }
    return out;
  }, [splitRequired, splitGroups, splitSelectedByGroup]);

  const hasValidSplitSelections = useMemo(() => {
    if (!splitRequired) return false;
    if (!splitGroups.length) return false;
    return splitGroups.every((group) => {
      const selected = splitSelectedByGroup[group.groupId];
      return (
        !!selected &&
        group.options.some((candidate) => candidate.id === selected.id)
      );
    });
  }, [splitRequired, splitGroups, splitSelectedByGroup]);

  // базовая стоимость доставки
  const baseShippingCents = useMemo(() => {
    if (splitRequired) {
      return splitSelections.reduce(
        (sum, row) => sum + Math.max(0, row.effectivePriceCents || 0),
        0
      );
    }
    if (!shipping) return 0;
    return shipping.effectivePriceCents ?? shipping.priceCents ?? 0;
  }, [splitRequired, splitSelections, shipping]);

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
      address.houseNo,
      address.city,
      address.postalCode,
      address.country,
    ].every((x) => String(x || "").trim().length > 1);
    const phoneLen = address.phone.trim().length;
    const phoneOk = phoneLen === 0 || phoneLen >= 6;
    return emailOk && requiredOk && phoneOk;
  }, [address]);

  const canPay = useMemo(
    () =>
      addressValid &&
      !shipLoading &&
      !shipError &&
      (splitRequired
        ? splitGroups.length > 0 && hasValidSplitSelections
        : !!shipping && shippingOptions.length > 0) &&
      selectedLines.length > 0,
    [
      addressValid,
      shipping,
      shipLoading,
      shipError,
      splitRequired,
      splitGroups.length,
      hasValidSplitSelections,
      shippingOptions.length,
      selectedLines.length,
    ]
  );

  const handleBack = () => {
    navigate(`/identity-gate?next=${encodeURIComponent("/checkout")}`);
  };

  const handleGoToPayment = () => {
    if (!canPay) return;
    if (!splitRequired && !shipping) return;

    navigate("/checkout/payment", {
      state: {
        provider,
        address,
        shipping: splitRequired ? null : shipping,
        splitRequired,
        splitSelections,
        promoApplied,
      },
    });
  };

  const displaySubtotal = serverQuote?.subtotal ?? subtotal;
  const displayShipping = serverQuote?.shipping ?? baseShippingCents;
  const displayDiscount = serverQuote?.discount ?? discount;
  const displayVat = serverQuote?.vat ?? vat;
  const displayTotal = serverQuote?.total ?? total;

  const allVisibleOptions = useMemo(() => {
    if (splitRequired) {
      return splitGroups.flatMap((group) => group.options);
    }
    return shippingOptions;
  }, [splitRequired, splitGroups, shippingOptions]);

  const minFreeThreshold = useMemo(() => {
    const vals = allVisibleOptions
      .map((o) => o.freeFromCents ?? 0)
      .filter((v) => v && v > 0) as number[];
    return vals.length ? Math.min(...vals) : undefined;
  }, [allVisibleOptions]);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Page padding={false}>
        <div className={styles.mastbar}>
          <div className={styles.mastbar__left}>
            <h2 className={styles.title}>{t("title")}</h2>
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
              splitRequired={splitRequired}
              splitGroups={splitGroups}
              splitGroupsCount={splitGroups.length}
              splitSelectedByGroup={splitSelectedByGroup}
              onSelectSplitOption={(groupId, option) =>
                setSplitSelectedByGroup((current) => ({
                  ...current,
                  [groupId]: option,
                }))
              }
              isAuthed={isAuthenticated}
              savedAddresses={savedAddresses}
              selectedAddrId={selectedAddressId}
              onSelectSavedAddr={handleSelectSavedAddr}
              fieldsDisabled={selectedAddressId !== "manual"}
            />

            <Accordion title={t("payment.accordionTitle")} defaultOpen>
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
                type="button"
                disabled={!canPay || qLoading}
                onClick={handleGoToPayment}
              >
                {t("actions.continueToPayment", {
                  total: formatMoney(displayTotal),
                })}
              </Button>
              <Button size="small" variant="link" onClick={handleBack}>
                {t("actions.back")}
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
    </>
  );
};

export default CheckoutPage;

type AddressSectionProps = {
  address: FormAddress;
  setAddress: (a: FormAddress) => void;

  shipping: ShippingUi | null;
  setShipping: (s: ShippingUi) => void;
  shippingOptions: ShippingUi[];
  shipLoading: boolean;
  shipError: string | null;
  splitRequired: boolean;
  splitGroups: ShippingSplitGroupUi[];
  splitGroupsCount: number;
  splitSelectedByGroup: Record<string, ShippingUi>;
  onSelectSplitOption: (groupId: string, option: ShippingUi) => void;

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
  splitRequired,
  splitGroups,
  splitGroupsCount,
  splitSelectedByGroup,
  onSelectSplitOption,
  isAuthed = false,
  savedAddresses,
  selectedAddrId,
  onSelectSavedAddr,
  fieldsDisabled = false,
}) => {
  const { t } = useTranslation("checkout");

  const set =
    (k: keyof FormAddress) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setAddress({ ...address, [k]: e.target.value });

  const addrOptions = [
    { value: "manual", label: t("address.manualOption") },
    ...savedAddresses.map((a) => ({
      value: a.id,
      label: `${a.isDefault ? t("address.saved.defaultPrefix") + " " : ""}${a.firstName
        } ${a.lastName}, ${a.city}, ${a.country}`,
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
          <Accordion title={t("address.accordionTitle")} defaultOpen>
            {isAuthed && savedAddresses.length > 0 && (
              <div className="form" style={{ marginBottom: 20 }}>
                <SelectField
                  label={t("address.savedAddressLabel")}
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
                <div style={{ marginBottom: 6 }}>
                  <strong>
                    {selectedSavedAddr.firstName}{" "}
                    {selectedSavedAddr.lastName}
                  </strong>
                </div>
                <div style={{ marginLeft: 4 }}>
                  {selectedSavedAddr.company && (
                    <div>{selectedSavedAddr.company}</div>
                  )}
                  <div>{selectedSavedAddr.line1} {selectedSavedAddr.houseNo || ""}</div>
                  {selectedSavedAddr.line2 && (
                    <div>{selectedSavedAddr.line2}</div>
                  )}
                  <div>
                    {selectedSavedAddr.postalCode}{" "}
                    {selectedSavedAddr.city}
                  </div>
                  <div>{selectedSavedAddr.country}</div>
                </div>
              </>
            )}

            {/* Форма показывается только когда выбран "manual" или нет валидного сохранённого адреса */}
            {(!selectedSavedAddr ||
              selectedSavedAddr === null ||
              selectedAddrId === "manual") && (
                <form
                  className="form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="form__row">
                    <TextField
                      label={t("address.form.firstNameLabel")}
                      value={address.firstName}
                      onChange={set("firstName")}
                      placeholder={t(
                        "address.form.firstNamePlaceholder"
                      )}
                      required
                      disabled={fieldsDisabled}
                    />
                    <TextField
                      label={t("address.form.lastNameLabel")}
                      value={address.lastName}
                      onChange={set("lastName")}
                      placeholder={t("address.form.lastNamePlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                  </div>
                  <div className="form__row">
                    <TextField
                      label={t("address.form.emailLabel")}
                      type="email"
                      value={address.email}
                      onChange={set("email")}
                      placeholder={t("address.form.emailPlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                    <TextField
                      label={t("address.form.phoneLabel")}
                      value={address.phone}
                      onChange={set("phone")}
                      placeholder={t("address.form.phonePlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                  </div>
                  <div className="form__row">
                    <TextField
                      label={t("address.form.address1Label")}
                      value={address.line1}
                      onChange={set("line1")}
                      placeholder={t("address.form.address1Placeholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                    <TextField
                      label="House No."
                      value={address.houseNo}
                      onChange={set("houseNo")}
                      placeholder="12A"
                      required
                      disabled={fieldsDisabled}
                    />
                  </div>
                  <div className="form__row">
                    <TextField
                      label={t("address.form.cityLabel")}
                      value={address.city}
                      onChange={set("city")}
                      placeholder={t("address.form.cityPlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                  </div>
                  <div className="form__row">
                    <TextField
                      label={t("address.form.countryLabel")}
                      value={address.country}
                      onChange={set("country")}
                      placeholder={t("address.form.countryPlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                    <TextField
                      label={t("address.form.postalLabel")}
                      value={address.postalCode}
                      onChange={set("postalCode")}
                      placeholder={t("address.form.postalPlaceholder")}
                      required
                      disabled={fieldsDisabled}
                    />
                  </div>
                </form>
              )}
          </Accordion>
        </div>
      </div>

      <Accordion title={t("shipping.accordionTitle")} defaultOpen>
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
            {t("shipping.loading")}
          </div>
        )}
        {shipError && (
          <div className="warn" style={{ marginBottom: 8 }}>
            {t("shipping.error")}
          </div>
        )}
        {!shipLoading && !shipError && splitRequired && (
          <div className="warn" style={{ marginBottom: 12 }}>
            {t("shipping.splitRequired", { groups: splitGroupsCount })}
          </div>
        )}
        {!shipLoading && !shipError && splitRequired && (
          <div>
            {splitGroups.map((group, groupIndex) => {
              const selected = splitSelectedByGroup[group.groupId] ?? null;
              return (
                <div key={group.groupId} style={{ marginBottom: 14 }}>
                  <div className="muted" style={{ marginBottom: 8 }}>
                    {t("shipping.splitGroupTitle", {
                      index: groupIndex + 1,
                      count: group.lineIndexes.length,
                    })}
                  </div>

                  {group.options.length === 0 ? (
                    <div className="muted">{t("shipping.none")}</div>
                  ) : (
                    <div className={styles.radio__list}>
                      {group.options.map((m) => (
                        <RadioField
                          key={`${group.groupId}-${m.id}`}
                          name={`shipping-split-${group.groupId}`}
                          value={m.id}
                          checked={selected?.id === m.id}
                          onChange={() => onSelectSplitOption(group.groupId, m)}
                          label={
                            <RadioLabel
                              icon={carrierIconFor(m)}
                              title={m.label}
                              meta={
                                <span>
                                  {m.effectivePriceCents === 0
                                    ? t("shipping.free")
                                    : formatMoney(m.effectivePriceCents)}
                                </span>
                              }
                              caption={m.eta && <span className="muted">{m.eta}</span>}
                            />
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!shipLoading && !shipError && !splitRequired && shippingOptions.length === 0 && (
          <div className="muted">
            {t("shipping.none")}
          </div>
        )}

        {!splitRequired && (
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
                          ? t("shipping.free")
                          : formatMoney(m.effectivePriceCents)}
                      </span>
                    }
                    caption={m.eta && <span className="muted">{m.eta}</span>}
                  />
                }
              />
            ))}
          </div>
        )}
      </Accordion>
    </div>
  );
};
