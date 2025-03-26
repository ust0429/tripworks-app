import React from 'react';
import { cn } from '../../utils/cn';

// バッジのバリアント型
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';

// バッジのプロパティ型
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * バッジコンポーネント
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-semibold',
          // サイズによるスタイル
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-base': size === 'lg',
          },
          // バリアントによるスタイル
          {
            'bg-gray-100 text-gray-800': variant === 'default',
            'bg-blue-100 text-blue-800': variant === 'secondary',
            'bg-transparent border border-gray-300 text-gray-800': variant === 'outline',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
            'bg-red-100 text-red-800': variant === 'danger',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
