// src/components/Icons/ArrowTopIcon.tsx
import React from 'react';

export default function ArrowTopIcon(
    props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M6 15l6-6 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
