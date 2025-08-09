import React from 'react';

/**
 * Векторная иконка "link" (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function LinkIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            {...props}  // Spread props to allow customization
        >
            <path d="M10.59 13.41a1 1 0 0 1 0-1.41l4.3-4.3a3 3 0 1 1 4.24 4.24l-1.59 1.59a1 1 0 1 1-1.42-1.42l1.59-1.59a1 1 0 1 0-1.42-1.42l-4.3 4.3a1 1 0 0 1-1.4 0Z" />
            <path d="M13.41 10.59a1 1 0 0 1 0 1.41l-4.3 4.3a3 3 0 1 1-4.24-4.24l1.59-1.59a1 1 0 0 1 1.42 1.42l-1.59 1.59a1 1 0 1 0 1.42 1.42l4.3-4.3a1 1 0 0 1 1.4 0Z" />
        </svg>
    );
}