import React from 'react';

/**
 * Векторная иконка "account" (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function AccountIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}