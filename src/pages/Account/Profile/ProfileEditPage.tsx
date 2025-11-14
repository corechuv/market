// src/pages/Account/ProfileEditPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";
import ProfileForm, { type Me, type ProfileFormState } from "../../../components/User/Forms/ProfileForm";
import api from "../../../lib/api";

export default function ProfileEditPage() {
    const nav = useNavigate();
    const { search } = useLocation();
    const backTo = new URLSearchParams(search).get("back") ?? "/account?tab=settings";

    const [me, setMe] = useState<Me | null>(null);
    const [saving, setSaving] = useState(false);

    async function refreshMeAndCache() {
        const { data } = await api.get("/auth/me");
        setMe(data as Me);
        try {
            localStorage.setItem("mp_auth_user", JSON.stringify(data));
            sessionStorage.setItem("mp_auth_user", JSON.stringify(data));
        } catch { /* ignore */ }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get("/auth/me");
                if (mounted) setMe(data as Me);
            } catch {
                nav("/auth", { replace: true });
            }
        })();
        return () => { mounted = false; };
    }, [nav]);

    if (!me) {
        return (
            <Page>
                <main style={{ padding: 16 }}>Loading…</main>
            </Page>
        );
    }

    return (
        <Page>
            <PageLayout title="Edit profile" onBack={() => nav(backTo)}>
                <ProfileForm
                    me={me}
                    saving={saving}
                    onSave={async (patch: ProfileFormState, avatar) => {
                        setSaving(true);
                        try {
                            // 1) текстовые поля
                            await api.put(`/customers/${me.id}`, {
                                email: patch.email || null,
                                phone: patch.phone || null,
                                firstName: patch.firstName || null,
                                lastName: patch.lastName || null,
                            });

                            // 2) аватар
                            if (avatar?.removed) {
                                await api.delete("/customers/me/avatar");
                            } else if (avatar?.file) {
                                const fd = new FormData();
                                fd.append("file", avatar.file, avatar.file.name || "avatar.jpg");
                                await api.post("/customers/me/avatar", fd, {
                                    transformRequest: [
                                        (data, headers) => {
                                            if (headers) delete (headers as any)["Content-Type"];
                                            return data as any;
                                        },
                                    ],
                                });
                            }

                            // 3) обновить кэш
                            await refreshMeAndCache();

                            // опционально вернуться назад:
                            // nav(backTo);
                        } catch (e: any) {
                            const status = e?.response?.status;
                            const msg = e?.response?.data?.message || "Failed to save profile";
                            if (status === 409) throw { email: "Email already exists" };
                            throw { _form: msg };
                        } finally {
                            setSaving(false);
                        }
                    }}
                />
            </PageLayout>
        </Page>
    );
}
