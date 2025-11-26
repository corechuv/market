// src/components/UI/RadioField.tsx
import React, { useId } from "react";
import cs from "./RadioField.module.scss";

export type RadioFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
};

export const RadioField: React.FC<RadioFieldProps> = ({
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
    <label className={cs.option} htmlFor={inputId} onClick={onClick}>
      {label && <span className={cs.label}>{label}</span>}
      <input
        id={inputId}
        type="radio"
        checked={checked}
        onChange={onChange}
        {...props}
        className={`${cs.radio} ${className ?? ""}`}
      />
    </label>
  );
};
