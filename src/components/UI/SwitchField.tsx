// src/components/UI/SwitchField.tsx
import { forwardRef } from "react";
import styles from "./SwitchField.module.scss";

type SwitchFieldProps = {
    /** Управляемое состояние */
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    /** Текст справа от тумблера */
    label?: string;
    /** Более мелкое описание под заголовком */
    description?: string;
    id?: string;
    name?: string;
    className?: string;
    size?: "sm" | "md";
};

function cx(...v: Array<string | false | undefined>) {
    return v.filter(Boolean).join(" ");
}

const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(function Switch(
    { checked, onChange, disabled, label, description, id, name, className, size = "md" },
    ref
) {
    return (
        <label
            className={cx(styles.root, styles[size], disabled && styles.disabled, className)}
            aria-disabled={disabled || undefined}
        >
            <input
                ref={ref}
                id={id}
                name={name}
                type="checkbox"
                role="switch"
                className={styles.input}
                checked={checked}
                onChange={(e) => onChange?.(e.currentTarget.checked)}
                disabled={disabled}
                aria-checked={checked}
                aria-label={label}
            />
            <span className={styles.control} aria-hidden="true" />
            {(label || description) && (
                <span className={styles.meta}>
                    {label && <span className={styles.title}>{label}</span>}
                    {description && <span className={styles.desc}>{description}</span>}
                </span>
            )}
        </label>
    );
});

export default SwitchField;
export type { SwitchFieldProps };
