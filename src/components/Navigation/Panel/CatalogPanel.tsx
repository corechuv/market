// src/components/Navigation/Panel/CatalogPanel.tsx
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import c from "./CatalogPanel.module.scss";
import Left from "../../Icons/ChevronLeftIcon";
import Right from "../../Icons/ChevronRightIcon";

// пути от папки Panel/ к types и services
import type { Category as Cat } from "../../../types/category";
import {
    getRootCategories,
    getChildren,
    subscribe,
    syncFromApi,
    getStatus,
} from "../../../services/categoryService";
import MasterBar from "../../UI/Bars/MasterBar";
import { useVisualViewport } from "../../../hooks/useViewportUnits";
import ScrollArea from "../../UI/ScrollArea/ScrollArea";

interface CatalogPanelProps {
    /** Управление видимостью извне (Navigation) */
    open: boolean;
    /** Закрыть панель (например, по Esc/выбору) */
    onClose: () => void;
    /** Чтобы разместить панель относительно якоря в стилях (опционально) */
    anchorRole?: "catalog";
    /** Поддержка hover-логики родителя: держим открытым, пока курсор над панелью */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

type Stage = "L1" | "L2" | "L3";

const CatalogPanel: React.FC<CatalogPanelProps> = ({
    open,
    onClose,
    anchorRole = "catalog",
    onMouseEnter,
    onMouseLeave,
}) => {
    useVisualViewport();
    const nav = useNavigate();

    // ----- загрузка категорий -----
    const [tick, force] = React.useReducer((x) => x + 1, 0);
    const [{ loaded, error }, setStatus] = useState(getStatus());

    useEffect(() => {
        const off = subscribe(() => {
            setStatus(getStatus());
            force();
        });
        void syncFromApi().then(() => setStatus(getStatus()));
        return off;
    }, []);

    const roots = useMemo(() => getRootCategories(), [tick]);
    const isLoading = !loaded && roots.length === 0;

    // ----- L1/L2/L3 -----
    const [stage, setStage] = useState<Stage>("L1");
    const [rootCat, setRootCat] = useState<Cat | null>(null);
    const [l2Cat, setL2Cat] = useState<Cat | null>(null);

    const l2List = useMemo<Cat[]>(
        () => (rootCat ? getChildren(rootCat.id) : []),
        [rootCat, tick]
    );
    const l3List = useMemo<Cat[]>(
        () => (l2Cat ? getChildren(l2Cat.id) : []),
        [l2Cat, tick]
    );

    // reset состояния при закрытии панели
    useEffect(() => {
        if (!open) {
            setStage("L1");
            setRootCat(null);
            setL2Cat(null);
        }
    }, [open]);

    const openL2 = (cat: Cat) => {
        setRootCat(cat);
        setL2Cat(null);
        setStage("L2");
    };

    const openL3 = (cat: Cat) => {
        const children = getChildren(cat.id);
        if (!children.length) {
            onClose();
            nav(`/category${cat.fullSlug}`);
            return;
        }
        setL2Cat(cat);
        setStage("L3");
    };

    const back = () => {
        if (stage === "L3") {
            setStage("L2");
            return;
        }
        if (stage === "L2") {
            setStage("L1");
            setL2Cat(null);
            return;
        }
        onClose();
    };

    // свайп-назад (вправо) на L2/L3
    const touchStartX = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 60) back();
        touchStartX.current = null;
    };

    // классы для "слайдов"
    const screenClass = useCallback(
        (name: Stage) => {
            if (stage === name) return c.screenActive;
            if (name === "L1")
                return stage === "L2" || stage === "L3"
                    ? c.screenHiddenLeft
                    : c.screenHiddenRight;
            if (name === "L2")
                return stage === "L1" ? c.screenHiddenRight : c.screenHiddenLeft;
            return c.screenHiddenRight; // L3
        },
        [stage]
    );

    // чтобы при смене экрана начинать с верха
    const l1ScrollRef = useRef<HTMLDivElement | null>(null);
    const l2ScrollRef = useRef<HTMLDivElement | null>(null);
    const l3ScrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el =
            stage === "L1" ? l1ScrollRef.current :
                stage === "L2" ? l2ScrollRef.current :
                    l3ScrollRef.current;
        el?.scrollTo({ top: 0 });
    }, [stage]);

    if (!open) return null;

    return (
        <section
            id="catalog-panel"
            role="region"
            aria-label="Catalog"
            data-panel="catalog"
            data-anchor={anchorRole}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={c.g}
        >
            <div className={c.page}>
                <MasterBar title={stage === "L1" ? "Catalog" : ""} background="var(--n-bg-desktop)">
                    {stage !== "L1" && (
                        <button className={c.back} onClick={back} aria-label="Back" type="button">
                            <Left /> Back
                        </button>
                    )}
                </MasterBar>
                <div className={c.drawer}>
                    <div className={screenClass("L1")}>
                        <ScrollArea
                            lockBody={stage === "L1"}            // ← держим глобальный лок только у активного
                            ref={(el: any) => (l1ScrollRef.current = el)}
                        >
                            {isLoading ? (
                                <div className={c.skeleton} role="status" aria-live="polite">
                                    Загрузка…
                                </div>
                            ) : error && roots.length === 0 ? (
                                <div className={c.skeleton} role="alert">
                                    Не удалось загрузить категории
                                </div>
                            ) : (
                                <ul className={c.list}>
                                    {roots.map((cat) => (
                                        <li key={cat.id} className={c.list__item} onClick={() => openL2(cat)}>
                                            <span className={c["list__item--label"]} aria-label={`Open ${cat.name}`} title={cat.name}>
                                                {cat.name}
                                            </span>
                                            <Right className={c["list__item--icon-right"]} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
                    </div>

                    <div
                        className={screenClass("L2")}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <ScrollArea
                            className={c.scroll}
                            lockBody={stage === "L2"}
                            ref={(el: any) => (l2ScrollRef.current = el)}
                        >
                            {rootCat && (
                                <ul className={c.list}>
                                    <li className={c.list__item} onClick={() => { onClose(); nav(`/category${rootCat.fullSlug}`); }}>
                                        <span className={c["list__item--label"]} aria-label={`Open ${rootCat.name}`} title={rootCat.name}>
                                            {rootCat.name}
                                        </span>
                                    </li>
                                    {l2List.map((l2) => (
                                        <li key={l2.id} className={c.list__item} onClick={() => openL3(l2)}>
                                            <span className={c["list__item--label"]} aria-label={`Open ${l2.name}`} title={l2.name}>
                                                {l2.name}
                                            </span>
                                            <Right className={c["list__item--icon-right"]} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
                    </div>

                    <div
                        className={screenClass("L3")}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <ScrollArea
                            className={c.scroll}
                            lockBody={stage === "L3"}
                            ref={(el: any) => (l3ScrollRef.current = el)}
                        >
                            {l2Cat && (
                                <ul className={c.list}>
                                    <li className={c.list__item} onClick={() => { onClose(); nav(`/category${l2Cat.fullSlug}`); }}>
                                        <span className={c["list__item--label"]} aria-label={`Open ${l2Cat.name}`} title={l2Cat.name}>
                                            {l2Cat.name}
                                        </span>
                                    </li>
                                    {l3List.map((leaf) => (
                                        <li key={leaf.id} className={c.list__item} onClick={() => { onClose(); nav(`/category${leaf.fullSlug}`); }}>
                                            <span className={c["list__item--label"]} title={leaf.name}>
                                                {leaf.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default CatalogPanel;
