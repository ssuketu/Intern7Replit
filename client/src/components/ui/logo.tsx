import React from "react";

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const dimensions = {
    small: { width: 32, height: 32 },
    default: { width: 40, height: 40 },
    large: { width: 48, height: 48 },
  };

  const { width, height } = dimensions[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="url(#paint0_linear)" />
      <path
        d="M14 14H20V34H14V14Z"
        fill="white"
      />
      <path
        d="M24 14H30V34H24V14Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M34 14H34.5C36.9853 14 39 16.0147 39 18.5V18.5C39 20.9853 36.9853 23 34.5 23H34V14Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M34 25H34.5C36.9853 25 39 27.0147 39 29.5V29.5C39 31.9853 36.9853 34 34.5 34H34V25Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M9 20L14 17V31L9 28V20Z"
        fill="white"
        fillOpacity="0.4"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoWithText({ size = "default" }: { size?: "small" | "default" | "large" }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        InternVacancy
      </span>
    </div>
  );
}