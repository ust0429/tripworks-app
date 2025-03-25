import { SVGProps } from 'react';

// アイコンコンポーネントのプロパティ型定義
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  color?: string;
}
