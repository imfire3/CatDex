import React from 'react';

interface CatFaceProps {
  color: string;
  size?: number;
  className?: string;
}

const CatFace = ({ color = '#FF9F43', size = 28, className = '' }: CatFaceProps) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ears */}
      <path
        d="M4 11L2 7L6 5L8 9Z"
        fill={color}
      />
      <path
        d="M20 11L22 7L18 5L16 9Z"
        fill={color}
      />
      {/* Head */}
      <circle cx="12" cy="12" r="8" fill={color} />
      {/* Eyes */}
      <circle cx="9" cy="10" r="1.5" fill="white" />
      <circle cx="15" cy="10" r="1.5" fill="white" />
      <circle cx="9" cy="10" r="0.5" fill="black" />
      <circle cx="15" cy="10" r="0.5" fill="black" />
      {/* Nose */}
      <path d="M12 13L10.5 15L13.5 15Z" fill="#FF69B4" />
      {/* Mouth */}
      <path d="M10 16 Q12 18 14 16" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export default CatFace;