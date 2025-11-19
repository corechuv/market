// src/components/UI/Bars/MasterBar.tsx
import React from "react";
import clsx from "clsx";
import c from "./MasterBar.module.scss";

export interface MasterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    includeBars?: boolean;
    bar?: React.ReactNode;
    background?: React.CSSProperties["background"];
}

export default function MasterBar({
    children,
    className,
    title,
    includeBars = false,
    bar,
    background,
    ...divProps
}: MasterBarProps) {
    const style: React.CSSProperties = {
        paddingBottom: includeBars ? "0" : "1.2rem",
        ...(background ? { background } : {}),
        ...divProps.style,
    };

    const w: React.CSSProperties = {
        gap: includeBars ? "1rem" : "0",
    };

    return (
        <div className={clsx(c.mastbar, className)} style={style} {...divProps}>
            <div className={c.mastbar__w} style={w}>
                {title && <h2 className={c.mastbar__title}>{title}</h2>}
                {includeBars &&
                    <div className={c.mastbar__bar}>
                        {bar}
                    </div>
                }
            </div>
            {children}
        </div>
    );
}
