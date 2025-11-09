// src/components/Navigation/Panel/CatalogPanel.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import c from "./CatalogPanel.module.scss";
import { useCatalogFlow } from "../../../utils/catalog/useCatalogFlow";
import { CatalogScreens } from "../../Catalog/CatalogScreens";

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

const CatalogPanel: React.FC<CatalogPanelProps> = ({
    open,
    onClose,
    anchorRole = "catalog",
    onMouseEnter,
    onMouseLeave,
}) => {
    const nav = useNavigate();

    const flow = useCatalogFlow({
        backAtL1: "close",
        closeOnNavigate: true,
        onClose,
        resetKey: open,             // при закрытии сбрасываем состояние
        onNavigate: (url) => nav(url),
    });

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
            <CatalogScreens
                title="Catalog"
                mastbarBg="var(--n-bg-desktop)"
                stage={flow.stage}
                isLoading={flow.isLoading}
                error={!flow.isLoading && !!flow.error}
                roots={flow.roots}
                l2List={flow.l2List}
                l3List={flow.l3List}
                rootCat={flow.rootCat}
                l2Cat={flow.l2Cat}
                back={flow.back}
                screenClass={flow.screenClass}
                refs={{ l1: flow.l1ScrollRef, l2: flow.l2ScrollRef, l3: flow.l3ScrollRef }}
                touch={{ onTouchStart: flow.onTouchStart, onTouchEnd: flow.onTouchEnd }}
                onOpenL2={flow.openL2}
                onOpenL3={flow.openL3}
                onOpenSlug={(slug) => { onClose(); nav(`/category${slug}`); }}
                lockBody={false}
            />
        </section>
    );
};

export default CatalogPanel;
