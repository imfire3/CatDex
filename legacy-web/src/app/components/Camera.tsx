import React from 'react';

interface CameraProps {
  size?: number;
  className?: string;
}

const Camera = ({ size = 28, className = '' }: CameraProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <rect x="9" y="11" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  );
};

export default Camera;