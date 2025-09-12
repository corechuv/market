// 6.1) components/header/MobileSearch.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MobileSearch.module.scss";
import SearchIcon from "../Icons/SearchIcon";
import { createPortal } from "react-dom";
import { getProducts } from "../../services/productService";
import CloseIcon from "../Icons/CloseIcon";

export interface SearchItem { id: string; label: string; }

interface MobileSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
        const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
        setIsMobile(mql.matches);
        mql.addEventListener ? mql.addEventListener("change", onChange as any) : mql.addListener(onChange as any);
        return () => {
            mql.removeEventListener ? mql.removeEventListener("change", onChange as any) : mql.removeListener(onChange as any);
        };
    }, [breakpoint]);
    return isMobile;
}

const MobileSearchModal: React.FC<MobileSearchModalProps> = ({ open, onOpenChange }) => {
    const isMobile = useIsMobile(768);
    const items: SearchItem[] = useMemo(() => getProducts().map((p: any) => ({ id: String(p.id), label: String(p.name) })), []);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Блокируем скролл и фокусируем инпут при открытии
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = setTimeout(() => inputRef.current?.focus(), 0);
        return () => { document.body.style.overflow = prev; clearTimeout(t); };
    }, [open]);

    // Синхронизация с кнопкой «назад» в браузере
    useEffect(() => {
        if (!open) return;
        const url = new URL(window.location.href);
        url.searchParams.set("search", "1");
        const state = { searchModal: true };
        window.history.pushState(state, "", url.toString());
        const onPop = () => onOpenChange(false);
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [open, onOpenChange]);

    // Обновление результатов
    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (!q) { setResults([]); return; }
        setResults(items.filter(i => i.label.toLowerCase().includes(q)).slice(0, 50));
    }, [query, items]);

    const close = () => {
        if (!open) return;
        onOpenChange(false);
        const url = new URL(window.location.href);
        if (url.searchParams.get("search") === "1") {
            // вернёмся на предыдущую запись истории (которую добавили при открытии)
            window.history.back();
        }
    };

    const onSelect = (item: SearchItem) => {
        // Навигацию на страницу товара оставьте в месте, где используете модалку,
        // либо импортируйте useNavigate здесь. Чтобы модалка была переиспользуемой,
        // просто диспатчим кастомное событие.
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: { to: `/product/${item.id}` } }));
        close();
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Escape") close();
        if (e.key === "Enter" && results[0]) onSelect(results[0]);
    };

    if (!open) return null;
    return createPortal(
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Поиск по каталогу" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div className={styles.topbar}>
                <button className={styles.backBtn} aria-label="Закрыть" onClick={close}>
                    <CloseIcon className={styles.backBtn__icon} />
                </button>
                <div className={styles.inputWrap}>
                    <SearchIcon className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="search"
                        inputMode="search"
                        placeholder="Поиск товаров"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        aria-label="Строка поиска"
                    />
                    {query && <button className={styles.clearBtn} onClick={() => setQuery("")}>Очистить</button>}
                </div>
            </div>

            <div className={styles.content}>
                {!query && <div className={styles.placeholder}>Начните вводить, чтобы увидеть результаты</div>}
                {query && (
                    <>
                        <div className={styles.count}>{results.length > 0 ? `${results.length} результатов` : "Ничего не найдено"}</div>
                        <ul className={styles.list} role="listbox">
                            {results.map((item) => (
                                <li key={item.id} className={styles.listItem} role="option" tabIndex={0}
                                    onClick={() => onSelect(item)}
                                    onKeyDown={(e) => { if (e.key === "Enter") onSelect(item); }}>
                                    <span className={styles.itemLabel}>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default MobileSearchModal;
