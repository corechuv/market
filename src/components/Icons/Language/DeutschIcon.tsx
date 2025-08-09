import React from 'react';

export default function DeutschIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg width="24" height="12" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect width="3" height="2" fill="#FFCE00" />
            <rect width="3" height="1.33" fill="#DD0000" />
            <rect width="3" height="0.66" fill="#000" />
        </svg>
    );
}