// src/components/CategoryGrid/CategoryGrid.tsx
import React from "react";
import styles from "./CategoryGrid.module.scss";

export type Category = {
    id: string;
    title: string;
    href?: string;
    image?: string;
    color?: string;
};

export type CategoryGridProps = {
    title?: string;
    categories: Category[];
    className?: string;
    onSelect?: (category: Category) => void;
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
    title = "Популярные категории",
    categories,
    className,
    onSelect,
}) => {
    return (
        <section className={`${styles.section} ${className}`} aria-label={title}>
            <h2 className={styles.heading}>{title}</h2>

            <ul className={styles.grid} role="list">
                {categories.map((c) => {
                    const styleVar =
                        { ["--accent" as any]: c.color ?? "rgba(0,0,0,0.5)" } as React.CSSProperties;

                    const content = (
                        <>
                            {c.image && (
                                <img
                                    className={styles.media}
                                    src={c.image}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                />
                            )}
                            <h4 className={styles.title}>{c.title}</h4>
                        </>
                    );

                    return (
                        <li key={c.id} className={styles.item} style={styleVar}>
                            {c.href ? (
                                <a className={styles.card} href={c.href} draggable={false}>
                                    {content}
                                </a>
                            ) : (
                                <div className={styles.card}
                                    onClick={() => onSelect?.(c)}
                                >
                                    {content}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default CategoryGrid;
