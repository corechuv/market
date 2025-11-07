// src/components/Search/SearchPanel.tsx
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../../services/productService";
import c from "./SearchPanel.module.scss";
import SearchField from "../../UI/SearchField";
import SearchResultsList from "../../Search/SearchResultsList";
import MasterBar from "../../UI/Bars/MasterBar";

export interface SearchItem {
  id: string;
  label: string;
}

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRole?: "search";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  open,
  onClose,
  anchorRole = "search",
  onMouseEnter,
  onMouseLeave,
}) => {
  const navigate = useNavigate();

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const maybe = (getProducts as any)({ sort: "name" });
        const list = Array.isArray(maybe) ? maybe : await maybe;

        const arr = Array.isArray(list)
          ? list
          : (list?.items ?? list?.data ?? list?.products ?? []);

        const mapped: SearchItem[] = (Array.isArray(arr) ? arr : [])
          .map((p: any) => ({
            id: String(p?.id ?? p?.productId ?? ""),
            label: String(p?.name ?? p?.title ?? ""),
          }))
          .filter((x) => x.id && x.label);

        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setLoadError("Не удалось загрузить каталог");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [query, setQuery] = useState("");
  const listboxId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(i => i.label.toLowerCase().includes(q)).slice(0, 50);
  }, [query, items]);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const moveActive = useCallback((dir: 1 | -1) => {
    if (results.length === 0) return;
    setActiveIndex((prev) => {
      const next = prev < 0 ? (dir === 1 ? 0 : results.length - 1) : prev + dir;
      if (next < 0) return results.length - 1;
      if (next >= results.length) return 0;
      return next;
    });
  }, [results]);

  const onSelect = useCallback((item: SearchItem) => {
    navigate(`/product/${item.id}`);
    onClose();
    setQuery("");
    setActiveIndex(-1);
  }, [navigate, onClose]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter") {
      const chosen = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (chosen) onSelect(chosen);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); return; }
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    <section
      id="search-panel"                 // для aria-controls у кнопки
      role="region"
      aria-label="Search the catalog"
      data-panel="search"
      data-anchor={anchorRole}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={c.g}
    >
      <MasterBar title="Search" includeBars background="var(--n-bg-desktop)">
        <SearchField
          ref={inputRef}
          value={query}
          onChange={(value: string) => { setQuery(value); setActiveIndex(-1); }}
          onKeyDown={onKeyDown}
          placeholder="Start typing..."
          aria-label="Search bar"
          aria-controls={listboxId}
          aria-expanded={loading || results.length > 0}   // <-- учитываем загрузку
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          loading={loading}
          error={loadError}
          resultsLength={results.length}
        />
      </MasterBar>
      <SearchResultsList
        items={results}
        getKey={(x) => x.id}
        getLabel={(x) => x.label}
        onSelect={(item) => onSelect(item)}
        loading={loading}
        role="listbox"
        ariaLabel="Search results"
        listId={listboxId}
        skeletonRows={6}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    </section>
  );
};

export default SearchPanel;
