// src/components/UI/TextField.tsx
import React, { useId } from "react";
import cs from "./TextField.module.scss";

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
    <div className={cs.field}>
      {label && (
        <label className={cs.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[cs.input, error ? cs.inputError : "", className || ""].join(" ")}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ""} ${error ? errId : ""}`.trim()}
      />
      {hint && (
        <div id={hintId} className={cs.hint}>
          {hint}
        </div>
      )}
      {error && (
        <div id={errId} className={cs.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
