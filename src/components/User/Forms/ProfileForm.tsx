// src/components/User/Forms/ProfileForm.tsx
import React, { useEffect, useState } from "react";
import styles from "../../../pages/Account/AccountPage.module.scss";
import Button from "../../UI/Button";
import { TextField } from "../../UI/TextField";
import { AvatarField } from "../../UI/AvatarField";
import {
  required,
  validatePhone,
  validateEmail,
  validateForm,
  compose,
  type FieldErrors,
} from "../../../utils/validate/fields";

const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin;
const abs = (u?: string | null) => (!u ? "" : (u.startsWith("http") ? u : `${API_ORIGIN}${u}`));

export type Address = {
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

export type Me = {
  id: string;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  role?: string;
  addresses?: Address[];
};

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function ProfileForm({
  me,
  saving,
  onSave,
}: {
  me: Me;
  saving: boolean;
  onSave: (
    p: ProfileFormState,
    avatar?: { file?: File | null; removed?: boolean },
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<ProfileFormState>({
    firstName: me.firstName ?? "",
    lastName: me.lastName ?? "",
    email: me.email ?? "",
    phone: me.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [avatarDraft, setAvatarDraft] =
    useState<{ file?: File | null; removed?: boolean } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    me.avatarUrl ? abs(me.avatarUrl) + `?t=${encodeURIComponent(me.updatedAt || String(Date.now()))}` : "",
  );

  useEffect(() => {
    setAvatarPreview(
      me.avatarUrl ? abs(me.avatarUrl) + `?t=${encodeURIComponent(me.updatedAt || String(Date.now()))}` : "",
    );
  }, [me.avatarUrl, me.updatedAt]);

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
      await onSave(form, avatarDraft || undefined);
      setAvatarDraft(null);
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
          <AvatarField
            label="Avatar"
            value={avatarPreview}
            maxSizeMb={8}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={({ file, dataUrl }) => {
              if (dataUrl === null) {
                setAvatarDraft({ file: undefined, removed: true });
                setAvatarPreview("");
              } else if (file) {
                if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
                  alert("Unsupported image type. Please upload JPG, PNG, WEBP or GIF.");
                  return;
                }
                setAvatarDraft({ file, removed: false });
                setAvatarPreview(dataUrl || "");
              }
            }}
          />

          <div></div>

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

        {errors._form && (
          <div className={styles.formError} role="alert">
            {errors._form}
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
