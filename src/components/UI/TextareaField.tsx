// src/components/UI/TextareaField.tsx
import React, {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import cs from "./TextareaField.module.scss";

type CountMode = "current" | "remaining";

export type TextareaFieldProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
    /** Показывать счётчик. 'auto' — только если задан maxLength */
    showCount?: boolean | "auto";
    /** current = "123/500", remaining = "377" (осталось) */
    countMode?: CountMode;
    /** Автоподгон высоты под контент */
    autoGrow?: boolean;
    /** Минимум/максимум строк при autoGrow */
    minRows?: number;
    maxRows?: number;
    /** Управление ручкой ресайза */
    resizable?: "none" | "vertical" | "both" | "horizontal";
  };

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    {
      label,
      hint,
      error,
      className,
      id,
      rows = 4,
      showCount = "auto",
      countMode = "current",
      autoGrow = true,
      minRows,
      maxRows,
      resizable = "vertical",
      maxLength,
      required,
      onInput,
      value,
      defaultValue,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const areaId = id ?? autoId;
    const hintId = `${areaId}-hint`;
    const errId = `${areaId}-err`;
    const countId = `${areaId}-count`;

    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    // вычисляем текущую длину (универсально для контролируемого/неконтролируемого)
    const computeLen = (): number => {
      if (innerRef.current) return innerRef.current.value.length;
      if (typeof value === "string") return value.length;
      if (typeof value === "number") return String(value).length;
      if (typeof defaultValue === "string") return defaultValue.length;
      if (typeof defaultValue === "number") return String(defaultValue).length;
      return 0;
    };

    const [valueLen, setValueLen] = useState<number>(() => computeLen());

    // авто-подгон высоты
    const resizeToContent = () => {
      const el = innerRef.current;
      if (!el || !autoGrow) return;

      el.style.height = "auto";

      const style = window.getComputedStyle(el);
      const line = parseFloat(style.lineHeight || "0") || 20;
      const paddingsBorders =
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);

      const minH = (minRows ?? rows) * line + paddingsBorders;
      const maxH = maxRows ? maxRows * line + paddingsBorders : Infinity;

      const wanted = el.scrollHeight;
      el.style.height = Math.max(Math.min(wanted, maxH), minH) + "px";
      el.style.overflowY = wanted > maxH ? "auto" : "hidden";
    };

    // инициализация и реагирование на изменения внешних значений
    useEffect(() => {
      setValueLen(computeLen());
      resizeToContent();
      // если доступен ResizeObserver — подстраиваемся под изменения размеров/шрифта
      if (typeof ResizeObserver !== "undefined" && innerRef.current) {
        const ro = new ResizeObserver(resizeToContent);
        ro.observe(innerRef.current);
        return () => ro.disconnect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, defaultValue, autoGrow, minRows, maxRows, rows]);

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      setValueLen((e.target as HTMLTextAreaElement).value.length);
      resizeToContent();
      onInput?.(e);
    };

    // Логика показа счётчика
    const shouldShowCount =
      showCount === "auto" ? typeof maxLength === "number" : !!showCount;

    const countText =
      countMode === "remaining" && typeof maxLength === "number"
        ? `${Math.max(maxLength - valueLen, 0)}`
        : typeof maxLength === "number"
        ? `${valueLen}/${maxLength}`
        : `${valueLen}`;

    const describedBy = [
      hint ? hintId : "",
      error ? errId : "",
      shouldShowCount ? countId : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      <div className={cs.field}>
        {label && (
          <label className={cs.label} htmlFor={areaId}>
            {label}
            {required && (
              <span className={cs.requiredMark} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          id={areaId}
          ref={innerRef}
          rows={rows}
          maxLength={maxLength}
          {...rest}
          onInput={handleInput}
          className={[
            cs.textarea,
            autoGrow ? cs.autoGrow : "",
            error ? cs.textareaError : "",
            className || "",
          ].join(" ")}
          style={{ resize: resizable }}
          aria-invalid={!!error}
          aria-errormessage={error ? errId : undefined}
          aria-describedby={describedBy || undefined}
          required={required}
        />

        <div className={cs.metaRow}>
          {hint && (
            <div id={hintId} className={cs.hint}>
              {hint}
            </div>
          )}
          {shouldShowCount && (
            <div id={countId} className={cs.counter} aria-live="polite">
              {countText}
            </div>
          )}
        </div>

        {error && (
          <div id={errId} className={cs.error} role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";
