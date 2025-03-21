import { User } from './user';

export interface Experience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  duration: number; // 分単位
  price: number;
  currency: string;
  capacity: {
    min: number;
    max: number;
  };
  categories: string[];
  tags: string[];
  attender: User; // 提供するアテンダー
  rating: number;
  reviewCount: number;
  availableDates: string[]; // ISO形式の日付文字列
  createdAt: string;
  updatedAt: string;
}