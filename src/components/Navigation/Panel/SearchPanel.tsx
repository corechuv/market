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
import api from "../../../lib/api";
import { listReelsFeed } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import { Tabs, type TabItem } from "../../UI/Tabs";
import ReelsGrid from "../../User/Tabs/ReelsGrid";
import UserResultsList from "../../Search/UsersResultList";
import { buildAvatarSrc } from "../../../utils/avatar";
import ReelsGridSkeleton from "../../User/Tabs/ReelsGrid.Skeleton";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../../utils/useInfiniteList";

const PAGE_SIZE = 50;

export interface SearchItem {
  id: string;
  label: string;
}

type SearchTabKey = "products" | "people" | "videos";

type PersonSearchItem = {
  id: string;
  username: string;
  name: string;
  photoUrl?: string | null;
};

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRole?: "search";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// такой же маппер, как в MobileSearchPage,
// чтобы и десктопный поиск показывал аватары
function mapProfileToPerson(p: any): PersonSearchItem {
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();

  const rawAvatar: string | null =
    p.avatarUrl || p.avatar || p.avatarPath || null;

  const cacheKey: string | null = p.avatarUpdatedAt || p.updatedAt || null;

  return {
    id: String(p.id),
    username: String(p.username || ""),
    name: fullName || String(p.username || ""),
    photoUrl: rawAvatar
      ? buildAvatarSrc(rawAvatar, cacheKey || `${p.id}-${rawAvatar}`)
      : null,
  };
}

// убираем дубли по id
function uniqById(items: SearchItem[]): SearchItem[] {
  const map = new Map<string, SearchItem>();
  for (const it of items) {
    if (!it.id) continue;
    if (!map.has(it.id)) map.set(it.id, it);
  }
  return Array.from(map.values());
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
  const { t } = useTranslation("search");

  const [activeTab, setActiveTab] = useState<SearchTabKey>("products");

  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  // ----- ТОВАРЫ -----
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);

  const loadProductsPage = useCallback(
    async (page: number): Promise<SearchItem[]> => {
      const q = trimmedQuery;
      if (!q) {
        setProductsLoadError(null);
        return [];
      }

      try {
        const list = await getProducts({
          q,
          sort: "new", // новые сверху
          availableOnly: true,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });

        const mapped: SearchItem[] = (Array.isArray(list) ? list : [])
          .map((p: any) => ({
            id: String(p?.id ?? p?.productId ?? ""),
            label: String(p?.name ?? p?.title ?? ""),
          }))
          .filter((x) => x.id && x.label);

        setProductsLoadError(null);
        return uniqById(mapped);
      } catch {
        setProductsLoadError(t("errors.catalog"));
        return [];
      }
    },
    [trimmedQuery, t]
  );

  const {
    items: productResults,
    loading: productsLoading,
    hasMore: hasMoreProducts,
    loadNext: loadNextProducts,
    reset: resetProducts,
  } = useInfiniteList<SearchItem>(loadProductsPage, PAGE_SIZE);

  const productsLoaderRef = useRef<HTMLDivElement | null>(null);

  // ----- ЛЮДИ -----
  const [people, setPeople] = useState<PersonSearchItem[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  // ----- ВИДЕО (reels) -----
  const [videos, setVideos] = useState<ReviewOut[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  const listboxId = useId();

  const peopleResults = people;
  const videoResults = videos;

  const tabItems = useMemo<TabItem<SearchTabKey>[]>(
    () => [
      { key: "products", label: t("tabs.products") },
      { key: "people", label: t("tabs.people") },
      { key: "videos", label: t("tabs.videos") },
    ],
    [t]
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
    resetProducts();
    setActiveIndexByTab({
      products: -1,
      people: -1,
      videos: -1,
    });
  }, [onClose, resetProducts]);

  // сброс списка товаров при смене вкладки/поиска
  useEffect(() => {
    if (activeTab === "products") {
      resetProducts();
    }
  }, [activeTab, trimmedQuery, resetProducts]);

  // ==== загрузка people / videos (дебаунс по query) ====

  // ЛЮДИ
  useEffect(() => {
    if (activeTab !== "people") return;

    const q = trimmedQuery;
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
          .map(mapProfileToPerson)
          .filter((x) => x.username);

        setPeople(mapped);
      } catch {
        if (!cancelled) {
          setPeopleError(t("errors.users"));
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
  }, [activeTab, trimmedQuery, t]);

  // ВИДЕО
  useEffect(() => {
    if (activeTab !== "videos") return;

    const q = trimmedQuery;
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
          setVideosError(t("errors.videos"));
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
  }, [activeTab, trimmedQuery, t]);

  // IntersectionObserver для догрузки товаров
  useEffect(() => {
    if (activeTab !== "products") return;
    if (!trimmedQuery) return;
    if (!hasMoreProducts) return;

    const node = productsLoaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNextProducts();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTab, trimmedQuery, hasMoreProducts, loadNextProducts]);

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
      navigate(`/u/${item.username}`);
      resetAndClose();
    },
    [navigate, resetAndClose]
  );

  const onSelectVideo = useCallback(
    (item: ReviewOut) => {
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

      const chosen = idx >= 0 ? collection[idx as number] : collection[0 as number];
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
      aria-label={t("panel.ariaRegion")}
      data-panel="search"
      data-anchor={anchorRole}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={c.g}
    >
      <div className={c.content}>
        <MasterBar
          title={t("panel.title")}
          includeBars
          background="var(--n-bg-desktop)"
          onClose={onClose}
          bar={
            <SearchField
              ref={inputRef}
              value={query}
              onChange={(value: string) => {
                setQuery(value);
                // при наборе всегда сбрасываем activeIndex текущей вкладки
                setActiveIndexForTab(activeTab, -1);
              }}
              onKeyDown={onKeyDown}
              placeholder={t("field.placeholder")}
              aria-label={t("field.ariaBar")}
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
          }
        >
          <Tabs<SearchTabKey>
            items={tabItems}
            activeKey={activeTab}
            onChange={(k) => {
              setActiveTab(k);
              setActiveIndexForTab(k, -1);
            }}
            ariaLabel={t("tabs.ariaLabel")}
            background="transparent"
          />
        </MasterBar>

        <ScrollArea lockBody={false}>
          {activeTab === "products" && (
            <>
              <SearchResultsList
                items={productResults}
                getKey={(x) => x.id}
                getLabel={(x) => x.label}
                onSelect={(item) => onSelectProduct(item)}
                // 👇 ВАЖНО: просто productsLoading,
                // чтобы скелеты были и на первой, и на последующих страницах
                loading={productsLoading}
                role="listbox"
                ariaLabel={t("ariaResults.products")}
                listId={listboxId}
                skeletonRows={6}
                activeIndex={activeIndexByTab.products}
                onActiveIndexChange={(idx) =>
                  setActiveIndexForTab("products", idx)
                }
              />
              {/* маячок для IntersectionObserver */}
              <div ref={productsLoaderRef} />
            </>
          )}

          {activeTab === "people" && (
            <UserResultsList<PersonSearchItem>
              items={peopleResults}
              getKey={(p) => p.id || p.username}
              onSelect={(item) => {
                onSelectPerson(item);
              }}
              loading={peopleLoading && !!peopleResults.length}
              role="listbox"
              ariaLabel={t("ariaResults.people")}
              listId={listboxId}
              skeletonRows={6}
              activeIndex={activeIndexByTab.people}
              onActiveIndexChange={(idx) =>
                setActiveIndexForTab("people", idx)
              }
            />
          )}

          {activeTab === "videos" && (
            <div
              id={listboxId}
              role="listbox"
              aria-label={t("ariaResults.videos")}
            >
              {videosLoading && trimmedQuery && !videosError ? (
                <ReelsGridSkeleton layout="search" />
              ) : (
                <ReelsGrid
                  items={videoResults}
                  emptyText={
                    searchError
                      ? searchError
                      : videosLoading
                      ? ""
                      : trimmedQuery
                      ? t("empty.videos")
                      : ""
                  }
                  onItemClick={(review) => {
                    onSelectVideo(review);
                  }}
                  layout="search"
                />
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </section>
  );
};

export default SearchPanel;
