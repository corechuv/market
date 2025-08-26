import React from 'react';

export default function StarIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            {...props}
        >
            <path d="m12 2.5 3.09 6.26 6.91 1.01-5 4.88 1.18 6.88L12 17.77l-6.18 3.26 1.18-6.88-5-4.88 6.91-1.01L12 2.5Z" />
        </svg>

    );
}
