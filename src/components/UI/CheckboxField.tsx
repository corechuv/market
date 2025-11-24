import React, { useId } from "react";
import cs from "./CheckboxField.module.scss";

export type CheckboxFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
};

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  onClick,
  onChange,
  checked,
  className,
  id,
  ...props
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label className={cs.option} htmlFor={inputId}>
      <input id={inputId} checked={checked} type="checkbox" onClick={onClick} onChange={onChange} {...props} className={`${cs.checkbox} ${className}`} />
      {label && (<span className={cs.label}>{label}</span>)}
    </label>
  );
};
