// src/pages/Account/AccountPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import Button from "../../components/UI/Button";
import { Tabs, type TabItem } from "../../components/UI/Tabs";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import MyVideos from "./MyVideos";
import Page from "../../components/UI/Page/Page";
import Wrapper from "../../components/User/Wrapper";

const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin;
const abs = (u?: string | null) =>
  !u ? "" : (u.startsWith("http") ? u : `${API_ORIGIN}${u}`);

/* ================= types ================= */
type TabKey = "videos";

const tabs: TabItem<TabKey>[] = [
  { key: "videos", label: "Videos" },
];

type Me = {
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
};

/* ================= page ================= */
export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [me, setMe] = useState<Me | null>((user ?? null) as Me | null);
  const [active, setActive] = useState<TabKey>("videos");

  // ждём окончания инициализации auth, прежде чем дёргать /auth/me
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
    return () => {
      mounted = false;
    };
  }, [authLoading, navigate]);

  const displayName = (() => {
    const f = me?.firstName?.trim() || "";
    const l = me?.lastName?.trim() || "";
    const full = `${f} ${l}`.trim();
    return full || me?.username || me?.email || "User";
  })();

  const displayUsername = (() => {
    if (me?.username || null) return me?.username;
  })();

  const verified = !!me?.isEmailVerified;
  // теперь просто ведём назад в /account после действий (edit / verify)
  const backAfter = encodeURIComponent("/account");

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
      <Page>
        <Wrapper
          photoUrl={
            abs(me.avatarUrl) +
            `?t=${encodeURIComponent(me.updatedAt || String(Date.now()))}`
          }
          fullname={displayName}
          username={displayUsername}
        />

        <div className={styles.layout}>
          <section className={styles.content}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.titlePage}>Email verification required</h2>
                <p className={styles.muted}>
                  We sent you a link. You can resend it or open the verification
                  screen.
                </p>
              </div>

              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() =>
                    navigate(
                      `/account/settings/verify-email?back=${backAfter}`,
                    )
                  }
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
      </Page>
    );
  }

  return (
    <Page padding={false}>
      <Wrapper
        photoUrl={
          abs(me.avatarUrl) +
          `?t=${encodeURIComponent(me.updatedAt || String(Date.now()))}`
        }
        fullname={displayName}
        username={displayUsername}
        action={
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              navigate(`/account/profile/edit?back=${backAfter}`)
            }
          >
            Edit profile
          </Button>
        }
      />

      <div className={styles.layout}>
        <section className={styles.content}>
          <Tabs<TabKey>
            items={tabs}
            activeKey={active}
            onChange={setActive}
            ariaLabel="Account sections"
          />

          {active === "videos" && <MyVideos />}
        </section>
      </div>
    </Page>
  );
}
