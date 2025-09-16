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

import { exportInvoicePDF } from "../../types/helpers/invoiceConfig";
import type { Profile } from "../../types/profile";
import type { Settings } from "../../types/settings";
import type { Address } from "../../types/address";
import { statusLabel, type Order, type OrderStatus } from "../../types/order";
import { fmtMoney } from "../../types/helpers/fmtMoney";
import type { Account } from "../../types/account";
import type { Wishlist } from "../../types/wishlist";
import { DE_STATES, EU_COUNTRIES_RU } from "../../data/helpers/region";
import { account, uid } from "../../data/account";
import { STATUS_OPTIONS } from "../../data/helpers/deliveryStatus";
import { Tabs, type TabItem } from "../../components/UI/Tabs";

type UUID = string;

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());

const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};

const persistKey = "mp_account_demo_eu_v1";

function loadData(): Account | null {
  try {
    const raw = localStorage.getItem(persistKey);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

function saveData(data: Account) {
  localStorage.setItem(persistKey, JSON.stringify(data));
}

function usePersistentAccount() {
  const [data, setData] = useState<Account>(() => loadData() ?? account);
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

type TabKey = "profile" | "addresses" | "orders" | "wishlist" | "settings";

const tabs: TabItem<TabKey>[] = [
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
                      ? (next as (prev: Wishlist[]) => Wishlist[])(d.wishlist)
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
    value: string;                    // ISO: yyyy-mm-dd или ""
    onChange: (iso: string) => void;  // в состояние уходит всегда ISO или ""
    minYear?: number;
    maxYear?: number;
    namePrefix?: string;              // чтобы autocomplete не конфликтовал
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
                <span className={`${styles.badge} ${styles[`st_${o.status}`]}`}>
                  {statusLabel(o.status)}
                </span>
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
                <Button size="small" variant="secondary" onClick={() => onOpen(o)}>
                  Details
                </Button>
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
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className={styles.empty}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
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

          <div className={styles.stack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>Сводка заказа</h4>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <tbody>
                    {"subtotal" in order && typeof order.subtotal === "number" && (
                      <tr>
                        <td>Товары</td>
                        <td className={styles.right}>{fmtMoney((order.subtotal) / 100, currency, locale)}</td>
                      </tr>
                    )}
                    {"shippingCents" in order && typeof order.shippingCents === "number" && (
                      <tr>
                        <td>Доставка{order.shippingMethod ? ` (${order.shippingMethod})` : ""}</td>
                        <td className={styles.right}>
                          {order.shippingCents === 0
                            ? "Free"
                            : fmtMoney(order.shippingCents / 100, currency, locale)}
                        </td>
                      </tr>
                    )}
                    {"discountCents" in order && order.discountCents! > 0 && (
                      <tr>
                        <td>Скидка{order.promoCode ? ` (${order.promoCode})` : ""}</td>
                        <td className={styles.right}>- {fmtMoney(order.discountCents! / 100, currency, locale)}</td>
                      </tr>
                    )}
                    {"vatCents" in order && typeof order.vatCents === "number" && (
                      <tr>
                        <td>НДС</td>
                        <td className={styles.right}>{fmtMoney(order.vatCents! / 100, currency, locale)}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>Итого</strong></td>
                      <td className={styles.right}>
                        <strong>{fmtMoney(order.total / 100, currency, locale)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <button
              className={styles.secondaryBtn}
              onClick={() => exportInvoicePDF({
                order,
                address,
                currency,
                locale,
                buyer: undefined, // можно передать account.profile, если поднимешь выше
              })}
            >
              Экспорт инвойса (PDF)
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => alert("Повторить заказ (демо)")}
              style={{ marginLeft: 8 }}
            >
              Повторить заказ
            </button>
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
  wishlist: Wishlist[];
  currency: Settings["currency"];
  locale: string;
  onChange: React.Dispatch<React.SetStateAction<Wishlist[]>>;
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
            <Button variant="ghost" size="small" onClick={clearAll}>
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
            <Button type="submit" size="small" variant="primary">Save</Button>
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
            <Button type="submit" size="small">Change password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
