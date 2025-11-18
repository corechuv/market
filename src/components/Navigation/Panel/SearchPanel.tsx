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
import ScrollArea from "../../UI/ScrollArea/ScrollArea";
import { useVisualViewport } from "../../../hooks/useViewportUnits";
import api from "../../..//lib/api"; // путь подправь под свою структуру
import { listReelsFeed } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import { Tabs, type TabItem } from "../../UI/Tabs";
import ReelsGrid from "../../User/Tabs/ReelsGrid";

export interface SearchItem {
  id: string;
  label: string;
}

type SearchTabKey = "products" | "people" | "videos";

type PersonSearchItem = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
};

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
  useVisualViewport();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SearchTabKey>("products");

  // ----- ТОВАРЫ -----
  const [items, setItems] = useState<SearchItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setProductsLoading(true);
        setProductsLoadError(null);

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
        if (!cancelled) setProductsLoadError("Не удалось загрузить каталог");
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ----- ЛЮДИ -----
  const [people, setPeople] = useState<PersonSearchItem[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  // ----- ВИДЕО (reels) -----
  const [videos, setVideos] = useState<ReviewOut[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const listboxId = useId();

  const productResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 50);
  }, [query, items]);

  const peopleResults = people;
  const videoResults = videos;

  const tabItems = useMemo<TabItem<SearchTabKey>[]>(
    () => [
      { key: "products", label: "Goods" },
      { key: "people", label: "People" },
      { key: "videos", label: "Videos" },
    ],
    []
  );

  // отдельный activeIndex для каждой вкладки
  const [activeIndexByTab, setActiveIndexByTab] = useState<
    Record<SearchTabKey, number>
  >({
    products: -1,
    people: -1,
    videos: -1,
  });

  const activeIndex = activeIndexByTab[activeTab];

  const setActiveIndexForTab = useCallback(
    (tab: SearchTabKey, idx: number) => {
      setActiveIndexByTab((prev) => ({ ...prev, [tab]: idx }));
    },
    []
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const resetAndClose = useCallback(() => {
    onClose();
    setQuery("");
    setActiveIndexByTab({
      products: -1,
      people: -1,
      videos: -1,
    });
  }, [onClose]);

  // ==== сетка загрузки для people / videos (дебаунс по query) ====

  // ЛЮДИ
  useEffect(() => {
    if (activeTab !== "people") return;

    const q = query.trim();
    if (!q) {
      setPeople([]);
      setPeopleError(null);
      setPeopleLoading(false);
      return;
    }

    let cancelled = false;
    setPeopleLoading(true);
    setPeopleError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const { data } = await api.get("/profiles/search", {
          params: { q, limit: 20 },
        });
        if (cancelled) return;
        const mapped: PersonSearchItem[] = (Array.isArray(data) ? data : [])
          .map((p: any) => {
            const fullName = [p.firstName, p.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();
            return {
              id: String(p.id),
              username: String(p.username || ""),
              name: fullName || p.username || "",
              avatarUrl: p.avatarUrl ?? null,
            };
          })
          .filter((x) => x.username);
        setPeople(mapped);
      } catch {
        if (!cancelled) {
          setPeopleError("Не удалось загрузить пользователей");
          setPeople([]);
        }
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, query]);

  // ВИДЕО
  useEffect(() => {
    if (activeTab !== "videos") return;

    const q = query.trim();
    if (!q) {
      setVideos([]);
      setVideosError(null);
      setVideosLoading(false);
      return;
    }

    let cancelled = false;
    setVideosLoading(true);
    setVideosError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await listReelsFeed({ q, sort: "trending", limit: 40 });
        if (!cancelled) setVideos(data);
      } catch {
        if (!cancelled) {
          setVideosError("Не удалось загрузить видео");
          setVideos([]);
        }
      } finally {
        if (!cancelled) setVideosLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, query]);

  const moveActive = useCallback(
    (dir: 1 | -1) => {
      const len =
        activeTab === "products"
          ? productResults.length
          : activeTab === "people"
            ? peopleResults.length
            : videoResults.length;

      if (len === 0) return;

      setActiveIndexByTab((prev) => {
        const cur = prev[activeTab] ?? -1;
        let next = cur < 0 ? (dir === 1 ? 0 : len - 1) : cur + dir;
        if (next < 0) next = len - 1;
        if (next >= len) next = 0;
        return { ...prev, [activeTab]: next };
      });
    },
    [activeTab, productResults.length, peopleResults.length, videoResults.length]
  );

  const onSelectProduct = useCallback(
    (item: SearchItem) => {
      navigate(`/product/${item.id}`);
      resetAndClose();
    },
    [navigate, resetAndClose]
  );

  const onSelectPerson = useCallback(
    (item: PersonSearchItem) => {
      // TODO: подправь под свой роут профиля
      navigate(`/u/${item.username}`);
      resetAndClose();
    },
    [navigate, resetAndClose]
  );

  const onSelectVideo = useCallback(
    (item: ReviewOut) => {
      // TODO: подправь под свой роут просмотра ролика
      navigate(`/reels/${item.id}`);
      resetAndClose();
    },
    [navigate, resetAndClose]
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "Enter") {
      const idx = activeIndexByTab[activeTab];
      const collection =
        activeTab === "products"
          ? productResults
          : activeTab === "people"
            ? peopleResults
            : videoResults;

      const chosen =
        idx >= 0 ? collection[idx as number] : collection[0 as number];
      if (!chosen) return;

      if (activeTab === "products") {
        onSelectProduct(chosen as SearchItem);
      } else if (activeTab === "people") {
        onSelectPerson(chosen as PersonSearchItem);
      } else {
        onSelectVideo(chosen as ReviewOut);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const activeResultsLength =
    activeTab === "products"
      ? productResults.length
      : activeTab === "people"
        ? peopleResults.length
        : videoResults.length;

  const searchLoading =
    activeTab === "products"
      ? productsLoading
      : activeTab === "people"
        ? peopleLoading
        : videosLoading;

  const searchError =
    activeTab === "products"
      ? productsLoadError
      : activeTab === "people"
        ? peopleError
        : videosError;

  return (
    <section
      id="search-panel"
      role="region"
      aria-label="Search"
      data-panel="search"
      data-anchor={anchorRole}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={c.g}
    >
      <div className={c.content}>
        <MasterBar title="Search" includeBars background="var(--n-bg-desktop)">
          <SearchField
            ref={inputRef}
            value={query}
            onChange={(value: string) => {
              setQuery(value);
              // при наборе всегда сбрасываем activeIndex текущей вкладки
              setActiveIndexForTab(activeTab, -1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Start typing..."
            aria-label="Search bar"
            aria-controls={listboxId}
            aria-expanded={searchLoading || activeResultsLength > 0}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
            }
            loading={searchLoading}
            error={searchError}
            resultsLength={activeResultsLength}
          />
          <Tabs<SearchTabKey>
            items={tabItems}
            activeKey={activeTab}
            onChange={(k) => {
              setActiveTab(k);
              // сбрасываем активный элемент новой вкладки
              setActiveIndexForTab(k, -1);
            }}
            ariaLabel="Search type"
          />
        </MasterBar>

        <ScrollArea>
          {activeTab === "products" && (
            <SearchResultsList
              items={productResults}
              getKey={(x) => x.id}
              getLabel={(x) => x.label}
              onSelect={(item) => onSelectProduct(item)}
              loading={productsLoading}
              role="listbox"
              ariaLabel="Search results: products"
              listId={listboxId}
              skeletonRows={6}
              activeIndex={activeIndexByTab.products}
              onActiveIndexChange={(idx) =>
                setActiveIndexForTab("products", idx)
              }
            />
          )}

          {activeTab === "people" && (
            <ul
              className={c.list}
              id={listboxId}
              role="listbox"
              aria-label="Search results: people"
            >
              {peopleLoading && !peopleResults.length && (
                <li>Загрузка...</li>
              )}
              {!peopleLoading && !searchError && query.trim() && !peopleResults.length && (
                <li>Ничего не найдено</li>
              )}
              {searchError && <li>{searchError}</li>}

              {peopleResults.map((p, i) => (
                <li
                  key={p.id || p.username}
                  id={`${listboxId}-opt-${i}`}
                  className={c.list__item}
                  role="option"
                  aria-selected={activeIndexByTab.people === i}
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    onSelectPerson(p);
                  }}
                  onMouseEnter={() => setActiveIndexForTab("people", i)}
                >
                  {p.avatarUrl && (
                    <img
                      className={c["list__item--photo"]}
                      alt=""
                    />
                  )}
                  <div className={c["list__item--col"]}>
                    <span className={c["list__item--label"]}
                      data-search="item-label" title={p.name}>{p.name}</span>
                    {p.username && (
                      <span className={c["list__item--label--s"]}
                        data-search="item-label" title={p.username}>@{p.username}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "videos" && (
            <div
              id={listboxId}
              role="listbox"
              aria-label="Search results: videos"
            >
              <ReelsGrid
                items={videoResults}
                emptyText={
                  searchError
                    ? searchError
                    : videosLoading
                      ? "Загрузка..."
                      : query.trim()
                        ? "Ничего не найдено"
                        : "Начните вводить, чтобы найти видео-отзывы"
                }
                onItemClick={(review) => {
                  // используем уже готовый хендлер
                  onSelectVideo(review);
                }}
                layout="search"
              />
            </div>
          )}
        </ScrollArea>
      </div>
    </section>
  );
};

export default SearchPanel;
