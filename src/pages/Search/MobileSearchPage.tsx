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

    const cacheKey: string | null =
        p.avatarUpdatedAt || p.updatedAt || null;

    return {
        id: String(p.id),
        username: String(p.username || ""),
        name: fullName || String(p.username || ""),
        photoUrl: rawAvatar
            ? buildAvatarSrc(rawAvatar, cacheKey || `${p.id}-${rawAvatar}`)
            : null,
    };
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

    // ----- ТОВАРЫ -----
    const [items, setItems] = useState<SearchItem[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);

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

    // Один раз грузим каталог товаров (как в SearchPanel)
    useEffect(() => {
        if (activeTab !== "products") return;

        const q = query.trim();
        // если ничего не введено — просто очищаем список и не дёргаем бэк
        if (!q) {
            setItems([]);
            setProductsError(null);
            setProductsLoading(false);
            return;
        }

        let cancelled = false;
        setProductsLoading(true);
        setProductsError(null);

        const timeoutId = window.setTimeout(async () => {
            try {
                const list = await getProducts({
                    q,
                    sort: "new",       // новые сверху
                    availableOnly: true,
                    limit: 50,         // максимум подсказок
                });

                const mapped: SearchItem[] = (Array.isArray(list) ? list : [])
                    .map((p: any) => ({
                        id: String(p?.id ?? p?.productId ?? ""),
                        label: String(p?.name ?? p?.title ?? ""),
                    }))
                    .filter((x) => x.id && x.label);

                if (!cancelled) setItems(mapped);
            } catch {
                if (!cancelled) {
                    setProductsError(t("errors.catalog"));
                    setItems([]);
                }
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        }, 250); // debounce 250 мс

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [activeTab, query, t]);

    // ==== people (дебаунс по query + активная вкладка) ====
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
    }, [activeTab, query, t]);

    // ==== videos (дебаунс по query + активная вкладка) ====
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
                const q = query.trim();
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
    }, [activeTab, query, t]);

    // ==== результаты для активной вкладки ====
    const productResults = useMemo(
        () => items.slice(0, 50),
        [items]
    );

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

    const trimmedQuery = query.trim();

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
                                    if (!query.trim()) return;
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

                    <ScrollArea>
                        {activeTab === "products" && (
                            <SearchResultsList
                                items={productResults}
                                getKey={(p) => String(p.id)}
                                getLabel={(p) => p.label}
                                onSelect={onSelectProduct}
                                loading={productsLoading}
                                role="listbox"
                                ariaLabel={t("ariaResults.products")}
                                listId={listboxId}
                                skeletonRows={6}
                            />
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
