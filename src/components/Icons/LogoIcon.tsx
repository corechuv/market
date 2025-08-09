import React from "react";

export default function LogoIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DO tile cutout centered"
      {...props}
    >
      <defs>
        <mask id="cut" maskUnits="userSpaceOnUse">
          {/* БЕЛОЕ = видно, ЧЁРНОЕ = вырезано */}
          <rect width="512" height="512" rx="64" style={{ fill: "#fff" }} />
          <g
            style={{
              fill: "none",
              stroke: "#000",
              strokeWidth: 64,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="M124 168 V344 A88 88 0 0 0 124 168 Z" />
            <circle cx="300" cy="256" r="88" />
          </g>
        </mask>
      </defs>

      {/* цвет логотипа берётся из CSS -> currentColor */}
      <rect width="512" height="512" rx="64" fill="currentColor" mask="url(#cut)" />
    </svg>
  );
}