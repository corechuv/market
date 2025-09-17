// src/pages/Account/ReturnRequest.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.scss";

import { useAccount } from "../../context/AccountContext";
import Button from "../../components/UI/Button";
import { TextField } from "../../components/UI/TextField";
import { SelectField } from "../../components/UI/SelectField";

import type { Address } from "../../types/address";
import type { Settings } from "../../types/settings";
import type { Order } from "../../types/order";
import type { ReturnRequest, ReturnItemLine, ReturnKind, ReturnStatus, ReturnReason } from "../../types/return";
import { RETURN_REASONS, REASONS_BY_KIND, returnStatusLabel } from "../../types/return";
import ChevronRightIcon from "../../components/Icons/ChevronRightIcon";

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

// статусы, которые «занимают» количество
const COUNT_STATUSES: ReturnStatus[] = [
    "submitted", "approved", "label_issued", "in_transit", "received", "refunded",
];

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

    // инициализация строк при смене заказа
    const [lines, setLines] = useState<Record<string, ReturnItemLine>>({});
    useEffect(() => {
        if (!order) return;
        const k: ReturnKind = withinReturnWindow(order) ? "withdrawal" : "defect";
        const obj: Record<string, ReturnItemLine> = {};
        order.items.forEach((it) => {
            obj[it.sku] = {
                sku: it.sku,
                name: it.name,
                qty: 0,
                unitPriceCents: it.price,
                kind: k,
                reason: firstAllowedReason(k),
            };
        });
        setLines(obj);
    }, [order?.id]);

    function updateLine(sku: string, patch: Partial<ReturnItemLine>) {
        setLines((prev) => ({ ...prev, [sku]: { ...prev[sku], ...patch } as ReturnItemLine }));
    }

    // уже созданные возвраты по этому заказу
    const returnsForOrder: ReturnRequest[] = useMemo(
        () => (order ? (account.returns || []).filter((r) => r.orderId === order.id) : []),
        [account.returns, order]
    );

    // суммарно возвращаемое количество по SKU (по учитываемым статусам)
    const returnedQtyBySku = useMemo(() => {
        const m = new Map<string, number>();
        returnsForOrder.forEach((r) => {
            if (!COUNT_STATUSES.includes(r.status)) return;
            r.items.forEach((it) => m.set(it.sku, (m.get(it.sku) || 0) + it.qty));
        });
        return m;
    }, [returnsForOrder]);

    // список конкретных заявок для каждого SKU
    const returnsBySku = useMemo(() => {
        const m = new Map<string, Array<{ req: ReturnRequest; qty: number }>>();
        returnsForOrder.forEach((req) => {
            req.items.forEach((line) => {
                const arr = m.get(line.sku) || [];
                arr.push({ req, qty: line.qty });
                m.set(line.sku, arr);
            });
        });
        return m;
    }, [returnsForOrder]);

    const selected = Object.values(lines).filter((l) => l.qty > 0);
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
            items: selected,
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
                <div className={styles.headerMainPage}>
                    <div>
                        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Назад">
                            <ChevronRightIcon /> Back
                        </button>
                    </div>
                    <h1 className={styles.title}>Возврат / Rücksendung</h1>
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
                            onChange={(v) => { setOrderId(v); }}
                            options={account.orders.map((o) => ({
                                value: o.id,
                                label: `${o.number} • ${new Date(o.createdAt).toLocaleDateString(locale)} • ${o.status}`,
                            }))}
                        />

                        {order && (
                            <div className={styles.stack}>
                                {/* Товары */}
                                <section>
                                    <h3>Товары</h3>
                                    <div className={styles.ordersList}>
                                        {order.items.map((it) => {
                                            const ordered = it.qty || 0;
                                            const alreadyReturned = returnedQtyBySku.get(it.sku) || 0;
                                            const left = Math.max(0, ordered - alreadyReturned);
                                            const skuReturns = returnsBySku.get(it.sku) || [];

                                            // строка уже инициализирована в useEffect; на самый первый рендер — подстрахуемся
                                            const orderInWindow = withinReturnWindow(order);
                                            const line = lines[it.sku] || {
                                                sku: it.sku,
                                                name: it.name,
                                                qty: 0,
                                                unitPriceCents: it.price,
                                                kind: (orderInWindow ? "withdrawal" : "defect") as ReturnKind,
                                                reason: firstAllowedReason(orderInWindow ? "withdrawal" : "defect"),
                                            };

                                            const img = getItemImage(it);

                                            return (
                                                <article
                                                    key={it.sku}
                                                    className={styles.orderCard}
                                                    style={skuReturns.length ? { outline: "1px dashed currentColor", borderRadius: 10 } : undefined}
                                                >
                                                    {/* шапка товара */}
                                                    <div className={styles.orderBody} style={{ alignItems: "center" }}>
                                                        <div className={styles.orderMeta} style={{ flex: 2 }}>
                                                            {img && <img src={img} alt={it.name} className={styles.orderThumb} loading="lazy" />}
                                                            <div className={styles.orderTitles}>{it.name}</div>
                                                            <div className={styles.muted}>
                                                                SKU: {it.sku} • В заказе: ×{ordered} • Уже в возвратах: ×{alreadyReturned} • Доступно: ×{left}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Подсказка с уже созданными возвратами по этому SKU */}
                                                    {skuReturns.length > 0 && (
                                                        <div className={styles.orderBody}>
                                                            <div className={styles.muted}>Уже есть возвраты по этому товару:</div>
                                                            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                                                                {skuReturns.map(({ req, qty }) => (
                                                                    <div key={`${req.id}-${it.sku}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                        <span className={styles.badge}>{returnStatusLabel(req.status)}</span>
                                                                        <span className={styles.muted}>×{qty} • {req.rma}</span>
                                                                        <button
                                                                            type="button"
                                                                            className={styles.ghostBtn}
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/account/returns/${req.id}?back=${encodeURIComponent(
                                                                                        location.pathname + location.search
                                                                                    )}&sku=${encodeURIComponent(it.sku)}`
                                                                                )
                                                                            }
                                                                        >
                                                                            Открыть
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Если нечего возвращать — прячем все поля и выходим */}
                                                    {left === 0 ? null : (
                                                        <>
                                                            {/* Поля выбора: тип / кол-во / причина */}
                                                            <div className={styles.orderBody} style={{ alignItems: "center" }}>
                                                                <div className={styles.orderMeta} style={{ minWidth: 220 }}>
                                                                    <SelectField
                                                                        value={line.kind}
                                                                        label="Тип"
                                                                        onChange={(v) => {
                                                                            const nextKind = v as ReturnKind;
                                                                            const nextReason = fitReasonToKind(nextKind, line.reason);
                                                                            updateLine(it.sku, { kind: nextKind, reason: nextReason });
                                                                        }}
                                                                        options={[
                                                                            { value: "withdrawal", label: "Widerruf (14 дней)", disabled: !orderInWindow },
                                                                            { value: "defect", label: "Дефект (Gewährleistung)" },
                                                                        ]}
                                                                        className={styles.toolbarSelect}
                                                                    />
                                                                </div>

                                                                <div className={styles.orderMeta}>
                                                                    <SelectField
                                                                        value={String(Math.min(line.qty, left))}
                                                                        label="Кол-во"
                                                                        onChange={(v) => updateLine(it.sku, { qty: Math.min(Number(v), left) })}
                                                                        options={[...Array(left + 1)].map((_, i) => ({ value: String(i), label: String(i) }))}
                                                                        className={styles.toolbarSelect}
                                                                    />
                                                                </div>

                                                                <div className={styles.orderMeta} style={{ minWidth: 260 }}>
                                                                    <SelectField
                                                                        value={line.reason}
                                                                        label="Причина"
                                                                        onChange={(v) => updateLine(it.sku, { reason: fitReasonToKind(line.kind, v as ReturnReason) })}
                                                                        options={REASONS_BY_KIND[line.kind].map((value) => ({ value, label: RETURN_REASONS[value] }))}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Комментарий */}
                                                            <div className={styles.orderBody}>
                                                                <TextField
                                                                    label="Комментарий (опционально)"
                                                                    value={line.note || ""}
                                                                    onChange={(e) => updateLine(it.sku, { note: e.target.value })}
                                                                />
                                                            </div>

                                                            {/* Фото */}
                                                            <div className={styles.orderBody}>
                                                                <label className={styles.label}>Фото/доказательства (опционально)</label>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const files = Array.from(e.target.files || []).slice(0, 5);
                                                                        const dataUrls: string[] = [];
                                                                        for (const f of files) {
                                                                            const b = await f.arrayBuffer();
                                                                            const base64 = btoa(String.fromCharCode(...new Uint8Array(b)));
                                                                            dataUrls.push(`data:${f.type};base64,${base64}`);
                                                                        }
                                                                        updateLine(it.sku, { photos: dataUrls });
                                                                    }}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </article>
                                            );

                                        })}
                                    </div>
                                </section>

                                <TextField
                                    label="Примечание к заявке (опционально)"
                                    value={customerNote}
                                    onChange={(e) => setCustomerNote(e.target.value)}
                                />

                                {/* Итого */}
                                <div className={styles.addrBody}>
                                    <div>
                                        <span className={styles.muted}>Сумма товаров к возврату:</span>{" "}
                                        {(sumCents / 100).toLocaleString(locale, { style: "currency", currency: account.settings.currency })}
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

                {/* Блок справки/правил */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h3>Правила возврата (EU/DE — кратко)</h3></div>
                    <ul className="summary__list">
                        <li><span>Widerruf (онлайн/дистанционная покупка):</span> <span>14 календарных дней с момента получения товара.</span></li>
                        <li><span>Исключения:</span> <span>кастомные товары, запечатанные носители/гигиена — если вскрыты, и т. п.</span></li>
                        <li><span>Gewährleistung (дефект):</span> <span>минимум 2 года для новых товаров в Германии.</span></li>
                    </ul>
                </div>
            </section>
        </main>
    );
}
