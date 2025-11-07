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
import ChevronLeftIcon from "../../Icons/ChevronRightIcon";
import ChevronRightIcon from "../../Icons/ChevronLeftIcon";

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
            <div className={c.drawer}>
                {/* SCREEN L1: ROOTS */}
                <div className={screenClass("L1")}>
                    <MasterBar title="Catalog" background="var(--n-bg-desktop)" />
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
                                    <ChevronRightIcon className={c["list__item--icon-right"]} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* SCREEN L2 */}
                <div
                    className={screenClass("L2")}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <MasterBar title="" background="var(--n-bg-desktop)">
                        <button className={c.back} onClick={back} aria-label="Back to roots" type="button">
                            <ChevronLeftIcon /> Back
                        </button>
                    </MasterBar>

                    {rootCat && (
                        <>
                            <h2 className={c.title}>{rootCat.name}</h2>
                            <ul className={c.list}>
                                {l2List.map((l2) => (
                                    <li key={l2.id} className={c.list__item} onClick={() => openL3(l2)}>
                                        <span className={c["list__item--label"]} aria-label={`Open ${l2.name}`} title={l2.name}>
                                            {l2.name}
                                        </span>
                                        <ChevronRightIcon className={c["list__item--icon-right"]} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* SCREEN L3 */}
                <div
                    className={screenClass("L3")}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <MasterBar title="" background="var(--n-bg-desktop)">
                        <button className={c.back} onClick={back} aria-label="Back to subcategories" type="button">
                            <ChevronLeftIcon /> Back
                        </button>
                    </MasterBar>

                    {l2Cat && (
                        <>
                            <h2 className={c.title}>{l2Cat.name}</h2>
                            <ul className={c.list}>
                                {l3List.map((leaf) => (
                                    <li key={leaf.id} className={c.list__item} onClick={() => { onClose(); nav(`/category${leaf.fullSlug}`); }}>
                                        <span className={c["list__item--label"]} title={leaf.name}>
                                            {leaf.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CatalogPanel;
