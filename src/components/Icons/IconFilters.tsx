import React, { forwardRef, useId } from "react";

export type IconFiltersProps = React.SVGProps<SVGSVGElement> & {
  /** Ширина/высота иконки */
  size?: number | string;
  /** Цвет обводки/заливки */
  color?: string;
  /** Толщина обводки для варианта outline */
  strokeWidth?: number | string;
  /** Заголовок для доступности. Если не указан — иконка будет скрыта от screen reader */
  title?: string;
  /** Вариант отображения */
  variant?: "outline" | "filled";
};

const IconFilters = forwardRef<SVGSVGElement, IconFiltersProps>(
  (
    {
      size = 24,
      color = "currentColor",
      strokeWidth = 2,
      title,
      variant = "outline",
      ...rest
    },
    ref
  ) => {
    const titleId = useId();

    const common = {
      ref,
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      ...(title ? { "aria-labelledby": titleId } : { "aria-hidden": true }),
      ...rest,
    };

    if (variant === "filled") {
      // Вариант с заливкой (акцентный и компактный)
      return (
        <svg {...common}>
          {title ? <title id={titleId}>{title}</title> : null}
          <path
            d="
              M3.5 3h17a1.5 1.5 0 0 1 1.14 2.45l-7.25 8.86a1.5 1.5 0 0 0-.34.95v3.72
              c0 .59-.36 1.13-.91 1.36l-3 1.3A1.5 1.5 0 0 1 8 20.93v-4.98
              c0-.36-.13-.71-.36-.99L2.36 5.46A1.5 1.5 0 0 1 3.5 3Z
            "
            fill={color}
          />
        </svg>
      );
    }

    // Вариант с обводкой (классический)
    return (
      <svg {...common}>
        {title ? <title id={titleId}>{title}</title> : null}
        <g
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Верхняя планка */}
          <path d="M3 4h18" />
          {/* Боковые ребра воронки */}
          <path d="M6 4l6 7" />
          <path d="M18 4l-6 7" />
          {/* Хвостик с контейнером для «сбора» */}
          <path d="M12 11v5l-4 2v-7" />
        </g>
      </svg>
    );
  }
);

IconFilters.displayName = "IconFilters";

export default IconFilters;
