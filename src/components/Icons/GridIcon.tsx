import React from 'react';

/**
 * Векторная иконка «сетка» (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function GridIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (<svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...props}
    >
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>);
}