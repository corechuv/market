// src/pages/Account/ReturnListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import badgeCls from "./OrderDetails.module.scss";
import PageLayout from "../../components/layouts/PageLayout";
import Button from "../../components/UI/Button";
import api from "../../lib/api";
import Page from "../../components/UI/Page/Page";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

/* ===== types (в синхроне с API) ===== */
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
  decision?: string | null; // accept|reject|partial
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

type OrderShort = { id: string; number: string };

/* ===== utils ===== */
const fmtDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso))
    : "";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export default function ReturnListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const backTo = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("back") || "/account";
  }, [location.search]);

  const [rows, setRows] = useState<ReturnOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // карта orderId -> номер заказа (для красивого отображения)
  const [orderNums, setOrderNums] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get<ReturnOut[]>("/returns/my");
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        const msg = e?.response?.data?.detail || e?.message || "Failed to load returns";
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Подтянуть номера заказов, чтобы вместо UUID показывать “#12345”
  useEffect(() => {
    let cancelled = false;
    async function hydrateOrderNumbers() {
      const uniqueIds = Array.from(new Set(rows.map((r) => r.orderId).filter(Boolean)));
      const miss = uniqueIds.filter((id) => !orderNums[id]);
      if (miss.length === 0) return;

      try {
        const fetched = await Promise.all(
          miss.map(async (oid) => {
            try {
              const { data } = await api.get<OrderShort>(`/orders/${oid}`);
              return [oid, data?.number || "—"] as const;
            } catch {
              return [oid, oid] as const; // fallback — покажем UUID
            }
          })
        );
        if (!cancelled) {
          setOrderNums((prev) => {
            const m = { ...prev };
            for (const [id, num] of fetched) m[id] = num;
            return m;
          });
        }
      } catch {
        /* ignore */
      }
    }
    if (rows.length) hydrateOrderNumbers();
    return () => {
      cancelled = true;
    };
  }, [rows, orderNums]);

  const back = encodeURIComponent("/account/returns");

  return (
    <Page>
      <PageLayout title="Returns" onBack={() => navigate(backTo)}>
        <div className={styles.stack}>
          {loading && <div className={styles.loadingWrap}>Loading…</div>}
          {err && <div className={styles.error} role="alert">{err}</div>}

          {!loading && !err && rows.length === 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.titlePage}>No returns yet</h2>
                <p className={styles.muted}>Оформляйте возврат из деталей нужного заказа.</p>
              </div>
              <div className={styles.orderActions}>
                <Button size="small" variant="secondary" onClick={() => navigate("/account?tab=orders")}>
                  My orders
                </Button>
              </div>
            </div>
          )}

          {!loading && !err && rows.length > 0 && (
            <div className={styles.ordersList}>
              {rows.map((rma) => {
                const qtyTotal = sum(rma.items.map((i) => i.requestedQty || 0));
                const orderNum = orderNums[rma.orderId] || rma.orderId;

                return (
                  <article key={rma.id} className={styles.orderCard}>
                    {/* header как в Orders */}
                    <div className={styles.orderHead}>
                      <div className={styles.orderId}>
                        <div className={styles.orderNumber}>{rma.number}</div>
                        <div className={styles.orderDate}>{fmtDate(rma.createdAt)}</div>
                      </div>
                      <span
                        className={classNames(
                          badgeCls.badge,
                          badgeCls[(rma.status || "").toLowerCase() as keyof typeof badgeCls]
                        )}
                      >
                        {rma.status}
                      </span>
                    </div>

                    {/* body как в Orders: мета + “total” слот (без изображений/превью) */}
                    <div className={styles.orderBody}>
                      {/* мета: заказ, позиции, комментарий */}
                      <div className={styles.orderMeta}>
                        <div className={styles.orderTitles}>
                          Order {orderNum} • Items ×{qtyTotal}
                          {rma.refundShipping ? " • shipping refund requested" : ""}
                        </div>
                        <div className={styles.muted}>
                          {rma.comment ? rma.comment : rma.reasonCode ? `Reason: ${rma.reasonCode}` : "—"}
                        </div>
                      </div>

                      {/* правый блок — используем под “сводку” */}
                      <div className={styles.orderTotal} title="Accepted / Received / Approved">
                        {(() => {
                          const acc = sum(rma.items.map((i) => i.acceptedQty || 0));
                          const rec = sum(rma.items.map((i) => i.receivedQty || 0));
                          const app = sum(rma.items.map((i) => i.approvedQty || 0));
                          if (acc || rec || app) {
                            return <>✓{acc} / ↧{rec} / ✔{app}</>;
                          }
                          return <>×{qtyTotal}</>;
                        })()}
                      </div>
                    </div>

                    {/* actions как в Orders */}
                    <div className={styles.orderActions}>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => navigate(`/account/returns/${encodeURIComponent(rma.id)}?back=${back}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          navigate(`/account/orders/${encodeURIComponent(rma.orderId)}?back=${encodeURIComponent("/account/returns")}`)
                        }
                      >
                        Order
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </Page>
  );
}
