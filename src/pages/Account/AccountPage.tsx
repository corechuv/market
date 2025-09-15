// src/pages/Account/AccountPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./AccountPage.module.scss";
import Button from "../../components/UI/Button";
import { SelectField } from "../../components/UI/SelectField";
import { TextField } from "../../components/UI/TextField";
import { PasswordField } from "../../components/UI/PasswordField";
import { AvatarField } from "../../components/UI/AvatarField";
import CloseIcon from "../../components/Icons/CloseIcon";
import PlusIcon from "../../components/Icons/PlusIcon";
import SwitchField from "../../components/UI/SwitchField";

/**
 * EU-ready Account (React + TSX + SCSS Module)
 * - Defaults: EU focus, primarily Germany (DE)
 * - Currency: EUR by default, proper locale formatting (de-DE when applicable)
 * - Addresses: EU country picker, DE Bundesland picker, PLZ validation (5 digits)
 * - Orders: localized dates & money
 * - Settings: language options kept (ru/en) — currency defaults to EUR; easy to extend
 * - Local storage key bumped to avoid clashing with older demo data
 */

//#region Types
type UUID = string;

type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  price: number; // per unit (in cents)
};

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

type Order = {
  id: UUID;
  number: string;
  createdAt: string; // ISO
  status: OrderStatus;
  total: number; // in cents
  items: OrderItem[];
  deliveryAddressId?: UUID;
};

type Address = {
  id: UUID;
  label: string; // "Дом", "Офис"
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string; // Bundesland / Region
  postalCode: string; // PLZ
  country: string; // country display name
  phone?: string;
  isDefault?: boolean;
};

type Profile = {
  avatar?: string; // dataURL
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: string; // yyyy-mm-dd
};

type Settings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingOptIn: boolean; // GDPR-friendly explicit toggle
  language: "ru" | "en"; // UI still in RU/EN (can be extended)
  currency: "RUB" | "USD" | "EUR";
  theme: "system" | "light" | "dark";
};

type WishlistItem = {
  id: UUID;
  sku: string;
  name: string;
  price: number; // in cents
  addedAt: string; // ISO
};

type AccountData = {
  profile: Profile;
  addresses: Address[];
  orders: Order[];
  wishlist: WishlistItem[];
  settings: Settings;
};
//#endregion

//#region EU helpers
const EU_COUNTRIES_RU = [
  "Германия", "Австрия", "Бельгия", "Болгария", "Хорватия", "Кипр", "Чехия", "Дания",
  "Эстония", "Финляндия", "Франция", "Греция", "Венгрия", "Ирландия", "Италия",
  "Латвия", "Литва", "Люксембург", "Мальта", "Нидерланды", "Польша", "Португалия",
  "Румыния", "Словакия", "Словения", "Испания", "Швеция"
];

const DE_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());

const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};
//#endregion

//#region Utils
const uid = () => Math.random().toString(36).slice(2, 10);

const fmtMoney = (n: number, currency: Settings["currency"], locale?: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);

const persistKey = "mp_account_demo_eu_v1";

function loadData(): AccountData | null {
  try {
    const raw = localStorage.getItem(persistKey);
    return raw ? (JSON.parse(raw) as AccountData) : null;
  } catch {
    return null;
  }
}

function saveData(data: AccountData) {
  localStorage.setItem(persistKey, JSON.stringify(data));
}

const initialData: AccountData = {
  profile: {
    firstName: "Alex",
    lastName: "Müller",
    email: "alex@example.de",
    phone: "+49 151 23456789",
    birthday: "1993-05-20",
    avatar: "",
  },
  addresses: [
    {
      id: uid(),
      label: "Дом",
      fullName: "Alex Müller",
      line1: "Musterstraße 10",
      city: "Berlin",
      postalCode: "10115",
      country: "Германия",
      phone: "+49 151 23456789",
      isDefault: true,
    },
    {
      id: uid(),
      label: "Офис",
      fullName: "Alex Müller",
      line1: "Leopoldstraße 25, Büro 302",
      city: "München",
      postalCode: "80802",
      country: "Германия",
    },
  ],
  orders: [
    {
      id: uid(),
      number: "MP-2025-000123",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "delivered",
      total: 12990,
      items: [
        { sku: "SKU-1001", name: "Kopfhörer Pro", qty: 1, price: 9990 },
        { sku: "SKU-2001", name: "Hülle", qty: 1, price: 3000 },
      ],
    },
    {
      id: uid(),
      number: "MP-2025-000124",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "shipped",
      total: 4590,
      items: [{ sku: "SKU-3009", name: "USB‑C Kabel", qty: 2, price: 2295 }],
    },
  ],
  settings: {
    emailNotifications: true,
    smsNotifications: false,
    marketingOptIn: false,
    language: "ru",
    currency: "EUR",
    theme: "system",
  },
  wishlist: [
    { id: uid(), sku: "SKU-5555", name: "Bluetooth Lautsprecher", price: 7990, addedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: uid(), sku: "SKU-7777", name: "Kabellose Maus", price: 3490, addedAt: new Date().toISOString() },
  ],
};

function usePersistentAccount() {
  const [data, setData] = useState<AccountData>(() => loadData() ?? initialData);
  useEffect(() => saveData(data), [data]);
  return [data, setData] as const;
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

const required = (v?: string) => (!!v && v.trim().length > 0 ? null : "Обязательное поле");
const emailVal = (v?: string) =>
  !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Некорректный email";
const phoneVal = (v?: string) => (!v || /^\+?[0-9\s\-()]{7,}$/.test(v) ? null : "Некорректный телефон");
const postalVal = (country: string, v?: string) => {
  if (!v) return "Обязательное поле";
  if (isGermany(country)) return /^\d{5}$/.test(v) ? null : "PLZ: 5 цифр";
  return null; // other EU formats can be added per country
};
//#endregion

type TabKey = "profile" | "addresses" | "orders" | "wishlist" | "settings";

const tabs: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "addresses", label: "Addresses" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "settings", label: "Settings" },
];

export default function AccountPage() {
  const [account, setAccount] = usePersistentAccount();
  const [active, setActive] = useState<TabKey>("profile");

  // Locale preferred for formatting
  const locale = getPreferredLocale(account.settings, account.addresses);

  // Модалка заказа
  const [openOrder, setOpenOrder] = useState<Order | null>(null);

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
            onClick={() => {
              localStorage.removeItem(persistKey);
              window.location.reload();
            }}
            aria-label="Сбросить демо-данные"
          >
            Сбросить демо
          </button>
          <button className={styles.primaryBtn} onClick={() => alert("Выход из аккаунта (демо)")}>Выйти</button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <nav className={styles.sidebar} aria-label="Навигация по аккаунту">
          {tabs.map((t) => (
            <a
              key={t.key}
              className={classNames(styles.tab, active === t.key && styles.tabActive)}
              onClick={() => setActive(t.key)}
              aria-current={active === t.key ? "page" : undefined}
            >
              {t.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <section className={styles.content}>
          <div className={styles.tabsMobile} role="tablist" aria-label="Разделы аккаунта">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={active === t.key}
                className={classNames(styles.chip, active === t.key && styles.chipActive)}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

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
              onOpen={(o) => setOpenOrder(o)}
            />
          )}

          {active === "wishlist" && (
            <WishlistSection
              wishlist={account.wishlist}
              currency={account.settings.currency}
              locale={locale}
              onChange={(next) =>
                setAccount((d) => ({
                  ...d,
                  wishlist:
                    typeof next === "function"
                      ? (next as (prev: WishlistItem[]) => WishlistItem[])(d.wishlist)
                      : next,
                }))
              }
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

      {openOrder && (
        <OrderModal
          order={openOrder}
          currency={account.settings.currency}
          locale={locale}
          onClose={() => setOpenOrder(null)}
          address={account.addresses.find((a) => a.id === openOrder.deliveryAddressId) || account.addresses.find(a => a.isDefault)}
        />
      )}
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
    const next: typeof errors = {
      firstName: required(form.firstName),
      lastName: required(form.lastName),
      email: required(form.email) || emailVal(form.email),
      phone: phoneVal(form.phone),
      birthday: null,
      avatar: null,
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
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

          <TextField
            label="Date of birth"
            type="date"
            className={styles.dateOfBirthBtn}
            value={form.birthday || ""}
            /* onChange обязателен, даже для date */
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            name="bday"
          />

        </div>

        <div className={styles.formActions}>
          <Button type="submit" variant="primary">Save</Button>
          <Button type="button" variant="secondary" onClick={() => setForm(profile)} aria-label="Отменить изменения">Canсel</Button>
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
  const [editing, setEditing] = useState<Address | null>(null);

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
    setEditing(null);
  }

  function remove(id: UUID) {
    onChange((prev: Address[]) => prev.filter((a) => a.id !== id));
  }
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
            onClick={() =>
              setEditing({
                id: uid(),
                label: "New address",
                fullName: "",
                line1: "",
                city: "",
                postalCode: "",
                country: "Germany",
                isDefault: addresses.length === 0,
              })
            }>
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
                onClick={() => setEditing(a)}>
                Edit
              </Button>
            </article>
          ))}
        </div>
      </div>

      {editing && <AddressEditor initial={editing} onCancel={() => setEditing(null)} onSave={upsert} />}
    </div>
  );
}

function AddressEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: Address;
  onCancel: () => void;
  onSave: (a: Address) => void;
}) {
  const [form, setForm] = useState<Address>(initial);
  const [errs, setErrs] = useState<Record<string, string | null>>({});

  function validate(): boolean {
    const e: Record<string, string | null> = {
      fullName: required(form.fullName),
      line1: required(form.line1),
      city: required(form.city),
      postalCode: postalVal(form.country, form.postalCode),
      country: required(form.country),
      phone: phoneVal(form.phone),
    };
    setErrs(e);
    return Object.values(e).every((v) => !v);
  }

  return (
    <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Редактировать адрес">
      <div className={styles.sheetContent}>
        <div className={styles.sheetHeader}>
          <h3>Адрес</h3>
          <button className={styles.ghostBtn} onClick={onCancel} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate()) return;
            onSave(form);
          }}
        >
          <div className={styles.grid2}>
            <TextField
              label="Метка *"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />

            <TextField
              label="Получатель *"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={errs.fullName || undefined}
            />

            <TextField
              label="Адрес строка 1 *"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
              error={errs.line1 || undefined}
            />

            <TextField
              label="Адрес строка 2"
              value={form.line2 || ""}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />

            <TextField
              label="Город *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              error={errs.city || undefined}
            />

            {isGermany(form.country) ? (
              <SelectField
                label="Регион / земля (Bundesland)"
                value={form.region || ""}
                onChange={(v) => setForm({ ...form, region: v })}
                options={DE_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="— Выберите землю —"
              />
            ) : (
              <TextField
                label="Регион / область"
                value={form.region || ""}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            )}

            <TextField
              label="Индекс (PLZ) *"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              error={errs.postalCode || undefined}
              inputMode="numeric"
              autoComplete="postal-code"
            />

            <SelectField
              label="Страна (ЕС) *"
              value={form.country}
              onChange={(v) => setForm({ ...form, country: v })}
              options={EU_COUNTRIES_RU.map((c) => ({ value: c, label: c }))}
              placeholder="— Выберите страну —"
              error={errs.country || undefined}
            />

            <TextField
              label="Телефон"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errs.phone || undefined}
              autoComplete="tel"
            />

            <div className={styles.gridColSpan2}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                />
                <span>Сделать адресом по умолчанию</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              Сохранить
            </button>
            <button type="button" className={styles.ghostBtn} onClick={onCancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** ========== ORDERS ========== */
function OrdersSection({
  orders,
  currency,
  locale,
  onOpen,
}: {
  orders: Order[];
  currency: Settings["currency"];
  locale: string;
  onOpen: (o: Order) => void;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const STATUS_OPTIONS = [
    { value: "all", label: "Все статусы" },
    { value: "processing", label: "В обработке" },
    { value: "shipped", label: "Отгружен" },
    { value: "delivered", label: "Доставлен" },
    { value: "cancelled", label: "Отменён" },
    { value: "refunded", label: "Возврат" },
  ] as const;

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
          options={STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          placeholder="Выберите статус"
          className={styles.toolbarSelect} // опционально для ширины
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Номер</th>
              <th>Дата</th>
              <th className={styles.hideSm}>Товары</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.number}</td>
                <td>{new Date(o.createdAt).toLocaleDateString(locale)}</td>
                <td className={styles.hideSm}>{o.items.map((i) => i.name).join(", ")}</td>
                <td>{fmtMoney(o.total / 100, currency, locale)}</td>
                <td>
                  <span className={classNames(styles.badge, styles[`st_${o.status}`])}>
                    {statusLabel(o.status)}
                  </span>
                </td>
                <td className={styles.right}>
                  <Button size="small" variant="secondary" onClick={() => onOpen(o)}>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Ничего не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusLabel(s: OrderStatus) {
  switch (s) {
    case "processing":
      return "В обработке";
    case "shipped":
      return "Отгружен";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменён";
    case "refunded":
      return "Возврат";
  }
}

function OrderModal({
  order,
  currency,
  locale,
  onClose,
  address,
}: {
  order: Order;
  currency: Settings["currency"];
  locale: string;
  onClose: () => void;
  address?: Address;
}) {
  const totalItems = order.items.reduce((a, b) => a + b.qty, 0);

  return (
    <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Детали заказа">
      <div className={styles.sheetContent}>
        <div className={styles.sheetHeader}>
          <h3>Заказ {order.number}</h3>
          <button className={styles.ghostBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className={styles.stack}>
          <div className={styles.kv}>
            <div>
              <span className={styles.muted}>Дата:</span> {new Date(order.createdAt).toLocaleString(locale)}
            </div>
            <div>
              <span className={styles.muted}>Статус:</span>{" "}
              <span className={classNames(styles.badge, styles[`st_${order.status}`])}>{statusLabel(order.status)}</span>
            </div>
            <div>
              <span className={styles.muted}>Позиции:</span> {totalItems}
            </div>
            <div>
              <span className={styles.muted}>Сумма:</span> {fmtMoney(order.total / 100, currency, locale)}
            </div>
          </div>

          {address && (
            <div className={styles.addrBox}>
              <div className={styles.muted}>Адрес доставки</div>
              <div>{address.fullName}</div>
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

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Товар</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.sku}>
                    <td>{it.sku}</td>
                    <td>{it.name}</td>
                    <td>{it.qty}</td>
                    <td>{fmtMoney(it.price / 100, currency, locale)}</td>
                    <td>{fmtMoney((it.price * it.qty) / 100, currency, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.right}>
            <button className={styles.secondaryBtn} onClick={() => alert("Повторить заказ (демо)")}>Повторить заказ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ========== WISHLIST ========== */
function WishlistSection({
  wishlist,
  currency,
  locale,
  onChange,
}: {
  wishlist: WishlistItem[];
  currency: Settings["currency"];
  locale: string;
  onChange: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
}) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...wishlist]
      .filter((w) => !s || w.name.toLowerCase().includes(s) || w.sku.toLowerCase().includes(s))
      .sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
  }, [wishlist, q]);

  function remove(id: UUID) {
    onChange((prev) => prev.filter((x) => x.id !== id));
  }

  function clearAll() {
    if (!confirm("Очистить избранное?")) return;
    onChange([]);
  }

  return (
    <div className={styles.stackLg}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.titlePage}>Wishlist</h2>
        </div>

        <div className={styles.toolbar}>
          <TextField
            placeholder="Поиск по товару или SKU"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {list.length === 0 ? (
          <div className={styles.empty}>Список пуст</div>
        ) : (
          <div className={styles.listGrid}>
            {list.map((w) => (
              <article key={w.id} className={styles.addrCard}>
                <div className={styles.addrHeader}>
                  <strong className={styles.addrLabel}>{w.name}</strong>
                  <div className={styles.addrActions}>
                    <CloseIcon onClick={() => remove(w.id)} />
                  </div>
                </div>
                <div className={styles.addrBody}>
                  <div className={styles.muted}>SKU: {w.sku}</div>
                  <div>Цена: {fmtMoney(w.price / 100, currency, locale)}</div>
                  <div className={styles.muted}>
                    Добавлено: {new Date(w.addedAt).toLocaleString(locale)}
                  </div>
                </div>
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => alert("В корзину (демо)")}
                >
                  В корзину
                </Button>
              </article>
            ))}
          </div>
        )}

        <div style={{ display: "flex", marginTop: 20, justifyContent: "end" }}>
          {wishlist.length > 0 && (
            <Button className={styles.ghostBtn} onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
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
  const [pwErr, setPwErr] = useState<string | null>(null);

  const strengthCalc = (v: string) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s; // 0..4
  };

  function submitPw(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.next || pw.next.length < 8) {
      setPwErr("Новый пароль должен быть не менее 8 символов");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwErr("Пароли не совпадают");
      return;
    }
    setPwErr(null);
    setPw({ current: "", next: "", confirm: "" });
    alert("Пароль изменён (демо)");
  }

  return (
    <div className={styles.stackLg}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.titlePage}>Settings</h2>
          <p className={styles.muted}>Уведомления, язык, валюта и тема. GDPR: маркетинговые рассылки включаются только по явному согласию.</p>
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
              options={[{ value: "ru", label: "Русский" }, { value: "en", label: "English" }]}
            />

            <SelectField
              label="Currency"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v as Settings["currency"] })}
              options={[{ value: "EUR", label: "EUR €" }, { value: "USD", label: "USD $" }, { value: "RUB", label: "RUB ₽" }]}
            />

            <SelectField
              label="Theme"
              value={form.theme}
              onChange={(v) => setForm({ ...form, theme: v as Settings["theme"] })}
              options={[{ value: "system", label: "Системная" }, { value: "light", label: "Светлая" }, { value: "dark", label: "Тёмная" }]}
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="primary">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setForm(settings)}>
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
            />

            <PasswordField
              label="Confirm password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.currentTarget.value })}
              error={pwErr && pw.next !== pw.confirm ? "Пароли не совпадают" : undefined}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit">Change password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
