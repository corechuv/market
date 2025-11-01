// src/pages/Search/ModileSearchPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./MobileSearchPage.module.scss";
import { getProducts } from "../../services/productService";
import SearchField from "../../components/UI/SearchField";
import Page from "../../components/UI/Page/Page";

type ProductLike = { id: string | number; name?: string; title?: string };

export default function ModileSearchPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const qParam = params.get("q") ?? "";

    const [query, setQuery] = useState(qParam);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ProductLike[]>([]);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Фокус в поле при заходе на страницу
    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(t);
    }, []);

    // Дебаунс: пишем q в URL и запускаем поиск
    useEffect(() => {
        const h = setTimeout(() => {
            const next = new URLSearchParams(params);
            if (query.trim()) next.set("q", query.trim());
            else next.delete("q");
            // Не триггерим push при одинаковых значениях
            if (next.toString() !== params.toString()) setParams(next, { replace: false });

            void runSearch(query.trim());
        }, 250);
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    // Синхронизация, если q меняют руками в адресной строке/ссылке
    useEffect(() => {
        if (qParam !== query) setQuery(qParam);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qParam]);

    async function runSearch(q: string) {
        setLoading(true);
        setError(null);
        try {
            const maybe = (getProducts as any)({ search: q, sort: "name" });
            const list = Array.isArray(maybe) ? maybe : await maybe;

            const arr = Array.isArray(list)
                ? list
                : (list?.items ?? list?.data ?? list?.products ?? []);

            const mapped: ProductLike[] = (Array.isArray(arr) ? arr : [])
                .map((p: any) => ({
                    id: p?.id ?? p?.productId ?? "",
                    name: p?.name ?? p?.title ?? "",
                }))
                .filter((p) => p.id && (p.name ?? "").trim());

            setItems(mapped);
        } catch (e: any) {
            setItems([]);
            setError(e?.message ?? "Не удалось выполнить поиск");
        } finally {
            setLoading(false);
        }
    }

    const results = useMemo(() => {
        // Если бэкенд не умеет search, подстрахуемся фильтром по клиенту
        const q = (query || "").trim().toLowerCase();
        if (!q) return [];
        return items.filter((i) => (i.name ?? "").toLowerCase().includes(q));
    }, [items, query]);

    const smartBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/"); // прямой заход на /search
    };

    return (
        <Page padding={false}>
            <div className={styles.page} role="search">
                <SearchField
                    ref={inputRef}
                    value={query}
                    onChange={setQuery}
                    placeholder="Start typing..."
                    aria-label="Search"
                    onEnter={() => {
                        if (results[0]) navigate(`/product/${results[0].id}`);
                    }}
                    onEscape={smartBack}
                    loading={loading}
                    error={error}
                    resultsLength={results.length}
                />

                <ul className={styles.list} role="listbox" aria-label="Search results">
                    {loading && <SkeletonRows />}
                    {!loading &&
                        results.map((p) => (
                            <li
                                key={String(p.id)}
                                className={styles.list__item}
                                role="option"
                                tabIndex={0}
                                onClick={() => navigate(`/product/${p.id}`)}
                                onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${p.id}`)}
                            >
                                <span className={styles.itemLabel}>{p.name}</span>
                            </li>
                        ))}
                </ul>
            </div>
        </Page>
    );
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className={`${styles.list__item}`}>
                    <span className={`${styles.skeleton}`}>&nbsp;</span>
                </li>
            ))}
        </>
    );
}
