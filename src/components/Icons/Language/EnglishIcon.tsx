import React from 'react';

export default function EnglishIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="12" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="60" height="30" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6" />
            <path d="M0,-1 L61,31 M61,-1 L-1,31" stroke="#C8102E" stroke-width="2.4" />
            <rect x="25" y="0" width="10" height="30" fill="#FFFFFF" />
            <rect x="0" y="10" width="60" height="10" fill="#FFFFFF" />
            <rect x="27" y="0" width="6" height="30" fill="#C8102E" />
            <rect x="0" y="12" width="60" height="6" fill="#C8102E" />
        </svg>
    );
}