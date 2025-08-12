import React from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "../Icons/ChevronLeftIcon";
import cls from "./Breadcrumbs.module.scss";
import HomeIcon from "../Icons/HomeIcon";

type CategoryCrumb = {
    id: string;
    name: string;
    fullSlug: string; // из category.fullSlug
};

type BreadcrumbsProps = {
    /** Крошки категорий (без Home и без текущей сущности) */
    crumbs?: CategoryCrumb[];
    /** Произвольный класс-обёртка (если нужно стилизовать снаружи) */
    className?: string;
    /** Показывать ли Home слева */
    showHome?: boolean;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    crumbs = [],
    className,
    showHome = true,
}) => {
    const nav = useNavigate();

    return (
        <nav className={`${cls.category} ${className ?? ""}`} aria-label="Breadcrumb">
            {showHome && (
                <HomeIcon className={cls["category__icon--home"]} onClick={() => nav("/")} />
            )}

            {crumbs.map((c) => (
                <React.Fragment key={c.id}>
                    <ChevronRightIcon className={cls.category__icon} />
                    <span
                        className={cls.category__link}
                        onClick={() => nav(`/category${c.fullSlug}`)}
                    >
                        {c.name}
                    </span>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default React.memo(Breadcrumbs);
