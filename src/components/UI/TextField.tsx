// src/components/UI/TextField.tsx
import React, { useId } from "react";
import cls from "./TextField.module.scss";

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  className,
  id,
  ...props
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errId = `${inputId}-err`;

  return (
    <div className={cls.field}>
      {label && (
        <label className={cls.field__label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[cls.field__input, error ? cls["field__input--error"] : "", className || ""].join(" ")}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ""} ${error ? errId : ""}`.trim()}
      />
      {hint && (
        <div id={hintId} className={cls["field__meta--error"]}>
          {hint}
        </div>
      )}
      {error && (
        <div id={errId} className={cls.field__error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
