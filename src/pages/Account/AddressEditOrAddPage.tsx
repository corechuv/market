// src/pages/Account/AddressEditOrAddPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import PageLayout from "../../components/layouts/PageLayout";

import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { SelectField } from "../../components/UI/SelectField";

import api from "../../lib/api";

// валидаторы
import {
    required,
    validatePhone,
    validateEmail,
    validateForm,
    type FieldErrors,
    type Validator,
} from "../../utils/validate/fields";
import { EUROPE_COUNTRIES } from "../../utils/country";

/** ================= helpers / data ================= */

const DE_STATES = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg",
    "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen",
    "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein",
    "Thüringen",
];

const isGermany = (code?: string) => (code || "").toUpperCase() === "DE";

// optional-обёртка, чтобы опциональные поля валидировались корректно
const optional = <T extends string | null | undefined>(
    fn: Validator<string>
): Validator<T> =>
    (((val: T, all?: any) => {
        const s = (val ?? "").toString().trim();
        if (!s) return null; // ВАЖНО: null, не undefined
        return fn(s as string, all);
    }) as unknown) as Validator<T>;

const validateCountryAlpha2: Validator<string> = (v) => {
    const s = (v || "").trim().toUpperCase();
    if (!s) return "Required";
    if (!/^[A-Z]{2}$/.test(s)) return "Use ISO-2 code, e.g. DE";
    if (!EUROPE_COUNTRIES.some((c) => c.code === s)) return "Select a European country";
    return null;
};

// Постал-код с учётом DE
const validatePostal: Validator<string> = (v, all?: AddressFormState) => {
    const s = (v || "").trim();
    if (!s) return "Required";
    if (isGermany(all?.country) && !/^\d{5}$/.test(s)) return "PLZ must be 5 digits";
    return null;
};

const countryOptions = EUROPE_COUNTRIES.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
}));

/** ================= types ================= */

type AddressFormState = {
    id?: string;
    firstName: string;
    lastName: string;
    company?: string;
    country: string; // ISO-2
    postalCode: string;
    region?: string;
    city: string;
    line1: string;
    line2?: string;
    phone?: string;
    email?: string;
    isDefault: boolean;
};

type AddressOut = {
    id: string;
    firstName: string;
    lastName: string;
    company?: string | null;
    country: string;
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

/** ================= component ================= */
export default function AddressEditOrAddPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // "new" | {uuid}
    const location = useLocation();

    // back target (?back=... or default)
    const backTo = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return sp.get("back") || "/account?tab=addresses";
    }, [location.search]);

    const isNew = !id || id === "new";

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [form, setForm] = useState<AddressFormState>({
        firstName: "",
        lastName: "",
        company: "",
        country: "DE",
        postalCode: "",
        region: "",
        city: "",
        line1: "",
        line2: "",
        phone: "",
        email: "",
        isDefault: false,
    });

    const [errs, setErrs] = useState<Record<string, string>>({});

    // загрузка данных: если редактируем — тянем адрес; если new — подтягиваем /auth/me для префилла
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                if (!isNew && id) {
                    const { data } = await api.get<AddressOut>(`/addresses/${id}`);
                    if (!mounted) return;
                    setForm({
                        id: data.id,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        company: data.company || "",
                        country: (data.country || "").toUpperCase(),
                        postalCode: data.postalCode,
                        region: data.region || "",
                        city: data.city,
                        line1: data.line1,
                        line2: data.line2 || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        isDefault: !!data.isDefault,
                    });
                } else {
                    // префилл из профиля
                    const me = await api.get<any>("/auth/me").then((r) => r.data);
                    if (!mounted) return;
                    setForm((s) => ({
                        ...s,
                        firstName: me?.firstName ?? "",
                        lastName: me?.lastName ?? "",
                        phone: me?.phone ?? "",
                        email: me?.email ?? "",
                        isDefault: (me?.addresses?.length ?? 0) === 0, // если адресов нет — делаем дефолтным
                    }));
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id, isNew]);

    // валидация
    function validate(): boolean {
        const rules = {
            firstName: required("Required"),
            lastName: required("Required"),
            country: validateCountryAlpha2, // ISO-2
            postalCode: validatePostal,
            city: required("Required"),
            line1: required("Required"),
            phone: optional(validatePhone),
            email: optional(validateEmail),
        } as const;

        const e = validateForm(form, rules) as FieldErrors<AddressFormState>;
        setErrs(e as Record<string, string>);
        return Object.keys(e).length === 0;
    }

    // submit
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        setErrs({});

        // готовим payload к бэку
        const payload = {
            firstName: form.firstName,
            lastName: form.lastName,
            company: form.company || null,
            country: (form.country || "").toUpperCase().slice(0, 2),
            postalCode: form.postalCode,
            region: form.region || null,
            city: form.city,
            line1: form.line1,
            line2: form.line2 || null,
            phone: form.phone || null,
            email: form.email || null,
            isDefault: !!form.isDefault,
        };

        try {
            if (isNew) {
                // важен слэш в конце — иначе 307
                await api.post("/addresses/", payload);
            } else if (form.id) {
                await api.put(`/addresses/${form.id}`, payload);
            }
            navigate(backTo, { replace: true });
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Failed to save address";
            setErrs({ _form: String(detail) });
        } finally {
            setSaving(false);
        }
    }

    return (
        <PageLayout title={isNew ? "New address" : "Edit address"} onBack={() => navigate(backTo)}>
            <div className={styles.card}>
                {loading ? (
                    <div className={styles.loadingWrap}>Loading…</div>
                ) : (
                    <form className={styles.form} onSubmit={onSubmit} noValidate>
                        <div className={styles.grid2}>
                            <TextField
                                label="First name *"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                error={errs.firstName}
                                name="firstName"
                                autoComplete="given-name"
                            />

                            <TextField
                                label="Last name *"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                error={errs.lastName}
                                name="lastName"
                                autoComplete="family-name"
                            />

                            <TextField
                                label="Company"
                                value={form.company || ""}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                name="organization"
                                autoComplete="organization"
                            />

                            {/* Country (Europe) */}
                            <SelectField
                                label="Country (Europe) *"
                                value={(form.country || "").toUpperCase()}
                                onChange={(v) => setForm({ ...form, country: (v || "").toUpperCase() })}
                                options={[{ value: "", label: "— select —" }, ...countryOptions]}
                                error={errs.country}
                            />

                            {/* Region */}
                            {isGermany(form.country) ? (
                                <SelectField
                                    label="Region / Bundesland"
                                    value={form.region || ""}
                                    onChange={(v) => setForm({ ...form, region: v })}
                                    options={[
                                        { value: "", label: "— select —" },
                                        ...DE_STATES.map((s) => ({ value: s, label: s })),
                                    ]}
                                />
                            ) : (
                                <TextField
                                    label="Region / State"
                                    value={form.region || ""}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    name="region"
                                    autoComplete="address-level1"
                                />
                            )}

                            <TextField
                                label="City *"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                error={errs.city}
                                name="city"
                                autoComplete="address-level2"
                            />

                            <TextField
                                label="Address line 1 *"
                                value={form.line1}
                                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                                error={errs.line1}
                                name="line1"
                                autoComplete="address-line1"
                            />

                            <TextField
                                label="Address line 2"
                                value={form.line2 || ""}
                                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                                name="line2"
                                autoComplete="address-line2"
                            />

                            <TextField
                                label="Postal code *"
                                value={form.postalCode}
                                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                                error={errs.postalCode}
                                name="postalCode"
                                autoComplete="postal-code"
                            />

                            <TextField
                                label="Phone"
                                value={form.phone || ""}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                error={errs.phone}
                                name="tel"
                                autoComplete="tel"
                            />

                            <TextField
                                label="Email"
                                type="email"
                                value={form.email || ""}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                error={errs.email}
                                name="email"
                                autoComplete="email"
                            />

                            <div className={styles.gridColSpan2}>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.isDefault}
                                        onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                                    />
                                    <span>Make it the default address</span>
                                </label>
                            </div>
                        </div>

                        {errs._form && (
                            <div className={styles.formError} role="alert">
                                {errs._form}
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <Button type="submit" variant="primary" size="small" disabled={saving}>
                                {saving ? "Saving…" : "Save"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() => navigate(backTo)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </PageLayout>
    );
}
