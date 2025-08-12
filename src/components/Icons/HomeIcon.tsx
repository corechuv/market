import React from 'react';

export default function HomeIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Home" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" {...props}>
            <title>Home</title>
            <path d="M4 10L12 4l8 6v8a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-8z" />
        </svg>
    );
}