// src/components/UI/SearchInput.tsx
import React, { useCallback } from "react";
import CloseIcon from "../Icons/CloseIcon";

export interface SearchInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string;
    onChange: (value: string) => void;
    /** Вызывается по Enter */
    onEnter?: () => void;
    /** Вызывается по Escape */
    onEscape?: () => void;
    /** Внешняя обёртка (для ваших .module.scss) */
    wrapperClassName?: string;
    /** Класс для <input> */
    inputClassName?: string;
    /** Класс для кнопки очистки */
    clearButtonClassName?: string;
    /** Левый адорнмент (обычно иконка поиска) */
    leftIcon?: React.ReactNode;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onEnter,
            onEscape,
            wrapperClassName,
            inputClassName,
            clearButtonClassName,
            leftIcon,
            ...inputProps
        },
        ref
    ) => {
        const clear = useCallback(() => onChange(""), [onChange]);

        return (
            <div className={wrapperClassName}>
                {leftIcon}
                <input
                    ref={ref}
                    className={inputClassName}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    inputMode="search"
                    {...inputProps}
                />
                {value && (
                    <button
                        className={clearButtonClassName}
                        onClick={clear}
                        type="button"
                    >
                        <CloseIcon />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
