import { ReactElement } from 'react';
import { IconProps } from './common';

export interface EventType {
  id: string | number;
  title: string;
  description?: string;
  day: string;
  month?: string;
  date?: string; // ISOString または 表示用フォーマット済みの日付
  time: string;
  attender: string;
  attenderAvatar?: string;
  attenderId?: string | number;
  period?: string;
  note?: string;
  location?: string;
  price: number;
  imageUrl?: string;
  icon?: ReactElement<IconProps>; // 更新: IconPropsを使用
  rating?: number;
  reviewCount?: number;
  badge?: string;
  type?: string;
  capacity?: number;
  remainingSpots?: number;
  featured?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
}

export interface EventFilterType {
  type: string;
  period: string;
}

export interface FilterOptionType {
  id: string;
  name: string;
}
