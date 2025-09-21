// src/pages/Account/ReturnRequest.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.scss";

import cls from "./ReturnRequest.module.scss";

import { useAccount } from "../../context/AccountContext";
import Button from "../../components/UI/Button";
import { SelectField } from "../../components/UI/SelectField";

import type { Address } from "../../types/address";
import type { Settings } from "../../types/settings";
import type { Order } from "../../types/order";
import type { ReturnRequest, ReturnItemLine, ReturnKind, ReturnReason } from "../../types/return";
import { RETURN_REASONS, REASONS_BY_KIND } from "../../types/return";
import ChevronRightIcon from "../../components/Icons/ChevronRightIcon";
import { TextareaField } from "../../components/UI/TextareaField";
import { UploadField } from "../../components/UI/UploadField";

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());
const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const uid = () => Math.random().toString(36).slice(2, 10);
const makeRMA = () => `RMA-${new Date().getFullYear()}-${pad2(Math.floor(Math.random() * 100))}-${uid().slice(-4)}`;

const RETURN_WINDOW_DAYS = 14;

const getItemImage = (it: any): string | undefined =>
  it?.image || it?.imageUrl || (Array.isArray(it?.images) ? it.images[0] : it?.thumb);

function withinReturnWindow(o: Order) {
  const base = o.deliveredAt ? new Date(o.deliveredAt) : new Date(o.createdAt);
  const deadline = new Date(base.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return new Date() <= deadline;
}

function firstAllowedReason(kind: ReturnKind): ReturnReason {
  return REASONS_BY_KIND[kind][0];
}

function fitReasonToKind(kind: ReturnKind, reason: ReturnReason): ReturnReason {
  return REASONS_BY_KIND[kind].includes(reason) ? reason : firstAllowedReason(kind);
}

export default function ReturnRequestPage() {
  const { account, upsertReturn } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getPreferredLocale(account.settings, account.addresses);

  const sp = new URLSearchParams(location.search);
  const orderHint = sp.get("order");

  const [orderId, setOrderId] = useState<string>(orderHint || (account.orders[0]?.id ?? ""));
  const order: Order | undefined = useMemo(
    () => account.orders.find((o) => o.id === orderId),
    [orderId, account.orders]
  );

  const [customerNote, setCustomerNote] = useState("");

  // СТРОКИ — допускаем несколько строк для одного SKU
  const [lines, setLines] = useState<ReturnItemLine[]>([]);
  useEffect(() => {
    if (!order) return;
    const k: ReturnKind = withinReturnWindow(order) ? "withdrawal" : "defect";
    const arr: ReturnItemLine[] = order.items.map((it) => ({
      lineId: uid(),
      sku: it.sku,
      name: it.name,
      qty: 0,
      unitPriceCents: it.price,
      kind: k,
      reason: firstAllowedReason(k),
      status: "pending",
    }));
    setLines(arr);
  }, [order?.id]);

  function addLineForSku(it: Order["items"][number]) {
    const k: ReturnKind = withinReturnWindow(order!) ? "withdrawal" : "defect";
    setLines((prev) => [
      ...prev,
      {
        lineId: uid(),
        sku: it.sku,
        name: it.name,
        qty: 0,
        unitPriceCents: it.price,
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

  // уже созданные возвраты по этому заказу
  const returnsForOrder: ReturnRequest[] = useMemo(
    () => (order ? (account.returns || []).filter((r) => r.orderId === order.id) : []),
    [account.returns, order]
  );

  // суммарно «занятое» количество по SKU в уже созданных возвратах (исключаем ОТКЛОНЁННЫЕ строки)
  const reservedQtyBySku = useMemo(() => {
    const m = new Map<string, number>();
    returnsForOrder.forEach((r) => {
      r.items.forEach((it) => {
        const include = (it.status || "pending") !== "rejected";
        if (!include) return;
        m.set(it.sku, (m.get(it.sku) || 0) + it.qty);
      });
    });
    return m;
  }, [returnsForOrder]);

  // выбранные строки в текущей форме
  const selected = lines.filter((l) => l.qty > 0);
  const sumCents = selected.reduce((s, l) => s + l.qty * l.unitPriceCents, 0);

  function submit() {
    if (!order) return;
    if (selected.length === 0) {
      alert("Выберите хотя бы 1 позицию и укажите количество для возврата");
      return;
    }
    const kinds = new Set(selected.map((l) => l.kind));
    const reqKind: ReturnRequest["kind"] = kinds.size === 1 ? (selected[0].kind as ReturnKind) : "mixed";

    const req: ReturnRequest = {
      id: uid(),
      rma: makeRMA(),
      kind: reqKind,
      status: "submitted",
      createdAt: new Date().toISOString(),
      orderId: order.id,
      orderNumber: order.number,
      currency: account.settings.currency,
      items: selected.map((l) => ({ ...l, status: l.status || "pending" })),
      merchandiseTotalCents: sumCents,
      customerNote,
      deliveredAt: order.deliveredAt,
    };
    upsertReturn(req);
    navigate(`/account/returns/${req.id}?back=${encodeURIComponent("/account?tab=orders")}`);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Назад">
            <ChevronRightIcon /> Back
          </button>
          <h1 className={styles.title}>Rücksendung</h1>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.titlePage}>Новый запрос на возврат</h2>
            <p className={styles.muted}>
              {RETURN_WINDOW_DAYS}-дневное право на отказ (Widerrufsrecht) действует с даты получения.
              По дефектам — законная гарантия (Gewährleistung) до 2 лет.
            </p>
          </div>

          <div className={styles.form}>
            <SelectField
              label="Заказ"
              value={orderId}
              onChange={(v) => {
                setOrderId(v);
              }}
              options={account.orders.map((o) => ({
                value: o.id,
                label: `${o.number} • ${new Date(o.createdAt).toLocaleDateString(locale)} • ${o.status}`,
              }))}
            />

            {order && (
              <div className={styles.stack}>
                {/* Товары */}
                <div>
                  <h3>Товары</h3>
                  <section className={cls.section}>
                    {order.items.map((it) => {
                      const ordered = it.qty || 0;
                      const alreadyReserved = reservedQtyBySku.get(it.sku) || 0;
                      const skuFormLines = lines.filter((l) => l.sku === it.sku);
                      const selectedForSku = skuFormLines.reduce((s, l) => s + (l.qty || 0), 0);
                      const leftGlobal = Math.max(0, ordered - alreadyReserved);
                      const remainingForSku = Math.max(0, leftGlobal - selectedForSku);

                      const img = getItemImage(it);

                      // если уже нечего возвращать — показываем только заголовок карточки без полей
                      if (leftGlobal === 0) {
                        return (
                          <article key={it.sku} className={styles.orderCard}>
                            <div className={styles.orderBody}>
                              <div className={styles.orderMeta}>
                                {img && <img src={img} alt={it.name} className={styles.orderThumb} loading="lazy" />}
                                <div className={styles.orderTitles}>{it.name}</div>
                                <div className={styles.muted}>SKU: {it.sku} • Доступно к возврату: ×0</div>
                              </div>
                            </div>
                          </article>
                        );
                      }

                      return (
                        <article key={it.sku} className={cls.section__article}>
                          <div className="mini-item">
                            {img && <img src={img} alt={it.name} loading="lazy" />}
                            <div>
                              <div className="mini-item__title">{it.name}</div>
                              <div className="mini-item__sku">SKU: {it.sku}</div>
                              <div className="mini-item__sku">В заказе: ×{ordered}</div>
                              <div className="mini-item__sku">Уже в возвратах: ×{alreadyReserved} • Доступно: ×{leftGlobal}</div>
                            </div>
                          </div>

                          {/* строки формы по этому SKU */}
                          {skuFormLines.map((line) => {
                            const selectedOther = selectedForSku - (line.qty || 0);
                            const maxForThisLine = Math.max(0, ordered - alreadyReserved - selectedOther);
                            const orderInWindow = withinReturnWindow(order);

                            return (
                              <div key={line.lineId} className="form">
                                <div className="card__head">
                                  Причина/Тип
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    type="button"
                                    onClick={() => removeLine(line.lineId)}
                                  >
                                    Удалить
                                  </Button>
                                </div>

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
                                      { value: "withdrawal", label: "Widerruf (14 дней)", disabled: !orderInWindow },
                                      { value: "defect", label: "Дефект (Gewährleistung)" },
                                    ]}
                                  />
                                  <SelectField
                                    value={line.reason}
                                    label="Причина"
                                    onChange={(v) =>
                                      updateLine(line.lineId, { reason: fitReasonToKind(line.kind, v as ReturnReason) })
                                    }
                                    options={REASONS_BY_KIND[line.kind].map((value) => ({
                                      value,
                                      label: RETURN_REASONS[value],
                                    }))}
                                  />
                                </div>

                                {/* Количество: если максимум 1 — показываем чекбокс вместо селекта */}
                                <div className="form__row">
                                  {maxForThisLine <= 1 ? (
                                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <input
                                        type="checkbox"
                                        checked={(line.qty || 0) > 0}
                                        onChange={(e) => updateLine(line.lineId, { qty: e.target.checked ? 1 : 0 })}
                                      />
                                      <span>
                                        {(line.qty || 0) > 0 ? "Возвращаю ×1" : "Добавить ×1 к возврату"}
                                      </span>
                                    </label>
                                  ) : (
                                    <SelectField
                                      value={String(Math.min(line.qty, maxForThisLine))}
                                      label="Кол-во"
                                      onChange={(v) =>
                                        updateLine(line.lineId, {
                                          qty: Math.min(Number(v), maxForThisLine),
                                        })
                                      }
                                      options={[...Array(maxForThisLine + 1)].map((_, i) => ({
                                        value: String(i),
                                        label: String(i),
                                      }))}
                                    />
                                  )}
                                </div>

                                <UploadField
                                  label="Фото/доказательства (опционально)"
                                  multiple
                                  accept="image/*"
                                  maxFiles={10}
                                  maxSizeMb={8}
                                  thumbSize={56}
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
                              </div>
                            );
                          })}

                          {/* Разрешаем добавлять ещё причину только когда во всех текущих строках qty выбран (>0) */}
                          {(() => {
                            const canAddAnotherReason =
                              remainingForSku > 0 && skuFormLines.every((l) => (l.qty || 0) > 0);
                            return canAddAnotherReason;
                          })() && (
                              <div className={styles.orderActions}>
                                <Button size="small" variant="secondary" onClick={() => addLineForSku(it)}>
                                  Добавить ещё причину
                                </Button>
                              </div>
                            )}
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
                    {(sumCents / 100).toLocaleString(locale, {
                      style: "currency",
                      currency: account.settings.currency,
                    })}
                  </div>
                  <div className={styles.muted}>
                    При полном отказе от заказа продавец возвращает стоимость стандартной доставки (если она была платной). Экспресс-доплаты обычно не возвращаются.
                  </div>
                </div>

                <div className={styles.formActions}>
                  <Button variant="primary" size="small" onClick={submit}>
                    Отправить запрос
                  </Button>
                  <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Правила */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Правила возврата (EU/DE — кратко)</h3>
          </div>
          <ul className="summary__list">
            <li>
              <span>Widerruf (онлайн/дистанционная покупка):</span>{" "}
              <span>14 календарных дней с момента получения товара.</span>
            </li>
            <li>
              <span>Исключения:</span>{" "}
              <span>кастомные товары, запечатанные носители/гигиена — если вскрыты, и т. п.</span>
            </li>
            <li>
              <span>Gewährleistung (дефект):</span>{" "}
              <span>минимум 2 года для новых товаров в Германии.</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
