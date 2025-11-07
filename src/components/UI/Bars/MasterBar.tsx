// src/components/UI/Bars/MasterBar.tsx
import React from "react"
import c from './MasterBar.module.scss'

export interface MasterBarProps {
    title?: string;
    includeBars?: boolean;
    className?: string;
}

export default function MasterBar({ className = '', title = 'text', includeBars = false }: MasterBarProps) {

    const inclBars: React.CSSProperties = {
        paddingBottom: includeBars ? "0" : "1.2rem",
    };

    return (
        <div className={`${c.mastbar} ${className}`} style={inclBars}>
            <h2 className={c.mastbar__title}>{title}</h2>
        </div >
    );
}