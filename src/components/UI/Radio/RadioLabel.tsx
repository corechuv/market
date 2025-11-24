// src/components/UI/Radio/RadioLabel.tsx
import React from "react";
import cs from "./RadioLabel.module.scss";

export type RadioLabelProps = {
    icon?: React.ReactNode;          // слева/справа (логотип перевозчика, иконки карт, …)
    title: React.ReactNode;         // заголовок (название тарифа / метода оплаты)
    meta?: React.ReactNode;         // справа от заголовка (цена доставки и т.п.)
    caption?: React.ReactNode;      // подпись снизу (ETA, пояснение и т.п.)
};

export const RadioLabel: React.FC<RadioLabelProps> = ({
    icon,
    title,
    meta,
    caption,
}) => {

    return (
        <div className={cs.go}>
            <div className={cs.go__text}>
                <div className={cs.titleRow}>
                    <div className={cs.title}>{title} {meta && <span className={cs.meta}>({meta})</span>}</div>
                </div>
                {caption && <div className={cs.caption}>{caption}</div>}
            </div>
            {icon && <div className={cs.go__icon}>{icon}</div>}
        </div>
    );
};

export default RadioLabel;
