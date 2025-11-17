// src/pages/Profile/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "../../components/UI/Page/Page";
import Wrapper from "../../components/User/Wrapper";
import Button from "../../components/UI/Button";
import { Tabs, type TabItem } from "../../components/UI/Tabs";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

import styles from "../Account/AccountPage.module.scss";
import Videos from "../../components/User/Tabs/Videos";

const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin;
const abs = (u?: string | null) =>
    !u ? "" : (u.startsWith("http") ? u : `${API_ORIGIN}${u}`);

type TabKey = "videos";

const tabs: TabItem<TabKey>[] = [
    { key: "videos", label: "Videos" },
];

type Profile = {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    isMe: boolean;
};

const normalizeTab = (tabParam?: string): TabKey => {
    switch (tabParam) {
        case "videos":
        default:
            return "videos";
    }
};

export default function ProfilePage() {
    const { username: usernameParam, tab } = useParams<{
        username: string;
        tab?: string;
    }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const username = (usernameParam || "").toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState<TabKey>(normalizeTab(tab));

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
                const { data } = await api.get(`/profiles/${encodeURIComponent(username)}`);
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
        if (!profile) return "User";
        const f = (profile.firstName || "").trim();
        const l = (profile.lastName || "").trim();
        const full = `${f} ${l}`.trim();
        return full || profile.username || "User";
    }, [profile]);

    const displayUsername = profile?.username || undefined;

    const backAfter = encodeURIComponent(`/u/${displayUsername ?? username}/videos`);

    if (loading || !profile) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>Loading…</div>
            </main>
        );
    }

    const avatarUrl =
        abs(profile.avatarUrl) +
        `?t=${encodeURIComponent(profile.id + "-" + (profile.avatarUrl || ""))}`;

    const handleTabChange = (key: TabKey) => {
        setActive(key);
        // меняем URL под таб
        navigate(`/u/${username}/${key}`, { replace: false });
    };

    return (
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
                                Edit profile
                            </Button>
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() =>
                                    navigate(`/account/settings?back=${backAfter}`)
                                }
                            >
                                Settings
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
                        ariaLabel="Profile sections"
                    />

                    {active === "videos" && (
                        <Videos username={profile.username || username} />
                    )}
                </section>
            </div>
        </Page>
    );
}
