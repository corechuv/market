// src/components/UI/BackButton.tsx
import "react"
import cls from "./BackButton.module.scss"
import Left from "../Icons/ChevronLeftIcon"

export interface BackButtonProps {
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    label?: boolean;
}

export default function BackButton({
    onClick,
    className = "",
    type = "button",
    size = "medium",
    disabled = false,
    label = false,
}: BackButtonProps) {
    return (
        <button
            type={type}
            className={[
                cls.back,
                className,
            ].join(" ")}
            onClick={onClick}
            aria-label="Back"
            disabled={disabled}
        >
            <span className={cls[size]}>
                <Left />
            </span>
            {label && "Back"}
        </button>
    );
}