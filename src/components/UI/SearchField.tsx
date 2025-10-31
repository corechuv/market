// src/components/UI/SearchField.tsx
import React, { useCallback } from "react";
import CloseIcon from "../Icons/CloseIcon";
import SearchIcon from "../Icons/SearchIcon";
import c from "./SearchField.module.scss";

export interface SearchFieldProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string;
    onChange: (value: string) => void;
    /** Вызывается по Enter */
    onEnter?: () => void;
    /** Вызывается по Escape */
    onEscape?: () => void;
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
    (
        {
            value,
            onChange,
            onEnter,
            onEscape,
            ...inputProps
        },
        ref
    ) => {
        const clear = useCallback(() => onChange(""), [onChange]);

        return (
            <div className={c.field}>
                <SearchIcon className={c.field__icon} />
                <input
                    ref={ref}
                    className={c.field__input}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    inputMode="search"
                    {...inputProps}
                />
                {value && (
                    <CloseIcon onClick={clear} className={c.field__clear} />
                )}
            </div>
        );
    }
);

SearchField.displayName = "SearchField";
export default SearchField;
