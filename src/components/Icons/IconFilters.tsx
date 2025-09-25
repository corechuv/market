import "react"

export default function IconFilters(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <g fill="currentColor">
        <rect x="3" y="5.1" width="18" height="1.8" rx="0.9" />
        <rect x="3" y="15.1" width="18" height="1.8" rx="0.9" />
        <circle cx="8" cy="6" r="2.6" />
        <circle cx="11" cy="16" r="2.6" />
      </g>
    </svg>
  );
}