import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../AccountPage.module.scss";
import Button from "../../../components/UI/Button";
import api from "../../../lib/api";
import PageLayout from "../../../components/layouts/PageLayout";
import Page from "../../../components/UI/Page/Page";

type OrderPreviewItem = {
    sku: string;
    name: string;
    qty: number;
    priceCents: number;
    imageUrl?: string;
};

type OrderListItem = {
    id: string;
    number: string;
    createdAt: string;
    status: string;
    currency: string;
    totalCents: number;
    shippingCents: number;
    itemsCount: number;
    itemsPreview: OrderPreviewItem[];
};

export default function OrdersPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const backTo = searchParams.get("back") || "/account";

    const [items, setItems] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<OrderListItem[]>("/orders/my?limit=50");
                if (mounted) setItems(data);
            } catch (e: any) {
                if (mounted)
                    setError(e?.response?.data?.detail || "Failed to load orders");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const fmtMoney = (cents: number, cur = "EUR") =>
        new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: cur,
        }).format((cents || 0) / 100);

    const fmtDate = (iso?: string) => {
        if (!iso) return "";
        const d = new Date(iso);
        return new Intl.DateTimeFormat("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(d);
    };

    const statusBadgeClass = (st: string) => {
        // мапа под ваши стили: st_awaiting_payment, st_paid, st_shipped, st_delivered, st_exception...
        const key = `st_${(st || "").toLowerCase()}`;
        return `${styles.badge} ${styles[key] || ""}`;
    };

    const back = encodeURIComponent("/account/orders");

    return (
        <Page>
            <PageLayout title="Orders" onBack={() => navigate(backTo)}>

                <a href="/account/returns">Returns</a>

                {loading && <div className={styles.loadingWrap}>Loading…</div>}
                {error && (
                    <div className={styles.formError} role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className={styles.ordersList}>
                        {items.length === 0 && (
                            <div className={styles.muted}>
                                You don't have any orders yet.
                            </div>
                        )}

                        {items.map((o) => {
                            const titles = o.itemsPreview.map((it) => it.name).slice(0, 3);
                            const more = Math.max(0, o.itemsCount - o.itemsPreview.length);
                            const skuCount = o.itemsPreview.length;

                            return (
                                <article key={o.id} className={styles.orderCard}>
                                    <div className={styles.orderHead}>
                                        <div className={styles.orderId}>
                                            <div className={styles.orderNumber}>{o.number}</div>
                                            <div className={styles.orderDate}>
                                                {fmtDate(o.createdAt)}
                                            </div>
                                        </div>
                                        <span className={statusBadgeClass(o.status)}>
                                            {o.status}
                                        </span>
                                    </div>

                                    <div className={styles.orderBody}>
                                        <div className={styles.orderThumbs}>
                                            {o.itemsPreview.map((it, idx) =>
                                                it.imageUrl ? (
                                                    <img
                                                        key={`${it.sku}-${idx}`}
                                                        src={it.imageUrl}
                                                        alt={it.name}
                                                        className={styles.orderThumb}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        key={`${it.sku}-${idx}`}
                                                        className={styles.orderThumb}
                                                        title={it.name}
                                                    >
                                                        {it.name?.[0]?.toUpperCase() || "•"}
                                                    </div>
                                                ),
                                            )}
                                            {more > 0 && (
                                                <div
                                                    className={
                                                        styles.orderThumb + " " + styles.orderMore
                                                    }
                                                >
                                                    +{more}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.orderMeta}>
                                            <div className={styles.orderTitles}>
                                                {titles.join(" • ")}
                                                {o.itemsCount > titles.length ? " …" : ""}
                                            </div>
                                            <div className={styles.muted}>
                                                {o.itemsCount} item{o.itemsCount !== 1 ? "s" : ""} •{" "}
                                                {skuCount} SKU
                                                {o.shippingCents > 0
                                                    ? ` • Shipping ${fmtMoney(
                                                        o.shippingCents,
                                                        o.currency,
                                                    )}`
                                                    : " • Free shipping"}
                                            </div>
                                        </div>

                                        <div className={styles.orderTotal}>
                                            {fmtMoney(o.totalCents, o.currency)}
                                        </div>
                                    </div>

                                    <div className={styles.orderActions}>
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() =>
                                                navigate(`/account/orders/${o.id}?back=${back}`)
                                            }
                                        >
                                            Details
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </PageLayout>
        </Page>
    );
}
