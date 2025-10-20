import React from 'react';

/**
 * Векторная иконка «три точки» — горизонтальная (24×24).
 * Scales with `em`, наследует цвет от родителя.
 */
export default function MoreHorizontalIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx={5} cy={12} r={2} fill="currentColor" />
      <circle cx={12} cy={12} r={2} fill="currentColor" />
      <circle cx={19} cy={12} r={2} fill="currentColor" />
    </svg>
  );
}
