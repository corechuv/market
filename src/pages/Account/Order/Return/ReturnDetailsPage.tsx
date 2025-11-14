// src/pages/Account/ReturnDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../../AccountPage.module.scss";
import PageLayout from "../../../../components/layouts/PageLayout";
import Button from "../../../../components/UI/Button";
import api from "../../../../lib/api";
import DefinitionList from "../../../../components/UI/DefinitionList";
import cls from "./ReturnDetails.module.scss";
import Page from "../../../../components/UI/Page/Page";

function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

/* ===== types ===== */
type ReturnItemOut = {
    id: string;
    orderItemId: string;
    requestedQty: number;
    approvedQty?: number | null;
    receivedQty?: number | null;
    acceptedQty?: number | null;
    restockingFeeCents: number;
    reasonCode?: string | null;
    reasonText?: string | null;
    decision?: string | null;
    evidenceUrls?: string[] | null;
};

type ReturnOut = {
    id: string;
    number: string;
    orderId: string;
    invoiceId?: string | null;
    status: string;
    refundShipping: boolean;
    reasonCode?: string | null;
    comment?: string | null;
    createdAt: string;
    items: ReturnItemOut[];
};

type OrderItemDetails = {
    orderItemId: string;
    sku: string;
    name: string;
    qty: number;
    priceCents: number;
    currency: string;
    imageUrl?: string | null;
};

type OrderDetailsOut = {
    id: string;
    number: string;
    totals: { currency: string };
    items: OrderItemDetails[];
};

type CreditNoteLineOut = {
    lineNo: number;
    sku?: string | null;
    name: string;
    qty: number;
    unitPriceCents: number;
    discountCents: number;
    vatRateBp: number;
    vatCents: number;
    totalCents: number;
    currency: string;
};

type CreditNoteOut = {
    id: string;
    returnId: string;
    orderId: string;
    invoiceId?: string | null;
    number: string;
    issueDate: string;
    status: string;
    currency: string;
    totals: { subtotalCents: number; shippingRefundCents?: number; vatCents: number; totalCents: number; currency: string; };
    pdfUrl?: string | null;
    lines: CreditNoteLineOut[];
};

type OrderShort = { id: string; number: string };

/* ===== utils ===== */
const fmtMoney = (cents: number, cur = "EUR") =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: cur }).format((cents || 0) / 100);

const fmtDateTime = (iso?: string | null) =>
    iso ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/* ===== page ===== */
export default function ReturnDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const backTo = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return sp.get("back") || "/account/returns";
    }, [location.search]);

    const [data, setData] = useState<ReturnOut | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null>(null);

    const [orderNum, setOrderNum] = useState<string | null>(null);

    // карта: orderItemId -> {name, sku, imageUrl, ...}
    const [oiById, setOiById] = useState<Record<string, OrderItemDetails>>({});
    const [orderCurrency, setOrderCurrency] = useState<string>("EUR");

    const [credit, setCredit] = useState<CreditNoteOut | null>(null);
    const [creditLoading, setCreditLoading] = useState<boolean>(false);
    const [creditErr, setCreditErr] = useState<string | null>(null);

    // 1) деталь возврата
    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!id) return;
            setLoading(true); setErr(null);
            try {
                const { data } = await api.get<ReturnOut>(`/returns/${id}`);
                if (!mounted) return;
                setData(data);
            } catch (e: any) {
                if (!mounted) return;
                setErr(e?.response?.data?.detail || e?.message || "Failed to load return");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [id]);

    // 2) номер заказа + детали заказа (для name/sku/imageUrl по orderItemId)
    useEffect(() => {
        let cancelled = false;
        async function loadOrderMeta(oid?: string) {
            if (!oid) return;
            try {
                const [{ data: short }, { data: details }] = await Promise.all([
                    api.get<OrderShort>(`/orders/${oid}`),
                    api.get<OrderDetailsOut>(`/orders/${oid}/details`)
                ]);
                if (cancelled) return;
                setOrderNum(short?.number || null);
                setOrderCurrency(details?.totals?.currency || "EUR");
                const map: Record<string, OrderItemDetails> = {};
                (details?.items || []).forEach((it) => { map[it.orderItemId] = it; });
                setOiById(map);
            } catch {
                if (!cancelled) {
                    setOrderNum(null);
                    setOiById({});
                    setOrderCurrency("EUR");
                }
            }
        }
        if (data?.orderId) loadOrderMeta(data.orderId);
        return () => { cancelled = true; };
    }, [data?.orderId]);

    // 3) кредит-нота (если есть)
    useEffect(() => {
        let active = true;
        async function loadCredit() {
            if (!id) return;
            setCreditErr(null);
            setCreditLoading(true);
            try {
                const { data } = await api.get<CreditNoteOut>(`/returns/${id}/credit-note`);
                if (active) setCredit(data);
            } catch (e: any) {
                if (e?.response?.status !== 404 && active) {
                    setCreditErr(e?.response?.data?.detail || e?.message || "Failed to load credit note");
                }
            } finally {
                if (active) setCreditLoading(false);
            }
        }
        loadCredit();
        return () => { active = false; };
    }, [id]);

    async function openPdfByBlob(pdfUrlOrPath: string) {
        const win = window.open("", "_blank");
        try {
            const res = await api.get(pdfUrlOrPath, { responseType: "blob" });
            const blob: Blob = res.data;
            const url = URL.createObjectURL(blob);
            if (win) {
                try { (win as any).opener = null; } catch { }
                win.location.assign(url);
            } else {
                window.open(url, "_blank");
            }
            setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
        } catch (e) {
            win?.close();
            throw e;
        }
    }

    const qtyRequested = useMemo(() => sum(data?.items?.map(i => i.requestedQty || 0) || []), [data]);
    const qtyApproved = useMemo(() => sum(data?.items?.map(i => i.approvedQty || 0) || []), [data]);
    const qtyReceived = useMemo(() => sum(data?.items?.map(i => i.receivedQty || 0) || []), [data]);
    const qtyAccepted = useMemo(() => sum(data?.items?.map(i => i.acceptedQty || 0) || []), [data]);

    const returnDetails = [
        {
            name: "Status:",
            description: data && <span
                className={classNames(
                    cls.badge,
                    cls[(data.status || "").toLowerCase() as keyof typeof cls]
                )}
            >
                {data.status}
            </span>
        },
        { name: "Return:", description: data && data.number },
        { name: "Created:", description: data && fmtDateTime(data.createdAt) },
        { name: "Order:", description: data && (orderNum || data.orderId) },
        { name: "Requested:", description: qtyRequested },
        { name: "Shipping:", description: data && data.refundShipping ? " • shipping refund requested" : "" },
        { name: "Comment:", description: data && (data.comment ? data.comment : data.reasonCode ? `Reason: ${data.reasonCode}` : "—") },
        { name: "Approved:", description: qtyApproved },
        { name: "Received:", description: qtyReceived },
        { name: "Accepted:", description: qtyAccepted },
    ];

    return (
        <Page>
            <PageLayout title="Return" onBack={() => navigate(backTo)}>
                <div className={styles.stack}>
                    {loading && <div className={styles.muted}>Loading…</div>}
                    {err && <div className={styles.error} role="alert">{err}</div>}

                    {!loading && !err && data && (
                        <>
                            <DefinitionList items={returnDetails} compact={true} />
                            <div className={styles.card}>
                                <div className={styles.orderBody} style={{ alignItems: "flex-start" }}>
                                    <div className={styles.orderTotal} style={{ textAlign: "right" }}>
                                        {creditLoading && <>Loading credit…</>}
                                        {!creditLoading && credit && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                                <div className={styles.muted}>Credit note</div>
                                                <div style={{ fontWeight: 600 }}>{credit.number}</div>
                                                <div className={styles.muted}>{fmtMoney(credit.totals.totalCents, credit.totals.currency)}</div>
                                                <Button size="small" onClick={() => openPdfByBlob(credit.pdfUrl || `/credit-notes/${credit.id}/pdf`)}>
                                                    Open PDF
                                                </Button>
                                            </div>
                                        )}
                                        {!creditLoading && !credit && <div className={styles.muted}>No credit note yet</div>}
                                        {creditErr && <div className={styles.error} role="alert">{creditErr}</div>}
                                    </div>
                                </div>
                                <section>
                                    <h3>Items</h3>
                                    <div className="summary__mini">
                                        {data.items.map((it) => {
                                            const snap = oiById[it.orderItemId];
                                            const ev = (it.evidenceUrls || []).slice(0, 6);
                                            const decision = (it.decision || "").toLowerCase();

                                            return (
                                                <div key={it.id} className="mini-item" style={{ alignItems: "flex-start" }}>
                                                    {snap?.imageUrl ? (
                                                        <img src={snap.imageUrl} alt={snap.name || snap.sku || "Product"} />
                                                    ) : (
                                                        <div className="mini-item__noimg" />
                                                    )}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                        <div className="mini-item__title">{snap?.name || `Item ${snap?.sku || it.orderItemId.slice(0, 8)}`}</div>
                                                        <div className="mini-item__sku">{snap?.sku ? `SKU: ${snap.sku}` : "SKU: —"}</div>
                                                        <div className={styles.muted}>
                                                            Requested ×{it.requestedQty}
                                                            {typeof it.approvedQty === "number" ? ` • Approved ×${it.approvedQty}` : ""}
                                                            {typeof it.receivedQty === "number" ? ` • Received ×${it.receivedQty}` : ""}
                                                            {typeof it.acceptedQty === "number" ? ` • Accepted ×${it.acceptedQty}` : ""}
                                                            {it.restockingFeeCents > 0 ? ` • Restocking: ${fmtMoney(it.restockingFeeCents, orderCurrency)}` : ""}
                                                            {decision ? ` • Decision: ${decision}` : ""}
                                                        </div>

                                                        {(it.reasonCode || it.reasonText) && (
                                                            <div className={styles.muted}>
                                                                {it.reasonCode ? `Reason: ${it.reasonCode}` : "Reason: —"}{it.reasonText ? ` — ${it.reasonText}` : ""}
                                                            </div>
                                                        )}

                                                        {/* evidence thumbnails (детали — оставляем) */}
                                                        {ev.length > 0 && (
                                                            <div
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                                                                    gap: 8,
                                                                    marginTop: 6,
                                                                    maxWidth: 420,
                                                                }}
                                                            >
                                                                {ev.map((url, i) => (
                                                                    <a
                                                                        key={i}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        style={{
                                                                            display: "block",
                                                                            width: "100%",
                                                                            aspectRatio: "1/1",
                                                                            overflow: "hidden",
                                                                            borderRadius: 8,
                                                                            boxShadow: "0 0 0 1px rgba(0,0,0,0.06) inset",
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={url}
                                                                            alt={`evidence ${i + 1}`}
                                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                            loading="lazy"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                                <div className={styles.orderActions}>
                                    <Button
                                        size="small"
                                        variant="secondary"
                                        onClick={() =>
                                            navigate(`/account/orders/${encodeURIComponent(data.orderId)}?back=${encodeURIComponent("/account/returns")}`)
                                        }
                                    >
                                        Order details
                                    </Button>
                                    <Button size="small" onClick={() => navigate("/account/returns")}>
                                        All returns
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </PageLayout>
        </Page>
    );
}
