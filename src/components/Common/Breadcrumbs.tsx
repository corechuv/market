import React from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "../Icons/ChevronLeftIcon";
import cls from "./Breadcrumbs.module.scss";

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
    /** Текст для Home (по умолчанию "Home") */
    homeLabel?: string;
    /** Показывать ли Home слева */
    showHome?: boolean;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    crumbs = [],
    className,
    homeLabel = "Home",
    showHome = true,
}) => {
    const nav = useNavigate();

    return (
        <nav className={`${cls.category} ${className ?? ""}`} aria-label="Breadcrumb">
            {showHome && (
                <span className={cls.category__link} onClick={() => nav("/")}>
                    {homeLabel}
                </span>
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
