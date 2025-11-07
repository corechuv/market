// src/components/Navigation/Panel/NotificationPanel.tsx
import React from "react";
import c from "./NotificationsPanel.module.scss";
import { useNavigate } from "react-router-dom";

interface NotificationsPanelProps {
    /** Управление видимостью извне (Navigation) */
    open: boolean;
    /** Закрыть панель (например, по Esc/выбору) */
    onClose: () => void;
    /** Чтобы разместить панель относительно якоря в стилях (опционально) */
    anchorRole?: "notifications";
    /** Поддержка hover-логики родителя: держим открытым, пока курсор над панелью */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    open,
    /*onClose,*/
    anchorRole = "notifications",
    onMouseEnter,
    onMouseLeave,
}) => {
    if (!open) return null;

    const nav = useNavigate()

    return (
        <section
            id="notifications-panel"            // для aria-controls на кнопке
            role="region"
            aria-label="Notifications"
            data-panel="notifications"
            data-anchor={anchorRole}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={c.g}
        >
            <h2 className={c.title}>Notifications</h2>
            <ul className={c.list}>
                <li className={c.list__item} onClick={() => { nav("/account") }}>
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        1
                    </span>
                </li>
                <li className={c.list__item} onClick={() => { nav("/account") }}>
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        2
                    </span>
                </li>
            </ul>
        </section>
    );
};

export default NotificationsPanel;
