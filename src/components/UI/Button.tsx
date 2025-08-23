import "react"
import cls from './Button.module.scss'

export interface ButtonProps {
    /** Текст кнопки */
    children: React.ReactNode;
    /** Обработчик клика */
    onClick?: () => void;
    /** Дополнительные классы */
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export default function Button({ children, onClick, className = '', type = 'button', size = 'medium', disabled = false }: ButtonProps) {
    return (
        <button
            type={type}
            className={`${cls.button} ${className} ${cls[size]}`}
            onClick={onClick}
            aria-label={typeof children === 'string' ? children : undefined}
            disabled={disabled}
        >
            {children}
        </button>
    );
}