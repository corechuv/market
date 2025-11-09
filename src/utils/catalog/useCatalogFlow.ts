// src/utils/catalog/useCatalogFlow.ts
import { useCallback, useEffect, useMemo, useRef, useState, useReducer } from "react";
import type { Category as Cat } from "../../types/category";
import { getRootCategories, getChildren, subscribe, syncFromApi, getStatus } from "../../services/categoryService";

export type Stage = "L1" | "L2" | "L3";
export interface FlowConfig {
    /** Что делать на Back с L1: "close" | "smartBack" | "noop" */
    backAtL1?: "close" | "smartBack" | "noop";
    /** Закрывать ли хост перед навигацией */
    closeOnNavigate?: boolean;
    /** Триггер для сброса (например, open=false у панели) */
    resetKey?: any;
    /** Коллбек закрытия хоста (панели) */
    onClose?: () => void;
    /** Навигация по слагу */
    onNavigate: (slug: string) => void;
}

export function useCatalogFlow(cfg: FlowConfig) {
    const [tick, force] = useReducer((x) => x + 1, 0);
    const [{ loaded, error }, setStatus] = useState(getStatus());

    useEffect(() => {
        const off = subscribe(() => { setStatus(getStatus()); force(); });
        void syncFromApi().then(() => setStatus(getStatus()));
        return off;
    }, []);

    const roots = useMemo(() => getRootCategories(), [tick]);
    const isLoading = !loaded && roots.length === 0;

    const [stage, setStage] = useState<Stage>("L1");
    const [rootCat, setRootCat] = useState<Cat | null>(null);
    const [l2Cat, setL2Cat] = useState<Cat | null>(null);

    // сбрасываем состояние при смене resetKey (напр., закрыли панель)
    useEffect(() => {
        if (cfg.resetKey) return; // значение само по себе не важно — важен факт изменения
        setStage("L1"); setRootCat(null); setL2Cat(null);
    }, [cfg.resetKey]);

    const l2List = useMemo<Cat[]>(() => (rootCat ? getChildren(rootCat.id) : []), [rootCat, tick]);
    const l3List = useMemo<Cat[]>(() => (l2Cat ? getChildren(l2Cat.id) : []), [l2Cat, tick]);

    const navigate = (slug?: string) => {
        if (!slug) return; // можно ещё залогировать предупреждение
        if (cfg.closeOnNavigate && cfg.onClose) cfg.onClose();
        cfg.onNavigate(`/category${slug}`);
    };

    const openL2 = (cat: Cat) => { setRootCat(cat); setL2Cat(null); setStage("L2"); };
    const openL3 = (cat: Cat) => {
        const children = getChildren(cat.id);
        if (!children.length) { navigate(cat.fullSlug); return; }
        setL2Cat(cat); setStage("L3");
    };

    const back = () => {
        if (stage === "L3") { setStage("L2"); return; }
        if (stage === "L2") { setStage("L1"); setL2Cat(null); return; }
        if (cfg.backAtL1 === "close" && cfg.onClose) { cfg.onClose(); return; }
        if (cfg.backAtL1 === "smartBack") { window.history.length > 1 ? history.back() : cfg.onNavigate("/"); }
    };

    // свайпы
    const touchStartX = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 60) back();
        touchStartX.current = null;
    };

    // классы экранов
    const screenClass = useCallback(
        (name: Stage, cls: Record<string, string>) => {
            if (stage === name) return cls.screenActive;
            if (name === "L1") return stage === "L2" || stage === "L3" ? cls.screenHiddenLeft : cls.screenHiddenRight;
            if (name === "L2") return stage === "L1" ? cls.screenHiddenRight : cls.screenHiddenLeft;
            return cls.screenHiddenRight;
        },
        [stage]
    );

    // refs скролла и автоскролл наверх
    const l1ScrollRef = useRef<HTMLDivElement | null>(null);
    const l2ScrollRef = useRef<HTMLDivElement | null>(null);
    const l3ScrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        (stage === "L1" ? l1ScrollRef.current :
            stage === "L2" ? l2ScrollRef.current : l3ScrollRef.current)?.scrollTo({ top: 0 });
    }, [stage]);

    return {
        isLoading, error, roots, l2List, l3List,
        stage, rootCat, l2Cat,
        openL2, openL3, back,
        onTouchStart, onTouchEnd,
        screenClass,
        l1ScrollRef, l2ScrollRef, l3ScrollRef,
    };
}
