import { useId } from "react";

const Logo = ({ size = 36, className = "" }) => {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7c7ffd" />
          <stop offset="100%" stopColor="#4740e8" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="12" fill={`url(#${gradientId})`} />

      <rect
        x="8"
        y="9"
        width="17"
        height="8"
        rx="4"
        fill="white"
        fillOpacity="0.95"
      />

      <rect
        x="15"
        y="23"
        width="17"
        height="8"
        rx="4"
        fill="white"
        fillOpacity="0.95"
      />

      <circle
        cx="27"
        cy="27"
        r="2.5"
        fill="#5b5ff5"
      />
    </svg>
  );
};

export default Logo;