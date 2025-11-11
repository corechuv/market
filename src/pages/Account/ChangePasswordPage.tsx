// src/pages/Account/ChangePasswordPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import {
  required,
  validateForm,
  minLength,
  sameAs,
  type FieldErrors,
} from "../../utils/validate/fields";
import PageLayout from "../../components/layouts/PageLayout";
import Page from "../../components/UI/Page/Page";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const backTo = useMemo(
    () => new URLSearchParams(location.search).get("back") || "/account?tab=settings",
    [location.search]
  );

  const { user } = useAuth();
  const initialLogin = (user?.email || user?.username || "") as string;

  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === form (two modes)
  const [forgotForm, setForgotForm] = useState<{ emailOrUsername: string }>({
    emailOrUsername: initialLogin,
  });
  const [resetForm, setResetForm] = useState<{ newPassword: string; confirm: string }>({
    newPassword: "",
    confirm: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});

  function stripTokenFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    const clean = url.pathname + (url.search ? url.search : "");
    window.history.replaceState({}, "", clean);
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setErrs({});
    setErrorMsg(null);
    setDoneMsg(null);

    const rules = { emailOrUsername: required("Required") } as const;
    const v = validateForm(forgotForm, rules) as FieldErrors<typeof forgotForm>;
    setErrs(v as Record<string, string>);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      await api.post("/auth/password/forgot", {
        emailOrUsername: forgotForm.emailOrUsername.trim(),
      });
      setDoneMsg("Reset link sent. Check your inbox.");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to send reset link");
    } finally {
      setSending(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setErrs({});
    setErrorMsg(null);
    setDoneMsg(null);

    const rules = {
      newPassword: minLength(8, "Must be at least 8 characters"),
      confirm: sameAs<string>((all) => (all as any).newPassword, "Passwords don't match"),
    } as const;

    const v = validateForm(resetForm, rules) as FieldErrors<typeof resetForm>;
    setErrs(v as Record<string, string>);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      await api.post("/auth/password/reset", {
        token: token,
        newPassword: resetForm.newPassword,
      });
      // успех: очищаем токен из URL и уводим назад
      stripTokenFromUrl();
      navigate(backTo, { replace: true });
      return; // не показываем форму/сообщения дальше
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to change password");
    } finally {
      setSending(false);
    }
  }

  return (
    <Page>
      <PageLayout title="Change password" onBack={() => navigate(backTo)}>
        <section>
          <h3>
            {token
              ? "Enter a new password for your account"
              : "Send a reset link to your email/username"}
          </h3>
        </section>
        <section className={styles.content}>
          {/* ===== Messages ===== */}
          {doneMsg && <div className={styles.noticeSuccess} role="status">{doneMsg}</div>}
          {errorMsg && <div className={styles.formError} role="alert">{errorMsg}</div>}

          {/* ===== Forms ===== */}
          {!token ? (
            <form className={styles.form} onSubmit={submitForgot} noValidate>
              <div className={styles.grid2}>
                <TextField
                  label="Email or username *"
                  name="emailOrUsername"
                  value={forgotForm.emailOrUsername}
                  onChange={(e) => setForgotForm({ emailOrUsername: e.target.value })}
                  error={errs.emailOrUsername}
                  autoComplete="username"
                  disabled={sending}
                />
              </div>

              <div className={styles.formActions}>
                <Button type="submit" size="small" variant="primary" disabled={sending}>
                  {sending ? "Sending…" : "Send reset link"}
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(backTo)}
                  disabled={sending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form className={styles.form} onSubmit={submitReset} noValidate>
              <div className={styles.grid2}>
                <TextField
                  label="New password *"
                  type="password"
                  name="newPassword"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  error={errs.newPassword}
                  autoComplete="new-password"
                  disabled={sending}
                />
                <TextField
                  label="Confirm password *"
                  type="password"
                  name="confirm"
                  value={resetForm.confirm}
                  onChange={(e) => setResetForm({ ...resetForm, confirm: e.target.value })}
                  error={errs.confirm}
                  autoComplete="new-password"
                  disabled={sending}
                />
              </div>

              <div className={styles.formActions}>
                <Button type="submit" size="small" variant="primary" disabled={sending}>
                  {sending ? "Saving…" : "Change password"}
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={() => navigate(backTo)}
                  disabled={sending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>
      </PageLayout>
    </Page>
  );
}
