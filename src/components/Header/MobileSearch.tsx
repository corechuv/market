// components/header/MobileSearch.tsx
import React, {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import styles from "./MobileSearch.module.scss";
import SearchIcon from "../Icons/SearchIcon";
import { createPortal } from "react-dom";
import { getProducts } from "../../services/productService";
import CloseIcon from "../Icons/CloseIcon";
import SearchInput from "../UI/SearchInput";

export interface SearchItem {
    id: string;
    label: string;
}

interface MobileSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Определяет мобильный вьюпорт; безопасно для SSR. */
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

        setIsMobile(mql.matches);

        if ("addEventListener" in mql) {
            mql.addEventListener("change", handler);
            return () => mql.removeEventListener("change", handler);
        } else {
            // @ts-expect-error: для старых браузеров
            mql.addListener(handler);
            // @ts-expect-error: для старых браузеров
            return () => mql.removeListener(handler);
        }
    }, [breakpoint]);

    return isMobile;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
    open,
    onOpenChange,
}) => {
    const isMobile = useIsMobile(768);
    const canUseDOM =
        typeof window !== "undefined" && typeof document !== "undefined";

    const items: SearchItem[] = useMemo(
        () =>
            getProducts().map((p: { id: string | number; name: string }) => ({
                id: String(p.id),
                label: String(p.name),
            })),
        []
    );

    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return items
            .filter((i) => i.label.toLowerCase().includes(q))
            .slice(0, 50);
    }, [query, items]);

    const close = useCallback(() => {
        if (!canUseDOM) return;
        if (!open) return;

        onOpenChange(false);

        // Откатываем историю, если мы её пушили при открытии
        const url = new URL(window.location.href);
        if (url.searchParams.get("search") === "1") {
            window.history.back();
        }
    }, [canUseDOM, open, onOpenChange]);

    const onSelect = useCallback(
        (item: SearchItem) => {
            if (!canUseDOM) return;
            window.dispatchEvent(
                new CustomEvent("app:navigate", {
                    detail: { to: `/product/${item.id}` },
                })
            );
            close();
        },
        [canUseDOM, close]
    );

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Escape") close();
        if (e.key === "Enter" && results[0]) onSelect(results[0]);
    };

    // Автозакрытие, если ушли с мобилки на десктоп
    useEffect(() => {
        if (open && !isMobile) close();
    }, [isMobile, open, close]);

    // Блокируем скролл и фокусируем инпут при открытии
    useEffect(() => {
        if (!canUseDOM) return;
        if (!open || !isMobile) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = window.setTimeout(() => inputRef.current?.focus(), 0);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.clearTimeout(t);
        };
    }, [open, isMobile, canUseDOM]);

    // Синхронизация с кнопкой «назад» в браузере
    useEffect(() => {
        if (!canUseDOM) return;
        if (!open || !isMobile) return;

        const url = new URL(window.location.href);
        url.searchParams.set("search", "1");
        const state = { searchModal: true as const };
        window.history.pushState(state, "", url.toString());

        const onPop = () => onOpenChange(false);
        window.addEventListener("popstate", onPop);

        return () => window.removeEventListener("popstate", onPop);
    }, [open, isMobile, onOpenChange, canUseDOM]);

    // Не рендерим на сервере, на десктопе и когда закрыто
    if (!canUseDOM || !open || !isMobile) return null;

    return createPortal(
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="Поиск по каталогу"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div className={styles.topbar}>
                <button
                    className={styles.backBtn}
                    aria-label="Закрыть"
                    onClick={close}
                    type="button"
                >
                    <CloseIcon className={styles.backBtn__icon} />
                </button>

                <SearchInput
                    ref={inputRef}
                    value={query}
                    onChange={setQuery}
                    placeholder="Поиск товаров"
                    aria-label="Строка поиска"
                    aria-controls={listboxId}
                    wrapperClassName={styles.inputWrap}
                    inputClassName={styles.input}
                    clearButtonClassName={styles.clearBtn}
                    leftIcon={<SearchIcon className={styles.searchIcon} />}
                    onEnter={() => results[0] && onSelect(results[0])}
                    onEscape={close}
                    onKeyDown={onKeyDown}
                />
            </div>

            <div className={styles.content}>
                {!query && (
                    <div className={styles.placeholder}>
                        Начните вводить, чтобы увидеть результаты
                    </div>
                )}

                {query && (
                    <>
                        <div className={styles.count}>
                            {results.length > 0
                                ? `${results.length} результатов`
                                : "Ничего не найдено"}
                        </div>

                        <ul
                            id={listboxId}
                            className={styles.list}
                            role="listbox"
                            aria-label="Результаты поиска"
                        >
                            {results.map((item) => (
                                <li
                                    key={item.id}
                                    className={styles.listItem}
                                    role="option"
                                    tabIndex={0}
                                    onClick={() => onSelect(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") onSelect(item);
                                    }}
                                >
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

export default MobileSearch;
