// src/pages/Account/AccountPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import Button from "../../components/UI/Button";
import { SelectField } from "../../components/UI/SelectField";
import { TextField } from "../../components/UI/TextField";
import { PasswordField } from "../../components/UI/PasswordField";
import { AvatarField } from "../../components/UI/AvatarField";
import CloseIcon from "../../components/Icons/CloseIcon";
import PlusIcon from "../../components/Icons/PlusIcon";
import SwitchField from "../../components/UI/SwitchField";

import { useAccount } from "../../context/AccountContext";

import { exportInvoicePDF } from "../../types/helpers/invoiceConfig";
import type { Profile } from "../../types/profile";
import type { Settings } from "../../types/settings";
import type { Address } from "../../types/address";
import { statusLabel, type Order, type OrderStatus } from "../../types/order";
import { fmtMoney } from "../../types/helpers/fmtMoney";
import { STATUS_OPTIONS } from "../../data/helpers/deliveryStatus";
import { Tabs, type TabItem } from "../../components/UI/Tabs";

// ✅ Универсальные валидаторы
import {
  required,
  validatePhone,
  validateEmail,
  validateForm,
  compose,
  minLength,
  sameAs,
  passwordStrength,
  type FieldErrors,
} from "../../utils/validate/fields";

type UUID = string;

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());

const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};

type TabKey = "profile" | "addresses" | "orders" | "settings";

const tabs: TabItem<TabKey>[] = [
  { key: "profile", label: "Profile" },
  { key: "addresses", label: "Addresses" },
  { key: "orders", label: "Orders" },
  { key: "settings", label: "Settings" },
];

export default function AccountPage() {
  const { account, setAccount, reset } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  // Активная вкладка <- из query ?tab=
  const initialTab = (() => {
    const sp = new URLSearchParams(location.search);
    const v = sp.get("tab") as TabKey | null;
    return (v ?? "profile") as TabKey;
  })();
  const [active, setActive] = useState<TabKey>(initialTab);

  // Держим URL в синхронизации с выбранной вкладкой
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("tab") !== active) {
      sp.set("tab", active);
      navigate({ search: sp.toString() }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Locale preferred for formatting
  const locale = getPreferredLocale(account.settings, account.addresses);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.avatarWrap}>
            {account.profile.avatar ? (
              <img
                className={styles.avatar}
                src={account.profile.avatar}
                alt="Avatar"
              />
            ) : (
              <svg
                className={styles.avatar}
                width="128"
                height="128"
                viewBox="0 0 128 128"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-labelledby="t d"
              >
                <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6">
                  <circle cx="64" cy="52" r="16" fill="none" />
                  <path d="M34 92c6-14 20-22 30-22s24 8 30 22" fill="none" />
                </g>
              </svg>
            )}
          </div>
          <div>
            <h1 className={styles.title}>{account.profile.firstName} {account.profile.lastName}</h1>
            <p className={styles.subtitle}>
              {account.profile.email}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.ghostBtn}
            onClick={() => reset()}
            aria-label="Сбросить демо-данные"
          >
            Сбросить демо
          </button>
          <button className={styles.primaryBtn} onClick={() => alert("Выход из аккаунта (демо)")}>Выйти</button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Content */}
        <section className={styles.content}>
          <Tabs<TabKey>
            items={tabs}
            activeKey={active}
            onChange={setActive}
            ariaLabel="Разделы аккаунта"
          />

          {active === "profile" && (
            <ProfileForm
              profile={account.profile}
              onSave={(p) => setAccount((d) => ({ ...d, profile: p }))}
            />
          )}

          {active === "addresses" && (
            <AddressesSection
              addresses={account.addresses}
              onChange={(next) =>
                setAccount((d) => ({
                  ...d,
                  addresses:
                    typeof next === "function"
                      ? (next as (prev: Address[]) => Address[])(d.addresses)
                      : next,
                }))
              }
            />
          )}

          {active === "orders" && (
            <OrdersSection
              orders={account.orders}
              currency={account.settings.currency}
              locale={locale}
            />
          )}

          {active === "settings" && (
            <SettingsSection
              settings={account.settings}
              onSave={(settings) => setAccount((d) => ({ ...d, settings }))}
            />
          )}
        </section>
      </div>
    </main>
  );
}

/** ========== PROFILE ========== */
function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (p: Profile) => void;
}) {
  const [form, setForm] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Record<keyof Profile, string | null>>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    birthday: null,
    avatar: null,
  });

  useEffect(() => setForm(profile), [profile]);

  function validate(): boolean {
    const rules = {
      firstName: required("Обязательное поле"),
      lastName: required("Обязательное поле"),
      email: compose(required("Обязательное поле"), validateEmail),
      phone: validatePhone,
      // birthday / avatar — опционально
    } as const;

    const errs = validateForm(form, rules) as FieldErrors<Profile>;
    const next: typeof errors = {
      firstName: (errs as any).firstName || null,
      lastName: (errs as any).lastName || null,
      email: (errs as any).email || null,
      phone: (errs as any).phone || null,
      birthday: null,
      avatar: null,
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  // helpers для DOB
  const pad2 = (n: number | string) => String(n).padStart(2, "0");

  // m: 1..12
  const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  const parseISODate = (iso?: string) => {
    if (!iso) return { y: "", m: "", d: "" };
    const [y, m, d] = iso.split("-");
    return { y: y || "", m: m || "", d: d || "" };
  };

  const buildISO = (y?: string, m?: string, d?: string) => {
    if (!y || !m || !d) return "";
    return `${y}-${pad2(m)}-${pad2(d)}`;
  };

  function DOBField({
    label = "Date of birth",
    value,
    onChange,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
    namePrefix = "bday",
  }: {
    label?: string;
    value: string; // ISO: yyyy-mm-dd или ""
    onChange: (iso: string) => void; // в состояние уходит всегда ISO или ""
    minYear?: number;
    maxYear?: number;
    namePrefix?: string; // чтобы autocomplete не конфликтовал
  }) {
    const { y, m, d } = parseISODate(value);

    const daysMax = y && m ? daysInMonth(+y, +m) : 31;

    const dayOptions = Array.from({ length: daysMax }, (_, i) => {
      const v = pad2(i + 1);
      return { value: v, label: v };
    });

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
      const v = pad2(i + 1);
      return { value: v, label: v }; // можно подставить локализованные названия месяцев
    });

    const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
      const v = String(maxYear - i); // по убыванию
      return { value: v, label: v };
    });

    function commit(next: { y?: string; m?: string; d?: string }) {
      const ny = next.y ?? y;
      const nm = next.m ?? m;
      let nd = next.d ?? d;

      if (ny && nm && nd) {
        const maxD = daysInMonth(+ny, +nm);
        const safeD = Math.min(+nd, maxD);
        onChange(buildISO(ny, nm, String(safeD)));
      } else {
        // если что-то не выбрано — очищаем
        onChange("");
      }
    }

    return (
      <div>
        <div className={styles.label}>{label}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <SelectField
            value={d}
            onChange={(v) => commit({ d: v })}
            options={dayOptions}
            placeholder="DD"
            name={`${namePrefix}-day`}
            autoComplete="bday-day"
          />
          <SelectField
            value={m}
            onChange={(v) => commit({ m: v })}
            options={monthOptions}
            placeholder="MM"
            name={`${namePrefix}-month`}
            autoComplete="bday-month"
          />
          <SelectField
            value={y}
            onChange={(v) => commit({ y: v })}
            options={yearOptions}
            placeholder="YYYY"
            name={`${namePrefix}-year`}
            autoComplete="bday-year"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.titlePage}>Profile</h2>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (!validate()) return;
          onSave(form);
        }}
      >
        <AvatarField
          label="Photo"
          value={form.avatar || ""}
          onChange={({ dataUrl }) => setForm((s) => ({ ...s, avatar: dataUrl || "" }))}
          hint=""
          maxSizeMb={5}
        />
        <div className={styles.grid2}>
          <TextField
            label="First name *"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName || undefined}
            name="firstName"
            autoComplete="given-name"
          />

          <TextField
            label="Last name *"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName || undefined}
            name="lastName"
            autoComplete="family-name"
          />

          <TextField
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email || undefined}
            name="email"
            autoComplete="email"
          />

          <TextField
            label="Phone number"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone || undefined}
            name="tel"
            autoComplete="tel"
          />

          <DOBField
            label="Date of birth"
            value={form.birthday || ""}
            onChange={(iso) => setForm({ ...form, birthday: iso })}
          />
        </div>

        <div className={styles.formActions}>
          <Button type="submit" variant="primary" size="small">Save</Button>
          <Button type="button" variant="secondary" size="small" onClick={() => setForm(profile)} aria-label="Отменить изменения">Canсel</Button>
        </div>
      </form>
    </div>
  );
}

/** ========== ADDRESSES ========== */
function AddressesSection({
  addresses,
  onChange,
}: {
  addresses: Address[];
  onChange: React.Dispatch<React.SetStateAction<Address[]>>;
}) {
  const navigate = useNavigate();

  function upsert(addr: Address) {
    onChange((prev: Address[]) => {
      let next = [...prev];
      const i = next.findIndex((a) => a.id === addr.id);

      if (addr.isDefault) {
        next = next.map((a) => ({ ...a, isDefault: a.id === addr.id }));
      }
      if (i >= 0) next[i] = addr;
      else next.unshift(addr);

      return next;
    });
  }

  function remove(id: UUID) {
    onChange((prev: Address[]) => prev.filter((a) => a.id !== id));
  }

  const back = encodeURIComponent("/account?tab=addresses");

  return (
    <div className={styles.stackLg}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.titlePage}>Addresses</h2>
        </div>

        <div className={styles.toolbar}>
          <Button
            type="button"
            size="small"
            variant="secondary"
            className={styles.addBtn}
            onClick={() => navigate(`/account/addresses/new?back=${back}`)}
            aria-label="Добавить адрес"
          >
            <PlusIcon />
          </Button>
        </div>

        <div className={styles.listGrid}>
          {addresses.map((a) => (
            <article key={a.id} className={styles.addrCard}>
              <div className={styles.addrHeader}>
                <strong className={styles.addrLabel}>
                  {a.label} {a.isDefault && <span className={styles.badge}>По умолчанию</span>}
                </strong>
                <div className={styles.addrActions}>
                  <CloseIcon onClick={() => remove(a.id)} />
                </div>
              </div>
              <div className={styles.addrBody}>
                <div>{a.fullName}</div>
                <div>{a.line1}</div>
                {a.line2 && <div>{a.line2}</div>}
                <div>
                  {a.city}
                  {a.region ? `, ${a.region}` : ""}, {a.postalCode}
                </div>
                <div>{a.country}</div>
                {a.phone && <div className={styles.muted}>{a.phone}</div>}
              </div>

              {!a.isDefault && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => upsert({ ...a, isDefault: true })}
                >
                  Make default
                </Button>
              )}

              <Button
                variant="secondary"
                size="small"
                onClick={() => navigate(`/account/addresses/${a.id}?back=${back}`)}
              >
                Edit
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ========== ORDERS ========== */
function OrdersSection({
  orders,
  currency,
  locale,
}: {
  orders: Order[];
  currency: Settings["currency"];
  locale: string;
}) {
  const navigate = useNavigate();
  const back = encodeURIComponent("/account?tab=orders");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      const byText =
        !s ||
        o.number.toLowerCase().includes(s) ||
        o.items.some((it) => it.name.toLowerCase().includes(s) || it.sku.toLowerCase().includes(s));
      const byStatus = status === "all" || o.status === status;
      return byText && byStatus;
    });
  }, [orders, q, status]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.titlePage}>Orders</h2>
      </div>

      <div className={styles.toolbar}>
        <TextField
          placeholder="Поиск по номеру, товару, SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <SelectField
          value={status}
          onChange={(v) => setStatus(v as OrderStatus | "all")}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Выберите статус"
          className={styles.toolbarSelect}
        />
      </div>

      {/* === LIST (cards) instead of table === */}
      <div className={styles.ordersList}>
        {filtered.map((o) => {
          const totalItems = o.items.reduce((s, it) => s + (it.qty || 0), 0);

          // пытаемся достать картинку из item: image | imageUrl | images[0] | thumb
          const getItemImage = (it: any): string | undefined =>
            it?.image || it?.imageUrl || (Array.isArray(it?.images) ? it.images[0] : it?.thumb);

          // до 4 миниатюр; если больше — "+N"
          const thumbs = o.items.slice(0, 4).map((it, idx) => {
            const src = getItemImage(it);
            return src ? (
              <img key={idx} src={src} alt={it.name} className={styles.orderThumb} loading="lazy" />
            ) : (
              <div key={idx} className={styles.orderThumb + " " + styles.thumbFallback} aria-hidden>
                {it.name?.[0]?.toUpperCase() ?? "•"}
              </div>
            );
          });
          const extra = o.items.length > 4 ? o.items.length - 4 : 0;

          return (
            <article key={o.id} className={styles.orderCard} aria-label={`Order ${o.number}`}>
              <div className={styles.orderHead}>
                <div className={styles.orderId}>
                  <div className={styles.orderNumber}>{o.number}</div>
                  <div className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString(locale)}</div>
                </div>
                <span className={`${styles.badge} ${styles[`st_${o.status}`]}`}>{statusLabel(o.status)}</span>
              </div>

              <div className={styles.orderBody}>
                <div className={styles.orderThumbs}>
                  {thumbs}
                  {extra > 0 && <div className={styles.orderThumb + " " + styles.orderMore}>+{extra}</div>}
                </div>

                <div className={styles.orderMeta}>
                  <div className={styles.orderTitles}>
                    {o.items.slice(0, 3).map((it) => it.name).join(", ")}
                    {o.items.length > 3 ? "…" : ""}
                  </div>
                  <div className={styles.muted}>
                    {totalItems} items • {o.items.length} SKU
                    {o.shippingMethod ? ` • ${o.shippingMethod}` : ""}
                  </div>
                </div>

                <div className={styles.orderTotal}>
                  {fmtMoney(o.total / 100, currency, locale)}
                </div>
              </div>

              <div className={styles.orderActions}>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() =>
                    exportInvoicePDF({
                      order: o,
                      currency,
                      locale,
                      address: undefined,
                      buyer: undefined,
                    })
                  }
                >
                  Invoice
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(`/account/orders/${o.id}?back=${back}`)}
                >
                  Details
                </Button>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && <div className={styles.empty}>Ничего не найдено</div>}
      </div>
    </div>
  );
}

/** ========== SETTINGS ========== */
function SettingsSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
}) {
  const [form, setForm] = useState(settings);

  // Смена пароля (демо)
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrs, setPwErrs] = useState<Record<string, string>>({});

  const strengthCalc = (v: string) => passwordStrength(v);

  function submitPw(e: React.FormEvent) {
    e.preventDefault();

    const rules = {
      next: compose(
        required("Новый пароль обязателен"),
        minLength(8, "Новый пароль должен быть не менее 8 символов")
      ),
      confirm: sameAs<string>((all) => all.next, "Пароли не совпадают"),
      // current — намеренно без проверки в демо
    } as const;

    const errs = validateForm(pw, rules);
    setPwErrs(errs as Record<string, string>);
    if (Object.keys(errs).length) return;

    setPw({ current: "", next: "", confirm: "" });
    setPwErrs({});
    alert("Пароль изменён (демо)");
  }

  return (
    <div className={styles.stackLg}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.titlePage}>Settings</h2>
          <p className={styles.muted}>
            Уведомления, язык, валюта и тема. GDPR: маркетинговые рассылки включаются только по явному согласию.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div className={styles.grid2}>
            <div className={styles.switchList}>
              <SwitchField
                label="Notification по email"
                checked={form.emailNotifications}
                onChange={(checked) => setForm({ ...form, emailNotifications: checked })}
              />
              <SwitchField
                label="SMS-notifications"
                checked={form.smsNotifications}
                onChange={(checked) => setForm({ ...form, smsNotifications: checked })}
              />
              <SwitchField
                label="Получать акции и предложения (GDPR согласие)"
                checked={form.marketingOptIn}
                onChange={(checked) => setForm({ ...form, marketingOptIn: checked })}
              />
            </div>

            <div></div>

            <SelectField
              label="Language"
              value={form.language}
              onChange={(v) => setForm({ ...form, language: v as Settings["language"] })}
              options={[
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
              ]}
            />

            <SelectField
              label="Currency"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v as Settings["currency"] })}
              options={[
                { value: "EUR", label: "EUR €" },
                { value: "USD", label: "USD $" },
                { value: "RUB", label: "RUB ₽" },
              ]}
            />

            <SelectField
              label="Theme"
              value={form.theme}
              onChange={(v) => setForm({ ...form, theme: v as Settings["theme"] })}
              options={[
                { value: "system", label: "Системная" },
                { value: "light", label: "Светлая" },
                { value: "dark", label: "Тёмная" },
              ]}
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" size="small" variant="primary">
              Save
            </Button>
            <Button type="button" size="small" variant="secondary" onClick={() => setForm(settings)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Change password</h3>
        </div>

        <form className={styles.form} onSubmit={submitPw}>
          <div className={styles.grid2}>
            <PasswordField
              label="Current password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.currentTarget.value })}
              autoComplete="current-password"
            />

            <PasswordField
              label="New password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.currentTarget.value })}
              withStrength
              strengthCalc={strengthCalc}
              autoComplete="new-password"
              error={pwErrs.next}
            />

            <PasswordField
              label="Confirm password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.currentTarget.value })}
              error={pwErrs.confirm}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" size="small">
              Change password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
