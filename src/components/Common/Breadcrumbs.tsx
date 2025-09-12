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
  const ref = React.useRef<HTMLElement | null>(null);

  // Автоматически прокручиваем к последней крошке на узких экранах
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    const isNarrow = window.matchMedia("(max-width: 756px)").matches;
    if (el && isNarrow) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [crumbs.length]);

  return (
    <nav
      ref={ref}
      className={`${cls.category} ${className ?? ""}`}
      aria-label="Breadcrumb"
      tabIndex={0} // клавиатурный скролл
    >
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
            title={c.name}
          >
            {c.name}
          </span>
        </span>
      ))}
    </nav>
  );
};

export default React.memo(Breadcrumbs);