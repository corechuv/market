import React from 'react';

export default function OrdersIcon(
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
      aria-labelledby="ordersTitle"
      {...props}
    >
      <title id="ordersTitle">Orders icon</title>
      {/* Лист/документ с загнутым углом */}
      <path d="M9 4h6l4 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M15 4v4h4" />
      {/* Строки заказа */}
      <path d="M9.5 11.5h5" />
      <path d="M9.5 14.5h4" />
      {/* Галочка выполненного заказа */}
      <path d="M10 18l1.7 1.7L15 16.4" />
    </svg>
  );
}
