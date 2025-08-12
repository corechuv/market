import React from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "../Icons/ChevronLeftIcon"; // 👈 проверь импорт!
import cls from "./Breadcrumbs.module.scss";
import HomeIcon from "../Icons/HomeIcon";

type CategoryCrumb = {
    id: string;
    name: string;
    fullSlug: string;
};

type BreadcrumbsProps = {
    crumbs?: CategoryCrumb[];
    className?: string;
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
                <HomeIcon
                    className={cls["category__icon--home"]}
                    aria-label="Home"
                    onClick={() => nav("/")}
                />
            )}

            {crumbs.map((c) => (
                <span className={cls.category__crumb} key={c.id}>
                    <ChevronRightIcon className={cls.category__icon} aria-hidden />
                    <span
                        className={cls.category__link}
                        onClick={() => nav(`/category${c.fullSlug}`)}
                    >
                        {c.name}
                    </span>
                </span>
            ))}
        </nav>
    );
};

export default React.memo(Breadcrumbs);
