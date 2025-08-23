import React, { useId, useMemo, useState } from "react";
import cs from "./PasswordField.module.scss";

export type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  withStrength?: boolean;
  strengthCalc?: (v: string) => number; // 0..4
};

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  hint,
  error,
  withStrength,
  strengthCalc,
  className,
  id,
  value,
  onChange,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [local, setLocal] = useState(String(value ?? ""));
  const autoId = useId();
  const inputId = id ?? autoId;

  const score = useMemo(
    () => (withStrength && strengthCalc ? strengthCalc(local) : 0),
    [local, withStrength, strengthCalc]
  );

  return (
    <div className={cs.field}>
      <div className={cs.labelRow}>
        <label className={cs.label} htmlFor={inputId}>
          {label}
        </label>
        <button
          type="button"
          className={cs.linkBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <input
        id={inputId}
        {...props}
        value={local}
        onChange={(e) => {
          onChange?.(e);
          setLocal(e.currentTarget.value);
        }}
        className={[cs.input, error ? cs.inputError : "", className || ""].join(" ")}
        aria-invalid={!!error}
        type={visible ? "text" : "password"}
      />

      {withStrength && (
        <div className={cs.strength} aria-hidden>
          <div className={[cs.bar, score >= 1 ? cs.ok : ""].join(" ")} />
          <div className={[cs.bar, score >= 2 ? cs.ok : ""].join(" ")} />
          <div className={[cs.bar, score >= 3 ? cs.ok : ""].join(" ")} />
          <div className={[cs.bar, score >= 4 ? cs.ok : ""].join(" ")} />
        </div>
      )}

      {hint && <div className={cs.hint}>{hint}</div>}
      {error && (
        <div className={cs.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
