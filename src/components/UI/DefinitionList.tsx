import React from "react";
import s from "./DefinitionList.module.scss";

export type DefinitionItem = {
    name: React.ReactNode;        // первая колонка — именование
    description: React.ReactNode; // вторая колонка — описание
};

export type DefinitionListProps = {
    items: DefinitionItem[];
    className?: string;
    style?: React.CSSProperties;
    /** Плотнее вертикальные отступы (опционально) */
    compact?: boolean;
};

const cx = (...parts: Array<string | false | undefined>) =>
    parts.filter(Boolean).join(" ");

const DefinitionList: React.FC<DefinitionListProps> = ({
    items,
    className,
    style,
    compact,
}) => {
    return (
        <dl className={cx(s.root, compact && s.compact, className)} style={style}>
            {items.map((it, i) => (
                <React.Fragment key={i}>
                    <dt className={s.term}>{it.name}</dt>
                    <dd className={s.desc}>{it.description}</dd>
                </React.Fragment>
            ))}
        </dl>
    );
};

export default DefinitionList;
