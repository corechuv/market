// src/pages/Search/ModileSearchPage.tsx
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useId,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

type SearchItem = {
    id: string;
    label: string;
};

type SearchTabKey = "products" | "people" | "videos";

type PersonSearchItem = {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string | null;
};

const tabItems: TabItem<SearchTabKey>[] = [
    { key: "products", label: "Goods" },
    { key: "people", label: "People" },
    { key: "videos", label: "Videos" },
];

export default function MobileSearchPage() {
    useVisualViewport();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const qParam = params.get("q") ?? "";

    const [query, setQuery] = useState(qParam);
    const [activeTab, setActiveTab] = useState<SearchTabKey>("products");

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
        let cancelled = false;
        (async () => {
            try {
                setProductsLoading(true);
                setProductsError(null);

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
                if (!cancelled) {
                    setProductsError("Не удалось загрузить каталог");
                    setItems([]);
                }
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

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
                    .map((p: any) => {
                        const fullName = [p.firstName, p.lastName]
                            .filter(Boolean)
                            .join(" ")
                            .trim();
                        return {
                            id: String(p.id),
                            username: String(p.username || ""),
                            name: fullName || p.username || "",
                            avatarUrl:
                                buildAvatarSrc(
                                    p.avatarUrl,
                                    `${p.id}-${p.avatarUrl || ""}`
                                ) ?? null,
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

    // ==== результаты для активной вкладки ====

    const productResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return items
            .filter((i) => i.label.toLowerCase().includes(q))
            .slice(0, 50);
    }, [items, query]);

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

    return (
        <Page padding={false}>
            <div className={c.content} role="search">
                <MasterBar
                    includeBars
                    bar={
                        <SearchField
                            ref={inputRef}
                            value={query}
                            onChange={setQuery}
                            placeholder="Start typing..."
                            aria-label="Search"
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
                        ariaLabel="Search type"
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
                            ariaLabel="Search results: products"
                            listId={listboxId}
                            skeletonRows={6}
                        />
                    )}

                    {activeTab === "people" && (
                        <UserResultsList<PersonSearchItem>
                            items={peopleResults}
                            getKey={(p) => p.id || p.username}
                            onSelect={onSelectPerson}
                            // скелетоны — только когда уже есть результаты и идёт новая загрузка
                            loading={peopleLoading && !!peopleResults.length}
                            role="listbox"
                            ariaLabel="Search results: people"
                            listId={listboxId}
                            skeletonRows={6}
                        />
                    )}

                    {activeTab === "videos" && (
                        <div
                            id={listboxId}
                            role="listbox"
                            aria-label="Search results: videos"
                        >
                            <ReelsGrid
                                items={videoResults}
                                layout="search"
                                emptyText={
                                    searchError
                                        ? searchError
                                        : videosLoading
                                            ? ""
                                            : query.trim()
                                                ? "Ничего не найдено"
                                                : ""
                                }
                                onItemClick={(review) => {
                                    onSelectVideo(review);
                                }}
                            />
                        </div>
                    )}
                </ScrollArea>
            </div>
        </Page>
    );
}
