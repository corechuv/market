import React from 'react';

/**
 * Векторная иконка "heart" (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function HeartIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}