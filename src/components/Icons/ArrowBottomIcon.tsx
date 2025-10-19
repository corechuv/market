// src/components/Icons/ArrowBottomIcon.tsx
import React from 'react';

export default function ArrowBottomIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
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
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
