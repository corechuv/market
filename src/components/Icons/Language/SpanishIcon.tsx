import React from 'react';

export default function SpanishIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="12" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="3" height="2" fill="#AA151B" />
            <rect y="0.5" width="3" height="1" fill="#F1BF00" />
        </svg>
    );
}