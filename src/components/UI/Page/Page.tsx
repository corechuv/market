// src/components/UI/Page/Page.tsx
import React from "react"
import c from "./Page.module.scss"

type PageProps = {
    children?: React.ReactNode;
    padding?: boolean;
}

export default function Page({ children, padding = true }: PageProps) {

    const paddingStyles: React.CSSProperties = {
        paddingLeft: padding ? "var(--page-pad)" : "",
        paddingRight: padding ? "var(--page-pad)" : ""
    }

    return (
        <>
            {children && (
                <main className={`${c.main}`} style={paddingStyles}>
                    {children}
                </main>
            )}
        </>
    );
}