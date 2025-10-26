// src/pages/Account/OrderDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import cls from "./OrderDetails.module.scss";
import Button from "../../components/UI/Button";
import PageLayout from "../../components/layouts/PageLayout";
import DefinitionList from "../../components/UI/DefinitionList";
import Accordion from "../../components/UI/Accordion";
import api from "../../lib/api";
import type { Totals } from "../../types/order";

function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

// + тип инвойса
type InvoiceDto = {
    id: string;
    orderId: string;
    number: string;
    issueDate: string;
    status: string;
    currency: string;
    pdfUrl?: string | null;
};

/* ================= types ================= */
type AddressSnap = {
    firstName: string; lastName: string; company?: string | null;
    country: string; postalCode: string; region?: string | null;
    city: string; line1: string; line2?: string | null;
    phone?: string | null; email?: string | null;
};

type Item = {
    productId?: string | null;
    sku: string; name: string; qty: number;
    priceCents: number; currency: string;
    imageUrl?: string | null;
};

type ShipmentPkg = { seq: number; tracking?: string | null; status?: string | null; labelUrl?: string | null; };
type Shipment = { id: string; carrierCode?: string | null; serviceCode?: string | null; status?: string | null; masterTracking?: string | null; packages?: ShipmentPkg[] | null; };

type Payment = {
    id: string; status?: string; provider?: string; amountCents?: number; currency?: string; approvalUrl?: string | null;
    // NEW: офлайн-инвойс и банковские реквизиты
    invoiceNumber?: string | null;
    invoicePdfUrl?: string | null;
    dueDate?: string | null;
    bank?: {
        iban?: string | null;
        bic?: string | null;
        beneficiary?: string | null;
        bank?: string | null;
    } | null;
    instructions?: string | null;
};

type OrderDetailsDto = {
    id: string; number: string; createdAt?: string | null; status?: string | null;
    shippingMethod?: string | null; shippingSnapshot?: any;
    totals: Totals;
    addresses: { delivery: AddressSnap; billing?: AddressSnap | null; };
    items: Item[];
    shipments?: Shipment[] | null;
    payments?: Payment[] | null;
    promo?: any;
};

/* ================= utils ================= */
const fmtMoney = (cents: number, cur = "EUR") =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: cur }).format((cents || 0) / 100);

const fmtDateTime = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

const isFinal = (s?: string | null) =>
    ["paid", "succeeded", "completed", "captured"].includes(String(s || "").toLowerCase());

export default function OrderDetails() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const location = useLocation();

    const backTo = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return sp.get("back") || "/account?tab=orders";
    }, [location.search]);

    const [data, setData] = useState<OrderDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (!id) return;
            setLoading(true);
            setErr(null);

            try {
                // основной путь — такой же стиль, как в Account/OrdersSection (через общий axios-инстанс)
                const { data } = await api.get<OrderDetailsDto>(`/orders/${id}/details`);
                if (mounted) setData(data);
            } catch (e: any) {
                // fallback, если в API нет /details — попробуем без него
                const status = e?.response?.status;
                if (status === 401) {
                    nav("/auth", { replace: true });
                    return;
                }

                if (status === 404) {
                    try {
                        const { data } = await api.get<OrderDetailsDto>(`/orders/${id}`);
                        if (mounted) setData(data);
                    } catch (e2: any) {
                        if (mounted) setErr(e2?.response?.data?.detail || e2?.message || "Failed to load order");
                    } finally {
                        if (mounted) setLoading(false);
                    }
                    return;
                }

                if (mounted) setErr(e?.response?.data?.detail || e?.message || "Failed to load order");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [id, nav]);

    const itemsCount = data?.items?.reduce((a, it) => a + (it?.qty || 0), 0) || 0;
    const orderDetails = [
        { name: "Number:", description: data?.number || "" },
        { name: "Date:", description: fmtDateTime(data?.createdAt) },
        { name: "Items:", description: String(itemsCount) },
        {
            name: "In total:",
            description: data ? fmtMoney(data.totals.totalCents, data.totals.currency) : "",
        },
    ];

    const shipments = data?.shipments ?? [];
    const payments = data?.payments ?? [];
    const firstPayment = payments[0];

    const invFromPayment = useMemo(() => {
        if (!firstPayment) return null;
        if (firstPayment.invoiceNumber || firstPayment.invoicePdfUrl) {
            return {
                number: firstPayment.invoiceNumber || "",
                pdfUrl: firstPayment.invoicePdfUrl || null,
                dueDate: firstPayment.dueDate || null,
            };
        }
        return null;
    }, [firstPayment]);

    // состояние
    const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
    const [invLoading, setInvLoading] = useState(false);
    const [invErr, setInvErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function loadInvoice(orderId: string) {
            try {
                const { data } = await api.get<InvoiceDto>(`/invoices/by-order/${orderId}`);
                if (mounted) setInvoice(data);
            } catch (e: any) {
                // 404 — инвойса пока нет, это нормально
                if (e?.response?.status !== 404 && mounted) {
                    setInvErr(e?.response?.data?.detail || e?.message || "Failed to load invoice");
                }
            }
        }

        if (id) loadInvoice(id);
        return () => { mounted = false; };
    }, [id]);

    function canIssueInvoice(): boolean {
        // инвойс выдаём только после оплаты
        const st = (data?.status || "").toLowerCase();
        return ["paid", "succeeded", "completed", "captured"].includes(st);
    }

    async function openPdfByBlob(pdfUrlOrPath: string) {
        // ВАЖНО: не делаем new URL(...), не трогаем baseURL!
        const win = window.open("", "_blank"); // без noopener, чтобы можно было навигироваться
        try {
            const res = await api.get(pdfUrlOrPath, { responseType: "blob" });
            const blob: Blob = res.data;
            // быстрая самопроверка
            // console.log("ct:", res.headers["content-type"], "size:", blob.size);

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


    async function handleInvoiceClick() {
        if (!id) return;
        setInvErr(null);
        setInvLoading(true);

        try {
            // если инвойс уже есть — просто открыть PDF
            if (invoice?.id) {
                await openPdfByBlob(invoice.pdfUrl || `/invoices/${invoice.id}/pdf`);
                return;
            }

            // иначе — если заказ оплачен, выписать и открыть
            if (canIssueInvoice()) {
                const { data: inv } = await api.post<InvoiceDto>(`/invoices/orders/${id}/issue`, {});
                setInvoice(inv);
                await openPdfByBlob(inv.pdfUrl || `/invoices/${inv.id}/pdf`);
                return;
            }

            // заказ не оплачен — не выдаём
            setInvErr("Инвойс доступен после оплаты.");
        } catch (e: any) {
            setInvErr(e?.response?.data?.detail || e?.message || "Не удалось открыть инвойс");
        } finally {
            setInvLoading(false);
        }
    }


    return (
        <PageLayout title="Order" onBack={() => nav(backTo)}>
            <div style={{ display: "flex", gap: 40, flexDirection: "column" }}>
                {loading && <div className={styles.muted}>Loading…</div>}
                {err && <div className={styles.error} role="alert">{err}</div>}

                {!loading && !err && data && (
                    <div className={styles.stack}>
                        {/* Статус (если нужна цветовая подсветка — подхватываем через cls.*) */}
                        <div style={{ display: "none" }}>
                            <span className={styles.muted}>Status:</span>{" "}
                            <span
                                className={classNames(
                                    cls.badge,
                                    cls[(data.status || "new").toLowerCase() as keyof typeof cls]
                                )}
                            >
                                {data.status || "—"}
                            </span>
                        </div>

                        {/* Общие детали */}
                        <section>
                            <DefinitionList items={orderDetails} compact />
                        </section>

                        {/* Трекинг */}
                        <section>
                            <h3>Tracking info</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {(shipments?.length ?? 0) === 0 && (
                                    <div className={styles.muted}>No tracking numbers yet.</div>
                                )}

                                {shipments.flatMap((sh, si) => {
                                    const pkgs = (sh?.packages && sh.packages.length > 0)
                                        ? sh.packages
                                        : [{ seq: 1, tracking: sh?.masterTracking, status: sh?.status }];

                                    return pkgs.map((p, pi) => (
                                        <Accordion
                                            key={`${si}-${pi}`}
                                            title={p.tracking || sh.masterTracking || `Package #${p.seq}`}
                                            margin={false}
                                        >
                                            <div className={styles.stack} style={{ gap: 6 }}>
                                                <div className={styles.muted}>Status: {p.status || sh.status || "—"}</div>
                                                {!!p.labelUrl && (
                                                    <a href={p.labelUrl} target="_blank" rel="noreferrer">Label PDF</a>
                                                )}
                                                {(sh.carrierCode || sh.serviceCode) && (
                                                    <div>
                                                        Carrier: {sh.carrierCode || "—"}{sh.serviceCode ? ` • ${sh.serviceCode}` : ""}
                                                    </div>
                                                )}
                                                {/* при желании — сюда можно добавить таймлайн событий */}
                                            </div>
                                        </Accordion>
                                    ));
                                })}
                            </div>
                        </section>

                        {/* Товары */}
                        <section>
                            <h3>Products</h3>
                            <div className="summary__mini">
                                {data.items.map((it, idx) => (
                                    <div key={`${it.sku}-${idx}`} className="mini-item">
                                        {it.imageUrl ? (
                                            <img src={it.imageUrl} alt={it.name} />
                                        ) : (
                                            <div className="mini-item__noimg" />
                                        )}
                                        <div>
                                            <div>
                                                <div className="mini-item__title">{it.name}</div>
                                                <div className="mini-item__sku">{it.sku}</div>
                                                <div className="muted">x{it.qty}</div>
                                            </div>
                                        </div>
                                        <div className="mini-item__price">
                                            {fmtMoney((it.priceCents || 0) * (it.qty || 0), it.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Адрес доставки */}
                        <section>
                            <h3>Delivery address</h3>
                            <div className={styles.addrBody}>
                                <div>{data.addresses.delivery.firstName} {data.addresses.delivery.lastName}</div>
                                {data.addresses.delivery.company && <div>{data.addresses.delivery.company}</div>}
                                <div>{data.addresses.delivery.line1}</div>
                                {data.addresses.delivery.line2 && <div>{data.addresses.delivery.line2}</div>}
                                <div>
                                    {data.addresses.delivery.postalCode} {data.addresses.delivery.city}
                                    {data.addresses.delivery.region ? `, ${data.addresses.delivery.region}` : ""}
                                </div>
                                <div>{data.addresses.delivery.country}</div>
                                {data.addresses.delivery.phone && (
                                    <div className={styles.muted}>{data.addresses.delivery.phone}</div>
                                )}
                            </div>
                        </section>

                        {/* Оплата */}
                        <section>
                            <h3>Payment info</h3>
                            <ul className="summary__list">
                                <li>
                                    <span>Method</span>
                                    <span>{firstPayment?.provider || "—"}</span>
                                </li>
                                <li>
                                    <span>{isFinal(firstPayment?.status) ? "Paid" : "Amount"}</span>
                                    <span>
                                        {firstPayment
                                            ? fmtMoney(firstPayment.amountCents || 0, firstPayment.currency || data.totals.currency)
                                            : fmtMoney(0, data.totals.currency)}
                                    </span>
                                </li>
                                {/* --- Bank transfer instructions (только если это офлайн и еще не финализировано) --- */}
                                {firstPayment?.bank && !isFinal(firstPayment?.status) && (
                                    <div className={styles.stack} style={{ gap: 8, marginTop: 8 }}>
                                        <h4 style={{ margin: 0 }}>Bank transfer (prepayment)</h4>
                                        {firstPayment.instructions && (
                                            <div className={styles.muted}>{firstPayment.instructions}</div>
                                        )}
                                        <ul className="summary__list">
                                            <li>
                                                <span>Beneficiary</span>
                                                <span>{firstPayment.bank?.beneficiary || "—"}</span>
                                            </li>
                                            <li>
                                                <span>IBAN</span>
                                                <span><code>{firstPayment.bank?.iban || "—"}</code></span>
                                            </li>
                                            <li>
                                                <span>BIC</span>
                                                <span><code>{firstPayment.bank?.bic || "—"}</code></span>
                                            </li>
                                            {firstPayment.bank?.bank && (
                                                <li>
                                                    <span>Bank</span>
                                                    <span>{firstPayment.bank.bank}</span>
                                                </li>
                                            )}
                                            {firstPayment.dueDate && (
                                                <li>
                                                    <span>Due date</span>
                                                    <span>{new Date(firstPayment.dueDate).toLocaleDateString()}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {!!firstPayment?.approvalUrl && (
                                    <li>
                                        <span>Approve</span>
                                        <a href={firstPayment.approvalUrl} target="_blank" rel="noreferrer">Open</a>
                                    </li>
                                )}
                            </ul>
                        </section>

                        {/* Сумма */}
                        <section>
                            <h3>Summary</h3>
                            <ul className="summary__list">
                                <li>
                                    <span>Products</span>
                                    <span>{fmtMoney(data.totals.subtotalCents, data.totals.currency)}</span>
                                </li>
                                <li>
                                    <span>Delivery {data.shippingMethod ? `(${data.shippingMethod})` : ""}</span>
                                    <span>{fmtMoney(data.totals.shippingCents, data.totals.currency)}</span>
                                </li>
                                {data.totals.discountCents > 0 && (
                                    <li className="good">
                                        <span>Discount</span>
                                        <span>-{fmtMoney(data.totals.discountCents, data.totals.currency)}</span>
                                    </li>
                                )}
                                <li>
                                    <span>Including VAT</span>
                                    <span>{fmtMoney(data.totals.vatCents, data.totals.currency)}</span>
                                </li>
                                <li className="sum">
                                    <span>Total</span>
                                    <span>{fmtMoney(data.totals.totalCents, data.totals.currency)}</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3>Invoice</h3>

                            {invFromPayment ? (
                                <div className={styles.stack} style={{ gap: 8 }}>
                                    <div className={styles.muted}>
                                        № {invFromPayment.number || "—"}
                                        {invFromPayment.dueDate ? ` • due ${new Date(invFromPayment.dueDate).toLocaleDateString()}` : ""}
                                    </div>
                                    <div className={styles.orderActions}>
                                        <Button size="small"
                                            onClick={async () => {
                                                // если API дал прямой URL — открываем им; иначе падаем на прежний механизм
                                                const url = invFromPayment.pdfUrl || (invoice?.id ? `/invoices/${invoice.id}/pdf` : "");
                                                if (!url) {
                                                    // нет прямого URL — попробуем существующий флоу (создать/загрузить)
                                                    await handleInvoiceClick();
                                                } else {
                                                    await openPdfByBlob(url);
                                                }
                                            }}
                                            disabled={invLoading}
                                        >
                                            {invLoading ? "Opening…" : "Open PDF"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // старый флоу: если инвойс уже подгружен отдельным вызовом — показываем,
                                // иначе: если заказ оплачен — кнопка "Issue & Open PDF", если нет — "Invoice unavailable"
                                <>
                                    {invoice ? (
                                        <div className={styles.stack} style={{ gap: 8 }}>
                                            <div className={styles.muted}>
                                                № {invoice.number} • {new Date(invoice.issueDate).toLocaleDateString()}
                                            </div>
                                            <div className={styles.orderActions}>
                                                <Button size="small" onClick={handleInvoiceClick} disabled={invLoading}>
                                                    {invLoading ? "Opening…" : "Open PDF"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.orderActions} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <Button size="small" onClick={handleInvoiceClick} disabled={invLoading || !canIssueInvoice()}>
                                                {invLoading ? "Issuing…" : (canIssueInvoice() ? "Issue & Open PDF" : "Invoice unavailable")}
                                            </Button>
                                            {invErr && <div className={styles.error} role="alert">{invErr}</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                        <section>
                            <div className={styles.orderActions}>
                                <Button
                                    size="small"
                                    onClick={() =>
                                        nav(`/account/returns/new?order=${encodeURIComponent(id || data?.id || "")}`)
                                    }
                                    disabled={!id && !data?.id}
                                >
                                    Return items
                                </Button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
