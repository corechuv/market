// src/pages/Search/ModileSearchPage.tsx
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./MobileSearchPage.module.scss";
import { getProducts } from "../../services/productService";
import SearchField from "../../components/UI/SearchField";
import Page from "../../components/UI/Page/Page";
import SearchResultsList from "../../components/Search/SearchResultsList";
import MasterBar from "../../components/UI/Bars/MasterBar";

type ProductLike = { id: string | number; name?: string; title?: string };

export default function MobileSearchPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const qParam = params.get("q") ?? "";

    const [query, setQuery] = useState(qParam);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ProductLike[]>([]);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId(); // чтобы связать поле и список

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const h = setTimeout(() => {
            const next = new URLSearchParams(params);
            if (query.trim()) next.set("q", query.trim());
            else next.delete("q");
            if (next.toString() !== params.toString()) setParams(next, { replace: false });

            void runSearch(query.trim());
        }, 250);
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

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
        const q = (query || "").trim().toLowerCase();
        if (!q) return [];
        return items.filter((i) => (i.name ?? "").toLowerCase().includes(q)).slice(0, 50);
    }, [items, query]);

    const smartBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    const onSelect = (p: ProductLike) => navigate(`/product/${p.id}`);

    return (
        <Page padding={false}>
            <div className={styles.page} role="search">
                <MasterBar title="Search" includeBars>
                    <SearchField
                        ref={inputRef}
                        value={query}
                        onChange={setQuery}
                        placeholder="Start typing..."
                        aria-label="Search"
                        aria-controls={listboxId}                // связь с listbox
                        aria-expanded={results.length > 0}
                        // активного элемента в мобильном варианте нет — aria-activedescendant опускаем
                        onEnter={() => { if (results[0]) onSelect(results[0]); }}
                        onEscape={smartBack}
                        loading={loading}
                        error={error}
                        resultsLength={results.length}
                    />
                </MasterBar>

                <SearchResultsList
                    items={results}
                    getKey={(p) => String(p.id)}
                    getLabel={(p) => String(p.name ?? p.title ?? "")}
                    onSelect={(p) => onSelect(p)}
                    loading={loading}
                    role="listbox"
                    ariaLabel="Search results"
                    listId={listboxId}
                    skeletonRows={6}
                />
            </div>
        </Page>
    );
}
