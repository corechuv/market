// src/pages/Search/MobileSearchPage.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import c from "./MobileSearchPage.module.scss";

import { getProducts } from "../../services/productService";
import SearchField from "../../components/UI/SearchField";
import Page from "../../components/UI/Page/Page";
import SearchResultsList from "../../components/Search/SearchResultsList";
import MasterBar from "../../components/UI/Bars/MasterBar";
import ScrollArea from "../../components/UI/ScrollArea/ScrollArea";
import { useVisualViewport } from "../../hooks/useViewportUnits";

import api from "../../lib/api";
import { Tabs, type TabItem } from "../../components/UI/Tabs";

import { listReelsFeed } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";
import ReelsGrid from "../../components/User/Tabs/ReelsGrid";
import UserResultsList from "../../components/Search/UsersResultList";
import { buildAvatarSrc } from "../../utils/avatar";
import ReelsGridSkeleton from "../../components/User/Tabs/ReelsGrid.Skeleton";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../utils/useInfiniteList";

const PAGE_SIZE = 50;

type SearchItem = {
  id: string;
  label: string;
};

type SearchTabKey = "products" | "people" | "videos";

type PersonSearchItem = {
  id: string;
  username: string;
  name: string;
  photoUrl?: string | null;
};

// Унифицированное преобразование профиля от бэка → PersonSearchItem
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

// помогают убрать дубли по id
function uniqById(items: SearchItem[]): SearchItem[] {
  const map = new Map<string, SearchItem>();
  for (const it of items) {
    if (!it.id) continue;
    if (!map.has(it.id)) map.set(it.id, it);
  }
  return Array.from(map.values());
}

export default function MobileSearchPage() {
  useVisualViewport();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";

  const { t } = useTranslation("search");

  const [query, setQuery] = useState(qParam);
  const [activeTab, setActiveTab] = useState<SearchTabKey>("products");

  const tabItems: TabItem<SearchTabKey>[] = useMemo(
    () => [
      { key: "products", label: t("tabs.products") },
      { key: "people", label: t("tabs.people") },
      { key: "videos", label: t("tabs.videos") },
    ],
    [t]
  );

  const trimmedQuery = query.trim();

  // ----- ТОВАРЫ -----
  const [productsError, setProductsError] = useState<string | null>(null);

  const loadProductsPage = useMemo(
    () =>
      async (page: number): Promise<SearchItem[]> => {
        const q = trimmedQuery;
        if (!q) {
          setProductsError(null);
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

          setProductsError(null);
          return uniqById(mapped);
        } catch {
          setProductsError(t("errors.catalog"));
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

  // ----- ВИДЕО -----
  const [videos, setVideos] = useState<ReviewOut[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // автофокус поля
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  // синхронизируем ?q= в урле с query (с дебаунсом)
  useEffect(() => {
    const h = setTimeout(() => {
      const next = new URLSearchParams(params);
      const trimmed = query.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      if (next.toString() !== params.toString()) {
        setParams(next, { replace: false });
      }
    }, 250);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // если пользователь вернулся по history с другим q — подтягиваем
  useEffect(() => {
    if (qParam !== query) setQuery(qParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  // сброс товаров при смене запроса / вкладки
  useEffect(() => {
    if (activeTab === "products") {
      resetProducts();
    }
  }, [activeTab, trimmedQuery, resetProducts]);

  // people
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

  // videos
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
        const data = await listReelsFeed({
          q,
          sort: "trending",
          limit: 40,
        });
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

  // ==== результаты для активной вкладки ====
  const peopleResults = people;
  const videoResults = videos;

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
      ? productsError
      : activeTab === "people"
      ? peopleError
      : videosError;

  const smartBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const onSelectProduct = (p: SearchItem) => navigate(`/product/${p.id}`);
  const onSelectPerson = (p: PersonSearchItem) => navigate(`/u/${p.username}`);
  const onSelectVideo = (r: ReviewOut) => navigate(`/reels/${r.id}`);

  // ---------------- SEO для мобильного поиска ----------------

  const canonicalBase = "https://dashedo.com/s";
  const canonicalUrl = trimmedQuery
    ? `${canonicalBase}?q=${encodeURIComponent(trimmedQuery)}`
    : canonicalBase;

  const seoTitle = trimmedQuery
    ? t(`seo.${activeTab}.queryTitle`, { query: trimmedQuery })
    : t(`seo.${activeTab}.title`);

  const seoDescription = trimmedQuery
    ? t(`seo.${activeTab}.queryDescription`, { query: trimmedQuery })
    : t(`seo.${activeTab}.description`);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>

      <Page padding={false}>
        <div
          className={c.content}
          role="search"
          aria-label={t("panel.ariaRegion")}
        >
          <MasterBar
            includeBars
            bar={
              <SearchField
                ref={inputRef}
                value={query}
                onChange={setQuery}
                placeholder={t("field.placeholder")}
                aria-label={t("field.ariaLabel")}
                aria-controls={listboxId}
                aria-expanded={searchLoading || activeResultsLength > 0}
                loading={searchLoading}
                error={searchError}
                resultsLength={activeResultsLength}
                onEnter={() => {
                  if (!trimmedQuery) return;
                  if (activeTab === "products" && productResults[0]) {
                    onSelectProduct(productResults[0]);
                  } else if (activeTab === "people" && peopleResults[0]) {
                    onSelectPerson(peopleResults[0]);
                  } else if (activeTab === "videos" && videoResults[0]) {
                    onSelectVideo(videoResults[0]);
                  }
                }}
                onEscape={smartBack}
              />
            }
          >
            <Tabs<SearchTabKey>
              items={tabItems}
              activeKey={activeTab}
              onChange={setActiveTab}
              ariaLabel={t("tabs.ariaLabel")}
              background="transparent"
            />
          </MasterBar>

          <ScrollArea useBottomNavOffset>
            {activeTab === "products" && (
              <>
                <SearchResultsList
                  items={productResults}
                  getKey={(p) => String(p.id)}
                  getLabel={(p) => p.label}
                  onSelect={onSelectProduct}
                  // 👇 а тут тоже важно — просто productsLoading
                  loading={productsLoading}
                  role="listbox"
                  ariaLabel={t("ariaResults.products")}
                  listId={listboxId}
                  skeletonRows={6}
                />
                {/* маячок для догрузки */}
                <div ref={productsLoaderRef} />
              </>
            )}

            {activeTab === "people" && (
              <UserResultsList<PersonSearchItem>
                items={peopleResults}
                getKey={(p) => p.id || p.username}
                onSelect={onSelectPerson}
                loading={peopleLoading && !!peopleResults.length}
                role="listbox"
                ariaLabel={t("ariaResults.people")}
                listId={listboxId}
                skeletonRows={6}
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
                    layout="search"
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
                  />
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </Page>
    </>
  );
}
