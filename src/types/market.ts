import { ReactElement } from 'react';
import { IconProps } from './common';

export interface ProductType {
  id: string | number;
  name: string;
  price: number;
  description: string;
  attender: string;
  attenderAvatar?: string;
  attenderId?: string | number;
  region: string;
  category: string;
  imageUrl?: string;
  icon?: ReactElement<IconProps>; // 更新: IconPropsを使用
  featured?: boolean;
  limited?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface CategoryType {
  id: string;
  name: string;
}

export interface ReviewType {
  id: string | number;
  userId: string | number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  helpful?: number;
}

export interface CartItemType {
  productId: string | number;
  quantity: number;
  product: ProductType;
}

export interface ExperienceProductType {
  experienceId: string;
  experienceName: string;
  attenderName: string;
  attenderAvatar?: string;
  products: ProductType[];
}
