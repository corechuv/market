import React from 'react';

/**
 * Векторная иконка «крестик» (24×24). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function CloseIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
            />
        </svg>
    );
}
