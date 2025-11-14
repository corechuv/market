// src/pages/Account/ReturnRequest.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../AccountPage.module.scss";
import cls from "./ReturnRequest.module.scss";

import Button from "../../../../components/UI/Button";
import { SelectField } from "../../../../components/UI/SelectField";
import QtyStepper from "../../../../components/UI/QtyStepper";
import { TextareaField } from "../../../../components/UI/TextareaField";
import { UploadField } from "../../../../components/UI/UploadField";
import CloseIcon from "../../../../components/Icons/CloseIcon";
import PageLayout from "../../../../components/layouts/PageLayout";
import DefinitionList from "../../../../components/UI/DefinitionList";
import type { Currency } from "../../../../types/currency";

import api from "../../../../lib/api";
import type { Totals } from "../../../../types/order";
import Page from "../../../../components/UI/Page/Page";

/* ========= локальные типы/константы под UI причин ========= */
type ReturnKind = "withdrawal" | "defect"; // mixed не нужен фронту
type ReturnReason =
  | "wrong_size"
  | "no_longer_wanted"
  | "ordered_by_mistake"
  | "not_as_described"
  | "defective"
  | "damaged"
  | "missing_parts";

const RETURN_REASONS: Record<ReturnReason, string> = {
  wrong_size: "Неверный размер",
  no_longer_wanted: "Больше не нужно",
  ordered_by_mistake: "Заказал по ошибке",
  not_as_described: "Не соответствует описанию",
  defective: "Дефект",
  damaged: "Повреждено при доставке",
  missing_parts: "Не хватает деталей",
};

const REASONS_BY_KIND: Record<ReturnKind, ReturnReason[]> = {
  withdrawal: ["wrong_size", "no_longer_wanted", "ordered_by_mistake", "not_as_described"],
  defect: ["defective", "damaged", "missing_parts", "not_as_described"],
};

type ReturnItemLine = {
  lineId: string;
  orderItemId: string; // ключевое поле для сервера
  sku: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  kind: ReturnKind;
  reason: ReturnReason;
  status: "pending" | "approved" | "rejected";
  note?: string;
  photos?: string[]; // dataURL'ы превью (или готовые URL'ы)
};
/* ========= /локальные типы ========= */

const uid = () => Math.random().toString(36).slice(2, 10);
const RETURN_WINDOW_DAYS = 14;

function firstAllowedReason(kind: ReturnKind): ReturnReason {
  return REASONS_BY_KIND[kind][0];
}
function fitReasonToKind(kind: ReturnKind, reason: ReturnReason): ReturnReason {
  return REASONS_BY_KIND[kind].includes(reason) ? reason : firstAllowedReason(kind);
}

/* ===== минимальные DTO под наши вызовы ===== */
type OrderItemDto = {
  orderItemId: string; // id строки заказа
  sku: string;
  name: string;
  qty: number;
  priceCents: number;
  imageUrl?: string | null;
};

type OrderDto = {
  id: string;
  number: string;
  createdAt?: string | null;
  totals?: Totals | null;
  currency?: string | null; // fallback
  items: OrderItemDto[];
};

/* --- для /returns/my --- */
type ServerReturnItem = {
  orderItemId: string;
  requestedQty: number;
  decision?: string | null; // accept|reject|null
};
type ServerReturnDto = {
  id: string;
  orderId: string;
  items: ServerReturnItem[];
};

/* ===== helpers для аплоада доказательств ===== */
function dataUrlToFile(dataUrl: string, name: string) {
  const [meta, b64] = dataUrl.split(",");
  const m = /data:(.*?);base64/.exec(meta || "");
  const mime = m?.[1] || "image/jpeg";
  const bin = atob(b64 || "");
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new File([buf], name, { type: mime });
}

async function uploadEvidence(dataUrls: string[]): Promise<string[]> {
  if (!dataUrls?.length) return [];
  const fd = new FormData();
  dataUrls.forEach((d, i) => fd.append("files", dataUrlToFile(d, `evidence-${i + 1}.jpg`)));
  // ВАЖНО: не задаём вручную Content-Type — браузер проставит boundary сам.
  const { data } = await api.post<{ urls: string[] }>(`/returns/evidence/upload`, fd);
  return data?.urls || [];
}

/* ===== Component ===== */
export default function ReturnRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const sp = new URLSearchParams(location.search);
  const orderHint = sp.get("order");

  const [orderId, setOrderId] = useState<string | null>(orderHint);
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1) Определяем orderId (если не пришёл в query — берём первый мой заказ)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (orderHint) return; // уже есть
        const { data } = await api.get<Array<Pick<OrderDto, "id">>>("/orders/my?limit=1");
        if (!mounted) return;
        const first = Array.isArray(data) ? data[0] : null;
        setOrderId(first?.id ?? null);
      } catch {
        if (mounted) setOrderId(null);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Тянем сам заказ
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        // основной путь: /orders/{id}/details (как в OrderDetails)
        const { data } = await api.get<OrderDto>(`/orders/${orderId}/details`);
        if (mounted) setOrder(normalizeOrder(data));
      } catch (e: any) {
        // fallback: /orders/{id}
        try {
          const { data } = await api.get<OrderDto>(`/orders/${orderId}`);
          if (mounted) setOrder(normalizeOrder(data));
        } catch (e2: any) {
          if (mounted) setLoadErr(e2?.response?.data?.detail || e2?.message || "Failed to load order");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const toCurrency = (c?: string | null): Currency => (String(c ?? "EUR").toUpperCase() as Currency);
  const currency: Currency = toCurrency(order?.totals?.currency ?? order?.currency);

  const formatMoney = (cents: number, cur: Currency) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format((cents || 0) / 100);
  const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

  // 3) Уже созданные возвраты по заказу
  const [existingReturns, setExistingReturns] = useState<ServerReturnDto[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!order?.id) return;
      try {
        const { data } = await api.get<ServerReturnDto[]>("/returns/my");
        if (mounted) {
          const arr = Array.isArray(data) ? data.filter((r) => r.orderId === order.id) : [];
          setExistingReturns(arr);
        }
      } catch {
        if (mounted) setExistingReturns([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [order?.id]);

  // 4) map orderItemId => уже «зарезервировано» (не учитываем явно отклонённые decision='reject')
  const reservedQtyByOrderItemId = useMemo(() => {
    const m = new Map<string, number>();
    existingReturns.forEach((r) => {
      r.items?.forEach((it) => {
        const include = (it?.decision || "pending") !== "reject";
        if (!include) return;
        m.set(it.orderItemId, (m.get(it.orderItemId) || 0) + (it.requestedQty || 0));
      });
    });
    return m;
  }, [existingReturns]);

  // 5) строки формы
  const [lines, setLines] = useState<ReturnItemLine[]>([]);
  useEffect(() => {
    if (!order) return;
    const kindDefault: ReturnKind = "withdrawal";
    const arr: ReturnItemLine[] = order.items.map((it) => ({
      lineId: uid(),
      orderItemId: it.orderItemId,
      sku: it.sku,
      name: it.name,
      qty: 0,
      unitPriceCents: it.priceCents,
      kind: kindDefault,
      reason: firstAllowedReason(kindDefault),
      status: "pending",
    }));
    setLines(arr);
  }, [order?.id]); // пересобираем при смене заказа

  function addLineForOrderItem(it: OrderItemDto) {
    const k: ReturnKind = "withdrawal";
    setLines((prev) => [
      ...prev,
      {
        lineId: uid(),
        orderItemId: it.orderItemId,
        sku: it.sku,
        name: it.name,
        qty: 0,
        unitPriceCents: it.priceCents,
        kind: k,
        reason: firstAllowedReason(k),
        status: "pending",
      },
    ]);
  }
  function updateLine(lineId: string, patch: Partial<ReturnItemLine>) {
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, ...patch } : l)));
  }
  function removeLine(lineId: string) {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }

  // выбранные строки и сумма
  const selected = lines.filter((l) => l.qty > 0);
  const sumCents = selected.reduce((s, l) => s + l.qty * l.unitPriceCents, 0);

  // 6) заметка клиента
  const [customerNote, setCustomerNote] = useState("");

  async function submit() {
    if (!order) return;
    const active = lines.filter((l) => l.qty > 0);
    if (active.length === 0) {
      alert("Выберите хотя бы 1 позицию и укажите количество для возврата");
      return;
    }

    setSubmitting(true);
    try {
      // 1) грузим фото для каждой активной строки параллельно
      const items = await Promise.all(
        active.map(async (l) => {
          let evidenceUrls: string[] = [];
          try {
            evidenceUrls = await uploadEvidence(l.photos || []);
          } catch (err) {
            // не валим всю заявку из-за сбоя аплоада конкретной строки
            console.warn("Evidence upload failed for line", l.lineId, err);
          }
          return {
            orderItemId: l.orderItemId,
            qty: l.qty,
            reasonCode: l.reason,
            reasonText: l.note || undefined,
            restockingFeeCents: 0,
            evidenceUrls, // ← сервер сохранит это в meta
          };
        })
      );

      // 2) шлём заявку
      const payload = {
        refundShipping: false,
        reasonCode: undefined as string | undefined,
        comment: customerNote || undefined,
        items,
      };

      const { data } = await api.post<{ id: string }>(
        `/returns/orders/${encodeURIComponent(order.id)}/request`,
        payload
      );
      const returnId = data?.id;
      navigate(
        returnId
          ? `/account/returns/${encodeURIComponent(returnId)}?back=${encodeURIComponent("/account?tab=orders")}`
          : "/account?tab=orders"
      );
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Не удалось создать возврат";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // если заказа нет — заглушка
  if (loading) {
    return (
      <Page>
        <PageLayout title="Return request" onBack={() => navigate(-1)}>
          <div className={styles.card}>
            <div className={styles.loadingWrap}>Loading…</div>
          </div>
        </PageLayout>
      </Page>
    );
  }

  if (!order || loadErr) {
    return (
      <Page>
        <PageLayout title="Order not found" onBack={() => navigate(-1)}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.titlePage}>Order not found</h2>
              <p className={styles.muted}>
                {loadErr || 'Open your order and click "Return" to submit your request.'}
              </p>
            </div>
            <div className={styles.formActions}>
              <Button variant="secondary" size="small" onClick={() => navigate("/account?tab=orders")}>
                To orders
              </Button>
            </div>
          </div>
        </PageLayout>
      </Page>
    );
  }

  const orderDetails = [
    { name: "Order:", description: order.number },
    { name: "Date:", description: formatDate(order.createdAt) },
  ];

  return (
    <Page>
      <PageLayout title="Return request" onBack={() => navigate(-1)}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.muted}>
              {RETURN_WINDOW_DAYS}-дневное право на отказ (Widerrufsrecht) действует с даты получения.
              По дефектам — законная гарантия (Gewährleistung) до 2 лет.
            </p>
          </div>

          <div className={styles.form}>
            <DefinitionList items={orderDetails} compact={true} />

            <div className={styles.stack}>
              {/* Товары */}
              <div>
                <h3>Товары</h3>
                <section className={cls.section}>
                  {order.items.map((it) => {
                    const ordered = it.qty || 0;
                    const alreadyReserved = reservedQtyByOrderItemId.get(it.orderItemId) || 0;
                    const itemFormLines = lines.filter((l) => l.orderItemId === it.orderItemId);
                    const selectedForItem = itemFormLines.reduce((s, l) => s + (l.qty || 0), 0);
                    const leftGlobal = Math.max(0, ordered - alreadyReserved);
                    const remainingForItem = Math.max(0, leftGlobal - selectedForItem);

                    if (leftGlobal === 0) {
                      return (
                        <article key={it.orderItemId} className={styles.orderCard}>
                          <div className={styles.orderBody}>
                            <div className={styles.orderMeta}>
                              {it.imageUrl && (
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className={styles.orderThumb}
                                  loading="lazy"
                                />
                              )}
                              <div className={styles.orderTitles}>{it.name}</div>
                              <div className={styles.muted}>
                                SKU: {it.sku} • Доступно к возврату: ×0
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    return (
                      <article key={it.orderItemId} className={cls.section__article}>
                        <div className={cls.item}>
                          {it.imageUrl && (
                            <img src={it.imageUrl} alt={it.name} loading="lazy" className={cls.item__thumb} />
                          )}
                          <div>
                            <div className="mini-item__title">{it.name}</div>
                            <div className="mini-item__sku">SKU: {it.sku}</div>
                            <div className="mini-item__sku">В заказе: ×{ordered}</div>
                            <div className="mini-item__sku">
                              Уже в возвратах: ×{alreadyReserved} • Доступно: ×{leftGlobal}
                            </div>
                            <div className={cls.column}>
                              {/* строки формы по этой строке заказа */}
                              {itemFormLines.map((line) => {
                                const selectedOther = selectedForItem - (line.qty || 0);
                                const maxForThisLine = Math.max(0, ordered - alreadyReserved - selectedOther);

                                const clampedQty = Math.min(line.qty || 0, maxForThisLine);
                                const active = clampedQty > 0;

                                return (
                                  <div key={line.lineId} className={cls.form}>
                                    <div className={cls.form__header}>
                                      <h4 className={cls["form__header--title"]}>
                                        {active ? "Строка к возврату" : "Добавить к возврату"}
                                      </h4>
                                      <div className={cls["form__header--actions"]}>
                                        <CloseIcon onClick={() => removeLine(line.lineId)} />
                                      </div>
                                    </div>

                                    {/* Количество */}
                                    <div className="form__row">
                                      <div>
                                        <QtyStepper
                                          value={clampedQty}
                                          max={maxForThisLine}
                                          min={0}
                                          onChange={(q) => updateLine(line.lineId, { qty: q })}
                                          ariaLabel={`Количество к возврату для SKU ${it.sku}`}
                                          size="sm"
                                        />
                                      </div>
                                    </div>

                                    {/* Остальные поля показываем только если позиция активна */}
                                    {active && (
                                      <>
                                        <div className="form__row">
                                          <SelectField
                                            value={line.kind}
                                            label="Тип"
                                            onChange={(v) => {
                                              const nextKind = v as ReturnKind;
                                              const nextReason = fitReasonToKind(nextKind, line.reason);
                                              updateLine(line.lineId, { kind: nextKind, reason: nextReason });
                                            }}
                                            options={[
                                              { value: "withdrawal", label: "Widerruf (14 дней)" },
                                              { value: "defect", label: "Дефект (Gewährleistung)" },
                                            ]}
                                          />
                                          <SelectField
                                            value={line.reason}
                                            label="Причина"
                                            onChange={(v) =>
                                              updateLine(line.lineId, {
                                                reason: fitReasonToKind(line.kind, v as ReturnReason),
                                              })
                                            }
                                            options={REASONS_BY_KIND[line.kind].map((value) => ({
                                              value,
                                              label: RETURN_REASONS[value],
                                            }))}
                                          />
                                        </div>

                                        <UploadField
                                          label="Фото/доказательства (опционально)"
                                          multiple
                                          accept="image/*"
                                          maxFiles={10}
                                          maxSizeMb={8}
                                          thumbSize={56}
                                          disabled={submitting}
                                          value={Array.isArray(line.photos) ? line.photos : []}
                                          onChange={({ dataUrls }) => {
                                            updateLine(line.lineId, { photos: dataUrls });
                                          }}
                                          hint="Можно перетащить сюда файлы"
                                          showCount="auto"
                                        />

                                        <TextareaField
                                          label="Комментарий к строке (опционально)"
                                          maxLength={500}
                                          resizable="none"
                                          value={line.note || ""}
                                          onChange={(e) => updateLine(line.lineId, { note: e.target.value })}
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Добавить ещё причину — только если текущие строки активированы */}
                              {(() => {
                                const canAddAnotherReason =
                                  remainingForItem > 0 && itemFormLines.every((l) => (l.qty || 0) > 0);
                                return canAddAnotherReason;
                              })() && (
                                  <div className={styles.orderActions}>
                                    <Button
                                      size="small"
                                      variant="secondary"
                                      onClick={() => addLineForOrderItem(it)}
                                      disabled={submitting}
                                    >
                                      Добавить ещё причину
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              </div>

              <TextareaField
                label="Примечание к заявке (опционально)"
                maxLength={200}
                resizable="none"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />

              {/* Итого */}
              <div className={styles.addrBody}>
                <div>
                  <span className={styles.muted}>Сумма товаров к возврату:</span>{" "}
                  {formatMoney(sumCents, currency)}
                </div>
                <div className={styles.muted}>
                  При полном отказе от заказа продавец возвращает стоимость стандартной доставки (если она
                  была платной). Экспресс доставка не возвращаются.
                </div>
              </div>

              <div className={styles.formActions}>
                <Button variant="primary" size="small" onClick={submit} disabled={submitting}>
                  {submitting ? "Отправка…" : "Отправить запрос"}
                </Button>
                <Button variant="secondary" size="small" onClick={() => navigate(-1)} disabled={submitting}>
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </Page>
  );
}

// ===== utils =====
function normalizeOrder(raw: any): OrderDto {
  // приведение названий полей под используемое нами представление
  return {
    id: raw?.id,
    number: raw?.number,
    createdAt: raw?.createdAt ?? raw?.date ?? null,
    totals: raw?.totals ?? null,
    currency: raw?.currency ?? null,
    items: Array.isArray(raw?.items)
      ? raw.items.map((it: any) => ({
        orderItemId: it?.id ?? it?.orderItemId ?? it?.itemId ?? it?.order_item_id, // важно
        sku: it?.sku,
        name: it?.name,
        qty: it?.qty ?? it?.quantity ?? 0,
        priceCents: it?.priceCents ?? it?.price ?? 0,
        imageUrl:
          it?.imageUrl ??
          it?.image ??
          (Array.isArray(it?.images) ? it.images[0] : undefined) ??
          it?.thumb ??
          null,
      }))
      : [],
  };
}
