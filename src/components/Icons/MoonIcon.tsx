import "react"

export default function MoonIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="
                M21 12.8
                A9 9 0 1 1 11.2 3
                A7 7 0 0 0 21 12.8
                Z" />
        </svg>
    );
}