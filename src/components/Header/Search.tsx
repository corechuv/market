// Search.tsx
import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import styles from "./Search.module.scss";
import SearchIcon from "../Icons/SearchIcon";

export interface SearchItem {
  id: string;
  label: string;
}

interface SearchProps {
  /** Массив элементов для поиска */
  data: SearchItem[];
  /** Максимум результатов */
  limit?: number;
  /** Коллбек при выборе — возвращаем весь объект, чтобы взять id */
  onSelect?: (item: SearchItem) => void;
}

const Search: React.FC<SearchProps> = ({ data, limit = 10, onSelect }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const next = data
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, limit);
    setResults(next);
  }, [query, data, limit]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  const handleSelect = (item: SearchItem) => {
    onSelect?.(item);
    setQuery(item.label);
    setOpen(false);
  };

  const handleBlur = () => {
    requestAnimationFrame(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) setOpen(false);
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
            {results.map((item) => (
              <li
                key={item.id}
                tabIndex={0}
                className={styles.item}
                onClick={() => handleSelect(item)}
                role="option"
              >
                <span className={styles.item__label}>{item.label}</span>
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
