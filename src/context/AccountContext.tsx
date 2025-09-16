// src/context/AccountContext.tsx
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

export const ACCOUNT_STORAGE_KEY = "mp_account_demo_eu_v1";

type AccountCtx = {
    account: Account;
    setAccount: React.Dispatch<React.SetStateAction<Account>>;
    reset: () => void;

    // Удобные доменные экшены:
    upsertAddress: (a: Address) => void;
    removeAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
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

    // по желанию: синхронизация между вкладками
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === storageKey && e.newValue) {
                try {
                    const next = JSON.parse(e.newValue) as Account;
                    setAccount((curr) =>
                        JSON.stringify(curr) === e.newValue ? curr : next
                    );
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
        () => ({ account, setAccount, reset, upsertAddress, removeAddress, setDefaultAddress }),
        [account, reset, upsertAddress, removeAddress, setDefaultAddress]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAccount must be used within <AccountProvider>");
    return ctx;
}
