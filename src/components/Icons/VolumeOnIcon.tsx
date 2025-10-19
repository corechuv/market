import 'react'

export default function VolumeOnIcon(
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
      <path d="M5 11.5Q5 10 6.5 10H7.6Q8.3 10 8.9 9.6L11.7 7.6Q12.8 6.8 12.8 7.9V16.1Q12.8 17.2 11.7 16.4L8.9 14.4Q8.3 14 7.6 14H6.5Q5 14 5 12.5Z" />
      <path d="M16 10.2Q17.6 12 16 13.8" />
      <path d="M18.6 8.4Q21.2 12 18.6 15.6" />
    </svg>
  );
}
