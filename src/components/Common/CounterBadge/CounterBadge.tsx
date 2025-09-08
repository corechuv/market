// src/components/Common/CounterBadge/CounterBadge.tsx
import React from "react";
import s from "./CounterBadge.module.scss";

type CounterBadgeProps = {
  /** Сколько показывать (0 можно скрывать) */
  count: number;
  /** Верхняя граница отображения (например, "99+") */
  max?: number;
  /** Скрывать ли бейдж при нуле */
  hideZero?: boolean;
  /** Для тонкой подстройки позиции снаружи */
  className?: string;
  /** Текст для a11y (aria-label / title) */
  title?: string;
};

const CounterBadge: React.FC<CounterBadgeProps> = ({
  count,
  max = 99,
  hideZero = true,
  className,
  title,
}) => {
  if (hideZero && (!Number.isFinite(count) || count <= 0)) return null;
  const value = count > max ? `${max}+` : String(count);

  return (
    <span
      className={`${s.badge} ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-label={title ?? `Количество: ${value}`}
      title={title ?? `Количество: ${value}`}
    >
      {value}
    </span>
  );
};

export default CounterBadge;
