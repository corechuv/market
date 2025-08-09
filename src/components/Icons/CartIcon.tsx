import React from 'react';

export default function CartIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
            <circle cx="9" cy="21" r="1" fill="currentColor" />
            <circle cx="19" cy="21" r="1" fill="currentColor" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}