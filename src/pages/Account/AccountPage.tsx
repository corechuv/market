// src/pages/Account/AccountPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { Tabs, type TabItem } from "../../components/UI/Tabs";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import {
    required,
    validatePhone,
    validateEmail,
    validateForm,
    compose,
    type FieldErrors,
} from "../../utils/validate/fields";

import PlusIcon from "../../components/Icons/PlusIcon";
import CloseIcon from "../../components/Icons/CloseIcon";
import { EUROPE_COUNTRIES } from "../../utils/country";
import MyVideos from "./MyVideos";

/* ================= types ================= */
type TabKey = "videos" | "profile" | "addresses" | "orders" | "settings";
const tabs: TabItem<TabKey>[] = [
    { key: "videos", label: "Videos" },
    { key: "profile", label: "Profile" },
    { key: "addresses", label: "Addresses" },
    { key: "orders", label: "Orders" },
    { key: "settings", label: "Settings" },
];

type Address = {
    id: string;
    firstName: string;
    lastName: string;
    company?: string | null;
    country: string;       // ISO-2
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

type Me = {
    id: string;
    email?: string | null;
    username?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isEmailVerified?: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
    role?: string;
    addresses?: Address[];
};

type ProfileFormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

const fmtCountry = (code: string) => {
    const c = EUROPE_COUNTRIES.find((x) => x.code === (code || "").toUpperCase());
    return c ? `${c.name} (${c.code})` : (code || "");
};

/* ================= page ================= */
export default function AccountPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [me, setMe] = useState<Me | null>((user ?? null) as Me | null);
    const [active, setActive] = useState<TabKey>("videos");
    const [loading, setLoading] = useState(false);

    // <<< ждём окончания инициализации auth, прежде чем дёргать /auth/me
    useEffect(() => {
        if (authLoading) return;
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get("/auth/me");
                if (mounted) setMe(data as Me);
            } catch {
                if (mounted) navigate("/auth", { replace: true });
            }
        })();
        return () => { mounted = false; };
    }, [authLoading, navigate]);

    // <<< можно без useMemo, чтобы не ловить порядок хуков
    const displayName = (() => {
        const f = me?.firstName?.trim() || "";
        const l = me?.lastName?.trim() || "";
        const full = `${f} ${l}`.trim();
        return full || me?.username || me?.email || "User";
    })();

    const verified = !!me?.isEmailVerified;
    const backSettings = encodeURIComponent("/account?tab=settings");

    // редирект неавторизованных — когда точно знаем, что auth инициализирован
    useEffect(() => {
        if (!authLoading && !user) navigate("/auth", { replace: true });
    }, [authLoading, user, navigate]);

    if (authLoading || !me) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>Loading…</div>
            </main>
        );
    }

    async function resendVerify() {
        try {
            await api.post("/auth/email/request-verify", {});
            alert("Verification email sent.");
        } catch {
            alert("Failed to send verification email.");
        }
    }

    // === если НЕ верифицирован — показываем компактный экран
    if (!verified) {
        return (
            <main className={styles.page}>
                <header className={styles.header}>
                    <div className={styles.headerMain}>
                        <div className={styles.avatarWrap}>
                            <svg className={styles.avatar} width="128" height="128" viewBox="0 0 128 128" fill="none"
                                xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">
                                <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6">
                                    <circle cx="64" cy="52" r="16" fill="none" />
                                    <path d="M34 92c6-14 20-22 30-22s24 8 30 22" fill="none" />
                                </g>
                            </svg>
                        </div>
                        <div>
                            <h1 className={styles.title}>{displayName}</h1>
                            <p className={styles.subtitle}>{me.email}{me.username ? ` · @${me.username}` : ""}</p>
                            <small className={styles.muted}>
                                Please verify your email to access your account.
                            </small>
                        </div>
                    </div>
                </header>

                <div className={styles.layout}>
                    <section className={styles.content}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.titlePage}>Email verification required</h2>
                                <p className={styles.muted}>We sent you a link. You can resend it or open the verification screen.</p>
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => navigate(`/account/settings/verify-email?back=${backSettings}`)}
                                >
                                    Open verification screen
                                </Button>
                                <Button variant="secondary" size="small" onClick={resendVerify}>
                                    Resend link
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerMain}>
                    <div className={styles.avatarWrap}>
                        {/* placeholder avatar */}
                        <svg
                            className={styles.avatar}
                            width="128" height="128" viewBox="0 0 128 128" fill="none"
                            xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar"
                        >
                            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6">
                                <circle cx="64" cy="52" r="16" fill="none" />
                                <path d="M34 92c6-14 20-22 30-22s24 8 30 22" fill="none" />
                            </g>
                        </svg>
                    </div>
                    <div>
                        <h1 className={styles.title}>{displayName}</h1>
                        <p className={styles.subtitle}>
                            {me.email}{me.username ? ` · @${me.username}` : ""}
                        </p>
                    </div>
                </div>
                <div className={styles.headerActions} />
            </header>

            <div className={styles.layout}>
                <section className={styles.content}>
                    <Tabs<TabKey> items={tabs} activeKey={active} onChange={setActive} ariaLabel="Account sections" />
                    {active === "videos" && (
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.titlePage}>My videos</h2>
                            </div>
                            <MyVideos />
                        </div>
                    )}
                    {active === "profile" && (
                        <ProfileForm
                            me={me}
                            saving={loading}
                            onSave={async (patch) => {
                                setLoading(true);
                                try {
                                    await api.put(`/customers/${me.id}`, {
                                        email: patch.email || null,
                                        phone: patch.phone || null,
                                        firstName: patch.firstName || null,
                                        lastName: patch.lastName || null,
                                    });
                                    const { data } = await api.get("/auth/me");
                                    setMe(data as Me);
                                    try {
                                        localStorage.setItem("mp_auth_user", JSON.stringify(data));
                                        sessionStorage.setItem("mp_auth_user", JSON.stringify(data));
                                    } catch { /* ignore */ }
                                } catch (e: any) {
                                    const status = e?.response?.status;
                                    const msg = e?.response?.data?.message || "Failed to save profile";
                                    if (status === 409) throw { email: "Email already exists" };
                                    throw { _form: msg };
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />
                    )}
                    {active === "addresses" && (
                        <AddressesSection
                            me={me}
                            onMeRefresh={async () => {
                                const { data } = await api.get("/auth/me");
                                setMe(data as Me);
                                try {
                                    localStorage.setItem("mp_auth_user", JSON.stringify(data));
                                    sessionStorage.setItem("mp_auth_user", JSON.stringify(data));
                                } catch { /* ignore */ }
                            }}
                        />
                    )}
                    {active === "orders" && <OrdersSection />}
                    {active === "settings" && <SettingsSection me={me} />}
                </section>
            </div>
        </main>
    );
}

/** ================== Profile ================== */
function ProfileForm({
    me,
    saving,
    onSave,
}: {
    me: Me;
    saving: boolean;
    onSave: (p: ProfileFormState) => Promise<void>;
}) {
    const [form, setForm] = useState<ProfileFormState>({
        firstName: me.firstName ?? "",
        lastName: me.lastName ?? "",
        email: me.email ?? "",
        phone: me.phone ?? "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setForm({
            firstName: me.firstName ?? "",
            lastName: me.lastName ?? "",
            email: me.email ?? "",
            phone: me.phone ?? "",
        });
    }, [me]);

    function validate(): boolean {
        const rules = {
            firstName: required("Required"),
            lastName: required("Required"),
            email: compose(required("Required"), validateEmail),
            phone: validatePhone,
        } as const;
        const errs = validateForm(form, rules) as FieldErrors<ProfileFormState>;
        setErrors(errs as Record<string, string>);
        return Object.keys(errs).length === 0;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        try {
            await onSave(form);
        } catch (fe: any) {
            setErrors(fe || { _form: "Failed to save" });
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.titlePage}>Profile</h2>
            </div>

            <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.grid2}>
                    <TextField
                        label="First name *"
                        name="firstName"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        error={errors.firstName}
                        autoComplete="given-name"
                    />
                    <TextField
                        label="Last name *"
                        name="lastName"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        error={errors.lastName}
                        autoComplete="family-name"
                    />
                    <TextField
                        label="Email *"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email}
                        autoComplete="email"
                    />
                    <TextField
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        error={errors.phone}
                        autoComplete="tel"
                    />
                </div>

                {errors._form && <div className={styles.formError} role="alert">{errors._form}</div>}

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" size="small" disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() =>
                            setForm({
                                firstName: me.firstName ?? "",
                                lastName: me.lastName ?? "",
                                email: me.email ?? "",
                                phone: me.phone ?? "",
                            })
                        }
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

/** ================== Addresses (list-only; edit on separate page) ================== */
function AddressesSection({
    me,
    onMeRefresh,
}: {
    me: Me;
    onMeRefresh: () => Promise<void>;
}) {
    const navigate = useNavigate();
    const [items, setItems] = useState<Address[]>(me.addresses ?? []);
    const [loading, setLoading] = useState<boolean>(true);

    // первичная загрузка / синхронизация
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get<Address[]>("/addresses/my");
                if (mounted) setItems(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (me.addresses) setItems(me.addresses);
    }, [me.addresses]);

    const back = encodeURIComponent("/account?tab=addresses");

    async function reloadAll() {
        const { data } = await api.get<Address[]>("/addresses/my");
        setItems(data);
        await onMeRefresh();
    }

    async function removeAddress(id?: string) {
        if (!id) return;
        if (!confirm("Delete this address?")) return;
        setLoading(true);
        try {
            await api.delete(`/addresses/${id}`);
            await reloadAll();
        } finally {
            setLoading(false);
        }
    }

    async function makeDefault(id?: string) {
        if (!id) return;
        setLoading(true);
        try {
            await api.post(`/addresses/${id}/make-default`, {});
            await reloadAll();
        } finally {
            setLoading(false);
        }
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
                        onClick={() => navigate(`/account/addresses/new?back=${back}`)}
                        aria-label="Add address"
                    >
                        <PlusIcon />
                    </Button>
                </div>

                {loading && <div className={styles.loadingWrap}>Loading…</div>}

                {!loading && (
                    <div className={styles.listGrid}>
                        {items.length === 0 && <div className={styles.muted}>No addresses yet.</div>}

                        {items.map((a) => (
                            <article key={a.id} className={styles.addrCard}>
                                <div className={styles.addrHeader}>
                                    <strong className={styles.addrLabel}>
                                        {a.firstName} {a.lastName}
                                        {a.company ? ` · ${a.company}` : ""}
                                        {a.isDefault && <span className={styles.badge}>Default</span>}
                                    </strong>
                                    <div className={styles.addrActions}>
                                        <CloseIcon onClick={() => removeAddress(a.id)} />
                                    </div>
                                </div>

                                <div className={styles.addrBody}>
                                    <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
                                    <div>
                                        {a.city}
                                        {a.region ? `, ${a.region}` : ""}, {a.postalCode}
                                    </div>
                                    <div>{fmtCountry(a.country)}</div>
                                    {(a.phone || a.email) && (
                                        <>
                                            <div className={styles.muted}>
                                                {a.phone ? `${a.phone}` : ""}
                                            </div>
                                            <div className={styles.muted}>
                                                {a.email ? `${a.email}` : ""}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!a.isDefault && (
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => makeDefault(a.id)}
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
                )}
            </div>
        </div>
    );
}

function OrdersSection() {
    const navigate = useNavigate();
    const back = encodeURIComponent("/account?tab=orders");

    type OrderPreviewItem = {
        sku: string;
        name: string;
        qty: number;
        priceCents: number;
        imageUrl?: string;
    };

    type OrderListItem = {
        id: string;
        number: string;
        createdAt: string;
        status: string;
        currency: string;
        totalCents: number;
        shippingCents: number;
        itemsCount: number;
        itemsPreview: OrderPreviewItem[];
    };

    const [items, setItems] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<OrderListItem[]>("/orders/my?limit=50");
                if (mounted) setItems(data);
            } catch (e: any) {
                if (mounted) setError(e?.response?.data?.detail || "Failed to load orders");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const fmtMoney = (cents: number, cur = "EUR") =>
        new Intl.NumberFormat("de-DE", { style: "currency", currency: cur }).format((cents || 0) / 100);

    const fmtDate = (iso?: string) => {
        if (!iso) return "";
        const d = new Date(iso);
        return new Intl.DateTimeFormat("de-DE", {
            year: "numeric", month: "2-digit", day: "2-digit"
        }).format(d);
    };

    const statusBadgeClass = (st: string) => {
        // мапа под ваши стили: st_awaiting_payment, st_paid, st_shipped, st_delivered, st_exception...
        const key = `st_${(st || "").toLowerCase()}`;
        return `${styles.badge} ${styles[key] || ""}`;
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.titlePage}>Orders</h2>
                <a href="account/returns">Returns</a>
            </div>

            {loading && <div className={styles.loadingWrap}>Loading…</div>}
            {error && <div className={styles.formError} role="alert">{error}</div>}

            {!loading && !error && (
                <div className={styles.ordersList}>
                    {items.length === 0 && (
                        <div className={styles.muted}>You don't have any orders yet.</div>
                    )}

                    {items.map((o) => {
                        const titles = o.itemsPreview.map(it => it.name).slice(0, 3);
                        const more = Math.max(0, o.itemsCount - o.itemsPreview.length);
                        const skuCount = o.itemsPreview.length; // быстрая метрика для превью

                        return (
                            <article key={o.id} className={styles.orderCard}>
                                <div className={styles.orderHead}>
                                    <div className={styles.orderId}>
                                        <div className={styles.orderNumber}>{o.number}</div>
                                        <div className={styles.orderDate}>{fmtDate(o.createdAt)}</div>
                                    </div>
                                    <span className={statusBadgeClass(o.status)}>{o.status}</span>
                                </div>

                                <div className={styles.orderBody}>
                                    <div className={styles.orderThumbs}>
                                        {o.itemsPreview.map((it, idx) =>
                                            it.imageUrl ? (
                                                <img
                                                    key={`${it.sku}-${idx}`}
                                                    src={it.imageUrl}
                                                    alt={it.name}
                                                    className={styles.orderThumb}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div
                                                    key={`${it.sku}-${idx}`}
                                                    className={styles.orderThumb}
                                                    title={it.name}
                                                >
                                                    {it.name?.[0]?.toUpperCase() || "•"}
                                                </div>
                                            )
                                        )}
                                        {more > 0 && (
                                            <div className={styles.orderThumb + " " + styles.orderMore}>+{more}</div>
                                        )}
                                    </div>

                                    <div className={styles.orderMeta}>
                                        <div className={styles.orderTitles}>
                                            {titles.join(" • ")}{o.itemsCount > titles.length ? " …" : ""}
                                        </div>
                                        <div className={styles.muted}>
                                            {o.itemsCount} item{o.itemsCount !== 1 ? "s" : ""} • {skuCount} SKU
                                            {o.shippingCents > 0 ? ` • Shipping ${fmtMoney(o.shippingCents, o.currency)}` : " • Free shipping"}
                                        </div>
                                    </div>

                                    <div className={styles.orderTotal}>
                                        {fmtMoney(o.totalCents, o.currency)}
                                    </div>
                                </div>

                                <div className={styles.orderActions}>
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
                </div>
            )}
        </div>
    );
}


/** ================== Settings (nav list) ================== */
function SettingsSection({ me }: { me: Me }) {
    const navigate = useNavigate();
    const back = encodeURIComponent("/account?tab=settings");

    const { logout } = useAuth();

    async function onLogout() {
        try { await logout(); } finally { navigate("/auth", { replace: true }); }
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.titlePage}>Settings</h2>
                <p className={styles.muted}>Security, notifications, language, etc.</p>
            </div>

            <div className={styles.list}>
                <div
                    className={styles.listItem}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/account/settings/change-password?back=${back}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/account/settings/change-password?back=${back}`)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 12,
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 8,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 600 }}>Change password</div>
                        <div className={styles.muted}>Reset via email link or apply token</div>
                    </div>
                    <span aria-hidden>›</span>
                </div>

                {!me.isEmailVerified && (
                    <div
                        className={styles.listItem}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/account/settings/verify-email?back=${back}`)}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/account/settings/verify-email?back=${back}`)}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 12,
                            border: "1px solid var(--border, #e5e7eb)",
                            borderRadius: 8,
                            cursor: "pointer",
                            marginBottom: 8,
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600 }}>Verify email</div>
                            <div className={styles.muted}>Confirm your address to secure your account</div>
                        </div>
                        <span aria-hidden>›</span>
                    </div>
                )}
            </div>

            <div className={styles.formActions}>
                <Button
                    size="small"
                    variant="primary"
                    onClick={() => onLogout()}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}
