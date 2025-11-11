import 'react'

export default function LegalIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* pillar & beam */}
      <line x1="12" y1="3" x2="12" y2="19" />
      <line x1="6" y1="7" x2="18" y2="7" />
      {/* chains */}
      <line x1="8" y1="7" x2="8" y2="11" />
      <line x1="16" y1="7" x2="16" y2="11" />
      {/* pans */}
      <path d="M5 11l3 5l3-5z" />
      <path d="M13 11l3 5l3-5z" />
      {/* base */}
      <line x1="9" y1="21" x2="15" y2="21" />
      <line x1="12" y1="19" x2="12" y2="21" />
    </svg>
  );
}
