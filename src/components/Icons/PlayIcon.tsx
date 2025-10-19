import * as React from "react";

export default function PlayIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <title>Video / Play Circle</title>
      <circle cx="12" cy="12" r="9" />
      {/* уменьшенный треугольник */}
      <path d="M11 9l4 3-4 3z" fill="currentColor" />
    </svg>
  );
}
