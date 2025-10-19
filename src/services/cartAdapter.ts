// FILE: src/services/cartAdapter.ts
import type { CartLine } from "../context/CartContext";
import type { Product, ProductVariant } from "../types/product";
import { parseEuroToCents } from "../utils/money";

function buildTitle(product: Product, variant?: ProductVariant): string {
    const base = product.name;
    const opts = variant?.options ? Object.values(variant.options) : [];
    return opts.length ? `${base} • ${opts.join(" / ")}` : base;
}

function pickImage(product: Product, variant?: ProductVariant): string | undefined {
    return variant?.images?.[0] || product.images?.[0] || product.imageUrl;
}

export function toCartLine(product: Product, variant?: ProductVariant, qty = 1): CartLine {
    const raw = (variant?.price ?? product.price) as unknown;
    const cents = parseEuroToCents(raw);
    const id = `${product.id}:${variant?.id ?? "base"}`;
    return {
        id,
        productId: String(product.id),
        variantId: variant?.id,
        title: buildTitle(product, variant),
        image: pickImage(product, variant),
        priceCents: cents,
        qty,
    };
}