// src/pages/Account/SecurityPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import c from "./SecurityPage.module.scss";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import Right from "../../../components/Icons/ChevronRightIcon";

type Me = {
  id: string;
  isEmailVerified?: boolean;
};

export default function SecurityPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("back") || "/account";

  const { user, loading: authLoading } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      nav("/auth", { replace: true });
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
  }, [authLoading, user, nav]);

  const back = encodeURIComponent("/account/security");

  if (authLoading || loading) {
    return (
      <Page>
        <PageLayout title="Security" onBack={() => nav(backTo)}>
          <div className={c.loading}>Loading…</div>
        </PageLayout>
      </Page>
    );
  }

  if (!me) {
    return (
      <Page>
        <PageLayout title="Security" onBack={() => nav(backTo)}>
          <div className={c.form___error}>Failed to load account info.</div>
        </PageLayout>
      </Page>
    );
  }

  return (
    <Page>
      <PageLayout title="Security" onBack={() => nav(backTo)}>
        <ul className={c.list}>
          <li
            className={c.list__item}
            onClick={() =>
              nav(`/account/settings/change-password?back=${back}`)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              nav(`/account/settings/change-password?back=${back}`)
            }
          >
            <span className={c["list__item--label"]} aria-label={``} title="">
              Change password
            </span>
            <Right className={c["list__item--icon-right"]} />
          </li>
          {!me.isEmailVerified && (
            <li
              className={c.list__item}
              onClick={() =>
                nav(`/account/settings/verify-email?back=${back}`)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                nav(`/account/settings/verify-email?back=${back}`)
              }
            >
              <span className={c["list__item--label"]} aria-label={``} title="">
                Verify email
              </span>
              <Right className={c["list__item--icon-right"]} />
            </li>
          )}
        </ul>
      </PageLayout>
    </Page>
  );
}
