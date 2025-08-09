import { useState } from 'react';
import cls from './SortSelectContainer.module.scss'

export interface SortOption {
    /** Уникальное значение опции (используйте в логике сортировки) */
    value: string;
    /** Читаемое название, которое увидит пользователь */
    label: string;
}

interface Props {
    /** Текущая сортировка */
    sort: string;
    /** Набор вариантов сортировки */
    sortOptions: SortOption[];
    /** Колбэк для смены сортировки */
    onChangeSort: (sort: string) => void;
}

const SortSelectContainer: React.FC<Props> = ({
    sort,
    sortOptions,
    onChangeSort,
}) => {

    const [open, setOpen] = useState(false);

    const handleSelect = (value: string) => {
        onChangeSort(value);
        setOpen(false);
    };

    return (
        <div className={cls.sortWrapper}>
            <button
                className={`${cls.iconBtnWithText} ${open ? cls.active : ''}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Сортировать"
                type="button"
                onClick={() => setOpen((prev) => !prev)}
            >
                {sortOptions.find(option => option.value === sort)?.label || 'Sort by'}
                <svg
                    className={`${cls.icon} ${open ? cls.iconOpen : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open && (
                <div role="listbox" className={cls.sortList}>
                    {sortOptions.map((option) => (
                        <button key={option.value}
                            role="option"
                            aria-selected={sort === option.value}
                            className={`${cls.sortItem} ${sort === option.value ? cls.selected : ''}`}
                            onClick={() => handleSelect(option.value)}
                            type="button"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortSelectContainer;
