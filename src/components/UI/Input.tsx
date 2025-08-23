import "react"
import cls from './Input.module.scss'

export interface InputProps {
    /** Текст кнопки */
    children: React.ReactNode;
    /** Дополнительные классы */
    className?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url' | 'date' | 'time';
    disabled?: boolean;
}

export default function Input({ children, className = '', type = 'text', disabled = false }: InputProps) {
    return (
        <input
            type={type}
            className={`${cls.input} ${className}`}
            aria-label={typeof children === 'string' ? children : undefined}
            disabled={disabled}
            placeholder={typeof children === 'string' ? children : undefined}
        >
            {children}
        </input>
    );
}