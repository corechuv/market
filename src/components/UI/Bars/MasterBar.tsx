// src/components/UI/Bars/MasterBar.tsx
import React from "react";
import clsx from "clsx";
import c from "./MasterBar.module.scss";

export interface MasterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    includeBars?: boolean;
    background?: React.CSSProperties["background"];
}

export default function MasterBar({
    children,
    className,
    title = "text",
    includeBars = false,
    background,
    ...divProps
}: MasterBarProps) {
    const style: React.CSSProperties = {
        paddingBottom: includeBars ? "0" : "1.2rem",
        ...(background ? { background } : {}),
        ...divProps.style,
    };

    return (
        <div className={clsx(c.mastbar, className)} style={style} {...divProps}>
            {title && <h2 className={c.mastbar__title}>{title}</h2>}
            {children}
        </div>
    );
}
