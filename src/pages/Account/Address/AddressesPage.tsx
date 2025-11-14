import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../AccountPage.module.scss";
import Button from "../../../components/UI/Button";
import PlusIcon from "../../../components/Icons/PlusIcon";
import CloseIcon from "../../../components/Icons/CloseIcon";
import { EUROPE_COUNTRIES } from "../../../utils/country";
import api from "../../../lib/api";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";

type Address = {
    id: string;
    firstName: string;
    lastName: string;
    company?: string | null;
    country: string; // ISO-2
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

const fmtCountry = (code: string) => {
    const c = EUROPE_COUNTRIES.find(
        (x) => x.code === (code || "").toUpperCase(),
    );
    return c ? `${c.name} (${c.code})` : code || "";
};

export default function AddressesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const backTo = searchParams.get("back") || "/account";

    const [items, setItems] = useState<Address[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // первичная загрузка / синхронизация
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get<Address[]>("/addresses/my");
                if (mounted) setItems(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const back = encodeURIComponent("/account/addresses");

    async function reloadAll() {
        const { data } = await api.get<Address[]>("/addresses/my");
        setItems(data);
        // обновим me в local/session storage, как раньше
        try {
            const meResp = await api.get("/auth/me");
            localStorage.setItem("mp_auth_user", JSON.stringify(meResp.data));
            sessionStorage.setItem("mp_auth_user", JSON.stringify(meResp.data));
        } catch {
            /* ignore */
        }
    }

    async function removeAddress(id?: string) {
        if (!id) return;
        if (!confirm("Delete this address?")) return;
        setLoading(true);
        try {
            await api.delete(`/addresses/${id}`);
            await reloadAll();
        } finally {
            setLoading(false);
        }
    }

    async function makeDefault(id?: string) {
        if (!id) return;
        setLoading(true);
        try {
            await api.post(`/addresses/${id}/make-default`, {});
            await reloadAll();
        } finally {
            setLoading(false);
        }
    }

    return (
        <Page>
            <PageLayout title="Addresses" onBack={() => navigate(backTo)}>
                <div className={styles.stackLg}>

                    <div className={styles.toolbar}>
                        <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            className={styles.addBtn}
                            onClick={() =>
                                navigate(`/account/addresses/new?back=${back}`)
                            }
                            aria-label="Add address"
                        >
                            <PlusIcon />
                        </Button>
                    </div>

                    {loading && <div className={styles.loadingWrap}>Loading…</div>}

                    {!loading && (
                        <div className={styles.listGrid}>
                            {items.length === 0 && (
                                <div className={styles.muted}>No addresses yet.</div>
                            )}

                            {items.map((a) => (
                                <article key={a.id} className={styles.addrCard}>
                                    <div className={styles.addrHeader}>
                                        <strong className={styles.addrLabel}>
                                            {a.firstName} {a.lastName}
                                            {a.company ? ` · ${a.company}` : ""}
                                            {a.isDefault && (
                                                <span className={styles.badge}>Default</span>
                                            )}
                                        </strong>
                                        <div className={styles.addrActions}>
                                            <CloseIcon onClick={() => removeAddress(a.id)} />
                                        </div>
                                    </div>

                                    <div className={styles.addrBody}>
                                        <div>
                                            {a.line1}
                                            {a.line2 ? `, ${a.line2}` : ""}
                                        </div>
                                        <div>
                                            {a.city}
                                            {a.region ? `, ${a.region}` : ""}, {a.postalCode}
                                        </div>
                                        <div>{fmtCountry(a.country)}</div>
                                        {(a.phone || a.email) && (
                                            <>
                                                <div className={styles.muted}>
                                                    {a.phone ? `${a.phone}` : ""}
                                                </div>
                                                <div className={styles.muted}>
                                                    {a.email ? `${a.email}` : ""}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {!a.isDefault && (
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => makeDefault(a.id)}
                                        >
                                            Make default
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() =>
                                            navigate(`/account/addresses/${a.id}?back=${back}`)
                                        }
                                    >
                                        Edit
                                    </Button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </PageLayout>
        </Page>
    );
}
