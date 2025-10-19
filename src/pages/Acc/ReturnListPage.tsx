// src/pages/Account/ReturnListPage.tsx
/*
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import styles from "./AccountPage.module.scss";

import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { SelectField } from "../../components/UI/SelectField";
import PageLayout from "../../components/layouts/PageLayout";

import { useAccount } from "../../context/AccountContext";
import type { Address } from "../../types/address";
import type { Settings } from "../../types/settings";
import type { ReturnRequest, ReturnStatus, ReturnKind } from "../../types/return";
import {
  returnStatusLabel,
  returnKindLabel,
  requestDecisionSummary,
  lineCounts,
} from "../../types/return";

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());
const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};

const getItemImage = (it: any): string | undefined =>
  it?.image || it?.imageUrl || (Array.isArray(it?.images) ? it.images[0] : it?.thumb);

// --- Типы фильтров (чтобы не ругался TS и было наглядно) ---
type KindFilter = ReturnKind | "all";
type StatusFilter = ReturnStatus | "all";

export default function ReturnsListPage() {
  const { account } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getPreferredLocale(account.settings, account.addresses);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const list = (account.returns || []) as ReturnRequest[];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    const byText = (r: ReturnRequest) =>
      !s ||
      r.rma.toLowerCase().includes(s) ||
      r.orderNumber.toLowerCase().includes(s) ||
      r.items.some(
        (it) => it.sku.toLowerCase().includes(s) || (it.name || "").toLowerCase().includes(s)
      );

    const byStatus = (r: ReturnRequest) => (status === "all" ? true : r.status === status);

    // Если выбран конкретный тип (withdrawal/defect), то:
    //  - заявки с таким же r.kind проходят;
    //  - заявки со статусом "mixed" проходят, если среди строк есть хотя бы одна нужного kind.
    const byKind = (r: ReturnRequest) => {
      if (kind === "all") return true;
      if (r.kind === kind) return true;
      if (r.kind === "mixed") return r.items.some((l) => l.kind === kind);
      return false;
    };

    const base = list.filter((r) => byText(r) && byStatus(r) && byKind(r));

    base.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return base;
  }, [list, q, status, kind, sort]);

  const openDetails = (id: string) => {
    const back = encodeURIComponent(location.pathname + location.search);
    navigate(`/account/returns/${id}?back=${back}`);
  };

  const openOrder = (orderId?: string) => {
    if (!orderId) return;
    const back = encodeURIComponent(location.pathname + location.search);
    navigate(`/account/orders/${orderId}?back=${back}`);
  };

  return (
    <PageLayout title="Returns" onBack={() => navigate("/account?tab=orders")}>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          <TextField
            placeholder="Поиск: RMA, номер заказа, SKU, товар…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <SelectField
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            className={styles.toolbarSelect}
            options={[
              { value: "all", label: "Все статусы" },
              { value: "submitted", label: returnStatusLabel("submitted") },
              { value: "approved", label: returnStatusLabel("approved") },
              { value: "label_issued", label: returnStatusLabel("label_issued") },
              { value: "in_transit", label: returnStatusLabel("in_transit") },
              { value: "received", label: returnStatusLabel("received") },
              { value: "refunded", label: returnStatusLabel("refunded") },
              { value: "rejected", label: returnStatusLabel("rejected") },
              { value: "draft", label: returnStatusLabel("draft") },
            ]}
          />

          <SelectField
            value={kind}
            onChange={(v) => setKind(v as KindFilter)}
            className={styles.toolbarSelect}
            options={[
              { value: "all", label: "Все типы" },
              { value: "withdrawal", label: returnKindLabel("withdrawal") },
              { value: "defect", label: returnKindLabel("defect") },
            ]}
          />

          <SelectField
            value={sort}
            onChange={(v) => setSort(v as "newest" | "oldest")}
            className={styles.toolbarSelect}
            options={[
              { value: "newest", label: "Сначала новые" },
              { value: "oldest", label: "Сначала старые" },
            ]}
          />
        </div>

        <div className={styles.ordersList}>
          {filtered.map((r) => {
            const order = account.orders.find((o) => o.id === r.orderId);

            // thumbnails from order items by SKU
            const thumbs = r.items.slice(0, 4).map((it, idx) => {
              const src = order?.items.find((oi) => oi.sku === it.sku);
              const img = src ? getItemImage(src) : undefined;
              return img ? (
                <img key={idx} src={img} alt={it.name} className={styles.orderThumb} loading="lazy" />
              ) : (
                <div key={idx} className={styles.orderThumb + " " + styles.thumbFallback} aria-hidden>
                  {it.name?.[0]?.toUpperCase() ?? "•"}
                </div>
              );
            });
            const extra = r.items.length > 4 ? r.items.length - 4 : 0;

            const sumFmt = (r.merchandiseTotalCents / 100).toLocaleString(locale, {
              style: "currency",
              currency: r.currency,
            });

            const counts = lineCounts(r);
            const decision = requestDecisionSummary(r);

            return (
              <article key={r.id} className={styles.orderCard} aria-label={`Return ${r.rma}`}>
                <div className={styles.orderHead}>
                  <div className={styles.orderId}>
                    <div className={styles.orderNumber}>{r.rma}</div>
                    <div className={styles.orderDate}>{new Date(r.createdAt).toLocaleDateString(locale)}</div>
                  </div>
                  <span className={styles.badge}>{returnStatusLabel(r.status)}</span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.orderThumbs}>
                    {thumbs}
                    {extra > 0 && (
                      <div className={styles.orderThumb + " " + styles.orderMore}>+{extra}</div>
                    )}
                  </div>

                  <div className={styles.orderMeta}>
                    <div className={styles.orderTitles}>
                      {r.items.slice(0, 3).map((it) => it.name).join(", ")}
                      {r.items.length > 3 ? "…" : ""}
                    </div>
                    <div className={styles.muted}>
                      {r.items.length} строк • {returnKindLabel(r.kind)}
                      {" • "}
                      <span title="Одобрено/Ожидает/Отклонено">
                        ✓ {counts.approved} / ⏳ {counts.pending} / ✕ {counts.rejected}
                      </span>
                      {decision === "partially_approved" && (
                        <span className={styles.badge} style={{ marginLeft: 6 }}>Частично одобрено</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.orderTotal}>{sumFmt}</div>
                </div>

                <div className={styles.orderActions}>
                  <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <Button size="small" variant="ghost" onClick={() => openOrder(order?.id)}>
                      To order
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => openDetails(r.id)}>
                      Open
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className={styles.empty}>
              Возвратов не найдено
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
*/