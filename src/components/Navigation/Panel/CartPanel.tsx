// src/components/Navigation/Panel/CartPanel.tsx
import React from "react";
import c from "./CartPanel.module.scss";
import MasterBar from "../../UI/Bars/MasterBar";

interface CartPanelProps {
    /** Управление видимостью извне (Navigation) */
    open: boolean;
    /** Закрыть панель (например, по Esc/выбору) */
    onClose: () => void;
    /** Чтобы разместить панель относительно якоря в стилях (опционально) */
    anchorRole?: "cart";
    /** Поддержка hover-логики родителя: держим открытым, пока курсор над панелью */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
    open,
    /*onClose,*/
    anchorRole = "cart",
    onMouseEnter,
    onMouseLeave,
}) => {
    if (!open) return null;

    return (
        <section
            id="cart-panel"            // для aria-controls на кнопке
            role="region"
            aria-label="Cart"
            data-panel="card"
            data-anchor={anchorRole}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={c.g}
        >
            <MasterBar title="Settings" background="var(--n-bg-desktop)" />
        </section>
    );
};

export default CartPanel;
