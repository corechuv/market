// src/components/UI/Button.tsx
import React from "react";
import cls from "./Button.module.scss";

export interface ButtonProps {
  /** Текст кнопки */
  children: React.ReactNode;
  /** Обработчик клика */
  onClick?: () => void;
  /** Дополнительные классы */
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  /** Стиль/вид кнопки */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "link";
}

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  size = "medium",
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        cls.button,
        cls[size],          // .small / .medium / .large
        cls[variant],       // .primary / .secondary / .ghost / ...
        className,
      ].join(" ")}
      onClick={onClick}
      aria-label={typeof children === "string" ? children : undefined}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  );
}