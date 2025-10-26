import React, { useState } from "react";
import styles from "./Accordion.module.scss";
import ArrowBottomIcon from "../Icons/ArrowBottomIcon";

interface AccordionProps {
    title: string;
    margin?: boolean;
    children: React.ReactNode;
    /**
     * Открыто ли по умолчанию
     */
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, margin = false, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    const contentStyle: React.CSSProperties = {
        marginLeft: margin ? "10px" : "",
    };

    return (
        <div className={styles.accordion}>
            <button
                type="button"
                className={styles.header}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                <h4 className={styles.header__title}>{title}</h4>
                <ArrowBottomIcon className={`${styles.icon} ${open ? styles.iconOpen : ""}`} />
            </button>
            {open && <div className={styles.accordion__content} style={contentStyle}>{children}</div>}
        </div>
    );
};

export default Accordion;
