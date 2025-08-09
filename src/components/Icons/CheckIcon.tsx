import React from 'react';

/**
 * Векторная иконка «галочка» (16×16). 
 * Scales with `em`, поэтому наследует цвет и размер от родителя.
 */
export default function CheckIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" {...props} width="1em" height="1em" viewBox="0 0 16 16">
            <polyline points="3 9 6.5 12.5 13 5"
                fill="none" stroke="black"
                strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
