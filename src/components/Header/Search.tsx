import React, { useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import styles from "./Search.module.scss";
import SearchIcon from "../Icons/SearchIcon";

interface SearchProps {
    /**
     * Array of strings (or objects you map to strings) that you want to search through.
     * In a real‑world app you might fetch suggestions from an API instead.
     */
    data: string[];
    /**
     * Maximum number of results to display (default 10)
     */
    limit?: number;
    /** Called when the user selects a result */
    onSelect?: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({ data, limit = 10, onSelect }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter results whenever query changes
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const next = data.filter((item) => item.toLowerCase().includes(q)).slice(0, limit);
        setResults(next);
    }, [query, data, limit]);

    // Close dropdown if clicked outside of component
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOpen = () => {
        setOpen((prev) => !prev);
        if (!open) {
            // next tick so styles can animate
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

    const handleSelect = (value: string) => {
        onSelect?.(value);
        setQuery(value);
        setOpen(false);
    };

    // Keep dropdown open while input is focused; close after leaving both input & results
    const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
        // Delay so click on result can register first
        requestAnimationFrame(() => {
            if (!wrapperRef.current?.contains(document.activeElement)) {
                setOpen(false);
            }
        });
    };

    return (
        <div
            ref={wrapperRef}
            className={styles.wrapper}
            onMouseEnter={() => setOpen(true)}
            onBlur={handleBlur}
        >
            <button className={styles.iconButton} onClick={toggleOpen} aria-label="Search">
                <SearchIcon className={styles.icon} />
            </button>

            <input
                ref={inputRef}
                className={`${styles.input} ${open ? styles.inputOpen : ""}`}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Start typing…"
            />

            {open && results.length > 0 && (
                <div className={styles.panel}>
                    <ul className={styles.dropdown} role="listbox">
                        {results.map((res, i) => (
                            <li
                                key={i}
                                tabIndex={0}
                                className={styles.item}
                                onClick={() => handleSelect(res)}
                                role="option"
                            >
                                {res}
                            </li>
                        ))}
                    </ul>
                    <div className={styles.footer}>
                        <span className={styles.count}>
                            {results.length} result{results.length > 1 ? "s" : ""}
                        </span>
                        <a href={`/search?q=${encodeURIComponent(query)}`} className={styles.footer__link}>
                            See all results
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;