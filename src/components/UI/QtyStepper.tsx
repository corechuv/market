// src/components/UI/QtyStepper.tsx
import { useCallback, useRef } from "react";
import styles from "./QtyStepper.module.scss";
import PlusIcon from "../Icons/PlusIcon";
import MinusIcon from "../Icons/MinusIcon";

export type QtyStepperProps = {
  value: number;
  max: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
  showMax?: boolean;                 // показать "/ {max}" справа
  onChange: (next: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function joinClasses(...args: Array<string | undefined | false>) {
  return args.filter(Boolean).join(" ");
}

export default function QtyStepper({
  value,
  max,
  min = 0,
  step = 1,
  disabled,
  ariaLabel = "Количество",
  className,
  size = "md",
  showMax = true,
  onChange,
}: QtyStepperProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const canDec = !disabled && safeValue > min;
  const canInc = !disabled && safeValue < max;
  const isAllDisabled = disabled || max <= 0 || (min >= max && safeValue === min);

  const apply = useCallback(
    (next: number) => onChange(clamp(Math.round(next), min, max)),
    [onChange, min, max]
  );

  // id для связи кнопок с output (aria-controls)
  const idRef = useRef<string>("qty-" + Math.random().toString(36).slice(2, 9));
  const outputId = idRef.current;

  return (
    <div
      className={joinClasses(styles.stepper, styles[size], className)}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={isAllDisabled || undefined}
      data-testid="qty-stepper"
    >
      <button
        type="button"
        className={styles.btn}
        onClick={() => apply(safeValue - step)}
        disabled={!canDec}
        aria-label="Уменьшить количество"
        aria-controls={outputId}
      >
        <MinusIcon />
      </button>

      <output
        id={outputId}
        className={styles.output}
        aria-live="polite"
        aria-atomic="true"
      >
        {safeValue}
      </output>

      <button
        type="button"
        className={styles.btn}
        onClick={() => apply(safeValue + step)}
        disabled={!canInc}
        aria-label="Увеличить количество"
        aria-controls={outputId}
      >
        <PlusIcon />
      </button>

      {showMax && (
        <span className={styles.meta} aria-hidden="true">/ {max}</span>
      )}
    </div>
  );
}
