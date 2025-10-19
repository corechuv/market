// src/componetns/UI/RadioCard.tsx
import React from "react";
import styles from "./RadioCard.module.scss";

export type RadioCardItem = {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  "data-testid"?: string;
  "aria-describedby"?: string;
};

// Базовые пропсы
type BaseProps = {
  name: string;
  /** можно переопределить класс-обёртку, по умолчанию styles.list__radio */
  listClassName?: string;
};

// Одиночный режим
type SingleProps = BaseProps & {
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;

  // запрет «списочных» полей
  items?: undefined;
  value?: undefined;
  onChangeValue?: undefined;
};

// Списочный режим
type ListProps = BaseProps & {
  items: RadioCardItem[];
  value?: string | null;                 // выбранный id
  onChangeValue: (id: string) => void;

  // запрет «одиночных» полей
  checked?: undefined;
  onChange?: undefined;
  title?: undefined;
  subtitle?: undefined;
  caption?: undefined;
  icon?: undefined;
  disabled?: undefined;
};

export type RadioCardProps = SingleProps | ListProps;

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(" ");

const Item: React.FC<{
  name: string;
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  "data-testid"?: string;
  "aria-describedby"?: string;
}> = ({ name, checked, onChange, title, subtitle, caption, icon, disabled, ...rest }) => (
  <label className={cx(styles.radio, checked && styles.radio__selected)}>
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      {...rest}
    />
    <div className={styles.radio__body}>
      <div className={styles.radio__label}>
        <div className={styles.radio__title}>
          {title}
          {subtitle ? <span> {subtitle}</span> : null}
        </div>
        {caption}
      </div>
      <div className={styles.radio__icon}>{icon}</div>
    </div>
  </label>
);

// type guard — список, если items это массив
function isListMode(p: RadioCardProps): p is ListProps {
  return Array.isArray((p as ListProps).items);
}

const RadioCard: React.FC<RadioCardProps> = (props) => {
  const wrapperClass = props.listClassName || styles.list__radio;

  if (isListMode(props)) {
    const { name, items, value, onChangeValue } = props;
    const selected = value ?? "";
    return (
      <div className={wrapperClass}>
        {items.map(it => (
          <Item
            key={it.id}
            name={name}
            checked={selected === it.id}
            onChange={() => onChangeValue(it.id)}
            title={it.title}
            subtitle={it.subtitle}
            caption={it.caption}
            icon={it.icon}
            disabled={it.disabled}
            data-testid={it["data-testid"]}
            aria-describedby={it["aria-describedby"]}
          />
        ))}
      </div>
    );
  }

  // одиночный режим
  const { listClassName: _omit, ...p } = props as SingleProps;
  return (
    <div className={wrapperClass}>
      <Item {...p} />
    </div>
  );
};

export default RadioCard;
