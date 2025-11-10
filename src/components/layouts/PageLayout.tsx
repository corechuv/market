// src/components/layouts/PageLayout.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Left from "../Icons/ChevronLeftIcon";
import styles from "./PageLayout.module.scss";

type PageLayoutProps = {
    title: React.ReactNode;
    /** либо куда перейти, либо ваш обработчик */
    backTo?: string;
    onBack?: () => void;
    /**
     * Явно управляем показом кнопки назад.
     * По умолчанию вычисляется как !!(backTo || onBack)
     */
    showBack?: boolean;
    /** основной контент */
    children: React.ReactNode;
    /** доп. классы, если нужно */
    className?: string;
    contentClassName?: string;
};

export default function PageLayout({
    title,
    backTo,
    onBack,
    children,
    className,
    contentClassName,
    showBack,
}: PageLayoutProps) {
    const navigate = useNavigate();

    const hasBack = showBack ?? Boolean(backTo || onBack);

    const handleBack = () => {
        if (onBack) return onBack();
        if (backTo) return navigate(backTo);
        navigate(-1);
    };

    return (
        <main className={[styles.page, className].filter(Boolean).join(" ")}>
            <div
                className={[
                    styles.header,
                    !hasBack ? styles.headerNoBack : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className={styles.header__main}>
                    {hasBack && (
                        <button
                            type="button"
                            className={styles["header__main--btn"]}
                            onClick={handleBack}
                        >
                            <Left />
                        </button>
                    )}
                    <h1 className={styles["header__main--title"]}>{title}</h1>
                </div>
            </div>

            <section className={[styles.content, contentClassName].filter(Boolean).join(" ")}>
                {children}
            </section>
        </main>
    );
}
