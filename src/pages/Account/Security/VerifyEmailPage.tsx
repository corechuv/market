// src/pages/Account/VerifyEmailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styles from "../AccountPage.module.scss";
import Button from "../../../components/UI/Button";
import api from "../../../lib/api";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sp] = useSearchParams();
    const token = sp.get("token") || "";
    const backTo = useMemo(
        () => new URLSearchParams(location.search).get("back") || "/account?tab=settings",
        [location.search]
    );

    const [verifying, setVerifying] = useState<boolean>(!!token);
    const [doneMsg, setDoneMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [authed, setAuthed] = useState<boolean | null>(null);

    function stripTokenFromUrl() {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        const clean = url.pathname + (url.search ? url.search : "");
        window.history.replaceState({}, "", clean);
    }

    // Если токена нет и почта уже верифицирована — сразу назад
    useEffect(() => {
        if (token) return;
        (async () => {
            try {
                const { data } = await api.get("/auth/me");
                if (data?.isEmailVerified) {
                    navigate(backTo, { replace: true });
                } else {
                    setAuthed(true); // пользователь есть, но еще не верифицирован
                }
            } catch {
                setAuthed(false); // не авторизован
            }
        })();
    }, [token, backTo, navigate]);

    // Автоподтверждение, если есть токен
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                setVerifying(true);
                await api.post("/auth/email/verify", { token });
                stripTokenFromUrl();

                // Попробуем обновить профиль; если 401 — просто считаем, что не авторизован
                try {
                    const { data } = await api.get("/auth/me");
                    setAuthed(true);
                    try {
                        localStorage.setItem("mp_auth_user", JSON.stringify(data));
                        sessionStorage.setItem("mp_auth_user", JSON.stringify(data));
                    } catch { /* ignore */ }
                } catch {
                    setAuthed(false);
                }

                setDoneMsg("Email verified successfully.");
            } catch (e: any) {
                setErrorMsg(e?.response?.data?.message || "Verification failed");
            } finally {
                setVerifying(false);
            }
        })();
    }, [token]);

    async function resend() {
        setErrorMsg(null);
        setDoneMsg(null);
        try {
            await api.post("/auth/email/request-verify", {});
            setDoneMsg("Verification email sent. Check your inbox.");
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || "Failed to send verification email");
        }
    }

    return (
        <Page>
            <PageLayout title="Verify email" onBack={() => navigate(backTo)}>
                <div>
                    <section>
                        <h3>{token ? "Email verification" : "Request verification link"}</h3>
                    </section>
                    <section className={styles.content}>
                        <div className={styles.card}>
                            {doneMsg && <div className={styles.noticeSuccess} role="status">{doneMsg}</div>}
                            {errorMsg && <div className={styles.formError} role="alert">{errorMsg}</div>}

                            {!token && (
                                <div className={styles.formActions}>
                                    <Button variant="primary" size="small" onClick={resend}>
                                        Send verification link
                                    </Button>
                                    <Button variant="secondary" size="small" onClick={() => navigate(backTo)}>
                                        Back
                                    </Button>
                                </div>
                            )}

                            {token && (
                                <div className={styles.formActions} style={{ gap: 8 }}>
                                    {authed === false && (
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => navigate("/auth")}
                                            disabled={verifying}
                                        >
                                            Go to login
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => navigate(backTo)}
                                        disabled={verifying}
                                    >
                                        {verifying ? "Verifying…" : "Back to settings"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </PageLayout>
        </Page>
    );
}
