import React from 'react';

export default function AddressIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-labelledby="addressTitle"
      {...props}
    >
      <title id="addressTitle">Address icon</title>
      {/* Пин адреса */}
      <path d="M12 4.5c-3 0-5.5 2.3-5.5 5.5 0 3.9 3.2 7.1 5.5 9.5 2.3-2.4 5.5-5.6 5.5-9.5 0-3.2-2.5-5.5-5.5-5.5z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}
