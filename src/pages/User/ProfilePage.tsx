// src/pages/Profile/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Page from "../../components/UI/Page/Page";
import Wrapper from "../../components/User/Wrapper";
import Button from "../../components/UI/Button";
import { Tabs, type TabItem } from "../../components/UI/Tabs";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import styles from "../Account/AccountPage.module.scss";
import Videos from "../../components/User/Tabs/Videos";
import { buildAvatarSrc } from "../../utils/avatar";
import WrapperSkeleton from "../../components/User/Wrapper.Skeleton";
import type { Profile } from "../../types/user/profile";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../utils/useIsMobile";
import { openSettingsPanel } from "../../utils/navEvents";

type TabKey = "videos";

const normalizeTab = (tabParam?: string): TabKey => {
    switch (tabParam) {
        case "videos":
        default:
            return "videos";
    }
};

export default function ProfilePage() {
    const { t } = useTranslation("profile");
    const { username: usernameParam, tab } = useParams<{
        username: string;
        tab?: string;
    }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMobile = useIsMobile(768);

    const username = (usernameParam || "").toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState<TabKey>(normalizeTab(tab));

    // табы с локализацией
    const tabs: TabItem<TabKey>[] = useMemo(
        () => [
            { key: "videos", label: t("tabs.videos") }
        ],
        [t]
    );

    // синхронизируем активный таб с URL
    useEffect(() => {
        setActive(normalizeTab(tab));
    }, [tab]);

    // если /u/:username без таба → редиректим на /videos
    useEffect(() => {
        if (!tab && username) {
            navigate(`/u/${username}/videos`, { replace: true });
        }
    }, [tab, username, navigate]);

    // грузим профиль по username
    useEffect(() => {
        if (!username) return;
        let cancelled = false;

        (async () => {
            try {
                const { data } = await api.get(
                    `/profiles/${encodeURIComponent(username)}`
                );
                if (!cancelled) {
                    setProfile(data as Profile);
                }
            } catch {
                if (!cancelled) {
                    navigate("/404", { replace: true });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [username, navigate]);

    const isMe = useMemo(() => {
        if (!profile) return false;
        // бэкенд уже прислал isMe, но продублируем на всякий случай
        if (profile.isMe) return true;
        if (user && (user as any).id && (user as any).id === profile.id) return true;
        if (user && (user as any).username && (user as any).username === profile.username)
            return true;
        return false;
    }, [profile, user]);

    const displayName = useMemo(() => {
        if (!profile) return t("fallback.user");
        const f = (profile.firstName || "").trim();
        const l = (profile.lastName || "").trim();
        const full = `${f} ${l}`.trim();
        return full || profile.username || t("fallback.user");
    }, [profile, t]);

    const displayUsername = profile?.username || undefined;

    const backAfter = encodeURIComponent(
        `/u/${displayUsername ?? username}/videos`
    );

    if (loading || !profile) {
        return (
            <Page padding={false}>
                <WrapperSkeleton />
            </Page>
        );
    }

    const avatarUrl = buildAvatarSrc(
        profile.avatarUrl,
        `${profile.id}-${profile.avatarUrl || ""}`
    );

    // ник для SEO – берём каноничный из профиля, если есть
    const handle = profile.username || username;

    const canonicalUrl = `https://dashedo.com/u/${encodeURIComponent(
        handle
    )}/videos`;

    const seoTitle = isMe
        ? t("seo.me.title", {
            username: handle,
            name: displayName,
        })
        : t("seo.user.title", {
            username: handle,
            name: displayName,
        });

    const seoDescription = isMe
        ? t("seo.me.description", {
            username: handle,
            name: displayName,
        })
        : t("seo.user.description", {
            username: handle,
            name: displayName,
        });


    const handleTabChange = (key: TabKey) => {
        setActive(key);
        // меняем URL под таб
        navigate(`/u/${username}/${key}`, { replace: false });
    };

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                {/* Open Graph */}
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                {avatarUrl && (
                    <meta property="og:image" content={avatarUrl} />
                )}
                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {avatarUrl && (
                    <meta name="twitter:image" content={avatarUrl} />
                )}
                {/* Доп. мета для профилей */}
                <meta name="profile:username" content={handle} />
            </Helmet>
            <Page padding={false}>
                <Wrapper
                    photoUrl={avatarUrl}
                    fullname={displayName}
                    username={displayUsername}
                    action={
                        isMe && (
                            <>
                                <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={() =>
                                        navigate(`/account/profile/edit?back=${backAfter}`)
                                    }
                                >
                                    {t("buttons.editProfile")}
                                </Button>
                                <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={() =>
                                        isMobile
                                            ? navigate(`/account/settings?back=${backAfter}`)
                                            : openSettingsPanel()
                                    }
                                >
                                    {t("buttons.settings")}
                                </Button>
                            </>
                        )
                    }
                />

                <div className={styles.layout}>
                    <section className={styles.content}>
                        <Tabs<TabKey>
                            items={tabs}
                            activeKey={active}
                            onChange={handleTabChange}
                            ariaLabel={t("tabs.ariaLabel")}
                        />

                        {active === "videos" && (
                            <Videos username={profile.username || username} />
                        )}
                    </section>
                </div>
            </Page>
        </>
    );
}
