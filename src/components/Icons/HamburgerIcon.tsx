import React from 'react';

/**
 * Векторная иконка "hamburger" (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function HamburgerIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}