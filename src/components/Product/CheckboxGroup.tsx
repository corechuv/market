import React, { useCallback, useId, useState } from "react";
import cls from "./CheckboxGroup.module.scss";

export interface CheckboxOption {
  /** Уникальное значение (value) чекбокса */
  value: string;
  /** Текстовая подпись рядом с чекбоксом */
  label?: string;
  /** Неактивный чекбокс */
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Массив пунктов */
  options: CheckboxOption[];
  /** Контролируемый набор выбранных значений */
  value?: string[];
  /** Неконтролируемый стартовый набор выбранных значений */
  defaultValue?: string[];
  /** Обработчик изменения */
  onChange?: (selected: string[]) => void;
  /** Дополнительный класс */
  className?: string;
  content?: React.ReactNode;
  contentRenderer?: (option: CheckboxOption) => React.ReactNode;
  /** Направление отображения: столбец / строка */
  direction?: "vertical" | "horizontal";
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  defaultValue = [],
  onChange,
  className,
  content,
  contentRenderer,
  direction = "vertical",
}) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const selected = isControlled ? (value as string[]) : internal;

  const groupId = useId();

  const handleToggle = useCallback(
    (optionValue: string) => () => {
      const exists = selected.includes(optionValue);
      const next = exists
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];

      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [selected, isControlled, onChange],
  );

  return (
    <fieldset
      className={`${cls.group} ${cls[direction]} ${className ?? ""}`}
      aria-labelledby={`${groupId}-legend`}
    >
      {options.map(({ value: val, label, disabled }) => (
        <label key={val} className={cls.option}>
          <input
            type="checkbox"
            value={val}
            checked={selected.includes(val)}
            onChange={handleToggle(val)}
            disabled={disabled}
            className={cls.checkbox}
          />
          {label && <span className={cls.label}>{label}</span>}
          {contentRenderer
            ? <div className={cls.content}>{contentRenderer({ value: val, label, disabled })}</div>
            : content && <div className={cls.content}>{content}</div>}
        </label>
      ))}
    </fieldset>
  );
};

export default React.memo(CheckboxGroup);
