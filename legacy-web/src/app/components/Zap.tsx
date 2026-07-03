import React from 'react';

interface ZapProps {
  size?: number;
  className?: string;
}

const Zap = ({ size = 18, className = '' }: ZapProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 14 12 15.09 18.74 12 22 8.91 18.74 10 12 2 9.27 9 8" fill="currentColor" />
    </svg>
  );
};

export default Zap;