// src/components/UI/Bars/MasterBar.tsx
import React from "react";
import clsx from "clsx";
import c from "./MasterBar.module.scss";
import CloseIcon from "../../Icons/CloseIcon";
import BackButton from "../BackButton";

export interface MasterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    onClose?: () => void;
    onBack?: () => void;
    backSize?: "small" | "medium" | "large";
    backLabel?: boolean;
    includeBars?: boolean;
    bar?: React.ReactNode;
    background?: React.CSSProperties["background"];
}

export default function MasterBar({
    children,
    className,
    title,
    onClose,
    onBack,
    backSize = "small",
    backLabel = false,
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
                {(title || onClose || onBack) &&
                    <div className={c.mastbar__h}>
                        {onBack && (
                            <BackButton
                                onClick={onBack}
                                size={backSize}
                                label={backLabel}
                                className={c.mastbar__back}
                            />
                        )}
                        {title && <h1 className={c.mastbar__title}>{title}</h1>}
                        {onClose && (
                            <button
                                type="button"
                                className={c.mastbar__close}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>
                }
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
