import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-900 text-white';
      case 'secondary':
        return 'bg-gray-100 text-gray-800';
      case 'outline':
        return 'bg-transparent text-gray-800 border border-gray-300';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-900 text-white';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'md':
        return 'text-sm px-2.5 py-0.5';
      case 'lg':
        return 'text-base px-3 py-1';
      default:
        return 'text-sm px-2.5 py-0.5';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        getVariantClass(),
        getSizeClass(),
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
