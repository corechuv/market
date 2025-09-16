import React from "react";

export type CartLine = {
    /** Stable cart line id (product + variant) */
    id: string;
    productId: string;
    variantId?: string;
    title: string;
    image?: string;
    /** Price in cents, GROSS (incl. VAT) */
    priceCents: number;
    qty: number;
};


export type CartState = {
    lines: CartLine[];
    add: (line: CartLine) => void;
    setQty: (id: string, qty: number) => void;
    inc: (id: string, delta: number) => void;
    remove: (id: string) => void;
    clear: () => void;
};


const LS_KEY = "cart_v1";


function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}


function readLS(): CartLine[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
        return [];
    }
}


function writeLS(lines: CartLine[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(lines)); } catch { }
}


const Ctx = React.createContext<CartState | null>(null);


export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [lines, setLines] = React.useState<CartLine[]>(() => readLS());


    React.useEffect(() => { writeLS(lines); }, [lines]);


    const add: CartState["add"] = (line) => {
        setLines((prev) => {
            const i = prev.findIndex((x) => x.id === line.id);
            if (i >= 0) {
                const copy = [...prev];
                copy[i] = { ...copy[i], qty: clamp(copy[i].qty + line.qty, 1, 99) };
                return copy;
            }
            return [...prev, { ...line, qty: clamp(line.qty, 1, 99) }];
        });
    };


    const setQty: CartState["setQty"] = (id, qty) => {
        setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: clamp(qty, 0, 99) } : l)).filter((l) => l.qty > 0));
    };


    const inc: CartState["inc"] = (id, delta) => setQty(id, (lines.find((l) => l.id === id)?.qty ?? 0) + delta);


    const remove: CartState["remove"] = (id) => setLines((prev) => prev.filter((l) => l.id !== id));


    const clear: CartState["clear"] = () => setLines([]);


    const value: CartState = { lines, add, setQty, inc, remove, clear };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};


export function useCart() {
    const ctx = React.useContext(Ctx);
    if (!ctx) throw new Error("useCart must be used within <CartProvider>");
    return ctx;
}