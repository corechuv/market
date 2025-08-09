import * as React from "react";

/** Props for IconFilters (sliders filled) */
export type IconFiltersProps = React.SVGProps<SVGSVGElement> & {
  /** Ширина/высота иконки */
  size?: number | string;
  /** Цвет заливки */
  color?: string;
  /** Заголовок для доступности. Если не указан — скрываем от скринридеров */
  title?: string;
};

/** IconFilters — иконка фильтров (вариант sliders, filled) */
const IconFilters = React.forwardRef<SVGSVGElement, IconFiltersProps>(
  ({ size = 24, color = "currentColor", title, ...rest }, ref) => {
    const titleId = React.useId();
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        {...(title ? { "aria-labelledby": titleId } : { "aria-hidden": true })}
        {...rest}
      >
        {title ? <title id={titleId}>{title}</title> : null}
        <g fill={color}>
          {/* Планки */}
          <rect x="3" y="5.1" width="18" height="1.8" rx="0.9" />
          <rect x="3" y="11.1" width="18" height="1.8" rx="0.9" />
          <rect x="3" y="17.1" width="18" height="1.8" rx="0.9" />
          {/* Бегунки */}
          <circle cx="8" cy="6" r="2.6" />
          <circle cx="15" cy="12" r="2.6" />
          <circle cx="11" cy="18" r="2.6" />
        </g>
      </svg>
    );
  }
);

IconFilters.displayName = "IconFilters";
export default IconFilters;
