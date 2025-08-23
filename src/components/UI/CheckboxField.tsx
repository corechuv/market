import React, { useId } from "react";
import cs from "./CheckboxField.module.scss";

export type CheckboxFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
};

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  className,
  id,
  ...props
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label className={cs.option} htmlFor={inputId}>
      <input id={inputId} type="checkbox" {...props} className={`${cs.checkbox} ${className}`} />
      <span className={cs.label}>{label}</span>
    </label>
  );
};
