// src/context/AccountContext.tsx
{/*
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Account } from "../types/account";
import type { Address } from "../types/address";
import { account as demoAccount } from "../data/account";
import type { Carriers } from "../types/delivery/carrier";
import type { ReturnLabel, ReturnRequest, ReturnStatus, ReturnLineStatus } from "../types/return";

import { toDataURL as qrToDataURL } from "qrcode";

export const ACCOUNT_STORAGE_KEY = "mp_account_demo_eu_v1";

type AccountCtx = {
  account: Account;
  setAccount: React.Dispatch<React.SetStateAction<Account>>;
  reset: () => void;

  // Адреса
  upsertAddress: (a: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Возвраты (заявки и строки)
  upsertReturn: (r: ReturnRequest) => void;
  setReturnStatus: (id: string, status: ReturnStatus) => void;
  setReturnLineStatus: (requestId: string, lineId: string, status: ReturnLineStatus) => void;
  issueReturnLabel: (requestId: string, mode?: "qr" | "pdf", carrier?: Carriers) => Promise<void>;
};

const Ctx = createContext<AccountCtx | undefined>(undefined);

export function AccountProvider({
  children,
  storageKey = ACCOUNT_STORAGE_KEY,
  initial = demoAccount,
}: {
  children: React.ReactNode;
  storageKey?: string;
  initial?: Account;
}) {
  // лениво читаем из localStorage (без SSR-ошибок)
  const [account, setAccount] = useState<Account>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Account) : initial;
    } catch {
      return initial;
    }
  });

  // сохраняем при изменениях
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(account));
    } catch { }
  }, [account, storageKey]);

  // синхронизация между вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as Account;
          setAccount((curr) => (JSON.stringify(curr) === e.newValue ? curr : next));
        } catch { }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const reset = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch { }
    setAccount(initial);
  }, [storageKey, initial]);

  const upsertAddress = React.useCallback((addr: Address) => {
    setAccount((prev) => {
      let addrs = [...prev.addresses];
      const i = addrs.findIndex((a) => a.id === addr.id);
      if (addr.isDefault) addrs = addrs.map((a) => ({ ...a, isDefault: a.id === addr.id }));
      if (i >= 0) addrs[i] = addr;
      else addrs.unshift(addr);
      return { ...prev, addresses: addrs };
    });
  }, []);

  const removeAddress = React.useCallback((id: string) => {
    setAccount((prev) => ({ ...prev, addresses: prev.addresses.filter((a) => a.id !== id) }));
  }, []);

  const setDefaultAddress = React.useCallback((id: string) => {
    setAccount((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }));
  }, []);

  const value = useMemo(
    () => ({
      account,
      setAccount,
      reset,
      upsertAddress,
      removeAddress,
      setDefaultAddress,

      upsertReturn: (r: ReturnRequest) =>
        setAccount((prev) => {
          const list = [...(prev.returns || [])];
          const i = list.findIndex((x) => x.id === r.id);
          if (i >= 0) list[i] = r;
          else list.unshift(r);
          return { ...prev, returns: list };
        }),

      setReturnStatus: (id: string, status: ReturnStatus) =>
        setAccount((prev) => ({
          ...prev,
          returns: (prev.returns || []).map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      setReturnLineStatus: (requestId: string, lineId: string, status: ReturnLineStatus) =>
        setAccount((prev) => ({
          ...prev,
          returns: (prev.returns || []).map((r) =>
            r.id !== requestId
              ? r
              : { ...r, items: r.items.map((l) => (l.lineId === lineId ? { ...l, status } : l)) }
          ),
        })),

      issueReturnLabel: async (requestId: string, mode: "qr" | "pdf" = "qr", carrier: Carriers = "DHL") => {
        // найдём возврат
        const current = account.returns.find((r) => r.id === requestId);
        if (!current) return;

        // демо-трек-номер и payload (в реале берёте из API перевозчика/агрегатора)
        const trackingNumber = `9${Math.floor(1e13 + Math.random() * 9e13)}`; // 14-15 цифр
        const payload = JSON.stringify({
          rma: current.rma,
          order: current.orderNumber,
          carrier,
          trackingNumber,
          // можно добавить адрес возврата/почтовый индекс для in-person печати
        });

        let qrDataUrl: string | undefined;
        if (mode === "qr") {
          try {
            qrDataUrl = await qrToDataURL(payload, { margin: 0, width: 320 });
          } catch (e) {
            // fail-safe: без QR — всё равно сохраним payload
            qrDataUrl = undefined;
          }
        }

        // простая «этикетка» как PNG dataURL (демо), чтобы было что скачать/показать
        // в реальном мире здесь будет URL на PDF/ZPL от перевозчика
        let labelUrl: string | undefined;
        if (mode === "pdf") {
          // Сгенерируем простую PNG-этикетку на canvas (чтобы было что скачать)
          labelUrl = makePngLabelDataUrl({
            title: `RETURN • ${carrier}`,
            rma: current.rma,
            order: current.orderNumber,
            trackingNumber,
          });
        }

        const label: ReturnLabel = {
          kind: mode === "qr" ? "qr" : "pdf",
          carrier,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          trackingNumber,
          labelUrl,
          qrPayload: payload,
          qrDataUrl,
          dropoffHint: carrier === "DHL" ? "Сдайте в DHL Filiale/Packstation, покажите QR" : undefined,
        };

        // применим в стейт
        setAccount((prev) => ({
          ...prev,
          returns: (prev.returns || []).map((r) =>
            r.id === requestId ? { ...r, label, status: "label_issued" } : r
          ),
        }));
      },
    }),
    [account, reset, upsertAddress, removeAddress, setDefaultAddress]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount must be used within <AccountProvider>");
  return ctx;
}

function makePngLabelDataUrl({
  title,
  rma,
  order,
  trackingNumber,
}: { title: string; rma: string; order: string; trackingNumber?: string }) {
  // 800x1200 ~ «4x6 дюймов» в грубом приближении для демо
  const w = 800, h = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.font = "bold 40px system-ui, -apple-system, Segoe UI, Roboto";
  ctx.fillText(title, 40, 80);
  ctx.font = "32px system-ui, -apple-system, Segoe UI, Roboto";
  ctx.fillText(`RMA: ${rma}`, 40, 150);
  ctx.fillText(`Order: ${order}`, 40, 200);
  if (trackingNumber) ctx.fillText(`Tracking: ${trackingNumber}`, 40, 250);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  return canvas.toDataURL("image/png");
}
*/}