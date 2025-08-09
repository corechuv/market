import React, { useCallback, useId, useState } from "react";
import cls from "./RatingStars.module.scss";

export interface RatingStarsProps {
  /** Сколько звёзд (по-умолчанию 5) */
  count?: number;
  /** Подпись группы (legend) */
  label?: string;
  /** Контролируемое значение */
  value?: number;
  /** Неконтролируемое стартовое значение */
  defaultValue?: number;
  /** Колбэк изменения */
  onChange?: (value: number) => void;
  /** Только просмотр (без взаимодействия) */
  readOnly?: boolean;
  /** Доп. класс */
  className?: string;
  /** Горизонталь / вертикаль */
  orientation?: "horizontal" | "vertical";
  /** Размер звезды (px) */
  size?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  count = 5,
  label = "",
  value,
  defaultValue = 0,
  onChange,
  readOnly = false,
  className,
  orientation = "horizontal",
  size = 20,
}) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<number>(defaultValue);
  const current = isControlled ? (value as number) : internal;

  const id = useId();

  const select = useCallback(
    (n: number) => () => {
      if (readOnly) return;
      if (!isControlled) setInternal(n);
      onChange?.(n);
    },
    [isControlled, onChange, readOnly],
  );

  return (
    <fieldset
      className={`${cls.group} ${cls[orientation]} ${className ?? ""}`}
      role="radiogroup"
      aria-labelledby={`${id}-legend`}
      aria-orientation={orientation}
    >
      <legend id={`${id}-legend`} className={cls.title}>
        {label}
      </legend>

      <div className={cls.stars} style={{ "--star-size": `${size}px` } as React.CSSProperties}>
        {Array.from({ length: count }, (_, i) => {
          const val = i + 1;
          const filled = val <= current;

          return (
            <label key={val} className={cls.option}>
              <input
                type="radio"
                name={id}
                value={val}
                checked={current === val}
                onChange={select(val)}
                disabled={readOnly}
                className={cls.input}
                aria-label={`${val} of ${count}`}
              />
              {/* SVG без внешнего fill — цвет управляется через CSS */}
              <svg
                className={`${cls.star} ${filled ? cls.filled : ""}`}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m12 2.5 3.09 6.26 6.91 1.01-5 4.88 1.18 6.88L12 17.77l-6.18 3.26 1.18-6.88-5-4.88 6.91-1.01L12 2.5Z" />
              </svg>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default React.memo(RatingStars);
