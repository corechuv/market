// src/pages/Account/ReturnDetails.tsx

import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./AccountPage.module.scss";
import cls from "./ReturnDetails.module.scss";

import { useAccount } from "../../context/AccountContext";
import type { Address } from "../../types/address";
import type { Settings } from "../../types/settings";
import { returnStatusLabel, returnKindLabel, requestDecisionSummary, returnLineStatusLabel } from "../../types/return";
import Button from "../../components/UI/Button";
import ChevronRightIcon from "../../components/Icons/ChevronRightIcon";

const isGermany = (country: string) => /^(германи|deutschland)/i.test(country.trim());
const getPreferredLocale = (settings: Settings, addresses: Address[]): string => {
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  if (def && isGermany(def.country)) return "de-DE";
  return settings.language === "ru" ? "ru-RU" : "en-GB";
};

const getItemImage = (it: any): string | undefined =>
  it?.image || it?.imageUrl || (Array.isArray(it?.images) ? it.images[0] : it?.thumb);

export default function ReturnDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { account, setReturnStatus, setReturnLineStatus } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("back") || "/account?tab=orders";
  }, [location.search]);

  const locale = getPreferredLocale(account.settings, account.addresses);
  const req = account.returns.find((r) => r.id === id);

  // фильтр по SKU (если пришли со страницы заказа)
  const sp = new URLSearchParams(location.search);
  const skuFilter = sp.get("sku");

  if (!req) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate(backTo)}
              aria-label="Назад"
            >
              <ChevronRightIcon /> Back
            </button>
            <h1 className={styles.title} style={{ marginLeft: 12 }}>Возврат не найден</h1>
          </div>
          <div className={styles.headerActions}>
            <Link to="/account?tab=orders" className={styles.ghostBtn}>К заказам</Link>
          </div>
        </header>
      </main>
    );
  }

  const order = account.orders.find((o) => o.id === req.orderId);
  const decision = requestDecisionSummary(req);

  const imgBySku = useMemo(() => {
    const m = new Map<string, string | undefined>();
    order?.items.forEach((it) => m.set(it.sku, getItemImage(it)));
    return m;
  }, [order]);

  const sumFmt = (req.merchandiseTotalCents / 100).toLocaleString(locale, { style: "currency", currency: req.currency });

  const lines = skuFilter ? req.items.filter((it) => it.sku === skuFilter) : req.items;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <button className={styles.backBtn} onClick={() => navigate(backTo)} aria-label="Назад">
            <ChevronRightIcon /> Back
          </button>
          <h1 className={styles.title}>Return {req.rma}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link to="/account?tab=orders" className={styles.ghostBtn}>К заказам</Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.stack}>
          <div>
            <span className={styles.muted}>Статус заявки:</span>{" "}
            <span className={styles.badge}>{returnStatusLabel(req.status)}</span>{" "}
            {decision === "partially_approved" && (
              <span className={styles.badge} style={{ marginLeft: 6 }}>Частично одобрено</span>
            )}
          </div>

          <div className={styles.addrBody}>
            <div><span className={styles.muted}>Создан:</span> {new Date(req.createdAt).toLocaleString(locale)}</div>
            <div><span className={styles.muted}>Тип заявки:</span> {returnKindLabel(req.kind)}</div>
            <div><span className={styles.muted}>Заказ:</span> {order ? order.number : req.orderNumber}</div>
            <div><span className={styles.muted}>Сумма товаров:</span> {sumFmt}</div>
          </div>

          {skuFilter && (
            <div className={styles.addrBody}>
              <div>
                <span className={styles.muted}>Фильтр по SKU:</span>{" "}
                <strong>{skuFilter}</strong>{" "}
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    const noSku = new URLSearchParams(location.search);
                    noSku.delete("sku");
                    navigate({ search: noSku.toString() });
                  }}
                >
                  Сбросить фильтр
                </button>
              </div>
              {lines.length === 0 && <div className={styles.muted}>В этом возврате нет строк с таким SKU.</div>}
            </div>
          )}

          <div>
            <h3>Items</h3>
            <section className={cls.section}>
              {lines.map((it, idx) => {
                const img = imgBySku.get(it.sku);
                const key = (it as any).lineId || `${it.sku}-${it.reason}-${idx}`; // fallback для старых данных
                const lineStatus = (it.status || "pending");
                return (
                  <article key={key} className={cls.section__article}>
                    <div className={cls.item}>
                      {img && <img src={img} alt={it.name} className={styles.orderThumb} loading="lazy" />}
                      <div>
                        <div className="mini-item__title">{it.name}</div>
                        <div className="mini-item__sku">{it.sku}</div>
                        <div className="muted">×{it.qty}</div>
                        <div className="muted">Тип: {returnKindLabel(it.kind)}</div>
                        <div className="muted">Причина: {it.reason}</div>
                        {it.note && <div className="muted">Комментарий: {it.note}</div>}
                        {Array.isArray(it.photos) && it.photos.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                            {it.photos.map((src, i) => (
                              <img key={i} src={src} alt="evidence" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6 }} />
                            ))}
                          </div>
                        )}
                        <div className="muted">Статус строки: {returnLineStatusLabel(lineStatus as any)}</div>
                        {(it as any).lineId && lineStatus === "pending" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Button size="small" onClick={() => setReturnLineStatus(req.id, (it as any).lineId!, "approved")}>Одобрить строку (демо)</Button>
                            <Button size="small" variant="secondary" onClick={() => setReturnLineStatus(req.id, (it as any).lineId!, "rejected")}>Отклонить строку (демо)</Button>
                          </div>
                        )}
                      </div>
                      <div className="mini-item__price">
                        {(it.unitPriceCents * it.qty / 100).toLocaleString(locale, { style: "currency", currency: req.currency })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        </div>

        {req.customerNote && (
          <section>
            <h3>Comment</h3>
            <p>{req.customerNote}</p>
          </section>
        )}

        {/* Имитация жизненного цикла/кнопок для демо */}
        <div className={styles.orderActions}>
          {req.status === "submitted" && (
            <Button size="small" onClick={() => setReturnStatus(req.id, "approved")}>Одобрить (демо)</Button>
          )}
          {req.status === "approved" && (
            <Button size="small" onClick={() => setReturnStatus(req.id, "label_issued")}>Сформировать этикетку (демо)</Button>
          )}
          {req.status === "label_issued" && (
            <Button size="small" onClick={() => setReturnStatus(req.id, "in_transit")}>Передано перевозчику (демо)</Button>
          )}
          {req.status === "in_transit" && (
            <Button size="small" onClick={() => setReturnStatus(req.id, "received")}>Получено складом (демо)</Button>
          )}
          {req.status === "received" && (
            <Button size="small" variant="secondary" onClick={() => setReturnStatus(req.id, "refunded")}>Возврат средств (демо)</Button>
          )}
        </div>
    </section>
    </main >
  );
}
