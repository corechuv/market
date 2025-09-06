import "react"

export default function PlusIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" {...props}
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}