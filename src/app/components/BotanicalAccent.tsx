import React from 'react';

export interface BotanicalAccentProps {
  className?: string;
}

export const BotanicalAccent: React.FC<BotanicalAccentProps> = ({ className = 'w-24 h-24 text-primary/20' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Branch stem */}
      <path
        d="M20 100C35 85 55 60 70 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Leaf 1 */}
      <path
        d="M40 75C42 62 55 58 60 62C65 66 60 80 40 75Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Leaf 2 */}
      <path
        d="M50 55C62 50 68 38 65 32C62 26 50 32 50 55Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Leaf 3 */}
      <path
        d="M28 85C22 75 25 65 32 66C38 67 36 80 28 85Z"
        fill="currentColor"
        fillOpacity="0.35"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Petal bloom */}
      <circle cx="70" cy="20" r="4" fill="#C08497" fillOpacity="0.8" />
      <circle cx="76" cy="17" r="3.5" fill="#E7C6D0" fillOpacity="0.8" />
      <circle cx="74" cy="25" r="3" fill="#E7C6D0" fillOpacity="0.8" />
      <circle cx="65" cy="18" r="3" fill="#E7C6D0" fillOpacity="0.8" />
    </svg>
  );
};
