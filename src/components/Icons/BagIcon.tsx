import React from 'react';

export default function BagIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.6"
            stroke-linecap="round" stroke-linejoin="round"
            role="img" aria-labelledby="bagTitle" {...props}>
            <title id="bagTitle">Bag icon</title>
            <rect x="5" y="8.5" width="14" height="12" rx="2" />
            <path d="M8 9V7a4 4 0 0 1 8 0v2" />
        </svg>
    );
}