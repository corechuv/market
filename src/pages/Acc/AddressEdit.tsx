// src/pages/Account/AddressEdit.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import PageLayout from "../../components/layouts/PageLayout";

import { useAccount } from "../../context/AccountContext";


import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { SelectField } from "../../components/UI/SelectField";

import type { Address } from "../../types/address";
import { uid } from "../../data/account";
import { DE_STATES, EU_COUNTRIES_RU } from "../../data/helpers/region";

// Валидаторы
import { required, validatePhone, validateForm, type FieldErrors, } from "../../utils/validate/fields";


/** ====== helpers ====== */
const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());
const postalVal = (country: string, v?: string) => {
    if (!v) return "Обязательное поле";
    if (isGermany(country)) return /^\d{5}$/.test(v) ? null : "PLZ: 5 цифр";
    return null;
};

export default function AddressEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // "new" | {uuid}
    const location = useLocation();
    const backTo = useMemo(() => {
        // куда возвращаться после сохранения/отмены
        // по умолчанию — на список адресов
        const sp = new URLSearchParams(location.search);
        return sp.get("back") || "/account?tab=addresses";
    }, [location.search]);

    const { account, setAccount } = useAccount();

    // существующий адрес (если редактируем), иначе — заготовка нового
    const existing = account.addresses.find((a) => a.id === id);
    const isNew = id === "new" || !existing;

    const [form, setForm] = useState<Address>(
        existing ?? {
            id: uid(),
            label: "New address",
            firstName: "",
            lastName: "",
            line1: "",
            city: "",
            postalCode: "",
            country: "Germany",
            isDefault: account.addresses.length === 0,
        }
    );

    // валидация
    const [errs, setErrs] = useState<Record<string, string | null>>({});
    function validate(): boolean {
        const rules = {
            fullName: required("Обязательное поле"),
            line1: required("Обязательное поле"),
            city: required("Обязательное поле"),
            postalCode: (v?: string, all?: Address) => postalVal(all?.country || "", v),
            country: required("Обязательное поле"),
            phone: validatePhone,
        } as const;
        const e = validateForm(form, rules) as FieldErrors<Address>;
        setErrs(e as Record<string, string | null>);
        return Object.keys(e).length === 0;
    }

    function upsertAddress(next: Address) {
        setAccount((prev) => {
            let addrs = [...prev.addresses];
            const idx = addrs.findIndex((a) => a.id === next.id);

            // если делаем адрес «по умолчанию», снимаем флаг с остальных
            if (next.isDefault) {
                addrs = addrs.map((a) => ({ ...a, isDefault: a.id === next.id }));
            }

            if (idx >= 0) {
                addrs[idx] = next;
            } else {
                addrs.unshift(next);
            }
            return { ...prev, addresses: addrs };
        });
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        upsertAddress(form);
        navigate(backTo, { replace: true });
    }

    return (
        <PageLayout title={isNew ? "New address" : "Edit address"} onBack={() => navigate(backTo)}>
            <div className={styles.card}>
                <form className={styles.form} onSubmit={onSubmit}>
                    <div className={styles.grid2}>
                        <TextField
                            label="Метка *"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                        />

                        <TextField
                            label="Имя *"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            error={errs.firstName || undefined}
                        />

                        <TextField
                            label="Фамилия *"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            error={errs.lastName || undefined}
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
                                <span>Make it the default address</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <Button type="submit" variant="primary" size="small">
                            Save
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
            </div>
        </PageLayout>
    );
}
