import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClass = "bg-gray-200 dark:bg-gray-700/50 animate-pulse";
  
  let variantClass = "";
  if (variant === 'circular') {
    variantClass = "rounded-full";
  } else if (variant === 'text') {
    variantClass = "rounded-md";
  } else {
    variantClass = "rounded-xl";
  }

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
}
