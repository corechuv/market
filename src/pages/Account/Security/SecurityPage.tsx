// src/pages/Account/SecurityPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../AccountPage.module.scss";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";

type Me = {
  id: string;
  isEmailVerified?: boolean;
};

export default function SecurityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("back") || "/account";

  const { user, loading: authLoading } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/auth/me");
        if (mounted) setMe(data as Me);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, navigate]);

  const back = encodeURIComponent("/account/security");

  if (authLoading || loading) {
    return (
      <Page>
        <PageLayout title="Security" onBack={() => navigate(backTo)}>
          <div className={styles.loadingWrap}>Loading…</div>
        </PageLayout>
      </Page>
    );
  }

  if (!me) {
    return (
      <Page>
        <PageLayout title="Security" onBack={() => navigate(backTo)}>
          <div className={styles.formError}>Failed to load account info.</div>
        </PageLayout>
      </Page>
    );
  }

  return (
    <Page>
      <PageLayout title="Security" onBack={() => navigate(backTo)}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.titlePage}>Security</h2>
            <p className={styles.muted}>
              Security, password, email verification.
            </p>
          </div>

          <div className={styles.list}>
            {/* Change password */}
            <div
              className={styles.listItem}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(`/account/settings/change-password?back=${back}`)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                navigate(`/account/settings/change-password?back=${back}`)
              }
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
                <div className={styles.muted}>
                  Reset via email link or apply token
                </div>
              </div>
              <span aria-hidden>›</span>
            </div>

            {/* Verify email — только если не верифицирован */}
            {!me.isEmailVerified && (
              <div
                className={styles.listItem}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/account/settings/verify-email?back=${back}`)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`/account/settings/verify-email?back=${back}`)
                }
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
                  <div className={styles.muted}>
                    Confirm your address to secure your account
                  </div>
                </div>
                <span aria-hidden>›</span>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </Page>
  );
}
