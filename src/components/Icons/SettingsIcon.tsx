import React from 'react';

export default function SettingsIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-labelledby="title"
            {...props}>
            <title id="title">settings</title>

            <path d="
    M 22 12
    L 18.93 16
    L 17 20.66
    L 12 20
    L 7 20.66
    L 5.07 16
    L 2 12
    L 5.07 8
    L 7 3.34
    L 12 4
    L 17 3.34
    L 18.93 8
    Z" />

            <circle cx="12" cy="12" r="3.8" />
        </svg>

    );
}
