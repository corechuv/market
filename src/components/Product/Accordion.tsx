import React, { useState } from "react";
import styles from "./Accordion.module.scss";

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    /**
     * Открыто ли по умолчанию
     */
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={styles.accordion}>
            <button
                type="button"
                className={styles.header}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                <h4 className={styles.header__title}>{title}</h4>
                <svg
                    className={`${styles.icon} ${open ? styles.iconOpen : ""}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open && <div className={styles.content}>{children}</div>}
        </div>
    );
};

export default Accordion;
