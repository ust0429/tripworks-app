import { ReactElement } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

export interface AttenderType {
  id: number;
  name: string;
  type: string;
  description: string;
  rating: string;
  distance: string;
  icon: ReactElement<IconProps>;
}